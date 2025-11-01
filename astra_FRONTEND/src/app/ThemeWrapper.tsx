'use client';

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    if (pathname === "/" || pathname.includes("marketplace")) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [pathname]);

  return <>{children}</>;
}
