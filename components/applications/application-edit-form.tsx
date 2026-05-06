"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateApplicationAction } from "@/services/applications.actions";
import { updateApplicationSchema, type UpdateApplicationInput } from "@/lib/validations/schemas";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";
import type { ApplicationWithScholarship } from "@/types";

interface ApplicationEditFormProps {
  application: ApplicationWithScholarship;
}

export function ApplicationEditForm({ application }: ApplicationEditFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateApplicationInput>({
    resolver: zodResolver(updateApplicationSchema),
    defaultValues: {
      id: application.id,
      status: application.status,
      notes: application.notes ?? "",
      deadline: application.deadline ?? "",
    },
  });

  const currentStatus = watch("status");

  const onSubmit = (data: UpdateApplicationInput) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", data.id);
      formData.append("status", data.status);
      if (data.notes) formData.append("notes", data.notes);
      if (data.deadline) formData.append("deadline", data.deadline);

      const result = await updateApplicationAction(formData);
      if (result.success) {
        toast({ variant: "success", title: "Application updated!" });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to update",
          description: result.error,
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Edit Application</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("id")} />

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={currentStatus}
              onValueChange={(v) =>
                setValue("status", v as UpdateApplicationInput["status"], {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Custom Deadline</Label>
            <Input
              id="deadline"
              type="date"
              {...register("deadline")}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add notes, requirements, contacts..."
              rows={4}
              {...register("notes")}
              disabled={isPending}
            />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
            )}
          </div>

          <Button
            type="submit"
            size="sm"
            className="w-full gap-1"
            disabled={isPending || !isDirty}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
