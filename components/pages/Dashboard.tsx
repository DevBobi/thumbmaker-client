"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import { GuaranteePopup } from "@/components/GuaranteePopup";
import { Project } from "@/types";

interface DashboardProps {
  projects: Project[];
}

const Dashboard = ({ projects }: DashboardProps) => {
  return (
    <div className="space-y-10">
      <GuaranteePopup />
      {/* Generate Static Ads Section */}
      <section className="relative p-4 sm:p-6 md:p-10 bg-gradient-to-r from-background via-accent/10 to-accent/20 dark:from-background/80 dark:via-accent/5 dark:to-accent/10 rounded-xl border border-border overflow-hidden shadow-lg">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-gradient-to-br from-brand-300/10 to-accent/20 dark:from-brand-300/5 dark:to-accent/10 rounded-full blur-3xl -mr-10 sm:-mr-16 md:-mr-20 -mt-10 sm:-mt-16 md:-mt-20"></div>
        <div className="absolute bottom-0 left-0 w-24 sm:w-32 md:w-48 h-24 sm:h-32 md:h-48 bg-gradient-to-tr from-brand-400/10 to-accent/10 dark:from-brand-400/5 dark:to-accent/5 rounded-full blur-2xl -ml-5 sm:-ml-8 md:-ml-10 -mb-5 sm:-mb-8 md:-mb-10"></div>

        <div className="relative flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
          <div className="inline-block p-1.5 sm:p-2 bg-brand-100/30 dark:bg-brand-900/30 rounded-full mb-1 sm:mb-2">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-brand-600 dark:text-brand-400" />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Generate Static Ads
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed px-2 sm:px-4">
            Create compelling ads for your products and services in seconds
            using our AI-powered platform. Transform your marketing with just a
            few clicks.
          </p>

          <div>
            <Button
              className="rounded-full text-white dark:text-primary w-40 sm:w-48 md:w-52 bg-brand-600 hover:bg-brand-700 gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg font-medium shadow-md hover:shadow-xl transition-all duration-300"
              size="lg"
              asChild
            >
              <Link href="/dashboard/create-ad">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                Create Ad
              </Link>
            </Button>
          </div>

          {/* <div className="flex items-center gap-3 text-sm text-muted-foreground mt-4">
            <span>Join 2,000+ marketers already using our platform</span>
          </div> */}
        </div>
      </section>

      {/* Products Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Products</h2>
          <div>
            <Button
              variant="default"
              className="bg-brand-600 hover:bg-brand-700 gap-2 shadow-sm dark:text-primary"
              asChild
            >
              <Link href="/dashboard/create-video-project">
                <Plus className="h-4 w-4" />
                Add Project
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project: Project) => (
            <ProductCard key={project.id} project={project} />
          ))}

          {projects.length === 0 && (
            <div className="col-span-full p-8 text-center border border-dashed rounded-lg border-border">
              <p className="text-muted-foreground">
                No projects yet. Add your first project to get started.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
