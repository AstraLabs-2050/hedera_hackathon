"use client";

import { FC, useState } from "react";
import Modal from "@/components/landingPage/Modal";
import Image from "next/image";
import { ShieldCheck, X } from "lucide-react";
import LoginModal from "@/components/Modals/LoginModal";

interface PreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: number;
    imageUrl: string;
    location: string;
    text: string;
  } | null;
}

const PreOrderModal: FC<PreOrderModalProps> = ({ isOpen, onClose, product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  if (!product) return null;

  const handleConfirm = () => {
    onClose(); // Close PreOrderModal
    setIsLoginOpen(true); // Open LoginModal
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 overflow-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden relative my-8">

            {/* Image Section */}
            <div className="relative w-full aspect-[4/5] md:aspect-auto rounded-lg">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover p-6 rounded-lg"
              />
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col justify-between">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-full transition"
              >
                <X size={20} />
              </button>

              <div>
                <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
                <p className="text-xl text-gray-800 font-semibold mb-4">${product.price}</p>
                <p className="text-gray-600 mb-6">{product.text}</p>

                <div className="mb-4">
                  <p className="font-semibold text-sm mb-1">Lead Time</p>
                  <button className="text-sm border rounded-full px-4 py-1">
                    Made to order: 7-10 business days
                  </button>
                </div>

                <div className="mb-4">
                  <p className="font-semibold text-sm mb-1">Ships From</p>
                  <button className="text-sm border rounded-full px-4 py-1">
                    {product.location || "Unknown"}
                  </button>
                </div>

                <div className="bg-gray-100 p-3 rounded-xl flex gap-3 items-start text-sm mb-4">
                  <ShieldCheck className="text-green-600 mt-1" size={20} />
                  <p className="text-gray-700">
                    <strong>Astro Escrow:</strong> All funds from items purchased will remain in escrow until clothing is delivered.
                  </p>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <p className="font-semibold text-sm">Quantity</p>
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="px-4">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleConfirm}
                  className="w-full bg-black text-white py-3 rounded-full text-lg font-semibold hover:bg-gray-900 transition"
                >
                  Pay into Escrow
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Login modal opens after PreOrder */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

export default PreOrderModal;
