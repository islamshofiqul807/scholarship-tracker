import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar, MobileSidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    await (supabase as any).from("users").insert({
      id: user.id,
      name: user.user_metadata?.name ?? user.email?.split("@")[0] ?? "User",
      email: user.email ?? "",
      plan: "free",
    });
  }

  const userProfile = (profile as any) ?? {
    name: user.user_metadata?.name ?? "User",
    email: user.email ?? "",
    plan: "free" as const,
    avatar_url: null,
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar user={userProfile} />
      </div>
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="min-h-full p-6 pb-20 md:pb-6">
          {children}
        </div>
      </main>
      <MobileSidebar user={userProfile} />
    </div>
  );
}
