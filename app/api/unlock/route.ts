import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticator } from "otplib";

const unlockSchema = z.object({
  code: z.string().min(1, "Access code is required"),
  space_id: z.string().uuid("Invalid space ID"),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Parse and validate request body
    const body = await request.json();
    const validatedData = unlockSchema.parse(body);

    // Find the access code
    const { data: accessCode, error: codeError } = await supabase
      .from("access_codes")
      .select(`
        *,
        user:profiles(full_name, email),
        space:spaces(
          id,
          name,
          address,
          lock_id,
          is_active,
          open_hours,
          partner:partners(company_name)
        )
      `)
      .eq("code", validatedData.code)
      .eq("space_id", validatedData.space_id)
      .single();

    if (codeError || !accessCode) {
      return NextResponse.json({ error: "Invalid access code" }, { status: 404 });
    }

    // Check if space is active
    if (!accessCode.space.is_active) {
      return NextResponse.json({ error: "Space is inactive" }, { status: 400 });
    }

    // Check if access code is expired
    const now = new Date();
    const expiresAt = new Date(accessCode.expires_at);
    
    if (now > expiresAt) {
      // Mark as expired
      await supabase
        .from("access_codes")
        .update({ status: "expired" })
        .eq("id", accessCode.id);

      return NextResponse.json({ error: "Access code has expired" }, { status: 400 });
    }

    // Check if access code is already used
    if (accessCode.status === "used") {
      return NextResponse.json({ error: "Access code already used" }, { status: 400 });
    }

    // Check operating hours
    const currentDay = now.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
    const currentTime = now.toLocaleTimeString("en-US", { 
      hour12: false, 
      hour: "2-digit", 
      minute: "2-digit" 
    });

    const openHours = accessCode.space.open_hours as any;
    if (openHours && openHours[currentDay]) {
      const { start, end } = openHours[currentDay];
      if (currentTime < start || currentTime > end) {
        return NextResponse.json({ 
          error: "Space is currently closed",
          details: `Operating hours: ${start} - ${end}`
        }, { status: 400 });
      }
    }

    // Validate OTP if it's an OTP code
    if (accessCode.type === "otp") {
      const isValidOTP = authenticator.verify({
        token: validatedData.code,
        secret: accessCode.space.lock_id,
      });

      if (!isValidOTP) {
        return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 });
      }
    }

    // Mark access code as used
    const { error: updateError } = await supabase
      .from("access_codes")
      .update({ 
        status: "used",
        used_at: now.toISOString()
      })
      .eq("id", accessCode.id);

    if (updateError) {
      console.error("Error updating access code:", updateError);
      return NextResponse.json({ error: "Failed to process access" }, { status: 500 });
    }

    // Log the successful unlock
    await supabase
      .from("access_logs")
      .insert({
        user_id: accessCode.user_id,
        space_id: accessCode.space_id,
        access_code_id: accessCode.id,
        event: "unlocked",
        metadata: {
          type: accessCode.type,
          unlock_time: now.toISOString(),
        },
      });

    // TODO: Integrate with actual smart lock API here
    // For now, we'll simulate the unlock process
    const unlockResult = await simulateSmartLockUnlock(accessCode.space.lock_id);

    if (!unlockResult.success) {
      // Log the failed unlock attempt
      await supabase
        .from("access_logs")
        .insert({
          user_id: accessCode.user_id,
          space_id: accessCode.space_id,
          access_code_id: accessCode.id,
          event: "denied",
          metadata: {
            type: accessCode.type,
            reason: "Smart lock communication failed",
            unlock_time: now.toISOString(),
          },
        });

      return NextResponse.json({ 
        error: "Failed to unlock space",
        details: unlockResult.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Space unlocked successfully",
      space: {
        name: accessCode.space.name,
        address: accessCode.space.address,
        partner: accessCode.space.partner.company_name,
      },
      user: {
        name: accessCode.user.full_name,
        email: accessCode.user.email,
      },
      unlock_time: now.toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Simulate smart lock unlock process
async function simulateSmartLockUnlock(lockId: string): Promise<{ success: boolean; error?: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate 95% success rate
  const success = Math.random() > 0.05;
  
  if (!success) {
    return {
      success: false,
      error: "Smart lock communication timeout"
    };
  }
  
  return { success: true };
}
