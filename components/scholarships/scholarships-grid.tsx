"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { ScholarshipCard } from "@/components/scholarships/scholarship-card";
import { ApplyDialog } from "@/components/scholarships/apply-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import type { Database } from "@/types";

type Scholarship = Database["public"]["Tables"]["scholarships"]["Row"];

interface ScholarshipsGridProps {
  scholarships: Scholarship[];
  appliedIds: string[];
}

export function ScholarshipsGrid({ scholarships, appliedIds }: ScholarshipsGridProps) {
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);

  if (scholarships.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No scholarships found"
        description="Try adjusting your filters or check back later for new opportunities."
      />
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {scholarships.map((scholarship) => (
          <ScholarshipCard
            key={scholarship.id}
            scholarship={scholarship}
            isApplied={appliedIds.includes(scholarship.id)}
            onApply={(id) => {
              const s = scholarships.find((s) => s.id === id);
              if (s) setSelectedScholarship(s);
            }}
          />
        ))}
      </div>

      {selectedScholarship && (
        <ApplyDialog
          scholarshipId={selectedScholarship.id}
          scholarshipTitle={selectedScholarship.title}
          open={!!selectedScholarship}
          onOpenChange={(open) => !open && setSelectedScholarship(null)}
        />
      )}
    </>
  );
}
