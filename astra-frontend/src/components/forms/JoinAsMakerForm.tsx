"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { joinMakerSchema, JoinMakerInput } from "@/lib/zodSchemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Notification from "@/app/components/notification";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import Image from "next/image";

export default function JoinAsMakerForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // form Input control using react-hook-form + zod
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JoinMakerInput>({
    resolver: zodResolver(joinMakerSchema),
  });

  // hide form on submit
  useEffect(() => {
    const submitted = localStorage.getItem("waitlistSubmitted");
    if (submitted === "true") setFormSubmitted(true);
  }, []);

  const onSubmit = async (data: JoinMakerInput) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsLoading(true);

    try {
      const controller = new AbortController();
      //Abort late response that takes 60sec
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await axios.post("/api/sendEmail", data, {
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response) {
        throw new Error("Email send failed");
      }

      reset();
      localStorage.setItem("waitlistSubmitted", "true");
      setFormSubmitted(true);
      setIsOpen(true);
    } catch (err) {
      console.error("Submission error:", err);
      const errorMessage =
        err.name === "AbortError"
          ? "Request timed out. Please try again."
          : "Failed to join the waitlist. Please try again.";
      Notification.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const inputFieldStyles =
    "bg-background/80 py-7 md:py-6 px-4 border border-white/20 placeholder:text-white/40 rounded-full";

  return (
    <>
      {formSubmitted && (
        <div>
          <p className='text-white text-md font-bold italic underline'>
            Form submitted successfully. Thrilled to have you on board
          </p>
        </div>
      )}
      {!formSubmitted && (
        <form
          ref={formRef}
          onSubmit={handleSubmit(onSubmit)}
          role='form'
          aria-label='Join Astra waitlist form'
          className="relative z-10 px-6 py-7 md:p-8 bg-neutral-900 rounded-xl w-full max-w-md border-l border-white/60 border-t border-b-0
        border-r-0  before:absolute before:bottom-0 before:left-0 before:h-px before:w-full before:bg-gradient-to-r before:from-white/20 before:to-white/5
        after:absolute after:top-0 after:right-0 after:w-px after:h-full after:bg-gradient-to-b after:from-white/10 after:to-white/5 overflow-auto
        before:content-[''] after:content-[''] space-y-6">
          <div>
            <h4 className='font-helvetica text-xl text-primary/90 pb-6 md:pb-5 text-center font-semibold'>
              Join The Waitlist
            </h4>
            <Input
              {...register("name")}
              placeholder='Full Name'
              className={inputFieldStyles}
            />
            {errors.name && (
              <p className='text-xs text-red-500 mt-1'>{errors.name.message}</p>
            )}
          </div>

          <div>
            <Input
              {...register("email")}
              placeholder='Email Address'
              className={inputFieldStyles}
            />
            {errors.email && (
              <p className='text-xs text-red-500 mt-1'>
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Input
              {...register("phone")}
              placeholder='Phone Number'
              className={inputFieldStyles}
            />
            {errors.phone && (
              <p className='text-xs text-red-500 mt-1'>
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <Input
              {...register("craft")}
              placeholder='What do you make?'
              className={inputFieldStyles}
            />
            {errors.craft && (
              <p className='text-xs text-red-500 mt-1'>
                {errors.craft.message}
              </p>
            )}
          </div>

          <div>
            <Input
              {...register("website")}
              placeholder='Website or Social Media Link'
              className={inputFieldStyles}
            />
            {errors.website && (
              <p className='text-xs text-red-500 mt-1'>
                {errors.website.message}
              </p>
            )}
          </div>

          <div>
            <Input
              {...register("city")}
              placeholder='Location (City)'
              className={inputFieldStyles}
            />
            {errors.city && (
              <p className='text-xs text-red-500 mt-1'>{errors.city.message}</p>
            )}
          </div>

          <Button
            type='submit'
            disabled={isLoading}
            aria-busy={isLoading}
            className='w-full mt-4 py-6 font-semibold rounded-full flex items-center justify-center gap-2'>
            {isLoading ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin' />
                Sending...
              </>
            ) : (
              "Join The Waitlist"
            )}
          </Button>
        </form>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='p-[40px] text-center'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold font-helvetica text-center bg-gradient-to-b from-primary/50 to-white bg-clip-text text-transparent'>
              You&apos;re on the list!
            </DialogTitle>
          </DialogHeader>
          <p>
            Thanks for signing up for early access to Astra. We’re thrilled to
            have you on board. You’ll be among the first to know when we launch!
          </p>

          <div className='flex justify-center items-center mt-5'>
            <Image
              src='/successIllustration.png'
              alt='Join the waitlist successful illustration'
              width={250}
              height={200}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
