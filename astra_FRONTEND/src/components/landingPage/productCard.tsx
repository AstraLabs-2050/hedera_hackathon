// components/ProductCard.tsx
import { FC } from 'react';
import Image from 'next/image';
import { Product } from '@/modaltypes'; //



interface ProductCardProps extends Product {
  onPreOrder: (product: Product) => void;
}

const ProductCard: FC<ProductCardProps> = ({ 
  id,
  name, 
  price, 
  imageUrl, 
  location = 'USA',
  text,
  onPreOrder 
}) => {
  return (
    <div className="mx-auto flex flex-col bg-[#F5F5F5] border rounded-[15px] w-[357px] h-[500px]">
      {/* Product Image */}
      <div className="relative w-full h-[500px]">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="pt-6 px-6 object-cover"
        />
      </div>
      
      {/* Product Info */}
      <div className="px-4 mt-10">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-[#1E1E1E] text-sm">{name}</h3>
          <span className="font-clash font-medium text-[#1E1E1E] text-sm">${price}</span>
        </div>
        
        {/* Location */}
        <p className='text-xs text-gray-400'>by Lumina Dusk</p>
        <div className="flex items-center text-gray-500 text-xs my-6">
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C7.58 2 4 5.58 4 10C4 14.42 7.58 18 12 18C16.42 18 20 14.42 20 10C20 5.58 16.42 2 12 2ZM12 16C8.69 16 6 13.31 6 10C6 6.69 8.69 4 12 4C15.31 4 18 6.69 18 10C18 13.31 15.31 16 12 16Z" fill="currentColor"/>
            <path d="M12 10C13.1046 10 14 9.10457 14 8C14 6.89543 13.1046 6 12 6C10.8954 6 10 6.89543 10 8C10 9.10457 10.8954 10 12 10Z" fill="currentColor"/>
            <path d="M19 20H5V18H19V20Z" fill="currentColor"/>
          </svg>
          Ships from {location}
        </div>
        
        {/* Pre-Order Button */}
        <button 
          onClick={() => onPreOrder({ id, name, price, imageUrl, location,text })}
          className="w-[325px] border border-gray-300 rounded-lg py-[18px] px-[40px] text-sm font-medium text-center hover:bg-gray-100 transition-colors mb-4"
        >
          Pre-Order
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
