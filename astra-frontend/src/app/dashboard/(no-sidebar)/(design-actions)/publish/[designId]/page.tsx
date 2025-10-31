"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { IoShirtOutline } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDesignContext } from "../../layout";
import { toast } from "sonner";
import { useWallet } from "@/hooks/useWallet";
import { CONTRACT_ADDRESS } from "@/utils/constant";
import { listingABI } from "@/abis/astraABIs";
import { ethers } from "ethers";
import { getPublishData, savePublishData } from "@/utils/publishStorage";

const publishSchema = z.object({
  pricePerOutfit: z
    .string()
    .min(1, "Price is required")
    .refine(
      (val) =>
        !isNaN(Number(val.replace(/,/g, ""))) &&
        Number(val.replace(/,/g, "")) >= 0,
      {
        message: "Price must be a valid number",
      }
    ),
  quantityAvailable: z
    .string()
    .min(1, "Quantity is required")
    .refine(
      (val) =>
        !isNaN(Number(val)) &&
        Number(val) >= 0 &&
        Number.isInteger(Number(val)),
      {
        message: "Quantity must be a valid whole number",
      }
    ),
  deliveryWindow: z.string().min(1, "Please select a delivery window"),
});

type FormData = z.infer<typeof publishSchema>;

const formatCurrency = (value: string): string => {
  const numericValue = value.replace(/[^\d.]/g, "");
  const parts = numericValue.split(".");
  if (parts.length > 2) parts.splice(2);

  const integerPart = parts[0];
  const decimalPart = parts[1];
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (decimalPart !== undefined) {
    return `${formattedInteger}.${decimalPart.slice(0, 2)}`;
  }
  return formattedInteger;
};

const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/,/g, "")) || 0;
};

// Store data in sessionStorage for the publish flow only
// const savePublishData = (step: string, data) => {
//   if (typeof window !== "undefined") {
//     sessionStorage.setItem(`publish_${step}`, JSON.stringify(data));
//   }
// };

// const getPublishData = (step: string) => {
//   if (typeof window !== "undefined") {
//     const saved = sessionStorage.getItem(`publish_${step}`);
//     return saved ? JSON.parse(saved) : null;
//   }
//   return null;
// };

