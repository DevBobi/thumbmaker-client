"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductSheet } from "@/components/products/ProductSheet";

export default function CreateProductPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      router.push("/dashboard/products");
    }
  };

  return (
    <ProductSheet
      open={isOpen}
      onOpenChange={handleOpenChange}
      mode="create"
      onSuccess={() => {
        router.push("/dashboard/products");
      }}
    />
  );
}
