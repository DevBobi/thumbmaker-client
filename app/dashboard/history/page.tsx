"use client";

import History from "@/components/pages/History";
import { usePathname } from "next/navigation";

export default function HistoryPage() {
  const pathname = usePathname();
  
  return <History key={pathname} />;
}
