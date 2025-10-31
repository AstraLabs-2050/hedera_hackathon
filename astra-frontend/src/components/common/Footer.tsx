import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { CiLinkedin } from "react-icons/ci";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";
import { navItems, socialLinks } from "@/lib/constants";

const Footer = () => {
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      console.warn(`Section with id "${id}" not found`);
    }
  };

  const socialIcons: { [key: string]: React.ComponentType } = {
    FaInstagram,
    CiLinkedin,
    FaXTwitter,
  };

  return (
    <footer className='mt-40 bg-neutral-900 py-16 px-6 md:px-20'>
      <div className='flex flex-col justify-center items-center gap-16 md:gap-9'>
        {/* Footer Navigation */}
        <nav aria-label='Footer navigation'>
          <ul className='flex justify-center flex-wrap gap-4 md:gap-7'>
            {navItems.map((link) => (
              <li key={link.name}>
                <button
                  onClick={() => handleScroll(link.id)}
                  className='relative inline-block text-white/60 hover:text-primary/70 after:block after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary/60 after:transition-all after:duration-300 hover:after:w-full text-sm'
                  aria-label={`Scroll to ${link.name} section`}>
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Logo */}
        <Image
          src='/astraLogo.svg'
          alt='Astra brand logo'
          width={780}
          height={40}
          className='w-[780px] h-auto'
          sizes='(max-width: 768px) 100vw, 280px'
        />
      </div>

      <div className='space-y-16'>
        <Separator className='bg-white/40 mt-16' />
        <div className='flex flex-col md:flex-row justify-between items-center gap-8'>
          {/* Social Links */}
          <div className='flex space-x-5 text-2xl'>
            {socialLinks.map((link) => {
              const Icon = socialIcons[link.icon];
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-white/60'
                  aria-label={`Visit Astra on ${link.name}`}
                  title={`Visit Astra on ${link.name}`}>
                  <Icon />
                </a>
              );
            })}
          </div>

          {/* Copyright and Privacy */}
          <div className='text-xs text-white/60'>
            <span>© 2025 — astra</span>{" "}
            <Link
              href='/privacy'
              className='underline hover:text-primary/60 pl-2'
              aria-label="View Astra's privacy and terms">
              Privacy and Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
