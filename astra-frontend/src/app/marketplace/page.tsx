"use client";

import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/navbar";
import Image from "next/image";
import FilterAndSort from "./filterAndSort";
import { useEffect, useState, useMemo, useCallback } from "react";
import { formatCurrency } from "./../dashboard/(with-sidebar)/utils/format";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/utils/api.class";
import { useRouter } from "next/navigation";

// Types for better type safety
interface Product {
  id: string | number;
  image: string;
  title: string;
  by: string;
  shipsFrom: string;
  price: number;
  preOrder: boolean;
  category: string;
  description: string;
  brandStory: string;
  deliveryWindow: string;
}

interface ApiResponse {
  data?: {
    items: any[];
    totalPages: number;
    filters?: {
      categories: string[];
    };
  };
  items?: any[];
  totalPages?: number;
  filters?: {
    categories: string[];
  };
}

interface FetchParams {
  search?: string;
  category?: string;
  sort?: string;
  limit?: number;
  page?: number;
}

// Constants
const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_DELAY = 300;
const DEFAULT_IMAGE = "/design_placeholder_1.png";

// Fallback data for when API fails
const fallbackProducts: Product[] = [
  {
    id: 1,
    image: "/design_placeholder_4.png",
    title: "Ephemeral Mechanics",
    by: "Lumina Dusk",
    shipsFrom: "USA",
    price: 120,
    preOrder: true,
    category: "Jacket",
    description:
      "Ephemeral Mechanics explores the transient nature of fashion through sustainable, adaptable designs. Each piece in this limited collection is crafted to evolve with the wearer, challenging traditional notions of permanence in clothing.",
    brandStory:
      "Our signature fabric blend combines organic cotton (70%), recycled polyester (25%), and elastane (5%) for comfort, durability, and minimal environmental impact. Every garment is ethically manufactured in small batches to ensure quality and reduce waste.",
    deliveryWindow: "7-10 business days",
  },
  {
    id: 2,
    image: "/design_placeholder_3.png",
    title: "Ephemeral Mechanics",
    by: "Lumina Dusk",
    shipsFrom: "USA",
    price: 120,
    preOrder: true,
    category: "Shirt",
    description:
      "Ephemeral Mechanics explores the transient nature of fashion through sustainable, adaptable designs. Each piece in this limited collection is crafted to evolve with the wearer, challenging traditional notions of permanence in clothing.",
    brandStory:
      "Our signature fabric blend combines organic cotton (70%), recycled polyester (25%), and elastane (5%) for comfort, durability, and minimal environmental impact. Every garment is ethically manufactured in small batches to ensure quality and reduce waste.",
    deliveryWindow: "7-10 business days",
  },
  {
    id: 3,
    image: "/design_placeholder_2.png",
    title: "Ephemeral Mechanics",
    by: "Lumina Dusk",
    shipsFrom: "USA",
    price: 120,
    preOrder: true,
    category: "Dress",
    description:
      "Ephemeral Mechanics explores the transient nature of fashion through sustainable, adaptable designs. Each piece in this limited collection is crafted to evolve with the wearer, challenging traditional notions of permanence in clothing.",
    brandStory:
      "Our signature fabric blend combines organic cotton (70%), recycled polyester (25%), and elastane (5%) for comfort, durability, and minimal environmental impact. Every garment is ethically manufactured in small batches to ensure quality and reduce waste.",
    deliveryWindow: "7-10 business days",
  },
];

// Optimized API fetcher
const fetchDesigns = async (params: FetchParams): Promise<ApiResponse> => {
  const cleanParams: Record<string, any> = {
    search: params.search || undefined,
    category: params.category === "all" ? undefined : params.category,
    page: params.page || 1,
    limit: params.limit || ITEMS_PER_PAGE,
  };

  // Map sort values
  const sortMapping: Record<string, string> = {
    "price-asc": "price_asc",
    "price-desc": "price_desc",
    newest: "newest",
    oldest: "oldest",
  };

  if (params.sort && sortMapping[params.sort]) {
    cleanParams.sortBy = sortMapping[params.sort];
  }

  // Remove undefined values
  Object.keys(cleanParams).forEach(
    (key) => cleanParams[key] === undefined && delete cleanParams[key]
  );

  try {
    return await api.browseMarketplace(cleanParams);
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to fetch marketplace data");
  }
};

// Transform API data to Product format
const transformApiData = (item: any): Product => ({
  id: item.id,
  image: item.imageUrl || DEFAULT_IMAGE,
  title: item.name || "Untitled Design",
  by: item.creator?.fullName || "Unknown Creator",
  shipsFrom: item.metadata?.regionOfDelivery || "N/A",
  price: parseFloat(item.price) || 0,
  preOrder: item.status === "listed",
  category: item.category || "Uncategorized",
  description: item.description || "No description available",
  brandStory: item.metadata?.brandStory || "No brand story available",
  deliveryWindow: item.metadata?.deliveryWindow || "N/A",
});

// Skeleton loader component
const ProductSkeleton = () => (
  <div className='overflow-hidden animate-pulse'>
    <div className='w-full h-[300px] bg-gray-700 rounded' />
    <div className='pt-4 space-y-2'>
      <div className='h-4 bg-gray-700 rounded w-3/4' />
      <div className='h-3 bg-gray-700 rounded w-1/2' />
      <div className='h-3 bg-gray-700 rounded w-1/4' />
      <div className='h-8 bg-gray-700 rounded w-full' />
    </div>
  </div>
);

