import { GraduationCap } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-10 text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-lg">{APP_NAME}</span>
        </div>

        <div>
          <blockquote className="space-y-2">
            <p className="text-xl leading-relaxed text-slate-200">
              "Track every scholarship, meet every deadline, and turn your
              academic dreams into reality — all from one place."
            </p>
            <footer className="text-sm text-slate-400">
              Built for ambitious students worldwide
            </footer>
          </blockquote>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "10K+", label: "Students" },
            { value: "500+", label: "Scholarships" },
            { value: "$2M+", label: "Awarded" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg bg-white/10 p-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - auth form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">{APP_NAME}</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
