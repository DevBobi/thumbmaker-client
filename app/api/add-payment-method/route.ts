import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const RETURN_URL = absoluteUrl("/dashboard");

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        {
          status: "error",
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    let customer;

    // Check if customer exists by email
    const customerExists = await stripe.customers.list({
      email: user.emailAddresses[0].emailAddress,
      limit: 1,
    });

    if (customerExists.data.length > 0) {
      customer = customerExists.data[0];
    } else {
      customer = await stripe.customers.create({
        email: user.emailAddresses[0].emailAddress,
      });
    }

    // Create a Checkout session in setup mode to save a payment method
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      mode: "setup",
      success_url: RETURN_URL,
      cancel_url: RETURN_URL,
    });

    return NextResponse.json({
      status: "success",
      url: session.url,
    });
  } catch (error) {
    console.error("Customer portal session error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to create customer portal session" },
      { status: 500 }
    );
  }
}
