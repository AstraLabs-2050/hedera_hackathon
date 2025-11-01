'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="sticky bg-white screen border-b py-4 px-[80px] flex justify-between items-center h-[84px]">
      {/* Logo Image */}
      <div className="flex items-center gap-2">
        <Image
          src="/astraLogo.svg"
          alt="Astra Logo"
          width={173}
          height={47}
        />
      </div>

      {/* Right Buttons */}
      <div>
        <Link href="/">
          <button className=" text-xl text-black text-[12px]  py-4 border w-fullz  rounded-[40px]">
            Join as a Maker
          </button>
        </Link>
      </div>
    </nav>
  );
}
