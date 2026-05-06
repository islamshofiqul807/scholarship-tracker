"use client";

import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
        <Mail className="h-8 w-8 text-blue-600" />
      </div>
      <h1 className="text-2xl font-bold">Verify your email</h1>
      <p className="text-sm text-muted-foreground">
        Your account has been created. Please check your inbox and click the
        verification link to get started.
      </p>
      <Link href="/auth/login">
        <Button className="w-full">Go to Login</Button>
      </Link>
    </div>
  );
}
