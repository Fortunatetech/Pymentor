import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error("Missing Service Role Key");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
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

        // 3. Verify password using a plain (non-SSR) client to avoid cookie side effects.
        // The SSR client's signInWithPassword overwrites session cookies mid-request,
        // which can cause the request to hang.
        const verifyClient = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        const { error: signInError } = await verifyClient.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            return NextResponse.json(
                { error: "Incorrect password" },
                { status: 401 }
            );
        }

        // 4. Delete the user using the admin (service role) client
        const admin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
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
