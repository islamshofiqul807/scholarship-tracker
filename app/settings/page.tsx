import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/components/settings/profile-form";
import { BillingCard } from "@/components/settings/billing-card";
import { DangerZone } from "@/components/settings/danger-zone";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*, subscriptions(*)")
    .eq("id", user.id)
    .single();

  const { data: appCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <PageHeader title="Settings" description="Manage your account and preferences." />

      {/* Profile Section */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Profile
        </h2>
        <ProfileForm
          name={profile?.name ?? ""}
          email={user.email ?? ""}
        />
      </div>

      <Separator />

      {/* Billing Section */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Subscription
        </h2>
        <BillingCard
          plan={profile?.plan ?? "free"}
          applicationCount={appCount?.count ?? 0}
        />
      </div>

      <Separator />

      {/* Danger Zone */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Danger Zone
        </h2>
        <DangerZone />
      </div>
    </div>
  );
}
