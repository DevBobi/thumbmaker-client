import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, X, ArrowDownUp } from "lucide-react";
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

interface EnhancedTemplateFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    category: string | null;
    brand: string | null;
    niche: string | null;
    subNiche: string | null;
  };
  onFilterChange: (name: string, value: string | null) => void;
  onClearFilters: () => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (field: any) => void;
  categoryOptions: FilterOption[];
  brandOptions: FilterOption[];
  nicheOptions: FilterOption[];
  subNicheOptions: FilterOption[];
}

const EnhancedTemplateFilters: React.FC<EnhancedTemplateFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
  sortBy,
  sortOrder,
  onSortChange,
  categoryOptions,
  brandOptions,
  nicheOptions,
  subNicheOptions,
}) => {
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const [categorySearch, setCategorySearch] = React.useState("");
  const [brandSearch, setBrandSearch] = React.useState("");
  const [nicheSearch, setNicheSearch] = React.useState("");
  const [subNicheSearch, setSubNicheSearch] = React.useState("");

  // Prevent select from closing when typing in search inputs
  const handleSearchInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Keep focus on input when typing
  const handleSearchInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setSearchFunction: React.Dispatch<React.SetStateAction<string>>
  ) => {
    e.stopPropagation();
    setSearchFunction(e.target.value);
    // Ensure the input keeps focus
    e.target.focus();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-4 w-full">
            <div className="w-full">
              <Select
                value={filters.category || "all"}
                onValueChange={(value) =>
                  onFilterChange("category", value === "all" ? null : value)
                }
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <div onClick={handleSearchInputClick}>
                    <Input
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) =>
                        handleSearchInputChange(e, setCategorySearch)
                      }
                      className="mb-2"
                      autoComplete="off"
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <SelectItem value="all">All categories</SelectItem>
                  {categoryOptions
                    .filter((option) =>
                      option.label
                        .toLowerCase()
                        .includes(categorySearch.toLowerCase())
                    )
                    .map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full">
              <Select
                value={filters.brand || "all"}
                onValueChange={(value) =>
                  onFilterChange("brand", value === "all" ? null : value)
                }
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  <div onClick={handleSearchInputClick}>
                    <Input
                      placeholder="Search brands..."
                      value={brandSearch}
                      onChange={(e) =>
                        handleSearchInputChange(e, setBrandSearch)
                      }
                      className="mb-2"
                      autoComplete="off"
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <SelectItem value="all">All brands</SelectItem>
                  {brandOptions
                    .filter((option) =>
                      option.label
                        .toLowerCase()
                        .includes(brandSearch.toLowerCase())
                    )
                    .map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full">
              <Select
                value={filters.niche || "all"}
                onValueChange={(value) =>
                  onFilterChange("niche", value === "all" ? null : value)
                }
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Niche" />
                </SelectTrigger>
                <SelectContent>
                  <div onClick={handleSearchInputClick}>
                    <Input
                      placeholder="Search niches..."
                      value={nicheSearch}
                      onChange={(e) =>
                        handleSearchInputChange(e, setNicheSearch)
                      }
                      className="mb-2"
                      autoComplete="off"
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <SelectItem value="all">All niches</SelectItem>
                  {nicheOptions
                    .filter((option) =>
                      option.label
                        .toLowerCase()
                        .includes(nicheSearch.toLowerCase())
                    )
                    .map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full">
              <Select
                value={filters.subNiche || "all"}
                onValueChange={(value) =>
                  onFilterChange("subNiche", value === "all" ? null : value)
                }
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Sub Niche" />
                </SelectTrigger>
                <SelectContent>
                  <div onClick={handleSearchInputClick}>
                    <Input
                      placeholder="Search sub niches..."
                      value={subNicheSearch}
                      onChange={(e) =>
                        handleSearchInputChange(e, setSubNicheSearch)
                      }
                      className="mb-2"
                      autoComplete="off"
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <SelectItem value="all">All sub niches</SelectItem>
                  {subNicheOptions
                    .filter((option) =>
                      option.label
                        .toLowerCase()
                        .includes(subNicheSearch.toLowerCase())
                    )
                    .map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onSortChange(sortBy)}
              className="h-9 w-9"
            >
              {sortOrder === "asc" ? (
                <ArrowUpDown className="h-4 w-4" />
              ) : (
                <ArrowDownUp className="h-4 w-4" />
              )}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="h-9 flex-1 sm:flex-none"
              >
                Clear ({activeFiltersCount})
              </Button>
            )}
          </div>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.category && (
            <div className="inline-flex items-center bg-accent rounded-full py-1 px-3 text-sm">
              <span>
                {categoryOptions.find((t) => t.value === filters.category)
                  ?.label || filters.category}
              </span>
              <button
                onClick={() => onFilterChange("category", null)}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.brand && (
            <div className="inline-flex items-center bg-accent rounded-full py-1 px-3 text-sm">
              <span>
                {brandOptions.find((b) => b.value === filters.brand)?.label ||
                  filters.brand}
              </span>
              <button
                onClick={() => onFilterChange("brand", null)}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.niche && (
            <div className="inline-flex items-center bg-accent rounded-full py-1 px-3 text-sm">
              <span>
                {nicheOptions.find((n) => n.value === filters.niche)?.label ||
                  filters.niche}
              </span>
              <button
                onClick={() => onFilterChange("niche", null)}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedTemplateFilters;
