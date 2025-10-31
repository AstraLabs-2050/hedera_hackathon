"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, LogOut, CircleUserRound } from "lucide-react";
import { GoShieldLock } from "react-icons/go";
import { MdOutlinePolicy } from "react-icons/md";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsOverview() {
  const { logout } = useAuth();

  const settings = [
    {
      title: "Brand Profile Settings",
      description:
        "Your brand name, brand story and other relevant information.",
      icon: <CircleUserRound className='h-6 w-6 text-black' />,
      href: "/dashboard/settings/profile",
    },
    {
      title: "Password & Security",
      description:
        "Change your password and other account security preferences.",
      icon: <GoShieldLock className='h-6 w-6 text-black' />,
      href: "/dashboard/settings/security",
    },
    {
      title: "Notifications",
      description: "Notification and alert preferences.",
      icon: <Bell className='h-6 w-6 text-black' />,
      href: "/dashboard/settings/notifications",
    },
    {
      title: "Return/Refund Policy",
      description: "Establish clear guidelines for product returns.",
      icon: <MdOutlinePolicy className='h-6 w-6 text-black' />,
      href: "/dashboard/settings/policy",
    },
    {
      title: "Log Out",
      description: "Sign out of your account",
      icon: <LogOut className='h-6 w-6 text-pink-500' />,
      logout: true,
    },
  ];

  return (
    <div className='h-full bg-[#F9F9F9] px-4 md:px-10 pt-10 pb-5'>
      <div className='grid gap-6 md:grid-cols-3 items-stretch'>
        {settings.map((item, idx) => {
          const card = (
            <Card
              key={idx}
              className='cursor-pointer hover:shadow-lg transition rounded-2xl h-full'>
              <CardContent className='flex flex-col items-start gap-3 p-6 h-full'>
                <div
                  className={`flex items-center justify-center rounded-full pb-4 ${
                    item.logout ? "text-pink-500" : "text-black"
                  }`}>
                  {item.icon}
                </div>
                <p
                  className={`font-medium ${
                    item.logout ? "text-pink-500" : "text-black"
                  }`}>
                  {item.title}
                </p>
                <p
                  className={`text-sm ${
                    item.logout ? "text-pink-400" : "text-gray-500"
                  }`}>
                  {item.description}
                </p>
                <div className='flex-grow' />
              </CardContent>
            </Card>
          );

          // Wrap logout card in AlertDialog
          if (item.logout) {
            return (
              <AlertDialog key={idx}>
                <AlertDialogTrigger asChild>{card}</AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Log Out?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to sign out of your account? You
                      will need to log in again to access your dashboard.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className='rounded-2xl'>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className='bg-pink-600 hover:bg-pink-600 text-white rounded-2xl'
                      onClick={logout}>
                      Log Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            );
          }

          // Normal settings (use Link)
          return (
            <Link href={item.href!} key={idx} className='h-full'>
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
