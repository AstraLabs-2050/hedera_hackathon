"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { use } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SaveAction } from "@/components/common/saveAction";
import { useDesignContext } from "../../../layout";
import Notification from "@/app/components/notification";

const brandStorySchema = z.object({
  brandStory: z
    .string()
    .min(10, "Brand story must be at least 10 characters")
    .max(1000, "Brand story must be less than 1000 characters"),
  regionOfDelivery: z.string().min(1, "Please select a delivery region"),
});

type BrandStoryFormData = z.infer<typeof brandStorySchema>;

const savePublishData = (step: string, data) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(`publish_${step}`, JSON.stringify(data));
  }
};

const getPublishData = (step: string) => {
  if (typeof window !== "undefined") {
    const saved = sessionStorage.getItem(`publish_${step}`);
    return saved ? JSON.parse(saved) : null;
  }
  return null;
};

const clearPublishData = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("publish_step1");
    sessionStorage.removeItem("publish_step2");
  }
};

interface PublishToMarketplaceStep2Props {
  params: Promise<{ designId: string }>; // Type params as a Promise
}

export default function PublishToMarketplaceBrandStoryPage({
  params,
}: PublishToMarketplaceStep2Props) {
  const { design, loading } = useDesignContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  const { designId } = use(params);
  const editId = searchParams.get("edit");
  const isEditMode = editId === designId;

  const form = useForm<BrandStoryFormData>({
    resolver: zodResolver(brandStorySchema),
    defaultValues: {
      brandStory: "",
      regionOfDelivery: "",
    },
  });

  // Load existing data for edit mode
  useEffect(() => {
    if (design && isEditMode) {
      // If editing, try to get existing data from design inventory
      form.reset({
        brandStory: design.brandStory || "",
        regionOfDelivery: design.regionOfDelivery || "",
      });
    }
  }, [design, isEditMode, form]);

  // Load saved data on mount for new publish (not edit mode)
  useEffect(() => {
    setMounted(true);
    if (!isEditMode) {
      const step2Data = getPublishData("step2");
      if (step2Data) {
        form.reset(step2Data);
      }
    }
  }, [form, isEditMode]);

  // Auto-save while typing (only in non-edit mode)
  useEffect(() => {
    if (mounted && !isEditMode) {
      const subscription = form.watch((value) => {
        savePublishData("step2", value);
      });
      return () => subscription.unsubscribe();
    }
  }, [form, mounted, isEditMode]);

  if (loading || !design) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-lg'>Loading...</div>
      </div>
    );
  }

  const onPreviewListing = async (data: BrandStoryFormData) => {
    setIsSubmitting(true);
    try {
      // Save step 2 data
      savePublishData("step2", data);

      // Navigate to preview
      router.push(`/dashboard/publish/${designId}/preview`);
    } catch (error) {
      console.error("Error going to preview:", error);
      // Add proper error handling/toast notifications
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSaveAsDraft = async () => {
    setIsDraftSaving(true);
    try {
      const formData = form.getValues();

      // Validate form first
      const isValid = await form.trigger();
      if (!isValid) {
        throw new Error("Please fix the validation errors before saving.");
      }

      // Save current data
      savePublishData("step2", formData);

      // Show success message
      Notification.success("Draft saved successfully!");
    } catch (error) {
      // console.error("Error saving draft:", error);
      Notification.error("Failed to save draft");
    } finally {
      setIsDraftSaving(false);
    }
  };

  // Save changes function for edit mode
  const handleSaveChanges = async () => {
    // Validate form first
    const isValid = await form.trigger();
    if (!isValid) {
      throw new Error("Please fix the validation errors before saving.");
    }

    const formData = form.getValues();

    // For edit mode, you might want to update the design directly
    // For now, we'll save it and redirect
    // console.log("Updating design brand story data:", { designId, ...formData });

    // Simulate API call for updating design data
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // After successful save, redirect back to designs page
    setTimeout(() => {
      router.replace("/dashboard/design");
    }, 1000);
  };

  // Cancel changes function
  const handleCancelChanges = () => {
    router.replace("/dashboard/design");
  };

  const deliveryRegions = [
    "North America",
    "Europe",
    "Asia Pacific",
    "South America",
    "Africa",
    "Middle East",
    "Worldwide",
    "United States Only",
    "Canada Only",
    "Local Area Only",
  ];

  const watchedBrandStory = form.watch("brandStory");
  const characterCount = watchedBrandStory?.length || 0;

  // Page title based on mode
  const pageTitle = isEditMode
    ? `Edit ${design.name}`
    : "Publish to marketplace";

  return (
    <div className='w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6 py-8 md:px-[65px] flex flex-col items-center'>
      {/* Title */}
      <h1 className='text-lg font-bold mb-8 text-center'>{pageTitle}</h1>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onPreviewListing)}
          className='w-full space-y-8'>
          {/* Brand Story */}
          <FormField
            control={form.control}
            name='brandStory'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-bold text-gray-900'>
                  Brand Story
                </FormLabel>
                <p className='text-sm text-gray-600 mb-4'>
                  Share the inspiration behind this collection. This builds
                  trust and excitement with buyers.
                </p>
                <FormControl>
                  <div className='relative'>
                    <Textarea
                      placeholder='Tell your story...'
                      {...field}
                      className='min-h-[120px] text-base border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 resize-none'
                      maxLength={1000}
                      disabled={isSubmitting || isDraftSaving}
                    />
                    <div className='absolute bottom-3 right-3 text-xs text-gray-400'>
                      {characterCount}/1000
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Region of Delivery */}
          <FormField
            control={form.control}
            name='regionOfDelivery'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-bold text-gray-900'>
                  Region of Delivery
                </FormLabel>
                <p className='text-sm text-gray-600 mb-4'>
                  Select where this collection can be shipped.
                </p>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting || isDraftSaving}>
                  <FormControl>
                    <SelectTrigger className='h-12 text-base border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500'>
                      <SelectValue placeholder='Select a range' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {deliveryRegions.map((region) => (
                      <SelectItem
                        key={region}
                        value={region}
                        className='text-base py-3'>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action Buttons */}
          <div className='pt-6 w-full space-y-4'>
            {/* Conditional Buttons Based on Mode */}
            {isEditMode ? (
              // Edit Mode Buttons
              <div className='w-full flex flex-col sm:flex-row gap-4 justify-center items-center'>
                <SaveAction
                  onConfirm={handleSaveChanges}
                  successMessage='Changes saved successfully!'
                  confirmTitle='Save changes to this design?'>
                  <Button
                    type='button'
                    className='w-full max-w-xs px-8 bg-black hover:bg-gray-800 text-white font-medium rounded-lg h-12 text-base transition-colors duration-200'
                    disabled={isSubmitting || isDraftSaving}>
                    Save Changes
                  </Button>
                </SaveAction>

                <Button
                  type='button'
                  onClick={handleCancelChanges}
                  variant='outline'
                  className='flex-1 px-8 border-gray-300 text-gray-700 hover:opacity-70 font-medium rounded-lg h-12 text-base transition-colors duration-200'
                  disabled={isSubmitting || isDraftSaving}>
                  Cancel Changes
                </Button>
              </div>
            ) : (
              // Publish Mode Buttons
              <div className='w-full flex flex-col sm:flex-row gap-4 justify-center items-center'>
                <Button
                  type='submit'
                  className='w-full max-w-xs px-8 bg-black hover:bg-gray-800 text-white font-medium rounded-lg h-12 text-base transition-colors duration-200'
                  disabled={isSubmitting || isDraftSaving}>
                  {isSubmitting ? "Loading..." : "Preview Listing"}
                </Button>

                <Button
                  type='button'
                  onClick={onSaveAsDraft}
                  variant='outline'
                  className='flex-1 px-8 border-gray-300 text-gray-700 hover:opacity-70 font-medium rounded-lg h-12 text-base transition-colors duration-200'
                  disabled={isSubmitting || isDraftSaving}>
                  {isDraftSaving ? "Saving..." : "Save as Draft"}
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
