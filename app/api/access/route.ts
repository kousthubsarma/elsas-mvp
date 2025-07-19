import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import QRCode from "qrcode";
import { authenticator } from "otplib";

const requestAccessSchema = z.object({
  space_id: z.string().uuid("Invalid space ID"),
  type: z.enum(["qr", "otp"]).default("qr"),
  duration_minutes: z.number().min(1).max(1440).default(60),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = requestAccessSchema.parse(body);

    // Check if space exists and is active
    const { data: space, error: spaceError } = await supabase
      .from("spaces")
      .select(`
        *,
        partner:partners(
          id,
          company_name
        )
      `)
      .eq("id", validatedData.space_id)
      .eq("is_active", true)
      .single();

    if (spaceError || !space) {
      return NextResponse.json({ error: "Space not found or inactive" }, { status: 404 });
    }

    // Check if space is within operating hours
    const now = new Date();
    const currentDay = now.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
    const currentTime = now.toLocaleTimeString("en-US", { 
      hour12: false, 
      hour: "2-digit", 
      minute: "2-digit" 
    });

    const openHours = space.open_hours as any;
    if (openHours && openHours[currentDay]) {
      const { start, end } = openHours[currentDay];
      if (currentTime < start || currentTime > end) {
        return NextResponse.json({ 
          error: "Space is currently closed",
          details: `Operating hours: ${start} - ${end}`
        }, { status: 400 });
      }
    }

    // Generate access code
    let code: string;
    let qrCodeDataUrl: string | null = null;

    if (validatedData.type === "qr") {
      // Generate unique QR code
      const uniqueId = `${user.id}-${space.id}-${Date.now()}`;
      code = uniqueId;
      
      // Generate QR code image
      try {
        qrCodeDataUrl = await QRCode.toDataURL(code, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF"
          }
        });
      } catch (qrError) {
        console.error("Error generating QR code:", qrError);
        return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
      }
    } else {
      // Generate OTP
      code = authenticator.generate(space.lock_id);
    }

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + validatedData.duration_minutes);

    // Create access code record
    const { data: accessCode, error: createError } = await supabase
      .from("access_codes")
      .insert({
        user_id: user.id,
        space_id: validatedData.space_id,
        code,
        type: validatedData.type,
        expires_at: expiresAt.toISOString(),
        status: "pending",
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating access code:", createError);
      return NextResponse.json({ error: "Failed to create access code" }, { status: 500 });
    }

    // Log the access request
    await supabase
      .from("access_logs")
      .insert({
        user_id: user.id,
        space_id: validatedData.space_id,
        access_code_id: accessCode.id,
        event: "requested",
        metadata: {
          type: validatedData.type,
          duration_minutes: validatedData.duration_minutes,
        },
      });

    return NextResponse.json({
      access_code: {
        ...accessCode,
        qr_code_url: qrCodeDataUrl,
      },
      space: {
        name: space.name,
        address: space.address,
        partner: space.partner.company_name,
      },
      expires_at: expiresAt.toISOString(),
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const spaceId = searchParams.get("space_id");

    let query = supabase
      .from("access_codes")
      .select(`
        *,
        space:spaces(
          id,
          name,
          address,
          partner:partners(company_name)
        )
      `)
      .eq("user_id", user.id);

    if (status) {
      query = query.eq("status", status);
    }

    if (spaceId) {
      query = query.eq("space_id", spaceId);
    }

    const { data: accessCodes, error } = await query
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching access codes:", error);
      return NextResponse.json({ error: "Failed to fetch access codes" }, { status: 500 });
    }

    return NextResponse.json({ access_codes: accessCodes });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 