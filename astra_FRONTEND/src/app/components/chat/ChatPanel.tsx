// 'use client';

// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import { useChats } from '../../hooks/useChats';
// import CreateEscrowModal from '../CreateEscrowModal';
// import useChatSocket from '@/app/hooks/useChatSocket';

// type Props = {
//   escrowBalance: number;
//   onBack?: () => void;
//   activeChatId: string | null;
//   token: string | null;
//   role: 'maker' | 'creator';
// };

// export default function ChatPanel({
//   escrowBalance,
//   onBack,
//   activeChatId,
//   token,
//   role,
// }: Props) {

//   const { chats } = useChats(token || '', role, activeChatId);
//   const selectedChat = chats.find((chat) => chat.id === activeChatId);
//   const [remainingBalance, setRemainingBalance] = useState<number>(0);


//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const { emit } = useChatSocket({
//     conversationId: activeChatId || '',
//     token: token || '',
//     role,
//   });

//   useEffect(() => {
//   if (remainingBalance && activeChatId) {
//     localStorage.setItem(`remainingBalance_${activeChatId}`, remainingBalance.toString());
//   }
// }, [remainingBalance, activeChatId]);


//   const isCreator = role === 'creator';
//   const hasFunded = remainingBalance > 0;

//   return (
//     <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F2F2] h-[10dvh]">
//       {/* LEFT SECTION */}
//       <div className="flex items-center gap-3">
//         {onBack && (
//           <button onClick={onBack} className="lg:hidden p-1">
//             <Image src="/back.svg" alt="back" width={20} height={20} />
//           </button>
//         )}
//         <Image
//           src={selectedChat?.avatar || '/user-fill.png'}
//           alt="avatar"
//           width={35}
//           height={35}
//           className="rounded-full"
//         />
//         <div>
//           <h3 className="text-base font-semibold truncate">
//             {selectedChat?.name || 'Unknown'}
//           </h3>
//           <p className="text-xs text-[#828282] truncate">
//             {selectedChat?.title}
//           </p>
//         </div>
//       </div>

//       {/* RIGHT SECTION */}
//       <div className="flex items-center gap-3">
//         {isCreator ? (
//           hasFunded ? (
//             <>
//               <div className="flex items-center gap-2 bg-gradient-radial from-[#3F37C9] to-[#4361EE] text-white px-4 py-2 rounded-full">
//                 <Image src="/payment.svg" alt="payment" width={20} height={20} />
//                 <button 
//                 onClick={() => setIsModalOpen(true)}
//                  >${remainingBalance}</button>
//               </div>
//             </>
//           ) : (
//             <button
//               onClick={() => setIsModalOpen(true)}
//               className="bg-[#4361EE] text-white rounded-full px-5 py-2.5 hover:opacity-90"
//             >
//               Create Escrow
//             </button>
//           )
//         ) : (
//           hasFunded && (
//             <div className="flex items-center gap-2 bg-gradient-radial from-[#3F37C9] to-[#4361EE] text-white px-4 py-2 rounded-full">
//               <Image src="/payment.svg" alt="payment" width={20} height={20} />
//               <button>${remainingBalance}</button>
//             </div>
//           )
//         )}
//       </div>

//       {/* ESCROW MODAL */}
//       <CreateEscrowModal
//         open={isModalOpen}
//         onOpenChange={setIsModalOpen}
//         chatId={activeChatId}
//         conversationId={activeChatId}
//         token={token}
//         emit={emit}
//         trigger={''}
//         onCreateEscrow={(data) => {
//           // Optional: you can call a prop function to refetch or update escrowDetail in parent
//         }}
//         onEscrowUpdate={(updatedBalance) => setRemainingBalance(updatedBalance)}
//       />
//     </div>
//   );
// }



// 'use client';

// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import { useChats } from '../../hooks/useChats';
// import CreateEscrowModal from '../CreateEscrowModal';
// import useChatSocket from '@/app/hooks/useChatSocket';

