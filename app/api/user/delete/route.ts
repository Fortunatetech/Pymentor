import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // 1. Verify the user is currently logged in
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. Verify the email matches the current user
        if (user.email !== email) {
            return NextResponse.json(
                { error: "Email does not match your account" },
                { status: 400 }
            );
        }

        // 3. Verify the password by attempting a sign-in using the Supabase Auth API
        // Note: We can't directly check the password hash (security), so we try to sign in.
        // However, since we are already authenticated, we should use re-authentication or check credentials directly.
        // signInWithPassword will return a new session if successful.
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            return NextResponse.json(
                { error: "Incorrect password" },
                { status: 401 }
            );
        }

        // 4. Delete the user (Using Service Role would be better for admin delete, but self-delete requires specific setup)
        // Actually, a user generally CANNOT delete themselves via the client SDK unless RLS allow it on auth.users (which is rare/unsafe).
        // The standard way is using the Service Role key on the server.
        // But `createClient` here uses the user's token by default.
        // We need a Service Role client for the deletion step.

        // We assume we have a way to create a service role client.
        // If not, we fall back to a "soft delete" or RPC.

        // Let's try to delete using the admin client.
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            // Fallback if keys missing (unlikely in this project setup)
            console.error("Missing Service Role Key");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const admin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

        if (deleteError) {
            console.error("Delete user error:", deleteError);
            return NextResponse.json(
                { error: "Failed to delete account" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Delete account error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
