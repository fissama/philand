"use client";

import { getVersionInfo } from "@/lib/version";

export function VersionInfo() {
  const { version, name, buildDate } = getVersionInfo();
  
  return (
    <div className="text-xs text-muted-foreground space-y-1">
      <div className="font-medium">{name}</div>
      <div>Version {version}</div>
      <div>Built: {new Date(buildDate).toLocaleDateString()}</div>
    </div>
  );
}