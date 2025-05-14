
import React from 'react';
import { BrandTone } from '@/contexts/AdContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ToneSelectorProps {
  value: BrandTone | null;
  onChange: (value: BrandTone) => void;
}

const toneDescriptions: Record<BrandTone, string> = {
  'Friendly & Casual': 'Approachable, warm, and conversational tone that builds rapport.',
  'Professional & Concise': 'Clear, direct, and authoritative messaging focused on facts.',
  'Edgy & Humorous': 'Bold, witty content that challenges norms and entertains.',
  'Inspirational & Motivational': 'Uplifting content that encourages action and aspiration.',
  'Sophisticated & Luxurious': 'Refined, elegant messaging that conveys exclusivity and quality.'
};

const ToneSelector: React.FC<ToneSelectorProps> = ({ value, onChange }) => {
  const tones: BrandTone[] = [
    'Friendly & Casual',
    'Professional & Concise',
    'Edgy & Humorous',
    'Inspirational & Motivational',
    'Sophisticated & Luxurious'
  ];

  const handleChange = (newValue: string) => {
    onChange(newValue as BrandTone);
  };

  return (
    <div>
      <Select value={value || undefined} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a brand tone" />
        </SelectTrigger>
        <SelectContent>
          {tones.map((tone) => (
            <SelectItem key={tone} value={tone}>
              {tone}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {value && (
        <p className="text-sm text-muted-foreground mt-2">
          {toneDescriptions[value]}
        </p>
      )}
    </div>
  );
};

export default ToneSelector;
