import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import Breadcrumb from "@/components/Breadcrumb";
import { HelpCircle, AlertCircle, MessageCircle } from "lucide-react";

export default function Support() {
  return (
    <div className="mx-auto px-4 space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Support", href: "/dashboard/support" },
        ]}
      />
      <div>
        <h1 className="text-3xl font-bold">Support Center</h1>
        <p className="text-muted-foreground">
          Get help and support for your trykrillion account
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Need Help Card */}
        <Card>
          <CardHeader>
            <Alert className="mb-2">
              <AlertTitle className="flex items-center gap-2">
                <span className="text-green-600">
                  <HelpCircle className="w-4 h-4" />
                </span>{" "}
                Need Help?
              </AlertTitle>
              <AlertDescription>
                Get in touch with our support team for assistance
              </AlertDescription>
            </Alert>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                </span>
                <span>DM us on X</span>
              </div>
              <div className="text-sm text-muted-foreground">
                We typically respond within a few hours
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="brand" asChild>
                <a
                  href="https://x.com/rezkhere"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  DM on X
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report an Issue Card */}
        <Card>
          <CardHeader>
            <Alert variant="destructive" className="mb-2">
              <AlertTitle className="flex items-center gap-2">
                <span className="text-red-600">
                  <AlertCircle className="w-4 h-4" />
                </span>{" "}
                Report an Issue
              </AlertTitle>
              <AlertDescription>
                Found a bug or having technical difficulties?
              </AlertDescription>
            </Alert>
          </CardHeader>
          <CardContent>
            {/* <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </span>
                <span>
                  Email us at{" "}
                  <a
                    href="mailto:contact@trykrillion.com"
                    className="text-brand-600 underline"
                  >
                    contact@trykrillion.com
                  </a>
                </span>
              </div> */}{" "}
            <div className="mb-4 text-sm text-muted-foreground">
              Our support team will investigate and respond within 48 hours.
              <br />
              Please provide as much detail as possible.
            </div>
            <Button variant="destructive" asChild>
              <a
                href="https://x.com/rezkhere"
                target="_blank"
                rel="noopener noreferrer"
              >
                Report an Issue
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <h2 className="text-2xl font-semibold mb-4">
        Frequently Asked Questions
      </h2>
      <p className="text-muted-foreground mb-4">
        Common questions about trykrillion
      </p>
      <Card>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="faq-1">
              <AccordionTrigger>
                How do I get started with trykrillion?
              </AccordionTrigger>
              <AccordionContent>
                Getting started is easy! Simply sign up for an account and
                follow our interactive onboarding process. We'll guide you
                through setting up your first test case.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2">
              <AccordionTrigger>
                What payment methods do you accept?
              </AccordionTrigger>
              <AccordionContent>
                We accept all major credit cards (Visa, MasterCard, American
                Express) and PayPal. For enterprise plans, we also support wire
                transfers.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3">
              <AccordionTrigger>
                Can I cancel my subscription anytime?
              </AccordionTrigger>
              <AccordionContent>
                Yes, you can cancel your subscription at any time. Your access
                will continue until the end of your current billing period.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-4">
              <AccordionTrigger>
                Is there a free trial available?
              </AccordionTrigger>
              <AccordionContent>
                No, we currently don't offer a free trial. However, we do offer
                a 100% money-back guarantee if you're not satisfied with our
                service.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
