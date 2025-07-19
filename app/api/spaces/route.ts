import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createSpaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  lock_id: z.string().min(1, "Lock ID is required"),
  camera_url: z.string().url().optional().or(z.literal("")),
  open_hours: z.record(z.object({
    start: z.string(),
    end: z.string(),
  })).optional(),
  max_duration_minutes: z.number().min(1).max(1440).default(60),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partner_id");
    const isActive = searchParams.get("is_active");

    let query = supabase
      .from("spaces")
      .select(`
        *,
        partner:partners(
          id,
          company_name,
          user:profiles(full_name, email)
        )
      `);

    // Filter by partner if specified
    if (partnerId) {
      query = query.eq("partner_id", partnerId);
    }

    // Filter by active status if specified
    if (isActive !== null) {
      query = query.eq("is_active", isActive === "true");
    }

    const { data: spaces, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching spaces:", error);
      return NextResponse.json({ error: "Failed to fetch spaces" }, { status: 500 });
    }

    return NextResponse.json({ spaces });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a partner
    const { data: partner, error: partnerError } = await supabase
      .from("partners")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json({ error: "Partner account required" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createSpaceSchema.parse(body);

    // Check if lock_id is already in use
    const { data: existingLock, error: lockCheckError } = await supabase
      .from("spaces")
      .select("id")
      .eq("lock_id", validatedData.lock_id)
      .single();

    if (existingLock) {
      return NextResponse.json({ error: "Lock ID already in use" }, { status: 400 });
    }

    // Create the space
    const { data: space, error: createError } = await supabase
      .from("spaces")
      .insert({
        partner_id: partner.id,
        name: validatedData.name,
        description: validatedData.description,
        address: validatedData.address,
        lock_id: validatedData.lock_id,
        camera_url: validatedData.camera_url || null,
        open_hours: validatedData.open_hours || {
          mon: { start: "09:00", end: "17:00" },
          tue: { start: "09:00", end: "17:00" },
          wed: { start: "09:00", end: "17:00" },
          thu: { start: "09:00", end: "17:00" },
          fri: { start: "09:00", end: "17:00" },
        },
        max_duration_minutes: validatedData.max_duration_minutes,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating space:", createError);
      return NextResponse.json({ error: "Failed to create space" }, { status: 500 });
    }

    return NextResponse.json({ space }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
