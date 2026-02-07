"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useUser, useSubscription } from "@/hooks";
import Link from "next/link";

export default function SettingsPage() {
  const { profile, authUser } = useUser();
  const { subscription, isPro } = useSubscription();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [dailyGoal, setDailyGoal] = useState(15);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Account Deletion State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setDailyGoal(profile.daily_goal_minutes || 15);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!authUser) return;
    setSaving(true);
    setSaved(false);

    await supabase
      .from("profiles")
      .update({
        name,
        daily_goal_minutes: dailyGoal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authUser.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    setChangingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }

    setChangingPassword(false);
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel? You'll lose access to Pro features at the end of your billing period.")) {
      return;
    }

    const response = await fetch("/api/billing/cancel", {
      method: "POST",
    });

    if (response.ok) {
      window.location.reload();
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: deleteEmail,
          password: deletePassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDeleteError(data.error || "Failed to delete account");
        setDeleting(false);
      } else {
        // Success! Sign out and redirect
        await supabase.auth.signOut();
        window.location.href = "/";
      }
    } catch (err) {
      setDeleteError("An unexpected error occurred");
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-dark-900 mb-8">Settings</h1>

      {/* Profile Settings */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="font-semibold text-dark-900 mb-4">Profile</h2>

          <div className="space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={authUser?.email || ""}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-dark-200 bg-dark-50 text-dark-500"
              />
              <p className="text-xs text-dark-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Daily Learning Goal
              </label>
              <select
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-dark-200 bg-white"
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              {saved && (
                <span className="text-green-600 text-sm">✓ Saved!</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="font-semibold text-dark-900 mb-4">Change Password</h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Input
              type="password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />

            {passwordError && (
              <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                ✓ Password updated successfully!
              </p>
            )}

            <Button type="submit" disabled={changingPassword}>
              {changingPassword ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Streak Freeze (Pro only) */}
      {isPro && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold text-dark-900 mb-4">Streak Freeze</h2>
            <div className="p-4 bg-primary-50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🧊</span>
                <div>
                  <p className="font-medium text-dark-900">
                    Pro Streak Protection
                  </p>
                  <p className="text-sm text-dark-500">
                    As a Pro member, you get one free streak freeze per week. If you miss a day,
                    your streak will be automatically preserved.
                  </p>
                </div>
              </div>
              {(profile as any)?.streak_freeze_used_at && (
                <p className="text-xs text-dark-400 mt-2">
                  Last used: {new Date((profile as any).streak_freeze_used_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="font-semibold text-dark-900 mb-4">Subscription</h2>

          <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-dark-900">
                  {isPro ? "Pro Plan" : "Free Plan"}
                </span>
                <Badge variant={isPro ? "primary" : "default"}>
                  {subscription?.plan || "free"}
                </Badge>
              </div>
              {subscription?.current_period_end && (
                <p className="text-sm text-dark-500 mt-1">
                  {subscription.cancel_at_period_end
                    ? "Cancels"
                    : "Renews"} on{" "}
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>

            {isPro ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancelSubscription}
              >
                Cancel
              </Button>
            ) : (
              <Link href="/pricing">
                <Button size="sm">Upgrade</Button>
              </Link>
            )}
          </div>

          {!isPro && (
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 text-white">
              <h3 className="font-semibold mb-1">Unlock Pro Features</h3>
              <p className="text-sm text-primary-100 mb-3">
                Get unlimited lessons, AI chat, and all projects
              </p>
              <Link href="/pricing">
                <Button variant="secondary" size="sm">
                  View Plans
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold text-red-600 mb-4">Danger Zone</h2>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-xl">
            <div>
              <p className="font-medium text-dark-900">Delete Account</p>
              <p className="text-sm text-dark-500">
                Permanently delete your account and all data
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-dark-100 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto text-xl">
                ⚠️
              </div>
              <h2 className="text-xl font-bold text-dark-900 text-center mb-2">
                Are you absolutely sure?
              </h2>
              <p className="text-dark-500 text-center mb-6">
                This action is permanent and cannot be undone. You will lose your progress, XP, and all account data.
              </p>

              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <Input
                  label="Type your email to confirm"
                  placeholder={authUser?.email || "Email"}
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  label="Enter your password"
                  placeholder="••••••••"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                />

                {deleteError && (
                  <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                    {deleteError}
                  </p>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="danger"
                    className="w-full"
                    disabled={deleting || deleteEmail !== authUser?.email || !deletePassword}
                  >
                    {deleting ? "Deleting Account..." : "Permanently Delete Account"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteEmail("");
                      setDeletePassword("");
                      setDeleteError("");
                    }}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
