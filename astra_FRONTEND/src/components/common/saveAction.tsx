"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";

interface SaveActionProps {
  children: React.ReactNode;
  onConfirm?: () => Promise<any>; // instead of Promise<void>
  successMessage?: string;
  confirmTitle?: string;
  confirmDescription?: string;
}

export function SaveAction({
  children,
  onConfirm,
  successMessage = "Saved Successfully!",
  confirmTitle = "Are you sure to save?",
  confirmDescription,
}: SaveActionProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fallback fake API if none is passed
  const fakeApiCall = () =>
    new Promise<void>((resolve) => setTimeout(resolve, 2000));

  const handleConfirm = async () => {
    setConfirmOpen(false);
    setLoading(true);
    setError(null);

    try {
      if (onConfirm) {
        await onConfirm();
      } else {
        await fakeApiCall();
      }
      setLoading(false);
      setSuccessOpen(true);
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Save failed:", err);
    }
  };

  const resetError = () => {
    setError(null);
  };

  return (
    <>
      {/* Wrap trigger button */}
      <div onClick={() => setConfirmOpen(true)} className='w-full'>
        {children}
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmTitle}</DialogTitle>
            {confirmDescription && (
              <div className='pt-2 text-sm text-muted-foreground'>
                {confirmDescription}
              </div>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Yes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loading Overlay */}
      {loading && (
        <div className='fixed inset-0 flex items-center justify-center bg-black/50 z-50'>
          <div className='flex flex-col items-center text-white'>
            <Loader2 className='h-12 w-12 animate-spin mb-4' />
            <p className='text-base font-medium'>
              Publishing to marketplace...
            </p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className='flex flex-col items-center text-center'>
          <CheckCircle2 className='h-16 w-16 text-green-500 mb-3' />
          <DialogHeader>
            <DialogTitle>{successMessage}</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      {error && (
        <Dialog open={!!error} onOpenChange={resetError}>
          <DialogContent>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                <div className='w-6 h-6 bg-red-100 rounded-full flex items-center justify-center'>
                  <svg
                    className='w-4 h-4 text-red-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </div>
                <DialogTitle className='text-red-800'>Error</DialogTitle>
              </div>
              <div className='pt-2 text-sm text-red-700'>{error}</div>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={resetError}
                className='bg-red-600 hover:bg-red-700'>
                Try Again
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
