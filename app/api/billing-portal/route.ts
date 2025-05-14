import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";

const RETURN_URL = absoluteUrl("/dashboard");

export async function POST(request: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { stripeCustomerId } = await request.json();

    if (!stripeCustomerId) {
      return NextResponse.json(
        { status: "error", message: "No active subscription found" },
        { status: 400 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: RETURN_URL,
    });

    return NextResponse.json({
      status: "success",
      url: portalSession.url,
    });
  } catch (error) {
    console.error("Subscription update error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
