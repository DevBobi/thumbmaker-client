"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export const BillingButton = ({
  variant,
  stripeCustomerId,
  className = "",
  size = "lg",
  text = "Manage Billing",
}: {
  variant: "outline" | "default" | "link" | "brand";
  stripeCustomerId: string;
  className?: string;
  size?: "default" | "sm" | "lg";
  text?: string;
}) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBilling = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/billing-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stripeCustomerId }),
      });

      const data = await response.json();

      if (data.url) {
        router.push(data.url);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error managing subscription:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 4000);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleBilling}
      disabled={loading}
      className={cn(className)}
      size={size}
    >
      {loading ? (
        <p className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </p>
      ) : (
        text
      )}
    </Button>
  );
};
