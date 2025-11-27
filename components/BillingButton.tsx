"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

export const BillingButton = ({
  variant,
  stripeCustomerId,
  className = "",
  size = "lg",
  text = "Manage Billing",
}: {
  variant: "outline" | "default" | "link" | "brand";
  stripeCustomerId?: string | null;
  className?: string;
  size?: "default" | "sm" | "lg";
  text?: string;
}) => {
  const [loading, setLoading] = useState(false);
  const { authFetch } = useAuthFetch();

  const handleBilling = async () => {
    try {
      setLoading(true);
      const response = await authFetch("/stripe/billing-portal", {
        method: "POST",
        body: JSON.stringify({ stripeCustomerId }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Unable to open billing portal.");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
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
