"use client";

import { useState, useEffect } from "react";
import DesignsTabs from "./tabs";
import DesignList from "./designList";
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

export default function DesignsPage() {
  const [activeTab, setActiveTab] = useState("my");
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for when inventory is empty
  // const mockApiResponse = {
  //   status: true,
  //   message: "Creator inventory retrieved successfully",
  //   data: [
  //     {
  //       id: "582955ee-1a17-4264-8393-cff80425e7bb",
  //       name: "Summer Collection Dress",
  //       price: "150.00",
  //       quantity: 1,
  //       publishedStatus: "listed" as const,
  //       designLink:
  //         "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
  //       lastUpdated: "2025-08-28T23:18:12.083Z",
  //     },
  //     {
  //       id: "2e03a615-db14-4f06-b82f-2bd868d6cd9a",
  //       name: "Dom Hill Design",
  //       price: "200.00",
  //       quantity: 1,
  //       publishedStatus: "minted" as const,
  //       designLink:
  //         "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=720&auto=format&fit=crop",
  //       lastUpdated: "2025-08-28T23:18:12.083Z",
  //     },
  //     {
  //       id: "81f6fd41-c613-4a3c-b8f8-02917990340a",
  //       name: "Casual T-Shirt",
  //       price: "50.00",
  //       quantity: 1,
  //       publishedStatus: "draft" as const,
  //       designLink:
  //         "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
  //       lastUpdated: "2025-08-28T23:18:12.083Z",
  //     },
  //     {
  //       id: "89eca9b7-72b1-4b63-bbc9-e4f030fbe37d",
  //       name: "Evening Gown",
  //       price: "350.00",
  //       quantity: 1,
  //       publishedStatus: "listed" as const,
  //       designLink:
  //         "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
  //       lastUpdated: "2025-08-28T23:18:12.083Z",
  //     },
  //     {
  //       id: "aec4a86f-d2e5-4e29-b2a8-76ec641080cf",
  //       name: "Denim Jacket",
  //       price: "120.00",
  //       quantity: 1,
  //       publishedStatus: "hired" as const,
  //       designLink:
  //         "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
  //       lastUpdated: "2025-08-28T23:18:12.083Z",
  //     },
  //   ],
  // };

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setLoading(true);
        setError(null);

        // Make the real API call
        const response = await api.getCreatorInventory();

        if (response.status && response.data) {
          // Check if the inventory has data
          if (response.data.length > 0) {
            // Use real data if available
            setDesigns(response.data);
          } else {
            // Use mock data if inventory is empty
            // setDesigns(mockApiResponse.data);
          }
        } else {
          // Fallback to mock data if API response is not successful
          // console.warn("API response not successful, using mock data");
          // setDesigns(mockApiResponse.data);
        }
      } catch {
        // console.error("Error fetching designs:", error);
        setError("Failed to fetch designs. Please try again later.");

        // Fallback to mock data on error
        // setDesigns(mockApiResponse.data);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  const handleUnpublish = async (designId: string) => {
    try {
      // TODO: Implement actual API call to update design status from "listed" to "minted"
      // Endpoint not ready yet as mentioned
      // const response = await api.updateDesignStatus(designId, 'minted');

      // For now, update local state to simulate the API call
      setDesigns((prevDesigns) =>
        prevDesigns.map((design) =>
          design.id === designId
            ? { ...design, publishedStatus: "minted" as const }
            : design
        )
      );

      // console.log(
      //   `TODO: API call to unpublish design ${designId} - change status from 'listed' to 'minted'`
      // );
    } catch {
      // console.error("Error unpublishing design:", error);
      // TODO: Show error toast/notification to user
    }
  };

  if (loading) {
    return (
      <div className='bg-[#F9F9F9] pt-6 px-6 md:px-[60px] h-full'>
        <div className='mt-10'>
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-[#F9F9F9] pt-6 px-6 md:px-[60px] h-full'>
        <div className='mt-10 text-center'>
          <p className='text-gray-400 italic text-sm mb-4'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-[#F9F9F9] pt-6 px-5 md:px-[60px] h-full min-h-screen'>
      <DesignsTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        designs={designs}
      />
      <DesignList
        activeTab={activeTab}
        designs={designs}
        onUnpublish={handleUnpublish}
      />
    </div>
  );
}