// type Props = {
//   escrowBalance: number;
//   onBack?: () => void;
//   activeChatId: string | null;
//   token: string | null;
//   role: 'maker' | 'creator';
// };

// export default function ChatPanel({
//   escrowBalance,
//   onBack,
//   activeChatId,
//   token,
//   role,
// }: Props) {
//   const { chats } = useChats(token || '', role, activeChatId);
//   const selectedChat = chats.find((chat) => chat.id === activeChatId);

//   const [remainingBalance, setRemainingBalance] = useState<number>(escrowBalance || 0);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const { emit } = useChatSocket({
//     conversationId: activeChatId || '',
//     token: token || '',
//     role,
//   });

//   // ✅ Save the balance to localStorage for persistence
//   useEffect(() => {
//     if (remainingBalance && activeChatId) {
//       localStorage.setItem(`remainingBalance_${activeChatId}`, remainingBalance.toString());
//     }
//   }, [remainingBalance, activeChatId]);

//   // ✅ Load stored balance when switching between chats
//   useEffect(() => {
//     if (activeChatId) {
//       const stored = localStorage.getItem(`remainingBalance_${activeChatId}`);
//       if (stored) setRemainingBalance(parseFloat(stored));
//       else setRemainingBalance(escrowBalance || 0);
//     }
//   }, [activeChatId, escrowBalance]);

//   const hasFunded = remainingBalance > 0;

//   return (
//     <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F2F2] h-[10dvh]">
//       {/* LEFT SECTION */}
//       <div className="flex items-center gap-3">
//         {onBack && (
//           <button onClick={onBack} className="lg:hidden p-1">
//             <Image src="/back.svg" alt="back" width={20} height={20} />
//           </button>
//         )}

//         <Image
//           src={selectedChat?.avatar || '/user-fill.png'}
//           alt="avatar"
//           width={35}
//           height={35}
//           className="rounded-full"
//         />

//         <div>
//           <h3 className="text-base font-semibold truncate">
//             {selectedChat?.name || 'Unknown'}
//           </h3>
//           <p className="text-xs text-[#828282] truncate">
//             {selectedChat?.title}
//           </p>
//         </div>
//       </div>

//       {/* RIGHT SECTION */}
//       <div className="flex items-center gap-3">
//         {/* ✅ For creator: show create escrow if not funded, else show balance */}
//         {role === 'creator' ? (
//           hasFunded ? (
//             <div className="flex items-center gap-2 bg-gradient-radial from-[#3F37C9] to-[#4361EE] text-white px-4 py-2 rounded-full">
//               <CreateEscrowModal
//                 trigger={
//                   <div className='flex gap-2'>
//                     <Image src="/payment.svg" alt="payment" width={20} height={20} />
//                   <button
//                     // onClick={() => console.log("Opening manage view")}
//                     className="text-white font-medium hover:underline"
//                     >
//                     ${remainingBalance}
//                   </button>
//                     </div>
//                 }
//                 open={isModalOpen}
//                 onOpenChange={setIsModalOpen}
//                 chatId={activeChatId}
//                 token={token}
//                 defaultView="manage"
//                 currentRole="creator"
//                 onCreateEscrow={() => { }}
//                 />
//                 </div>
//           ) : (
//             <button
//               onClick={() => setIsModalOpen(true)}
//               className="bg-[#4361EE] text-white rounded-full px-5 py-2.5 hover:opacity-90"
//             >
//               Create Escrow
//             </button>
//           )
//         ) : (
//           /* ✅ For maker: only show balance (no create escrow button) */
//           hasFunded && (
//             <div className="flex items-center gap-2 bg-gradient-radial from-[#3F37C9] to-[#4361EE] text-white px-4 py-2 rounded-full">
//               <Image src="/payment.svg" alt="payment" width={20} height={20} />
//               <span>${remainingBalance}</span>
//             </div>
//           )
//         )}
//       </div>

