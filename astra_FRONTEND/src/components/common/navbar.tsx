"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { navItems } from "@/lib/constants";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleMobileMenu = () => {
    setMobileMenu((prev) => !prev);
  };

  const handleNavClick = (item: { id?: string; route?: string }) => {
    if (item.route) {
      // "Home" or any future full routes
      router.push(item.route);
      return;
    }

    if (!item.id) return;

    const element = document.getElementById(item.id);
    if (element && pathname === "/") {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push(`/#${item.id}`);
    }
  };

  return (
    <header className='sticky top-0 z-50 backdrop-blur-sm bg-black/10 transition-colors duration-300'>
      <div className='flex justify-between items-center px-8 py-4 md:px-14 shadow-xs'>
        {/* Logo */}
        <div className='w-40'>
          <Link href='/' aria-label='Go to Astra homepage'>
            <Image
              src='/astraLogo.svg'
              alt='Astra brand logo'
              className='w-full h-auto'
              width={280}
              height={40}
              priority
              sizes='(max-width: 768px) 100vw, 280px'
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav
          className='hidden md:flex items-center gap-4 font-medium text-primary'
          aria-label='Main navigation'>
          <ul className='flex gap-8'>
            {navItems.map((link) => (
              <li key={link.name}>
                <button
                  onClick={() => handleNavClick(link)}
                  className='relative inline-block text-[#B3B3B3] hover:text-primary/80 after:block after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary/60 after:transition-all after:duration-300 hover:after:w-full text-sm'
                  aria-label={`Scroll to ${link.name} section`}>
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Action button */}
        <Link
          href={
            pathname === "/marketplace"
              ? "/dashboard/aiagent/chat"
              : "/marketplace"
          }
          className='hidden md:flex bg-[#2C2C2C] text-sm text-white font-medium rounded-full px-7 py-3 hover:text-primary/70 hover:bg-[#2C2C2C]/70'
          aria-label='Action Button'>
          {pathname === "/marketplace" ? "Create Now" : "Explore Marketplace"}
        </Link>

        {/* Mobile Menu Button */}
        <Button
          onClick={toggleMobileMenu}
          className='md:hidden bg-transparent hover:bg-transparent p-0 hover:text-primary/70 transition-colors duration-200'
          aria-label='Open mobile menu'>
          <Menu size={30} className='text-primary stroke-2' />
        </Button>
      </div>

      {/* Mobile Menu */}

      {mobileMenu && (
        <div
          className='fixed inset-0 z-50 bg-black/95 h-screen backdrop-blur-xl flex flex-col md:hidden'
          role='dialog'
          aria-label='Mobile navigation menu'>
          <div className='flex justify-end p-4'>
            <Button
              onClick={toggleMobileMenu}
              className='p-2 bg-transparent'
              aria-label='Close mobile menu'>
              <X size={30} className='text-white' />
            </Button>
          </div>
          <nav className='mt-10'>
            <ul className='flex flex-col items-center gap-6 text-lg text-white font-medium'>
              {navItems.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => {
                      handleNavClick(link);
                      setMobileMenu(false); // close after scroll
                    }}
                    className='hover:text-gray-300 transition-colors duration-200'
                    aria-label={`Scroll to ${link.name} section`}>
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
