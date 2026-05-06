"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Check, Clock, Circle, MinusCircle, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createDocumentAction,
  updateDocumentAction,
  deleteDocumentAction,
} from "@/services/documents.actions";
import {
  createDocumentSchema,
  type CreateDocumentInput,
} from "@/lib/validations/schemas";
import { DOCUMENT_TYPES, DOCUMENT_STATUSES } from "@/lib/constants";
import { getDocumentTypeLabel } from "@/utils";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/utils";
import type { Database } from "@/types";

type Document = Database["public"]["Tables"]["documents"]["Row"];

interface DocumentChecklistProps {
  applicationId: string;
  documents: Document[];
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Circle className="h-4 w-4 text-slate-400" />,
  in_progress: <Clock className="h-4 w-4 text-blue-500" />,
  complete: <Check className="h-4 w-4 text-emerald-500" />,
  not_required: <MinusCircle className="h-4 w-4 text-gray-300" />,
};

const NEXT_STATUS: Record<string, string> = {
  pending: "in_progress",
  in_progress: "complete",
  complete: "pending",
  not_required: "pending",
};

interface AddDocumentDialogProps {
  applicationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: (doc: Document) => void;
}

function AddDocumentDialog({ applicationId, open, onOpenChange, onAdded }: AddDocumentDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, setValue, reset, formState: { errors } } =
    useForm<CreateDocumentInput>({
      resolver: zodResolver(createDocumentSchema),
      defaultValues: { application_id: applicationId, status: "pending", type: "other" },
    });

  const onSubmit = (data: CreateDocumentInput) => {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => v && formData.append(k, v));

      const result = await createDocumentAction(formData);
      if (result.success) {
        toast({ variant: "success", title: "Document added!" });
        reset();
        onOpenChange(false);
        // Refresh will happen via revalidatePath
      } else {
        toast({ variant: "destructive", title: "Failed to add document", description: result.error });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("application_id")} value={applicationId} />

          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select
              defaultValue="other"
              onValueChange={(v) => {
                setValue("type", v as CreateDocumentInput["type"]);
                // Auto-fill name
                const label = getDocumentTypeLabel(v);
                setValue("name", label);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-name">Document Name</Label>
            <Input
              id="doc-name"
              placeholder="e.g., Professor Smith's Recommendation"
              {...register("name")}
              disabled={isPending}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DocumentChecklist({ applicationId, documents: initialDocs }: DocumentChecklistProps) {
  const [documents, setDocuments] = useState(initialDocs);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const cycleStatus = (doc: Document) => {
    const nextStatus = NEXT_STATUS[doc.status] as Document["status"];
    // Optimistic update
    setDocuments((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, status: nextStatus } : d))
    );

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", doc.id);
      formData.append("status", nextStatus);

      const result = await updateDocumentAction(formData);
      if (!result.success) {
        setDocuments(initialDocs);
        toast({ variant: "destructive", title: "Failed to update document status" });
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteDocumentAction(id);
      if (result.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      } else {
        toast({ variant: "destructive", title: "Failed to delete document" });
      }
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm">Document Checklist</CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-xs"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                No documents tracked yet.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add First Document
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50 transition-colors",
                    doc.status === "complete" && "opacity-70"
                  )}
                >
                  <button
                    onClick={() => cycleStatus(doc)}
                    className="flex-shrink-0 hover:scale-110 transition-transform"
                    title="Click to cycle status"
                    disabled={isPending}
                  >
                    {statusIcons[doc.status]}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm truncate",
                        doc.status === "complete" && "line-through text-muted-foreground",
                        doc.status === "not_required" && "text-muted-foreground"
                      )}
                    >
                      {doc.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground capitalize">
                      {getDocumentTypeLabel(doc.type)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    disabled={isPending}
                    title="Delete document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              <div className="pt-2 border-t mt-2">
                <p className="text-xs text-muted-foreground text-center">
                  Click any icon to cycle: ○ → ⏳ → ✓
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddDocumentDialog
        applicationId={applicationId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdded={(doc) => setDocuments((prev) => [...prev, doc])}
      />
    </>
  );
}
