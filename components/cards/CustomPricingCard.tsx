import Link from "next/link";
import { Mail, MessageSquare } from "lucide-react";

export function CustomPricingCard() {
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-accent/50 to-muted dark:from-accent/30 dark:to-muted/50 p-8 shadow-lg border border-border">
    
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium shadow-sm">
          Enterprise
        </span>
      </div>

      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground">Custom Plan</h3>
        <p className="mt-2 text-muted-foreground">
          Tailored to your specific needs
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground">Features</h4>
          <ul className="space-y-3">
            <li className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-primary mr-3" />
              <span className="text-muted-foreground">
                Custom credit packages
              </span>
            </li>
            <li className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-primary mr-3" />
              <span className="text-muted-foreground">Priority support</span>
            </li>
            <li className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-primary mr-3" />
              <span className="text-muted-foreground">
                Dedicated account manager
              </span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground">Contact Us</h4>
          <div className="space-y-3">
            <Link
              href="mailto:contact@trykrillion.com"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-4 w-4 mr-3" />
              contact@trykrillion.com
            </Link>
            <Link
              href="https://twitter.com/rezkhere"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageSquare className="h-4 w-4 mr-3" />
              Direct Message @rezkhere on X
            </Link>
          </div>
        </div>
      </div>

      {/* <div className="mt-8 text-muted-foreground">
        Or schedule a call with us
      </div>

      <Button size="lg" className="mt-8 w-full" asChild>
        <Link
          href="https://calendly.com/your-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Schedule a Call
        </Link>
      </Button> */}
    </div>
  );
}
