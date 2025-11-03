import DesignCard from "./designCard";

interface Design {
  id: string;
  name: string;
  price: string;
  quantity: number;
  publishedStatus: "listed" | "minted" | "draft" | "hired";
  designLink: string;
  lastUpdated: string;
}

interface DesignListProps {
  activeTab: string;
  designs: Design[];
  onUnpublish?: (designId: string) => void;
}

export default function DesignList({
  activeTab,
  designs,
  onUnpublish,
}: DesignListProps) {
  const filterDesignsByTab = (designs: Design[], tab: string): Design[] => {
    switch (tab) {
      case "my":
        // Show designs with status "minted" and "draft"
        return designs.filter(
          (design) =>
            design.publishedStatus === "minted" ||
            design.publishedStatus === "draft"
        );
      case "marketplace":
        // Show only designs with status "listed"
        return designs.filter((design) => design.publishedStatus === "listed");
      case "jobs":
        // Show only designs with status "hired"
        return designs.filter((design) => design.publishedStatus === "hired");
      default:
        return [];
    }
  };

  const filteredDesigns = filterDesignsByTab(designs, activeTab);

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 mt-7'>
      {filteredDesigns.length > 0 ? (
        filteredDesigns.map((design) => (
          <DesignCard
            key={design.id}
            design={design}
            activeTab={activeTab}
            onUnpublish={onUnpublish}
          />
        ))
      ) : (
        <p className='text-gray-500 text-sm col-span-full'>
          {activeTab === "my" &&
            "No designs found. Create your first design to get started."}
          {activeTab === "marketplace" &&
            "No designs published to marketplace yet."}
          {activeTab === "jobs" && "No design jobs available at the moment."}
        </p>
      )}
    </div>
  );
}