//       {/* ESCROW MODAL */}
//       <CreateEscrowModal
//         open={isModalOpen}
//         onOpenChange={setIsModalOpen}
//         chatId={activeChatId}
//         conversationId={activeChatId}
//         token={token}
//         emit={emit}
//         trigger={''}
//         onCreateEscrow={() => { }}
//         onEscrowUpdate={(updatedBalance) => setRemainingBalance(updatedBalance)}
//       />
//     </div>
//   );
// }


'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useChats } from '../../hooks/useChats';
import CreateEscrowModal from '../CreateEscrowModal';
import useChatSocket from '@/app/hooks/useChatSocket';

type Props = {
  escrowBalance: number;
  onBack?: () => void;
  activeChatId: string | null;
  token: string | null;
  role: 'maker' | 'creator';
};

export default function ChatPanel({
  escrowBalance,
  onBack,
  activeChatId,
  token,
  role,
}: Props) {
  const { chats } = useChats(token || '', role, activeChatId);
  const selectedChat = chats.find((chat) => chat.id === activeChatId);

  const [remainingBalance, setRemainingBalance] = useState<number>(escrowBalance || 0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultView, setDefaultView] = useState<'create' | 'manage'>('create');

  const { emit } = useChatSocket({
    conversationId: activeChatId || '',
    token: token || '',
    role,
  });

  // ✅ Persist balance per chat
  useEffect(() => {
    if (remainingBalance && activeChatId) {
      localStorage.setItem(`remainingBalance_${activeChatId}`, remainingBalance.toString());
    }
  }, [remainingBalance, activeChatId]);

  // ✅ Load stored balance when switching chats
  useEffect(() => {
    if (activeChatId) {
      const stored = localStorage.getItem(`remainingBalance_${activeChatId}`);
      if (stored) setRemainingBalance(parseFloat(stored));
      else setRemainingBalance(escrowBalance || 0);
    }
  }, [activeChatId, escrowBalance]);

  const hasFunded = remainingBalance > 0;
  const isCreator = role === 'creator';

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F2F2] h-[10dvh]">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="lg:hidden p-1">
            <Image src="/back.svg" alt="back" width={20} height={20} />
          </button>
        )}

        <Image
          src={selectedChat?.avatar || '/user-fill.png'}
          alt="avatar"
          width={35}
          height={35}
          className="rounded-full"
        />

        <div>
          <h3 className="text-base font-semibold truncate">
            {selectedChat?.name || 'Unknown'}
          </h3>
          <p className="text-xs text-[#828282] truncate">
            {selectedChat?.title}
          </p>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3">
        {isCreator ? (
          hasFunded ? (
            // ✅ Creator sees "Manage Escrow"
            <button
              onClick={() => {
                setDefaultView('manage');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-gradient-radial from-[#3F37C9] to-[#4361EE] text-white px-4 py-2 rounded-full hover:opacity-90"
            >
              <Image src="/payment.svg" alt="payment" width={20} height={20} />
              ${remainingBalance}
            </button>
          ) : (
            // ✅ Creator sees "Create Escrow" button
            <button
              onClick={() => {
                setDefaultView('create');
                setIsModalOpen(true);
              }}
              className="bg-[#4361EE] text-white rounded-full px-5 py-2.5 hover:opacity-90"
            >
              Create Escrow
            </button>
          )
        ) : (
          // ✅ Maker sees balance only, but cannot click it
          hasFunded && (
            <div className="flex items-center gap-2 bg-gradient-radial from-[#3F37C9] to-[#4361EE] text-white px-4 py-2 rounded-full cursor-default select-none">
              <Image src="/payment.svg" alt="payment" width={20} height={20} />
              ${remainingBalance}
            </div>
          )
        )}
      </div>

      {/* ESCROW MODAL — only used by creators */}
      {isCreator && (
        <CreateEscrowModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          chatId={activeChatId}
          conversationId={activeChatId}
          token={token}
          emit={emit}
          defaultView={defaultView}
          currentRole={role}
          trigger={''}
          onCreateEscrow={() => {}}
          onEscrowUpdate={(updatedBalance) => setRemainingBalance(updatedBalance)}
        />
      )}
    </div>
  );
}
