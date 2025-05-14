
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GeneratedAd } from '@/types/ad.types';

interface AdPreviewProps {
  ad: GeneratedAd;
}

const AdPreview = ({ ad }: AdPreviewProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium mb-4">Ad Preview</h3>
        <div className="aspect-[4/3] relative overflow-hidden rounded-md">
          <img 
            src={ad.finalImageUrl || ad.imageUrl} 
            alt="Ad preview"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="mt-4 text-sm">
          <p className="text-muted-foreground">
            Template: {ad.templateId}
          </p>
          {ad.adCopy && (
            <div className="mt-2 space-y-1">
              <p className="font-medium">{ad.adCopy.headline}</p>
              {ad.adCopy.subtitle && (
                <p className="text-muted-foreground text-xs">{ad.adCopy.subtitle}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdPreview;
