"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/schemas";
import { updateProfileAction } from "@/services/profile.actions";
import { toast } from "@/hooks/use-toast";

interface ProfileFormProps {
  name: string;
  email: string;
}

export function ProfileForm({ name, email }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors, isDirty } } =
    useForm<UpdateProfileInput>({
      resolver: zodResolver(updateProfileSchema),
      defaultValues: { name },
    });

  const onSubmit = (data: UpdateProfileInput) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name);
      const result = await updateProfileAction(formData);
      if (result.success) {
        toast({ variant: "success", title: "Profile updated!" });
      } else {
        toast({ variant: "destructive", title: "Failed to update profile", description: result.error });
      }
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...register("name")} disabled={isPending} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>
          <Button type="submit" size="sm" disabled={isPending || !isDirty} className="gap-1">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
