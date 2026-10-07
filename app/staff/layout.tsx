"use client";

import { RoleLayout } from "@/components/role-layout";
import type { ReactNode } from "react";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return <RoleLayout role="staff">{children}</RoleLayout>;
}
