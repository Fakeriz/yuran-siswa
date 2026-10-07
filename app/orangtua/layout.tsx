"use client";

import { RoleLayout } from "@/components/role-layout";
import type { ReactNode } from "react";

export default function OrangTuaLayout({ children }: { children: ReactNode }) {
  return <RoleLayout role="orang_tua">{children}</RoleLayout>;
}
