// UserReply.tsx
import React from 'react'
import Image from 'next/image'

interface UserReplyProps {
  content: React.ReactNode | string;
  images?: string[];
  showConfirmButton?: boolean;
  timestamp?: string;
  avatar?: string;
}

const UserReply: React.FC<UserReplyProps> = ({ 
  content, 
  images = [], 
  showConfirmButton = true,
  timestamp,
  avatar
}) => {
  return (
    <div className='my-4 bg-gray-100 rounded-lg p-3 max-w-md'>
      <div className='flex flex-col gap-2'>
        {/* Content text */}
        <div className='text-sm'>
          {content}
        </div>
        
        {/* Images grid if images are provided */}
        {images.length > 0 && (
          <div className={`grid ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2 mt-2`}>
            {images.map((src, index) => (
              <div key={index} className='relative aspect-square bg-gray-200 rounded overflow-hidden'>
                <Image 
                  src={src} 
                  fill
                  className="object-cover"
                  alt={`User uploaded image ${index + 1}`} 
                />
              </div>
            ))}
          </div>
        )}
        
        {/* Confirmation button and timestamp in a row */}
        <div className='flex items-center justify-between mt-1'>
          {timestamp && <span className='text-xs text-gray-500'>{timestamp}</span>}
          {showConfirmButton && (
            <div className='bg-black rounded-full w-[49px] h-[49px] flex items-center justify-center ml-auto'>
              {avatar ? (
                <Image 
                  src={avatar} 
                  width={43} 
                  height={43} 
                  className="rounded-full object-cover"
                  alt="User avatar" 
                />
              ) : (
                <Image src="/logo.svg" width={43} height={10.25} alt="logo" priority />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserReply