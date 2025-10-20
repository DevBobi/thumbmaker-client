"use server";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";

const RETURN_URL = absoluteUrl("/dashboard");

export async function manageSubscription(
  stripeCustomerId: string
): Promise<{ status: string; url?: string; message?: string }> {
  try {
    const user = await currentUser();

    if (!user) {
      return {
        status: "error",
        message: "Unauthorized",
      };
    }

    if (!stripeCustomerId) {
      return {
        status: "error",
        message: "No active subscription found",
      };
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: RETURN_URL,
    });

    return {
      status: "success",
      url: portalSession.url,
    };
  } catch (error) {
    console.error("Subscription update error:", error);
    return {
      status: "error",
      message: "Failed to update subscription",
    };
  }
}

