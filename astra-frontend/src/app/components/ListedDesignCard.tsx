import { Design } from "@/types/types";
import Image from "next/image";

function ListedDesignCard({ design }: { design: Design }) {
  const priceInUSD = parseFloat(design.price).toFixed(2);

  return (
    <div className='overflow-hidden rounded-xl border border-gray-300 flex flex-col'>
      <Image
        src={design.designLink}
        alt={design.name}
        width={240}
        height={244}
        className='w-full h-[244px] rounded-t-xl object-cover object-top'
      />

      <div className='space-y-[6px] px-3 py-2 text-sm'>
        <h3 className='font-medium'>{design.name}</h3>
        <p className='font-light text-black/60'>
          {design.quantity} Piece{design.quantity > 1 ? "s" : ""}
        </p>

        <div className='text-right font-light text-xs lg:text-[11px]'>
          <p>{priceInUSD} USD</p>
        </div>
      </div>
    </div>
  );
}

export default ListedDesignCard;
