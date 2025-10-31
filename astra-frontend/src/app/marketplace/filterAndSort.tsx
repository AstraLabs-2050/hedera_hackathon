import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Funnel } from "lucide-react";

interface HeaderProps {
  search: string;
  setSearch: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  categories?: string[];
}

export default function FilterAndSort({
  search,
  setSearch,
  sort,
  setSort,
  category,
  setCategory,
  categories = ["Jacket", "Shirt", "Dress"], // Fallback synced with dummy
}: HeaderProps) {
  return (
    <div className='flex flex-wrap md:flex-nowrap items-center gap-4 mb-12 bg-primary-foreground rounded-md px-4 md:px-6 py-4'>
      {/* Search */}
      <Input
        placeholder='Search designs...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='bg-transparent px-6 py-[22px] text-white ring-1 ring-gray-600 rounded-full md:w-[30%]'
        aria-label='Search marketplace designs'
      />

      <div className='flex items-center justify-center gap-[3px] w-full md:w-fit pt-5 md:pt-0'>
        <p>Filters</p>
        <Funnel size={15} />
      </div>

      {/* Sort Dropdown (expanded options) */}
      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger className='w-[45%] md:w-[30%] text-white rounded-full px-6 py-[22px] ring-1 ring-gray-600'>
          <SelectValue placeholder='Sort By' />
        </SelectTrigger>
        <SelectContent className='bg-card-foreground text-white border-gray-700'>
          <SelectItem value='newest'>Newest First</SelectItem>
          <SelectItem value='oldest'>Oldest First</SelectItem>
          <SelectItem value='price-asc'>Price Low to High</SelectItem>
          <SelectItem value='price-desc'>Price High to Low</SelectItem>
        </SelectContent>
      </Select>

      {/* Category Dropdown */}
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className='w-[45%] md:w-[30%] text-white rounded-full px-6 py-[22px] ring-1 ring-gray-600'>
          <SelectValue placeholder='Category' />
        </SelectTrigger>
        <SelectContent className='bg-card-foreground text-white border-gray-700'>
          <SelectItem value='all'>All</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
