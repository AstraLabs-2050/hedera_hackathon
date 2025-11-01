"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import Link from "next/link";
import { IoImages } from "react-icons/io5";
import CreateDesignDialog from "./CreateDesignDialog";

export default function UploadDesign() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [topProgress, setTopProgress] = useState(10); // Initialize to 10%
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const simulateUpload = async () => {
    setProgress(0);
    setTopProgress(10); // Start at 10%
    await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay to ensure render
    for (let i = 1; i <= 100; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setProgress(i);
    }
    setUploaded(true);
    setTopProgress(50); // Move to 50% on successful upload
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    setError(null);

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Unsupported file type. Only PNG, JPG, JPEG allowed.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setPreviewUrl(newUrl);
    setUploaded(false);
    simulateUpload();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
    setTopProgress(10);
    setUploaded(false);
    setError(null);
  };

  const handleCancel = () => {
    router.push("/");
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const isButtonEnabled = uploaded && description.length >= 30;

  return (
    <div className='w-full min-h-screen flex justify-center items-center relative bg-[#F9F9F9] pt-12 pb-10 px-5 md:px-[60px] h-auto'>
      <div className='w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6 py-8 md:px-[65px]'>
        <Progress value={topProgress} className='mb-8 w-full h-3' />
        <h1 className='text-2xl font-bold mb-6 text-center'>
          Upload Your Design
        </h1>
        <div
          className='border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center flex flex-col justify-center w-full'
          onDrop={handleDrop}
          onDragOver={handleDragOver}>
          <IoImages className='mx-auto h-12 w-12 text-gray-500 mb-2' />
          <p className='text-lg'>
            Drop your design image here, or{" "}
            <span
              className='text-blue-500 cursor-pointer hover:underline'
              onClick={handleBrowse}>
              Browse
            </span>
          </p>
          <p className='text-sm text-gray-400 italic'>
            For best results, submit a clear, high-quality image (PNG, JPG, or
            JPEG). Max size 10MB.
          </p>
          <input
            type='file'
            ref={fileInputRef}
            hidden
            accept='image/png, image/jpeg, image/jpg'
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          />
        </div>
        {error && <p className='text-red-500 mb-4'>{error}</p>}
        {file && (
          <div className='relative border-2 border-gray-100 w-full p-4 rounded-lg mb-6 flex items-start justify-between'>
            <div className='flex items-start flex-1'>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt='Thumbnail'
                  className='w-10 h-10 object-cover rounded mr-3'
                />
              )}
              <div className='flex-1'>
                <p className='font-medium max-w-[78%]'>{file.name}</p>
                <p className='text-sm text-gray-500'>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className='flex items-center gap-2'>
                  <Progress value={progress} className='mt-2 w-full' />
                  <p className='text-sm text-gray-500 mt-1'>{progress}%</p>
                </div>
              </div>
            </div>
            <div className='absolute top-2 right-3 flex items-center'>
              {uploaded && (
                <Button
                  variant='link'
                  className='mr-2'
                  onClick={() => setDialogOpen(true)}>
                  Preview
                </Button>
              )}
              <Button variant='ghost' size='icon' onClick={removeFile}>
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className='max-w-3xl max-h-[85vh] overflow-y-auto'>
            {previewUrl && (
              <img
                src={previewUrl}
                alt='Full Preview'
                className='w-full h-auto'
              />
            )}
          </DialogContent>
        </Dialog>
        <Label htmlFor='description' className='block mb-2 text-left'>
          Describe Your Design
        </Label>
        <Textarea
          id='description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className='mb-6 resize-none'
          placeholder=''
        />
        <Link
          href='/dashboard/aiagent/chat'
          className='text-sm text-gray-500 hover:opacity-80 mb-6 text-left underline'>
          Prefer AI?
        </Link>
        <div className='flex justify-end space-x-4'>
          <Button variant='outline' onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            disabled={!isButtonEnabled}
            onClick={() => setCreateDialogOpen(true)}>
            Create Design
          </Button>
        </div>
        <CreateDesignDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          previewUrl={previewUrl}
          description={description}
          file={file}
        />
      </div>
    </div>
  );
}
