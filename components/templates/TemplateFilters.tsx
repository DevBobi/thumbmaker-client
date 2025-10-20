import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterOption {
  value: string;
  label: string;
}

// Sample data - would come from API in real app
const productTypes: FilterOption[] = [
  { value: "saas", label: "SaaS" },
  { value: "ecommerce", label: "eCommerce" },
  { value: "service", label: "Service" },
];

const brands: FilterOption[] = Array(48)
  .fill(0)
  .map((_, i) => ({
    value: `brand${i + 1}`,
    label: `Brand ${i + 1}`,
  }));

const niches: FilterOption[] = [
  { value: "drinks", label: "Drinks" },
  { value: "snacks", label: "Snacks" },
  { value: "tech", label: "Tech" },
  { value: "fashion", label: "Fashion" },
  { value: "beauty", label: "Beauty" },
  { value: "fitness", label: "Fitness" },
  { value: "health", label: "Health" },
  { value: "home", label: "Home" },
  { value: "travel", label: "Travel" },
];

interface TemplateFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: {
    productType: string | null;
    brand: string | null;
    niche: string | null;
  };
  onFilterChange: (name: string, value: string | null) => void;
  onClearFilters: () => void;
}

const FilterSelect: React.FC<{
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder: string;
}> = ({ options, value, onChange, placeholder }) => {
  const [searchValue, setSearchValue] = useState("");

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Select value={value || undefined} onValueChange={(val) => onChange(val)}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <Input
            placeholder={`Search ${placeholder.toLowerCase()}`}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="mb-2"
          />
        </div>
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))
        ) : (
          <div className="p-2 text-center text-muted-foreground text-sm">
            No options found
          </div>
        )}
      </SelectContent>
    </Select>
  );
};

const TemplateFilters: React.FC<TemplateFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const handleRemoveFilter = (name: string) => {
    onFilterChange(name, null);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search thumbnail templates by keywords or tags..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <div>
          <FilterSelect
            options={productTypes}
            value={filters.productType}
            onChange={(value) => onFilterChange("productType", value)}
            placeholder="Product Type"
          />
        </div>
        <div>
          <FilterSelect
            options={brands}
            value={filters.brand}
            onChange={(value) => onFilterChange("brand", value)}
            placeholder="Brand"
          />
        </div>
        <div>
          <FilterSelect
            options={niches}
            value={filters.niche}
            onChange={(value) => onFilterChange("niche", value)}
            placeholder="Niche"
          />
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.productType && (
            <div className="inline-flex items-center bg-accent rounded-full py-1 px-3 text-sm">
              <span>
                {productTypes.find((t) => t.value === filters.productType)
                  ?.label || filters.productType}
              </span>
              <button
                onClick={() => handleRemoveFilter("productType")}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.brand && (
            <div className="inline-flex items-center bg-accent rounded-full py-1 px-3 text-sm">
              <span>
                {brands.find((b) => b.value === filters.brand)?.label ||
                  filters.brand}
              </span>
              <button
                onClick={() => handleRemoveFilter("brand")}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.niche && (
            <div className="inline-flex items-center bg-accent rounded-full py-1 px-3 text-sm">
              <span>
                {niches.find((n) => n.value === filters.niche)?.label ||
                  filters.niche}
              </span>
              <button
                onClick={() => handleRemoveFilter("niche")}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 text-sm text-muted-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default TemplateFilters;
