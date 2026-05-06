"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES, DEGREE_LEVELS, FUNDING_TYPES } from "@/lib/constants";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

export function ScholarshipFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCountry = searchParams.get("country") ?? "";
  const currentDegree = searchParams.get("degree_level") ?? "";
  const currentFunding = searchParams.get("funding_type") ?? "";
  const currentSearch = searchParams.get("search") ?? "";

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = useDebouncedCallback((value: string) => {
    router.push(`${pathname}?${createQueryString({ search: value })}`);
  }, 400);

  const handleFilter = (key: string, value: string) => {
    router.push(`${pathname}?${createQueryString({ [key]: value })}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasFilters = currentCountry || currentDegree || currentFunding || currentSearch;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search scholarships..."
          className="pl-9"
          defaultValue={currentSearch}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Country Filter */}
      <Select
        value={currentCountry || "all"}
        onValueChange={(v) => handleFilter("country", v === "all" ? "" : v)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Countries</SelectItem>
          {COUNTRIES.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Degree Filter */}
      <Select
        value={currentDegree || "all"}
        onValueChange={(v) => handleFilter("degree_level", v === "all" ? "" : v)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Degree" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Degrees</SelectItem>
          {DEGREE_LEVELS.map((d) => (
            <SelectItem key={d.value} value={d.value}>
              {d.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Funding Filter */}
      <Select
        value={currentFunding || "all"}
        onValueChange={(v) => handleFilter("funding_type", v === "all" ? "" : v)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Funding" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Funding</SelectItem>
          {FUNDING_TYPES.map((f) => (
            <SelectItem key={f.value} value={f.value}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
