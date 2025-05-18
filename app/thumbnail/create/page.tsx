"use client";

import { useState } from "react";
import ThumbnailInputType from "@/components/thumbnail/ThumbnailInputType";
import AutomatedInputForm from "@/components/thumbnail/AutomatedInputForm";
import ManualInputForm from "@/components/thumbnail/ManualInputForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

type InputType = "automated" | "manual" | null;

export default function CreateThumbnailPage() {
  const [inputType, setInputType] = useState<InputType>(null);

  const handleAutomatedSubmit = async (data: any) => {
    console.log("Automated form data:", data);
    // TODO: Handle form submission
  };

  const handleManualSubmit = async (data: any) => {
    console.log("Manual form data:", data);
    // TODO: Handle form submission
  };

  return (
    <div className="container mx-auto py-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Thumbnail</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="my-8">
        <h1 className="text-4xl font-bold mb-4">Create YouTube Thumbnail</h1>
        <p className="text-lg text-muted-foreground">
          Choose how you want to generate your thumbnail
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {!inputType ? (
          <ThumbnailInputType onSelect={setInputType} />
        ) : (
          <div>
            <div className="mb-8">
              <button
                onClick={() => setInputType(null)}
                className="text-primary hover:underline"
              >
                ← Choose different method
              </button>
            </div>
            {inputType === "automated" ? (
              <AutomatedInputForm onSubmit={handleAutomatedSubmit} />
            ) : (
              <ManualInputForm onSubmit={handleManualSubmit} />
            )}
          </div>
        )}
      </div>
    </div>
  );
} 