// Product card component
const ProductCard = ({ product }: { product: Product }) => {
  const router = useRouter();
  const handleClick = () => {
    localStorage.setItem("selectedDesign", JSON.stringify(product));
    router.push(`/marketplace/details/${product.id}`);
  };

  return (
    <div className='overflow-hidden'>
      <Image
        src={product.image}
        alt={`${product.title} by ${product.by}`}
        width={230}
        height={300}
        className='w-full h-[300px] object-cover object-top rounded-t-xl'
        onError={(e) => {
          e.currentTarget.src = DEFAULT_IMAGE;
        }}
      />
      <div className='pt-4'>
        <div className='flex justify-between'>
          <div className='space-y-2'>
            <h3 className='text-sm text-white font-semibold'>
              {product.title}
            </h3>
            <p className='text-gray-400 text-xs'>By {product.by}</p>
          </div>
          <p className='text-white font-semibold'>
            {formatCurrency(product.price)}
          </p>
        </div>
        <p className='flex items-center gap-[2px] text-gray-400 text-xs py-3'>
          <MapPin size={15} />
          Ships from {product.shipsFrom}
        </p>
        <Button
          onClick={handleClick}
          className='block w-full rounded-xl text-sm border border-primary/70 py-2 hover:opacity-70 text-center mt-2'>
          {product.preOrder ? "Pre-Order" : "Buy Now"}
        </Button>
      </div>
    </div>
  );
};

const Marketplace = () => {
  // State management
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("");
  const [category, setCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(search),
      SEARCH_DEBOUNCE_DELAY
    );
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort, category]);

  // Load designs
  const loadDesigns = useCallback(
    async (isLoadingMore = false) => {
      if (isLoadingMore && page > totalPages) return;

      try {
        if (isLoadingMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const response = await fetchDesigns({
          search: debouncedSearch,
          category,
          sort,
          limit: ITEMS_PER_PAGE,
          page,
        });

        // Handle nested response structure
        const responseData = response.data || response;

        if (responseData?.items && Array.isArray(responseData.items)) {
          const transformedProducts = responseData.items.map(transformApiData);

          if (isLoadingMore) {
            setProducts((prev) => [...prev, ...transformedProducts]);
          } else {
            setProducts(transformedProducts);
          }

          setCategories(responseData.filters?.categories || []);
          setTotalPages(responseData.totalPages || 1);
        } else {
          if (!isLoadingMore) {
            setProducts([]);
            setCategories([]);
          }
        }
      } catch (err: any) {
        setError(err.message);
        if (!isLoadingMore) {
          // Use fallback data only on initial load
          setProducts(fallbackProducts);
          setCategories(["Jacket", "Shirt", "Dress"]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearch, category, sort, page, totalPages]
  );

  // Fetch data on dependency changes
  useEffect(() => {
    loadDesigns();
  }, [loadDesigns]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  // Memoized values
  const memoizedProducts = useMemo(() => products, [products]);
  const hasMore = page < totalPages;
  const isInitialLoading = loading && page === 1;

  return (
    <main className='dark bg-background text-foreground font-sans relative'>
      <Navbar />

      {/* Hero Section */}
      <section className='relative min-h-[350px] h-[60vh] md:h-[50vh] mx-6 md:mx-5 overflow-hidden rounded-t-2xl'>
        <Image
          src='/hero_img.png'
          alt='Fashion design showcase with vibrant fabrics'
          fill
          className='object-cover object-center rounded-t-2xl'
          priority
          sizes='40vw'
          placeholder='blur'
          blurDataURL='/hero_img_placeholder.jpg'
        />
        <div className='absolute inset-0 bg-gradient-to-b from-black/5 via-black/5 to-background/60 md:to-background opacity-80' />
        <div className='relative z-20 flex flex-col gap-5 items-center justify-center text-center max-w-2xl h-full mx-auto text-primary px-4'>
          <h1 className='text-5xl md:text-6xl font-semibold font-helvetica bg-gradient-to-b from-primary/40 to-primary bg-clip-text text-transparent leading-tight md:leading-[1.2]'>
            Discover New Drops
          </h1>
          <p className='text-lg text-primary/70'>
            Explore limited edition designs from creators all over the world
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className='mt-24 mb-32 px-6 md:px-24 md:my-16'>
        <FilterAndSort
          search={search}
          setSearch={setSearch}
          sort={sort}
          setSort={setSort}
          category={category}
          setCategory={setCategory}
          categories={categories}
        />

        {/* Error Display */}
        {error && (
          <div className='mb-8 p-4 bg-red-900/50 border border-red-600 rounded text-red-200'>
            <h3 className='font-semibold mb-2'>⚠️ Error Loading Marketplace</h3>
            <p>{error}</p>
            <p className='text-sm mt-2 opacity-75'>Using fallback data.</p>
          </div>
        )}

        {/* Loading State */}
        {isInitialLoading ? (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-10'>
            {Array.from({ length: 6 }, (_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : memoizedProducts.length === 0 ? (
          /* Empty State */
          <div className='text-center py-12'>
            <p className='text-gray-400 text-lg mb-4'>No designs found.</p>
            <div className='text-sm text-gray-500 space-y-1'>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          </div>
        ) : (
          /* Products Grid */
          <div>
            <p className='text-gray-400 text-sm mb-4'>
              Showing {memoizedProducts.length} design(s) • Page {page} of{" "}
              {totalPages}
            </p>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-10'>
              {memoizedProducts.map((product) => (
                <ProductCard key={`${product.id}-${page}`} product={product} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <Button
                onClick={handleLoadMore}
                className='mx-auto block mt-10 bg-primary text-black w-52 h-12 rounded-full hover:bg-primary/60'
                disabled={loadingMore}>
                {loadingMore ? "Loading..." : "Show More"}
              </Button>
            )}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
};

export default Marketplace;
