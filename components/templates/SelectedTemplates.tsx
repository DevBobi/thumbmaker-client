import React from "react";
import { AdTemplate } from "@/contexts/AdContext";
import SelectedTemplateCard from "@/components/cards/SelectedTemplateCard";

interface SelectedTemplatesProps {
  templates: AdTemplate[];
  onRemoveTemplate: (templateId: string) => void;
}

const SelectedTemplates: React.FC<SelectedTemplatesProps> = ({
  templates,
  onRemoveTemplate,
}) => {
  if (templates.length === 0) {
    return null;
  }

  return (
    <div className="bg-accent rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Selected Templates ({templates.length})</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {templates.map((template) => (
          <SelectedTemplateCard
            key={template.id}
            template={template}
            onRemove={onRemoveTemplate}
          />
        ))}
      </div>
    </div>
  );
};

export default SelectedTemplates;