export default function PublishPage() {
  const { design, loading } = useDesignContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [availableTokenCount, setAvailableTokenCount] = useState<number | null>(
    null
  );

  const editId = searchParams.get("edit");
  const isEditMode = editId === design?.id;

  const form = useForm<FormData>({
    resolver: zodResolver(publishSchema),
    defaultValues: {
      pricePerOutfit: "",
      quantityAvailable: "",
      deliveryWindow: "",
    },
  });

  const {
    provider,
    address: userAddress,
    isConnected,
    isCorrectNetwork,
  } = useWallet();

  const priceValue = form.watch("pricePerOutfit");
  // const quantityValue = form.watch("quantityAvailable");

  useEffect(() => {
    async function fetchAvailableTokens() {
      if (
        !provider ||
        !isCorrectNetwork ||
        !isConnected ||
        !userAddress ||
        !design?.id
      ) {
        setAvailableTokenCount(null);
        setLoadingTokens(false);
        return;
      }

      setLoadingTokens(true);
      try {
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          listingABI,
          provider
        );
        const tokenIdsBN = await contract.tokensOfOwner(userAddress);
        const tokenIds = tokenIdsBN.map((id: ethers.BigNumber) =>
          id.toNumber()
        );

        if (tokenIds.length === 0) {
          setAvailableTokenCount(0);
          setLoadingTokens(false);
          return;
        }

        // Batch getDesignId
        const designIdPromises = tokenIds.map((id) =>
          contract.getDesignId(id).catch(() => null)
        );
        const designIds = await Promise.all(designIdPromises);

        const count = designIds.filter((id) => id === design.id).length;

        setAvailableTokenCount(count);
      } catch (error) {
        console.error("Failed to fetch tokens:", error);
        setAvailableTokenCount(null);
      } finally {
        setLoadingTokens(false);
      }
    }

    fetchAvailableTokens();
  }, [provider, userAddress, design?.id, isCorrectNetwork, isConnected]);

  useEffect(() => {
    if (design && isEditMode) {
      form.reset({
        pricePerOutfit: formatCurrency(design.price.toString()),
        quantityAvailable: design.quantity.toString(),
        deliveryWindow: "1-2 weeks",
      });
    }
  }, [design, isEditMode, form]);

  useEffect(() => {
    setMounted(true);
    if (!isEditMode) {
      const savedData = getPublishData(design.id, "step1");
      if (savedData) form.reset(savedData);
    }
  }, [form, isEditMode, design.id]);

  // Auto-save for publish flow (not edit mode)
  useEffect(() => {
    if (mounted && !isEditMode) {
      const subscription = form.watch((value) => {
        savePublishData(design.id, "step1", value);
      });
      return () => subscription.unsubscribe();
    }
  }, [form, mounted, isEditMode, design.id]);

  if (loading || !design) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-lg'>Loading...</div>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        // For edit mode, we might want to save changes immediately
        // or store them for later submission
        savePublishData(design.id, "step1", data);
        router.replace(
          `/dashboard/publish/${design.id}/step2?edit=${design.id}`
        );
      } else {
        // For publish flow, save to session and continue
        savePublishData(design.id, "step1", data);
        router.push(`/dashboard/publish/${design.id}/step2`);
      }
    } catch {
      toast.error("Error Submitting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceChange = (
    value: string,
    onChange: (value: string) => void
  ) => {
    const formatted = formatCurrency(value);
    onChange(formatted);
  };

  const deliveryOptions = [
    "1-3 days",
    "3-5 days",
    "1-2 weeks",
    "2-4 weeks",
    "1-2 months",
    "Custom timeline",
  ];

  const displayPrice = isEditMode
    ? priceValue
      ? parseCurrency(priceValue).toFixed(2)
      : design
        ? design.price
        : "0.00"
    : priceValue
      ? parseCurrency(priceValue).toFixed(2)
      : "0.00";

  const formattedDate = new Date(design.lastUpdated).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  const pageTitle = isEditMode
    ? `Edit ${design.name}`
    : "Publish to marketplace";

  return (
    <div className='w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6 py-8 md:px-[65px] flex flex-col items-center'>
      <h1 className='text-lg font-bold mb-8 text-center'>{pageTitle}</h1>

      <div className='border flex items-center w-full gap-3 md:gap-[16px] p-3 rounded-xl overflow-hidden border-gray-300 shadow-sm bg-white mb-5'>
        <div className='h-[150px] w-[130px] md:w-fit flex-shrink-0'>
          <Image
            src={design.designLink}
            alt='Design Image'
            width={200}
            height={150}
            className='w-[200px] h-full object-cover object-top rounded-lg'
          />
        </div>

        <div className='flex flex-col gap-2 min-w-0 flex-1'>
          <h3 className='font-semibold'>{design.name}</h3>
          <div className='flex flex-col gap-2 text-sm'>
            <span className='flex items-center gap-1'>
              <Image src='/USDC.svg' alt='usdc logo' width={16} height={16} />$
              {displayPrice}
            </span>
            <span className='flex items-center gap-2 text-gray-600'>
              <IoShirtOutline size={16} />
              {loadingTokens ? (
                <span className='inline-block w-10 h-4 bg-gray-300 rounded animate-pulse' />
              ) : availableTokenCount !== null ? (
                <>
                  {availableTokenCount}{" "}
                  <span className='text-sm font-medium italic'>
                    (Available on-chain)
                  </span>
                </>
              ) : (
                "0"
              )}
            </span>
          </div>
          <Link
            href='/'
            className='text-xs text-blue-500 hover:text-blue-700 underline truncate w-[160px] md:w-[250px]'>
            astra.com/{design.name.toLowerCase().replace(/\s+/g, "-")}
            -collection{design.id.slice(-6)}
          </Link>
          <p className='text-xs md:text-sm text-gray-500'>
            Last Updated {formattedDate}
          </p>
        </div>
      </div>

      {!isEditMode && (
        <Link
          href='/dashboard/design'
          className='text-blue-500 text-sm font-semibold mb-8 underline hover:text-blue-700'>
          Select another design
        </Link>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              control={form.control}
              name='pricePerOutfit'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-semibold text-gray-900'>
                    Price per Outfit
                  </FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg'>
                        $
                      </span>
                      <Input
                        placeholder='0.00'
                        value={field.value}
                        onChange={(e) =>
                          handlePriceChange(e.target.value, field.onChange)
                        }
                        className='pl-8 h-12 text-lg border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500'
                        disabled={isSubmitting}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='quantityAvailable'
              render={({ field }) => {
                const inputValue = parseInt(field.value) || 0;
                const exceedsAvailable =
                  availableTokenCount !== null &&
                  inputValue > availableTokenCount;

                return (
                  <FormItem>
                    <FormLabel className='text-sm font-semibold text-gray-900'>
                      Listing Quantity
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          placeholder='0'
                          {...field}
                          className={`h-12 text-lg border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 pr-10 ${
                            exceedsAvailable
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }`}
                          type='number'
                          min='0'
                          step='1'
                          disabled={isSubmitting}
                        />
                        <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                          <div className='flex flex-col items-center'>
                            <button
                              type='button'
                              className='text-gray-400 hover:text-gray-600 text-xs leading-none'
                              onClick={() => {
                                const currentValue = parseInt(field.value) || 0;
                                field.onChange((currentValue + 1).toString());
                              }}
                              disabled={isSubmitting}>
                              Up
                            </button>
                            <button
                              type='button'
                              className='text-gray-400 hover:text-gray-600 text-xs leading-none'
                              onClick={() => {
                                const currentValue = parseInt(field.value) || 0;
                                if (currentValue > 0) {
                                  field.onChange((currentValue - 1).toString());
                                }
                              }}
                              disabled={isSubmitting}>
                              Down
                            </button>
                          </div>
                        </div>
                      </div>
                    </FormControl>

                    {/* Zod error */}
                    <FormMessage />

                    {/* Custom helper error */}
                    {exceedsAvailable && (
                      <p className='text-xs text-red-500 mt-1'>
                        You only own {availableTokenCount} NFT
                        {availableTokenCount === 1 ? "" : "s"} for this design.
                      </p>
                    )}

                    {/* Optional: Show available count */}
                    {availableTokenCount !== null && !exceedsAvailable && (
                      <p className='text-xs text-gray-500 mt-1'>
                        {availableTokenCount} available
                      </p>
                    )}
                  </FormItem>
                );
              }}
            />
          </div>

          <FormField
            control={form.control}
            name='deliveryWindow'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-semibold text-gray-900'>
                  Delivery Window
                </FormLabel>
                <p className='text-sm text-gray-500 mb-4'>
                  Select a time range for how long it would take to deliver the
                  outfit
                </p>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger className='h-12 text-lg border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500'>
                      <SelectValue placeholder='Select a range' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {deliveryOptions.map((option) => (
                      <SelectItem
                        key={option}
                        value={option}
                        className='text-base py-3'>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='pt-6 flex justify-center items-center'>
            <Button
              type='submit'
              className='w-full max-w-xs bg-black hover:bg-gray-800 text-white font-medium rounded-lg h-12 text-lg transition-colors duration-200'
              disabled={
                isSubmitting ||
                loadingTokens ||
                availableTokenCount === null ||
                availableTokenCount === 0 ||
                parseInt(form.watch("quantityAvailable") || "0") >
                  (availableTokenCount || 0)
              }>
              {isSubmitting
                ? "Processing..."
                : isEditMode
                  ? "Save Changes"
                  : "Next"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
