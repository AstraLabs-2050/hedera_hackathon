"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { IoShirtOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { EllipsisVertical, QrCode, SquarePen } from "lucide-react";
import { useState } from "react";
import { Design } from "@/types/types";
interface DesignCardProps {
  design: Design;
  activeTab?: string;
  onUnpublish?: (designId: string) => void;
}

export default function DesignCard({ design, activeTab }: DesignCardProps) {
  const router = useRouter();
  const [isOpenEllipsis, setIsOpenEllipsis] = useState(false);

  // Transform API data to match existing UI expectations
  const transformedDesign = {
    id: design.id,
    title: design.name,
    status:
      design.publishedStatus === "minted"
        ? "Published"
        : design.publishedStatus === "listed"
          ? "Listed"
          : design.publishedStatus === "draft"
            ? "Draft"
            : "Hiring",
    price: parseFloat(design.price),
    likes: design.quantity, // Using quantity as likes for now
    lastUpdated: new Date(design.lastUpdated).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    image: design.designLink,
  };

  const getActionButton = () => {
    if (activeTab === "my") {
      // For "My Designs" tab - show both Hire a Maker and Publish buttons
      return (
        <>
          {design.publishedStatus === "minted" && (
            <>
              <Button
                onClick={() => router.push(`/dashboard/hire/${design.id}`)}
                variant='outline'
                className='rounded-full text-sm py-2 border border-primary'>
                Hire a Maker
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant='outline'
                    className='rounded-full text-sm py-2 border border-primary'>
                    Sell on the Marketplace
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Sell {transformedDesign.title} on Marketplace?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will make your design publicly available for buyers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className='rounded-full'>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        router.push(`/dashboard/publish/${design.id}`)
                      }
                      className='rounded-full'>
                      Yes, Sell
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </>
      );
    }

    if (activeTab === "marketplace") {
      // For "Marketplace" tab - show Unpublish button
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant='outline'
              className='rounded-full text-sm py-2 border border-primary'>
              Add More to Marketplace
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Sell more of {transformedDesign.title} on the Marketplace?
              </AlertDialogTitle>
              <AlertDialogDescription>
                You’ve already listed part of this design. Publishing more will
                make the remaining editions publicly available for buyers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='rounded-full'>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => router.push(`/dashboard/publish/${design.id}`)}
                className='rounded-full'>
                Yes, Publish More
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    if (activeTab === "jobs") {
      // For "Design Jobs" tab - show Publish to Marketplace button
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant='outline'
              className='rounded-full text-sm py-2 border border-primary'>
              Sell on the Marketplace
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Sell {transformedDesign.title} on the Marketplace?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will make your design publicly available for buyers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='rounded-full'>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => router.push(`/dashboard/publish/${design.id}`)}
                className='rounded-full'>
                Yes, Sell
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    return null;
  };

  const handleOpenEllipsis = () => {
    setIsOpenEllipsis((prev) => !prev);
  };

  return (
    <div className='relative h-full border flex items-center flex-wrap md:flex-nowrap gap-[16px] p-3 rounded-lg overflow-hidden border-[#BDBDBD] shadow-sm bg-white'>
      <div className='h-[280px] w-full md:w-[200px] md:flex-shrink-0'>
        <Image
          src={transformedDesign.image}
          alt={transformedDesign.title}
          width={180}
          height={280}
          className='md:w-[200px] w-full h-full object-cover object-top rounded-lg'
        />
      </div>
      {transformedDesign.status === "listed" && (
        <div
          onClick={() =>
            router.push(`/dashboard/design/${transformedDesign.id}`)
          }
          className='absolute top-3 right-3 cursor-pointer'>
          <QrCode size={20} className='text-blue-700 hover:shadow-md' />
        </div>
      )}

      <div className='flex flex-col gap-2 w-full md:w-fit'>
        <div className='flex flex-row-reverse md:block md:space-y-3 gap-2 justify-between items-center mb-2 mb:mb-0'>
          <span
            className={cn(
              "md:inline-block px-2 py-1 text-xs font-medium",
              transformedDesign.status === "Draft"
                ? "bg-red-100 text-red-700"
                : transformedDesign.status === "Hiring"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-green-100 text-green-700",
              "rounded-md w-fit"
            )}>
            {transformedDesign.status}
          </span>
          <h3 className='font-medium'>{transformedDesign.title}</h3>
        </div>

        <div className='flex md:flex-col gap-4 md:gap-2 text-sm text-gray-500'>
          <span className='flex items-center gap-1'>
            <Image src='/USDC.svg' alt='usdc logo' width={16} height={16} />{" "}
            {transformedDesign.price}
          </span>
          <span className='flex items-center gap-1'>
            <IoShirtOutline size={16} /> {transformedDesign.likes}
          </span>
        </div>
        <Link
          href='/'
          className='text-xs text-blue-500 underline max-w-[350px] truncate md:w-[200px]'>
          astra.com/ephemeral-mechanics-collection666654444566
        </Link>
        <p className='text-xs text-gray-400'>
          Last Updated {transformedDesign.lastUpdated}
        </p>

        <div className='w-fit mt-3 flex md:flex-col gap-2'>
          {getActionButton()}
        </div>
      </div>

      {transformedDesign.status === "listed" && (
        <div
          onClick={handleOpenEllipsis}
          className='absolute bottom-5 md:bottom-3 right-3 cursor-pointer'>
          <EllipsisVertical
            size={20}
            className='text-gray-500 hover:opacity-80'
          />
        </div>
      )}

      {/* Dropdown menu */}
      {isOpenEllipsis && (
        <div className='absolute right-3 bottom-10 md:bottom-8 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[140px]'>
          <button
            onClick={() =>
              router.push(
                `/dashboard/publish/${transformedDesign.id}?edit=${transformedDesign.id}`
              )
            }
            className='w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-200'>
            <SquarePen size={14} />
            Edit Design
          </button>
        </div>
      )}
    </div>
  );
}
