"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRouter, useParams } from "next/navigation";
import { useDesignContext } from "../../../layout";
import api from "@/utils/api.class";
import Notification from "@/app/components/notification";

const formSchema = z.object({
  shippingRegion: z.string().min(1, { message: "Shipping region is required" }),
  fabricSource: z.string().min(1, { message: "Fabric source is required" }),
  skillKeywords: z
    .array(z.string())
    .min(1, { message: "At least one skill keyword is required" }),
  experienceLevel: z
    .string()
    .min(1, { message: "Experience level is required" }),
});

interface JobDetailsData {
  requirements: string;
  quantity: string;
  deadline: Date;
  timeline: string;
  budgetMin: string;
  budgetMax: string;
}

export default function PreferencesPage() {
  const router = useRouter();
  const params = useParams<{ designId: string }>();
  const { design } = useDesignContext();
  const [jobDetailsData, setJobDetailsData] = useState<JobDetailsData | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shippingRegion: "",
      fabricSource: "",
      skillKeywords: [],
      experienceLevel: "",
    },
  });

  const [tagInput, setTagInput] = useState("");

  // Load saved form data on component mount
  useEffect(() => {
    // Load job details data
    const savedJobDetails = localStorage.getItem("jobDetails");
    if (savedJobDetails) {
      try {
        const parsedJobDetails = JSON.parse(savedJobDetails);
        // Convert date string back to Date object if it exists
        if (
          parsedJobDetails.deadline &&
          typeof parsedJobDetails.deadline === "string"
        ) {
          parsedJobDetails.deadline = new Date(parsedJobDetails.deadline);
        }
        setJobDetailsData(parsedJobDetails);
      } catch (error) {
        // console.error("Error loading job details data:", error);
        Notification.error(
          "Failed to load previous job details. Please start over."
        );
      }
    }

    // Load shipping preferences data
    const savedShippingData = localStorage.getItem("shippingPreferences");
    if (savedShippingData) {
      try {
        const parsedShippingData = JSON.parse(savedShippingData);
        form.reset(parsedShippingData);
      } catch (error) {
        // console.error("Error loading shipping preferences data:", error);
      }
    }
  }, [form]);

  // Save form data to localStorage whenever form values change (debounced)
  useEffect(() => {
    const subscription = form.watch((value) => {
      const timeoutId = setTimeout(() => {
        localStorage.setItem("shippingPreferences", JSON.stringify(value));
      }, 500); // Debounce saves

      return () => clearTimeout(timeoutId);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const clearHireMakerData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("jobDetails");
      localStorage.removeItem("shippingPreferences");
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!jobDetailsData) {
      Notification.error(
        "Job details are missing. Please go back and fill out the job details."
      );
      return;
    }

    if (!params.designId) {
      Notification.error("Design ID is missing. Please select a design.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Transform form data to match API requirements
      const hireMakerData = {
        designId: params.designId,
        requirements: jobDetailsData.requirements,
        quantity: parseInt(jobDetailsData.quantity, 10),

        // Fix deadlineDate to YYYY-MM-DD
        deadlineDate: jobDetailsData.deadline.toISOString().split("T")[0],

        productTimeline: jobDetailsData.timeline,
        budgetRange: {
          min: parseFloat(jobDetailsData.budgetMin.replace(/,/g, "")),
          max: parseFloat(jobDetailsData.budgetMax.replace(/,/g, "")),
        },
        shippingRegion: values.shippingRegion,
        fabricSource: values.fabricSource,

        // Normalize keywords to lowercase & hyphenate spaces
        skillKeywords: values.skillKeywords.map((k) =>
          k.trim().toLowerCase().replace(/\s+/g, "-")
        ),

        // Force lowercase for experience level
        experienceLevel: values.experienceLevel.toLowerCase(),
      };

      // console.log("Submitting hire maker request:", hireMakerData);

      // Make the API call
      await api.hireMaker(hireMakerData);

      // console.log("Hire maker response:", response);

      // Show success message
      Notification.success(
        "Your design job has been created successfully. Makers will be notified."
      );

      // Clear form state
      form.reset();

      // Clear localStorage after successful submission
      clearHireMakerData();

      // Redirect to design page and clear history
      router.replace("/dashboard/design");
    } catch (error) {
      // console.error("Submission error:", error);

      // Show error message to user
      Notification.error(
        `Submission Failed, ${
          error instanceof Error
            ? error.message
            : "Failed to create design job. Please try again"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const addTag = () => {
    const trimmedInput = tagInput.trim();
    if (trimmedInput !== "") {
      const currentTags = form.getValues("skillKeywords");
      if (!currentTags.includes(trimmedInput)) {
        form.setValue("skillKeywords", [...currentTags, trimmedInput], {
          shouldValidate: true,
        });
        setTagInput("");
      } else {
        Notification.error(
          "Duplicate Tag, This skill keyword has already been added."
        );
      }
    }
  };

  const removeTag = (index: number) => {
    const currentTags = form.getValues("skillKeywords");
    const newTags = currentTags.filter((_, i) => i !== index);
    form.setValue("skillKeywords", newTags, { shouldValidate: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && tagInput === "") {
      const currentTags = form.getValues("skillKeywords");
      if (currentTags.length > 0) {
        removeTag(currentTags.length - 1);
      }
    }
  };

  // Check if we have job details data
  if (!jobDetailsData) {
    return (
      <div className='w-full md:max-w-xl border border-[#E0E0E0] md:mt-0 bg-white rounded-2xl shadow-sm p-6 md:p-8 flex flex-col items-center'>
        <div className='text-center py-8'>
          <h2 className='text-sm md:text-base font-semibold text-red-500 mb-2'>
            Missing Job Details
          </h2>
          <p className='text-gray-600 mb-4 text-sm md:text-sm'>
            You need to fill out the job details first before setting
            preferences.
          </p>
          <Button onClick={() => router.back()} variant='outline'>
            Go Back to Job Details
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Card */}
      <div className='w-full md:max-w-xl border border-[#E0E0E0] mt-12 md:mt-0 bg-white rounded-2xl shadow-sm p-6 md:p-8 flex flex-col items-center'>
        {/* Title */}
        <h1 className='text-xl font-[ClashGrotesk-semibold] mb-6 text-center'>
          Delivery, Shipping & Matching Preferences
        </h1>

        {/* Design Info Summary */}
        <div className='w-full mb-4 p-3 bg-gray-50 rounded-lg space-y-2'>
          <p className='text-sm text-gray-600'>
            <span className='font-medium'>Design:</span> {design.name}
          </p>
          <p className='text-sm text-gray-600'>
            <span className='font-medium'>Quantity:</span>{" "}
            {jobDetailsData.quantity} pieces
          </p>
          <p className='text-sm text-gray-600'>
            <span className='font-medium'>Budget:</span> $
            {jobDetailsData.budgetMin} - ${jobDetailsData.budgetMax} USD
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='w-full space-y-6'>
            {/* Shipping Region */}
            <FormField
              control={form.control}
              name='shippingRegion'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-[ClashGrotesk-medium]'>
                    Shipping region
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select region' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='Africa'>Africa</SelectItem>
                      <SelectItem value='Asia'>Asia</SelectItem>
                      <SelectItem value='Europe'>Europe</SelectItem>
                      <SelectItem value='North America'>
                        North America
                      </SelectItem>
                      <SelectItem value='South America'>
                        South America
                      </SelectItem>
                      <SelectItem value='Oceania'>Oceania</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fabric Source */}
            <FormField
              control={form.control}
              name='fabricSource'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-[ClashGrotesk-medium]'>
                    Fabric Source
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select source' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='Supplied by brand'>
                        Supplied by creator
                      </SelectItem>
                      <SelectItem value='Sourced by maker'>
                        Sourced by maker
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Skill Keywords */}
            <FormField
              control={form.control}
              name='skillKeywords'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-[ClashGrotesk-medium]'>
                    Skill Keywords
                  </FormLabel>
                  <FormControl>
                    <div className='flex flex-wrap items-center gap-2 border bg-background rounded-md px-2 py-1 min-h-[40px] focus-within:outline-none focus-within:ring-1 shadow-sm focus-within:ring-ring focus-within:ring-offset-2'>
                      {field.value.map((tag, index) => (
                        <Badge
                          key={index}
                          variant='secondary'
                          className='text-sm text-[#4F4F4F] px-4 py-1 rounded-full'>
                          {tag}
                          <button
                            type='button'
                            className='ml-2 text-primary hover:text-primary/80'
                            onClick={() => removeTag(index)}>
                            ×
                          </button>
                        </Badge>
                      ))}
                      <Input
                        type='text'
                        className='border-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none focus:outline-none p-0 h-auto flex-1 min-w-[150px]'
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={() => {
                          if (tagInput.trim()) {
                            addTag();
                          }
                        }}
                        placeholder={
                          field.value.length === 0 ? "Add skill keyword" : ""
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Experience Level */}
            <FormField
              control={form.control}
              name='experienceLevel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-[ClashGrotesk-medium]'>
                    Experience Level
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select level' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='Beginner'>Beginner</SelectItem>
                      <SelectItem value='Intermediate'>Intermediate</SelectItem>
                      <SelectItem value='Expert'>Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className='flex flex-col items-center pt-7'>
              <Button
                type='submit'
                className='w-full max-w-xs bg-black text-white h-12'
                disabled={!form.formState.isValid || isSubmitting}>
                {isSubmitting ? "Creating Job..." : "Create a Design Job"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
