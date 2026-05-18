'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WHATSAPP_URL = 'https://wa.me/5521983573881';

export function WhatsAppButton() {
  const [isGlitching, setIsGlitching] = useState(false);

  const handleMouseEnter = () => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 300);
  };

  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="WhatsApp"
      animate={
        isGlitching
          ? {
              x: [0, 2, -2, 3, -3, 1, -1, 0],
              y: [0, 2, -2, 3, -3, 1, -1, 0],
              rotate: [0, 5, -5, 3, -3, 0],
            }
          : {}
      }
      transition={{ duration: 0.15, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
      onMouseEnter={handleMouseEnter}
    >
      <MessageCircle className="w-7 h-7" />
    </motion.a>
  );
}
