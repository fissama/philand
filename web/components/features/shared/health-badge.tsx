"use client";

import { useQuery } from "@tanstack/react-query";
import { ActivityIcon } from "lucide-react";

import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export function HealthBadge() {
  const { data } = useQuery({ queryKey: ["health"], queryFn: api.health, staleTime: 1000 * 60 });

  const healthy = data?.status === "ok";

  return (
    <Badge variant={healthy ? "default" : "destructive"} className="gap-2">
      <ActivityIcon className="h-3.5 w-3.5" />
      {healthy ? "API: Healthy" : "API: Down"}
    </Badge>
  );
}
