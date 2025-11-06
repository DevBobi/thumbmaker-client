"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VideoProjectSheet } from "@/components/projects/VideoProjectSheet";

export default function CreateVideoProjectPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      router.push("/dashboard/projects");
    }
  };

  return (
    <VideoProjectSheet
      open={isOpen}
      onOpenChange={handleOpenChange}
      mode="create"
      onSuccess={() => {
        router.push("/dashboard/projects");
      }}
    />
  );
}

