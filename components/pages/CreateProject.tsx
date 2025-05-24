"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateProject() {
  const router = useRouter();

  const handleAutomatedSubmit = async (data: any) => {
    data['id'] = Math.floor(Math.random() * 1000000);
    console.log("Automated form data:", data);
    // TODO: Create project with automated data
    // After successful creation, redirect to edit page
    router.push(`/dashboard/create-video-project/edit/${data.id}`);
  };

  const handleManualSubmit = async (data: any) => {
    console.log("Manual form data:", data);
    // TODO: Create project with manual data
    // After successful creation, redirect to edit page
    router.push(`/dashboard/create-video-project/edit/${data.id}`);
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
        <h1 className="text-4xl font-bold mb-4">Create New Video Project</h1>
        <p className="text-lg text-muted-foreground">
          Choose how you want to create your project
        </p>
      </div>

      <div className="mx-auto">
        <Tabs defaultValue="automated" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="automated">Automated Generation</TabsTrigger>
            <TabsTrigger value="manual">Manual Generation</TabsTrigger>
          </TabsList>

          <TabsContent value="automated" className="mt-6">
            <AutomatedInputForm onSubmit={handleAutomatedSubmit} />
          </TabsContent>

          <TabsContent value="manual" className="mt-6">
            <ManualInputForm onSubmit={handleManualSubmit} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 