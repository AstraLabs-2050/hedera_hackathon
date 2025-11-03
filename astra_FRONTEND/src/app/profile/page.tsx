"use client"
import Image from 'next/image'
import React, { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Input from '../components/input'
import { Select, SelectOption } from '../components/select'
import Textarea from '../components/textArea'
import { CloudUpload, Link as LinkIcon, Loader } from 'lucide-react'
import Button from '../components/button'
import { parseCookies, setCookie } from 'nookies'
import Notification from '../components/notification'
import api from '@/utils/api.class'
import { useRouter } from 'next/navigation'
import { TOKEN_NAME } from '@/utils/constant'

// Define form data interface
interface BrandFormValues {
  name: string;
  origin: string;
  story: string;
  logoFile: File | null;
  logoUrl: string;
  logoType: 'url' | 'file';
  logoBase64: string; // Hidden field to store base64 when file is uploaded
}

function BrandProfilePage(): any {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  // Define validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Brand name is required')
      .min(2, 'Brand name must be at least 2 characters'),
    origin: Yup.string()
      .required('Brand origin is required'),
    story: Yup.string(),
    logoType: Yup.string()
      .oneOf(['url', 'file'], 'Invalid logo type'),
    logoFile: Yup.mixed()
      .when('logoType', {
        is: 'file',
        then: (schema) => schema.test(
          'fileType', 
          'Only JPEG/JPG files are accepted', 
          (value) => !value || (value instanceof File && ['image/jpeg', 'image/jpg'].includes(value.type))
        )
      }),
    logoUrl: Yup.string()
      .when('logoType', {
        is: 'url',
        then: (schema) => schema.url('Must be a valid URL').required('Logo URL is required when using URL input')
      })
  });

  // Initialize formik
  const formik = useFormik<BrandFormValues>({
    initialValues: {
      name: '',
      origin: '',
      story: '',
      logoFile: null,
      logoUrl: '',
      logoBase64: '',
      logoType: 'url'
    },
    validationSchema,
    onSubmit: async(values) => {
      // Set loading state to true before submission
      setIsLoading(true);
      
      try {
        const cookies = parseCookies();
        if(!cookies?.brand_id){
          Notification.error("Invalid brand id");
          setIsLoading(false);
          return;
        }

        let logoData = null;

        // Process logo based on type
        if (values.logoType === 'url') {
          logoData = values.logoUrl;
        } else if (values.logoType === 'file') {
          // Use the converted base64 data
          logoData = values.logoBase64;
        }
       
        const response = await api.registerBrandStep2({
          id: cookies?.brand_id,
          name: values.name,
          origin: values.origin,
          story: values.story,
          logo: logoData
        });
        if (response.status) {
          Notification.success("Brand profile updated successfully");
          setCookie(null,TOKEN_NAME, response?.token)
          // Redirect to success page
          router.push('/success');
        }
      } catch (error) {
        console.error("Error updating brand profile:", error);
        Notification.error("Failed to update brand profile");
      } finally {
        // Set loading state to false after submission (whether successful or not)
        setIsLoading(false);
      }
    }
  });

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Origin options for select
  const originOptions: SelectOption[] = [
    { label: 'USA', value: 'usa' },
    { label: 'Canada', value: 'canada' },
    { label: 'UK', value: 'uk' },
    { label: 'France', value: 'france' },
    { label: 'Italy', value: 'italy' },
    { label: 'Japan', value: 'japan' },
    { label: 'South Korea', value: 'south-korea' },
    { label: 'Other', value: 'other' },
  ];

  // Handle drag events for file upload
  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        formik.setFieldValue('logoFile', file);
        formik.setFieldValue('logoType', 'file');
        
        // Convert to base64 and update form
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          setLogoPreview(base64String);
          formik.setFieldValue('logoBase64', base64String);
        };
        reader.readAsDataURL(file);
      } else {
        formik.setFieldError('logoFile', 'Only JPEG/JPG files are accepted');
      }
    }
  };

  // Handle file selection via input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        formik.setFieldValue('logoFile', file);
        formik.setFieldValue('logoType', 'file');
        
        // Convert to base64 and update form
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          setLogoPreview(base64String);
          formik.setFieldValue('logoBase64', base64String);
        };
        reader.readAsDataURL(file);
      } else {
        formik.setFieldError('logoFile', 'Only JPEG/JPG files are accepted');
      }
    }
  };

  // Handle URL input
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const url = e.target.value;
    formik.setFieldValue('logoUrl', url);
    formik.setFieldValue('logoType', 'url');
    
    if (url) {
      setLogoPreview(url);
    } else {
      setLogoPreview(null);
    }
  };

  // Switch between logo input methods
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');

  return (
    <div
      className="w-screen p-6 flex items-center justify-center"
      style={{
        backgroundImage: 'url("/loginBg.png")'
      }}
    >
      <div className="w-[516px] h-auto rounded-[16px] border border-[#000000] py-[24px] px-[40px] gap-[10px] flex flex-col items-center justify-center bg-white">
        <Image className="mb-2" src="/logo.png" alt="logo" width={155} height={37} />
        <h2 className="font-[500] text-[32px]">Brand Profile</h2>
        <p className="font-[400] text-[18px]">Showcase your unique fashion identity</p>
        
        <form onSubmit={formik.handleSubmit} className="w-full space-y-4">
          <div>
            <Input 
              name="name"
              placeholder="Enter your brand name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && formik.errors.name ? formik.errors.name : ''}
            />
          </div>
          
          <div>
            <Select
              name="origin"
              placeholder="Select your brand origin"
              options={originOptions}
              value={formik.values.origin}
              onChange={(value) => formik.setFieldValue('origin', value)}
              onBlur={() => formik.setFieldTouched('origin', true)}
              error={formik.touched.origin && formik.errors.origin ? formik.errors.origin : ''}
            />
          </div>
          
          <div>
            <Textarea
              name="story"
              placeholder="Tell your brand story (optional, but good for marketing)"
              value={formik.values.story}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.story && formik.errors.story ? formik.errors.story : ''}
            />
          </div>
          
          <div className="flex mb-3 flex-col items-center w-full">
            <h2 className="text-[] font-[ClashGrotesk-Medium] font-medium mb-3 w-full text-left">Upload your Brand Logo</h2>
            
            {/* Tab selector for logo input method */}
            <div className="flex w-full mb-3 border-b">
              <button 
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 px-4 ${activeTab === 'upload' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
              >
                Upload File
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-2 px-4 ${activeTab === 'url' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
              >
                URL
              </button>
            </div>
            
            {/* File upload tab - automatically converts to base64 */}
            {activeTab === 'upload' && (
              <div
                className={`w-full h-44 mb-3 rounded-lg flex flex-col items-center justify-center bg-gray-50 ${
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                } ${formik.touched.logoFile && formik.errors.logoFile ? "border-red-500" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {logoPreview && formik.values.logoType === 'file' ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={logoPreview}
                      alt="Brand logo preview"
                      className="max-h-40 max-w-full mb-2"
                    />
                    <p className="text-sm text-gray-500">{formik.values.logoFile?.name} (Converted to Base64)</p>
                  </div>
                ) : (
                  <>
                    <CloudUpload size={32} />
                    <p className="text-[14px] text-gray-500 mb-1">Drag and Drop JPEG File</p>
                    <p className="text-lg text-gray-500 mb-4">or</p>
                    <label htmlFor="fileUpload" className="cursor-pointer">
                      <div className="text-[14px] text-black underline">Upload from Device</div>
                      <input
                        id="fileUpload"
                        name="logoFile"
                        type="file"
                        accept="image/jpeg,image/jpg"
                        onChange={handleChange}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>
            )}
            
            {/* URL input tab */}
            {activeTab === 'url' && (
              <div className="w-full mb-3">
                <div className="flex items-center mb-2">
                  <LinkIcon size={16} className="mr-2" />
                  <Input
                    name="logoUrl"
                    placeholder="Enter image URL"
                    value={formik.values.logoUrl}
                    onChange={handleUrlChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.logoUrl && formik.errors.logoUrl ? formik.errors.logoUrl : ''}
                  />
                </div>
                
                {logoPreview && formik.values.logoType === 'url' && (
                  <div className="mt-3 border rounded-lg p-2 flex justify-center">
                    <img
                      src={logoPreview}
                      alt="Brand logo preview"
                      className="max-h-40 max-w-full"
                      onError={() => {
                        formik.setFieldError('logoUrl', 'Unable to load image from URL');
                        setLogoPreview(null);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
            
            {logoPreview && (
              <button
                type="button"
                onClick={() => {
                  formik.setFieldValue('logoFile', null);
                  formik.setFieldValue('logoUrl', '');
                  formik.setFieldValue('logoBase64', '');
                  setLogoPreview(null);
                }}
                className="mt-1 text-red-500 hover:text-red-700"
              >
                Remove Image
              </button>
            )}
          </div>
          
          <Button 
            type='submit' 
            label={isLoading ? 'Saving... ' + (isLoading ? '⟳' : '') : 'Save Brand Profile'}
            disabled={isLoading}
          />
        </form>
      </div>
    </div>
  );
}

export default BrandProfilePage;