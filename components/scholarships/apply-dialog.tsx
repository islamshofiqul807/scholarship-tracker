"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { createApplicationAction } from "@/services/applications.actions";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";

interface ApplyDialogProps {
  scholarshipId: string;
  scholarshipTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplyDialog({
  scholarshipId,
  scholarshipTitle,
  open,
  onOpenChange,
}: ApplyDialogProps) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      status: "wishlist",
      notes: "",
      deadline: "",
    },
  });

  const onSubmit = (data: { status: string; notes: string; deadline: string }) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("scholarship_id", scholarshipId);
      formData.append("status", data.status || "wishlist");
      if (data.notes) formData.append("notes", data.notes);
      if (data.deadline) formData.append("deadline", data.deadline);

      const result = await createApplicationAction(formData);

      if (result.success) {
        toast({
          variant: "success",
          title: "Application created!",
          description: `You've started tracking "${scholarshipTitle}".`,
        });
        reset();
        onOpenChange(false);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to create application",
          description: result.error,
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start Application</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {scholarshipTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div className="space-y-2">
            <Label>Initial Status</Label>
            <Select
              defaultValue="wishlist"
              onValueChange={(v) => setValue("status", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_STATUSES.slice(0, 3).map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Your Deadline (optional)</Label>
            <Input
              id="deadline"
              type="date"
              {...register("deadline")}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Override if your deadline differs from the scholarship's.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Requirements, contacts, reminders..."
              rows={3}
              disabled={isPending}
              {...register("notes")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}