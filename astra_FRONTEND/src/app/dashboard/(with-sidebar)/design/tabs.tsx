"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Design {
  id: string;
  name: string;
  price: string;
  quantity: number;
  publishedStatus: "listed" | "minted" | "draft" | "hired";
  designLink: string;
  lastUpdated: string;
}

interface DesignsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  designs: Design[];
}

export default function DesignsTabs({
  activeTab,
  setActiveTab,
  designs,
}: DesignsTabsProps) {
  // Calculate counts based on publishedStatus
  const counts = {
    my: designs.filter(
      (d) => d.publishedStatus === "minted" || d.publishedStatus === "draft"
    ).length,
    marketplace: designs.filter((d) => d.publishedStatus === "listed").length,
    jobs: designs.filter((d) => d.publishedStatus === "hired").length,
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value='my'>My Designs ({counts.my})</TabsTrigger>
        <TabsTrigger value='marketplace'>
          Marketplace Designs ({counts.marketplace})
        </TabsTrigger>
        <TabsTrigger value='jobs'>Design Jobs ({counts.jobs})</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
