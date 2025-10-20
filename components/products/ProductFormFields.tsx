import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProductFormFieldsProps {
  formData: {
    name: string;
    overview: string;
    features: string;
    valueProposition: string;
    targetAudience: string;
  };
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  formData,
  handleChange,
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Product/Service Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="overview">Product/Service Overview</Label>
        <Textarea
          id="overview"
          name="overview"
          value={formData.overview}
          onChange={handleChange}
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="features">Key Features & Benefits</Label>
        <Textarea
          id="features"
          name="features"
          value={formData.features}
          onChange={handleChange}
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="valueProposition">Unique Value Proposition (UVP)</Label>
        <Textarea
          id="valueProposition"
          name="valueProposition"
          value={formData.valueProposition}
          onChange={handleChange}
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAudience">Target Audience</Label>
        <Textarea
          id="targetAudience"
          name="targetAudience"
          value={formData.targetAudience}
          onChange={handleChange}
          rows={3}
          required
        />
      </div>
    </>
  );
};

export default ProductFormFields;
