"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AutomatedGeneration from "@/components/products/AutomatedGeneration";
import ManualEntryForm from "@/components/products/ManualEntryForm";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";

const ProductCreate = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("auto");
  const tabs = [
    {
      label: "Automated Generation",
      value: "auto",
    },
    {
      label: "Manual Entry",
      value: "manual",
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Create Product", href: "/dashboard/create-product" },
        ]}
      />
      <div>
        <h1 className="text-3xl font-bold">Create New Product</h1>
        <p className="text-muted-foreground max-w-2xl">
          Create a new product by either using our AI-powered automated
          generation or manually entering the details yourself. Choose the
          method that works best for you.
        </p>
      </div>

      <Tabs
        defaultValue="auto"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mx-auto"
      >
        <TabsList className="grid grid-cols-2 mb-4 w-full h-10">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="cursor-pointer h-8"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="auto">
          <AutomatedGeneration />
        </TabsContent>

        <TabsContent value="manual">
          <ManualEntryForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductCreate;
