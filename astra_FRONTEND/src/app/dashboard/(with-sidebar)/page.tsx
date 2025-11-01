"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { filterStatsByRange } from "./utils/filterStats";
import { usePersistedState } from "./hooks/usePersistedState";
import { Button } from "@/components/ui/button";
import { Stat } from "@/types/stat";
import StatsDropdown from "@/app/components/statsDropdown";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency, formatMetric } from "./utils/format";
// import { useRouter } from "next/navigation";
// import ChatWithMakerButton from "@/app/components/ChatWithMakerButton";

// import { Frame } from "lucide-react";

const STAT_CARDS = [
  { title: "Total Sales", field: "revenue", prefix: "$" },
  { title: "Total Orders", field: "sales" },
  { title: "Impressions", field: "visitors" },
  { title: "No. of outfits created", field: "outfits" },
];

const designs = [
  {
    id: 1,
    image: "/designs_cap.png",
    design_name: "Coloured Jumpsuits",
    pieces: 2,
    cost: "£50 ≈ 0.132 ASTRA ",
  },
  {
    id: 2,
    image: "/designs_jacket.png",
    design_name: "Jacket",
    pieces: 4,
    cost: "£20 ≈ 0.092 ASTRA ",
  },
  {
    id: 3,
    image: "/designs_mask.png",
    design_name: "Mask",
    pieces: 10,
    cost: "£50 ≈ 0.132 ASTRA ",
  },
  {
    id: 4,
    image: "/designs_jacket.png",
    design_name: "Jacket",
    pieces: 3,
    cost: "£20 ≈ 0.092 ASTRA",
  },
  {
    id: 5,
    image: "/designs_mask.png",
    design_name: "Ghost Mask",
    pieces: 30,
    cost: "£20 ≈ 0.092 ASTRA",
  },
  {
    id: 6,
    image: "/designs_cap.png",
    design_name: "Vintage Jacket",
    pieces: 6,
    cost: "£20 ≈ 0.092 ASTRA",
  },
];

function Page() {
  const [isEmptyDesign, setIsEmptyDesign] = useState(true);
  const [stats, setStats] = useState<Stat[]>([]);
  const [hasMounted, setHasMounted] = useState(false);
  const [filteredStats, setFilteredStats] = useState<Stat[]>([]);
  const [brandName, setBrandName] = useState();
  // const router = useRouter();

  // Lifted state with setters here
  const [filter, setFilter] = usePersistedState<string>(
    "dashboard-filter",
    "7d"
  );
  const [customDate, setCustomDate] = usePersistedState<string | null>(
    "dashboard-custom-date",
    null
  );

  useEffect(() => {
    axios.get("/data/stats.json").then((res) => setStats(res.data.stats));
  }, []);

  useEffect(() => {
    const filtered = filterStatsByRange(stats, filter, customDate ?? undefined);
    setFilteredStats(filtered);
  }, [stats, filter, customDate]);

  useEffect(() => {
    setHasMounted(true);
    const storedUser = sessionStorage.getItem("user_data");

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setBrandName(user.brandName);
    }
  }, []);

  const getStatTotal = (field: string) =>
    filteredStats.reduce((sum, item) => sum + (item[field] || 0), 0.0);

  if (!hasMounted) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  // const handleDesignToggle = () => {
  //   setIsEmptyDesign((prev) => !prev);
  // };

  return (
    <div className='min-h-screen relative bg-[#F9F9F9] px-7 md:px-[60px] pb-10 pt-12 space-y-10 h-auto'>
      {/* <div
        onClick={handleDesignToggle}
        className='hidden md:flex md:fixed md:bottom-6 md:right-6 z-50 hover:cursor-pointer'>
        <div className='flex justify-center items-center bg-white shadow-md w-12 h-12 rounded-full p-3'>
          <Frame size={30} />
        </div>
      </div> */}

      <div className='space-y-2'>
        <p className='font-[ClashGrotesk-regular] text-2xl'>
          Hello, <span className='font-bold'>{brandName || ""}</span>
        </p>
        <p className='text-[#535353] font-[ClashGrotesk-regular]'>
          Welcome to your Dashboard!
        </p>
      </div>

      <div className='bg-white p-6 rounded-2xl'>
        <h2 className='text-xl font-medium mb-2'>Creator Analytics</h2>

        <div className='flex items-center gap-2 md:text-sm mb-8'>
          <p className='text-[#828282] font-[ClashGrotesk-regular]'>
            Your key stats{" "}
          </p>
          <StatsDropdown
            filter={filter}
            setFilter={setFilter}
            customDate={customDate ? new Date(customDate) : null}
            setCustomDate={(date) =>
              setCustomDate(date ? date.toISOString() : null)
            }
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-5'>
          {STAT_CARDS.map((stat) => (
            <div
              key={stat.title}
              className='px-4 pt-3 pb-2 rounded-xl border border-gray-300 shadow-xs'>
              <p className='text-sm text-black/50 mb-3'>{stat.title}</p>
              <p className='font-semibold'>
                {stat.title === "Total Sales"
                  ? formatCurrency(getStatTotal(stat.field))
                  : formatMetric(getStatTotal(stat.field))}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className='bg-white p-6 md:py-10 md:px-10 lg:px-12 2xl:px-20 rounded-2xl border border-gray-200'>
        {isEmptyDesign ? (
          <div className='space-y-10'>
            <div className='flex justify-between items-center'>
              <h2 className='text-xl font-medium'>My Designs</h2>
              <Link
                href='/designs'
                className='underline hover:text-black/80 text-sm'>
                View all
              </Link>
            </div>

            {/* Designs */}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-[10px]'>
              {designs.map((design) => (
                <div
                  key={design.id}
                  className='overflow-hidden rounded-xl border border-gray-300 flex flex-col'>
                  <Image
                    src={design.image}
                    alt={`${design.design_name} design`}
                    width={240}
                    height={244}
                    className='w-full h-[244px] rounded-t-xl object-cover object-top'
                  />

                  <div className='space-y-[6px] px-3 py-2 text-sm'>
                    <h3 className=' font-medium'>{design.design_name}</h3>
                    <p className='font-light text-black/60'>
                      {design.pieces} Pieces
                    </p>

                    <div className='text-right font-light text-xs lg:text-[11px]'>
                      <p>{design.cost}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='flex justify-center items-center h-auto md:h-[400px]'>
            <div className='space-y-2 text-center'>
              <p className='text-black/50 font-[ClashGrotesk-regular] '>
                You do not have any uploaded outfit
              </p>
              <Button
                variant='outline'
                className='rounded-full p-5 border-primary'>
                Start Creating Designs
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Chat button */}
      <div className='flex justify-center mt-10'>
        {/* <ChatWithMakerButton makerId="6ff62179-9e80-4939-a33f-9e265a044e58" /> */}
      </div>
    </div>
  );
}

export default Page;
