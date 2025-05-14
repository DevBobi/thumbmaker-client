
import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyTemplatesMessageProps {
  onSelectTemplates: () => void;
}

const EmptyTemplatesMessage: React.FC<EmptyTemplatesMessageProps> = ({
  onSelectTemplates
}) => {
  return (
    <div className="border rounded-lg p-12 text-center bg-accent/10">
      <h3 className="text-lg font-medium mb-2">No templates selected</h3>
      <p className="text-muted-foreground">
        Please go back and select templates for your ad.
      </p>
      <Button 
        className="mt-4" 
        variant="outline" 
        onClick={onSelectTemplates}
      >
        Select Templates
      </Button>
    </div>
  );
};

export default EmptyTemplatesMessage;
