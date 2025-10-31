"use client"
import Image from "next/image"
import React, { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import Input from "../components/input"
import Button from "../components/button"
import Notification from "../components/notification"
import api from "@/utils/api.class"
import { useRouter } from "next/navigation"
import { setCookie } from "nookies"
// import { TokenInstance } from 'twilio/lib/rest/previewIam/v1/token'
import { BRAND_ID, TOKEN_NAME, USER_ID } from "@/utils/constant"
import Link from "next/link"

function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  // Form validation schema
  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string()
      .min(8, "Password must have at least 8 characters, 1 uppercase letter and 1 number")
      .matches(/[A-Z]/, "Password must have at least 8 characters, 1 uppercase letter and 1 number")
      .matches(/\d/, "Password must have at least 8 characters, 1 uppercase letter and 1 number")
      .required("Password is required"),
  })

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async values => {
      try {
        setIsLoading(true)
        // Simulate API call
        const response = await api.registerBrand(values)
        if (!response?.status) {
          return Notification.error(response?.message || "Something went wrong. Please try again.")
        }
        setCookie(null, BRAND_ID, response?.data)
        // Show success notification
        Notification.success("Account created successfully!")
        router.push("/profile")

      } catch (error) {
        // Show error notification
        Notification.error("Something went wrong. Please try again.")
      } finally {
        setIsLoading(false)
      }
    },
  })

  return (
    <div
      className="w-screen h-screen flex items-center justify-center"
      style={{
        backgroundImage: 'url("loginBg.png")',
      }}
    >
      <div className="w-[516px] h-auto rounded-[16px] border border-[#000000] py-[24px] px-[40px] gap-[10px] flex flex-col items-center justify-center bg-white">
        <Image className="mb-2" src="/logo.png" alt="logo" width={155} height={37} />
        <h2 className="font-[ClashGrotesk-Medium] font-[500] text-[32px]">Create an Account</h2>
        <p className="text-[400] text-[18px]">
          Create an account to launch your design onchain
        </p>

      

        <form onSubmit={formik.handleSubmit} className="w-full mt-4">
          <div className="flex flex-col gap-3 mb-3 w-full">
            <div>
              <Input
                placeholder="Enter your email address"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-[12px] text-red-500 mt-1">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <Input
                placeholder="Enter your password"
                type="password"
                showPasswordToggle={true}
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-[12px] text-red-500 mt-1">{formik.errors.password}</p>
              )}
            </div>
          </div>

          <div className="w-full flex justify-center mt-4">
            <Button
              label={isLoading ? "Creating Account..." : "Create Account"}
              type="submit"
              fullWidth={true}
              disabled={isLoading}
            />
          </div>

          <div className="mt-4 text-center">
            <p className="text-[16px] text-[#828282]">
              Already have an account?{" "}
              <Link href="login" className="text-black font-[ClashGrotesk-SemiBold]">
                Login
              </Link>
            </p>
            <p className="text-[16px] text-[#828282]">
              You acknowledge that you read, and agree to our{" "}
            </p>
            <span className="flex gap-1 justify-center items-center">
              <a href="#" className="underline">
                Terms of Service
              </a>{" "}
              <p className="text-[#828282]">and our</p>{" "}
              <a href="#" className="underline">
                Privacy Policy
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
