import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LogoUpload from "@/components/products/LogoUpload";

interface ProductEditFormProps {
  formData: {
    id: string;
    name: string;
    overview: string;
    features: string;
    uvp: string;
    targetAudience: string;
    logo: string | null;
  };
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  logo: File | null;
  setLogo: (file: File | null) => void;
  logoPreview: string | null;
  setLogoPreview: (preview: string | null) => void;
  setFormData: React.Dispatch<
    React.SetStateAction<{
      id: string;
      name: string;
      overview: string;
      features: string;
      uvp: string;
      targetAudience: string;
      logo: string | null;
    }>
  >;
}

const ProductEditForm: React.FC<ProductEditFormProps> = ({
  formData,
  handleChange,
  setLogo,
  logoPreview,
  setLogoPreview,
  setFormData,
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="logo-upload">Product Logo</Label>
        <LogoUpload
          logoPreview={logoPreview}
          setLogo={setLogo}
          setLogoPreview={(preview) => {
            setLogoPreview(preview);
            setFormData((prev) => ({ ...prev, logo: preview }));
          }}
        />
      </div>

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
          id="uvp"
          name="uvp"
          value={formData.uvp}
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

export default ProductEditForm;
