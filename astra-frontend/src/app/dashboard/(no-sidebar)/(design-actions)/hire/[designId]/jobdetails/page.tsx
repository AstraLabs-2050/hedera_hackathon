"use client";

import React, { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useDesignContext } from "../../../layout";

const formSchema = z
  .object({
    requirements: z.string().min(1, { message: "Requirements are required" }),
    quantity: z
      .string()
      .min(1, { message: "Quantity is required" })
      .refine(
        (val) => {
          const num = parseInt(val);
          return !isNaN(num) && num >= 1;
        },
        { message: "Quantity must be at least 1" }
      ),
    deadline: z.date().refine((date) => date > new Date(), {
      message: "Deadline must be in the future",
    }),
    timeline: z.string().min(1, { message: "Product timeline is required" }),
    budgetMin: z
      .string()
      .min(1, { message: "Min budget is required" })
      .refine(
        (val) => {
          const num = parseFloat(val.replace(/,/g, ""));
          return !isNaN(num) && num >= 0.1;
        },
        { message: "Min budget must be at least 0.1" }
      ),
    budgetMax: z
      .string()
      .min(1, { message: "Max budget is required" })
      .refine(
        (val) => {
          const num = parseFloat(val.replace(/,/g, ""));
          return !isNaN(num) && num >= 0;
        },
        { message: "Max budget must be at least 0" }
      ),
  })
  .refine(
    (data) => {
      const minNum = parseFloat(data.budgetMin.replace(/,/g, ""));
      const maxNum = parseFloat(data.budgetMax.replace(/,/g, ""));
      return maxNum >= minNum;
    },
    {
      message: "Max budget must be greater than or equal to min budget",
      path: ["budgetMax"],
    }
  );

// Utility function to format currency
const formatCurrency = (value: string): string => {
  // Remove all non-digit and non-decimal characters
  const numericValue = value.replace(/[^\d.]/g, "");

  // Handle multiple decimal points
  const parts = numericValue.split(".");
  if (parts.length > 2) {
    const wholePart = parts[0];
    const decimalPart = parts.slice(1).join("").substring(0, 2);
    return formatWithCommas(wholePart) + (decimalPart ? "." + decimalPart : "");
  }

  if (parts.length === 2) {
    const wholePart = parts[0];
    const decimalPart = parts[1].substring(0, 2); // Limit to 2 decimal places
    return formatWithCommas(wholePart) + "." + decimalPart;
  }

  return formatWithCommas(numericValue);
};

const formatWithCommas = (value: string): string => {
  if (!value) return "";
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function JobDetailsPage() {
  const router = useRouter();
  const { design } = useDesignContext();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requirements: "",
      quantity: "",
      deadline: undefined,
      timeline: "",
      budgetMin: "",
      budgetMax: "",
    },
  });

  // Load saved form data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("jobDetails");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Convert date string back to Date object if it exists
        if (parsedData.deadline) {
          parsedData.deadline = new Date(parsedData.deadline);
        }
        form.reset(parsedData);
      } catch (error) {
        // console.error("Error loading saved form data:", error);
      }
    }
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Save form values to localStorage
      localStorage.setItem("jobDetails", JSON.stringify(values));

      // Simulate API call delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // console.log(values);
      // Redirect to the next page after successful submission
      router.push(`/dashboard/hire/${design.id}/shipping`);
    } catch (error) {
      // console.error("Submission error:", error);
    }
  }

  const handleQuantityChange = (
    value: string,
    onChange: (value: string) => void
  ) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^\d]/g, "");
    onChange(numericValue);
  };

  const handleBudgetChange = (
    value: string,
    onChange: (value: string) => void
  ) => {
    const formatted = formatCurrency(value);
    onChange(formatted);
  };

  return (
    <>
      {/* Main Card */}
      <div className='w-full md:max-w-xl bg-white border border-[#E0E0E0] rounded-2xl shadow-sm p-6 md:p-8 flex flex-col items-center'>
        {/* Title */}
        <h1 className='text-xl font-[ClashGrotesk-semibold] mb-6'>
          Job Details
        </h1>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='w-full space-y-6'>
            {/* Requirements */}
            <FormField
              control={form.control}
              name='requirements'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-[ClashGrotesk-medium]'>
                    Requirements
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="E.g. 'Must use sustainable fabric'"
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity */}
            <FormField
              control={form.control}
              name='quantity'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-[ClashGrotesk-medium]'>
                    Quantity
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='text'
                      placeholder='0'
                      {...field}
                      onChange={(e) =>
                        handleQuantityChange(e.target.value, field.onChange)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deadline */}
            <FormField
              control={form.control}
              name='deadline'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-[ClashGrotesk-medium]'>
                    Deadline
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}>
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>DD/MM/YYYY</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-80' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date <= new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product Timeline */}
            <FormField
              control={form.control}
              name='timeline'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-[ClashGrotesk-medium]'>
                    Product Timeline
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select timeline' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='1-2 weeks'>1-2 weeks</SelectItem>
                      <SelectItem value='2-4 weeks'>2-4 weeks</SelectItem>
                      <SelectItem value='4-6 weeks'>4-6 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Budget Range */}
            <div className='space-y-2 '>
              <FormLabel className='font-[ClashGrotesk-medium]'>
                Budget Range
              </FormLabel>
              <div className='flex items-start space-x-4'>
                <FormField
                  control={form.control}
                  name='budgetMin'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Min</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            type='text'
                            placeholder='0'
                            {...field}
                            onChange={(e) =>
                              handleBudgetChange(e.target.value, field.onChange)
                            }
                          />
                          <span className='absolute right-2 top-2.5 text-sm text-muted-foreground'>
                            USD
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='budgetMax'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Max</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            type='text'
                            placeholder='0'
                            {...field}
                            onChange={(e) =>
                              handleBudgetChange(e.target.value, field.onChange)
                            }
                          />
                          <span className='absolute right-2 top-2.5 text-sm text-muted-foreground'>
                            USD
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className='flex flex-col items-center pt-7'>
              <Button
                type='submit'
                className='w-full max-w-xs bg-black text-white h-12'
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }>
                {form.formState.isSubmitting ? "Loading..." : "Next"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
