import Image from "next/image";

const GeneratingIndicator: React.FC = () => {
  return (
    <div className='flex items-start space-x-3 max-w-[70%]'>
      <div className='flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-400 to-white/70 rounded-full flex items-center justify-center'>
        <Image
          src='/agent.svg'
          alt='AI Agent'
          width={20}
          height={20}
          priority
          className='w-5 h-auto animate-pulse'
        />
      </div>

      <div className='flex items-center space-x-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm'>
        <span className='text-sm text-gray-500 font-medium'>
          Generating design
        </span>
        <div className='flex space-x-1 items-center'>
          <span
            className='w-2 h-2 bg-gray-500 rounded-full animate-bounce'
            style={{ animationDelay: "0ms" }}></span>
          <span
            className='w-2 h-2 bg-gray-500 rounded-full animate-bounce'
            style={{ animationDelay: "150ms" }}></span>
          <span
            className='w-2 h-2 bg-gray-500 rounded-full animate-bounce'
            style={{ animationDelay: "300ms" }}></span>
        </div>
      </div>
    </div>
  );
};

export default GeneratingIndicator;
