"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useParams, usePathname } from "next/navigation";
import GoBackBtn from "@/app/components/goBackBtn";
import Loader from "@/app/components/common/Loader";
import api from "@/utils/api.class";

interface Design {
  id: string;
  name: string;
  price: string;
  quantity: number;
  publishedStatus: "listed" | "minted" | "draft" | "hired";
  designLink: string;
  lastUpdated: string;
}

interface DesignActionsLayoutProps {
  children: React.ReactNode;
}

// Enhanced context to include loading and error states for better UX
interface DesignContextValue {
  design: Design | null;
  loading: boolean;
  error: string | null;
  isUsingFallback: boolean;
  refetchDesign: () => Promise<void>;
}

const DesignContext = createContext<DesignContextValue | null>(null);

export const useDesignContext = () => {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error(
      "useDesignContext must be used within a DesignActionsLayout"
    );
  }
  return context;
};

export default function DesignActionsLayout({
  children,
}: DesignActionsLayoutProps) {
  const params = useParams<{ designId: string }>();
  const pathname = usePathname();

  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Determine the flow type based on the pathname
  // const flowType = pathname.includes("/hire/") ? "hire" : "publish";

  const fetchDesign = async () => {
    if (!params.designId) {
      setError("No design ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsUsingFallback(false);

      // Make the real API call
      const response = await api.getCreatorInventoryById(params.designId);

      if (response.status && response.data) {
        // Transform API response to match our Design interface
        const transformedDesign: Design = {
          id: response.data.id,
          name: response.data.name,
          price: response.data.price.toString(),
          quantity: response.data.quantity,
          publishedStatus: response.data.publishedStatus,
          designLink: response.data.designLink,
          lastUpdated: response.data.lastUpdated,
        };

        setDesign(transformedDesign);
      } else {
        throw new Error("Failed to fetch design");
      }
    } catch (err) {
      if (err instanceof Error) {
        // console.warn("Using fallback design due to:", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesign();
  }, [params.designId, pathname]);

  // Enhanced loading state
  if (loading) {
    return (
      <div className='flex flex-col items-center justify-start p-4 md:p-8'>
        <div className='hidden md:flex md:fixed left-4 md:left-8'>
          <GoBackBtn />
        </div>
        <div className='flex flex-col items-center justify-center mt-10'>
          <Loader />
        </div>
      </div>
    );
  }

  // Only show error state if we have an error AND no design (fallback failed)
  if (error && !design) {
    return (
      <div className='flex flex-col items-center justify-start p-4 md:px-8'>
        <div className='hidden md:flex md:fixed left-4 md:left-8'>
          <GoBackBtn />
        </div>
        <div className='flex flex-col items-center justify-center py-8 text-center mt-20'>
          <p className='text-gray-500 italic text-sm md:text-base font-medium mb-2'>
            Failed to load design
          </p>
          <p className='text-gray-500 text-xs mb-4'>
            {"The design you're looking for couldn't be loaded."}
          </p>
          {/* <button
            onClick={fetchDesign}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'>
            Try Again
          </button> */}
        </div>
      </div>
    );
  }

  // Enhanced context value with additional utilities
  const contextValue: DesignContextValue = {
    design,
    loading,
    error,
    isUsingFallback,
    refetchDesign: fetchDesign,
  };

  return (
    <DesignContext.Provider value={contextValue}>
      <div className='flex flex-col items-center justify-start py-5 md:p-8'>
        <div className='hidden md:flex md:fixed left-4 md:left-8 '>
          <GoBackBtn />
        </div>
        {children}
      </div>
    </DesignContext.Provider>
  );
}
