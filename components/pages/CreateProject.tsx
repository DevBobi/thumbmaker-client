"use client";

import AutomatedInputForm from "@/components/thumbnail/AutomatedInputForm";
import ManualInputForm from "@/components/thumbnail/ManualInputForm";
import AIEnhancedManualForm from "@/components/products/AIEnhancedManualForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import Link from "next/link";

export default function CreateProject() {
  const { authFetch } = useAuthFetch();

  const handleManualSubmit = async (data: any) => {
    const body = {
      title: data.videoTitle,
      description: data.videoDescription,
      highlights: data.highlights,
      targetAudience: data.targetAudience,
      image: data.image || null,
    };

    const response = await authFetch("/api/projects/create", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to create project");
    }

    const project = await response.json();

    return project;
  };

  return (
    <div className="container mx-auto">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Project</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="my-8">
        <h1 className="text-4xl font-bold mb-4">Add New Project</h1>
        <p className="text-lg text-muted-foreground">
          Choose how you want to create your project
        </p>
      </div>

      <div className="mx-auto">
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="ai-enhanced">AI-Enhanced</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-6">
            <ManualInputForm onSubmit={handleManualSubmit} />
          </TabsContent>

          <TabsContent value="ai-enhanced" className="mt-6">
            <Tabs defaultValue="ai-enhanced-form" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="ai-enhanced-form">AI Form</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="youtube">YouTube</TabsTrigger>
                <TabsTrigger value="document">Document</TabsTrigger>
              </TabsList>

              <TabsContent value="ai-enhanced-form" className="mt-6">
                <AIEnhancedManualForm />
              </TabsContent>

              <TabsContent value="text" className="mt-6">
                <AutomatedInputForm defaultTab="text" />
              </TabsContent>

              <TabsContent value="youtube" className="mt-6">
                <AutomatedInputForm defaultTab="youtube" />
              </TabsContent>

              <TabsContent value="document" className="mt-6">
                <AutomatedInputForm defaultTab="document" />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
