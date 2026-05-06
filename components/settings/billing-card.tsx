import { Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PLAN_FEATURES, FREE_PLAN_LIMIT } from "@/lib/constants";

interface BillingCardProps {
  plan: "free" | "premium";
  applicationCount: number;
}

export function BillingCard({ plan, applicationCount }: BillingCardProps) {
  const isPremium = plan === "premium";
  const usagePercent = isPremium
    ? 100
    : Math.min((applicationCount / FREE_PLAN_LIMIT) * 100, 100);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Plan Badge */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">
              {isPremium ? "Premium Plan" : "Free Plan"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isPremium ? "Unlimited access" : `${applicationCount} / ${FREE_PLAN_LIMIT} applications used`}
            </p>
          </div>
          <Badge
            className={
              isPremium
                ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0"
                : ""
            }
            variant={isPremium ? "default" : "secondary"}
          >
            {isPremium ? "✨ Premium" : "Free"}
          </Badge>
        </div>

        {/* Usage bar (free only) */}
        {!isPremium && (
          <div>
            <Progress value={usagePercent} className="h-2" />
            {applicationCount >= FREE_PLAN_LIMIT && (
              <p className="text-xs text-amber-600 mt-1 font-medium">
                Limit reached — upgrade to add more applications.
              </p>
            )}
          </div>
        )}

        {/* Features */}
        <div className="space-y-1.5">
          {PLAN_FEATURES[isPremium ? "premium" : "free"].features.map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
              <span>{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        {!isPremium && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Upgrade to Premium</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Unlock unlimited applications, advanced reminders, and priority support.
            </p>
            <p className="text-lg font-bold mb-3">
              $9.99<span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
            <Button className="w-full" size="sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade Now
            </Button>
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              Payment integration coming soon.
            </p>
          </div>
        )}

        {isPremium && (
          <p className="text-xs text-muted-foreground">
            Thank you for being a Premium member! Your subscription renews automatically.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
