"use client";

import VideoProjects from "@/components/pages/VideoProjects";
import { usePathname } from "next/navigation";

export default function VideoProjectsPage() {
  const pathname = usePathname();
  
  return <VideoProjects key={pathname} />;
} 