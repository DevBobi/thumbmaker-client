import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="bg-gradient-to-br from-background via-background/20 to-brand-500/10 dark:via-background/10 dark:to-brand-500/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-8 text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight font-bold">
          Create Winning Ads with Krillion AI
        </h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground text-base sm:text-lg md:text-xl">
          Join thousands of businesses that have revolutionized their
          advertising approach. Start creating high-converting ads today.
        </p>
        <Button
          className="rounded-full text-white dark:text-primary w-44 md:w-48 lg:w-52 bg-brand-600 hover:bg-brand-700 gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-medium shadow-md hover:shadow-xl transition-all duration-300"
          size="lg"
          asChild
        >
          <Link href="/sign-in">Start Creating Now</Link>
        </Button>
      </div>
    </section>
  );
}
