import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  MapPin,
  GraduationCap,
  DollarSign,
} from "lucide-react";
import { getApplicationById } from "@/services/applications.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { DocumentChecklist } from "@/components/documents/document-checklist";
import { ApplicationEditForm } from "@/components/applications/application-edit-form";
import {
  formatDate,
  calculateDocumentCompletion,
  getCountryLabel,
  getDegreeLevelLabel,
  getFundingTypeLabel,
} from "@/utils";

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ApplicationDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const application = await getApplicationById(id);
  return {
    title: (application?.scholarship as any)?.title ?? "Application Details",
  };
}

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id } = await params;
  const application = await getApplicationById(id);

  if (!application) notFound();

  const scholarship = application.scholarship as any;
  const documents = application.documents as any[];
  const docCompletion = calculateDocumentCompletion(documents ?? []);
  const deadline = application.deadline ?? scholarship?.deadline;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Back */}
      <Link href="/applications">
        <Button variant="ghost" size="sm" className="gap-1 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{scholarship?.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={application.status} type="application" />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {getCountryLabel(scholarship?.country ?? "")}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5" />
              {getDegreeLevelLabel(scholarship?.degree_level ?? "")}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              {getFundingTypeLabel(scholarship?.funding_type ?? "")}
            </div>
          </div>
        </div>
        {scholarship?.link && (
          <a href={scholarship.link} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1">
              <ExternalLink className="h-4 w-4" />
              Official Site
            </Button>
          </a>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Document Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-2">
                <Progress value={docCompletion} className="flex-1 h-2" />
                <span className="text-sm font-semibold text-primary">{docCompletion}%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {(documents ?? []).filter((d: any) => d.status === "complete").length} of{" "}
                {(documents ?? []).filter((d: any) => d.status !== "not_required").length} documents complete
              </p>
            </CardContent>
          </Card>

          <DocumentChecklist
            applicationId={application.id}
            documents={documents ?? []}
          />
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:col-span-2">
          <ApplicationEditForm application={application} />

          {deadline && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Deadline</p>
                    <p className="text-sm font-semibold">{formatDate(deadline)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {application.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {application.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {scholarship?.description && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-6">
                  {scholarship.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}