'use client';

import { useEffect, useState } from 'react';

export const WHATSAPP_PHONE = '5521983573881';

function digitsWithCountry(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('55') ? digits : `55${digits}`;
}

function isMobileDevice() {
  if (typeof navigator === 'undefined') return true;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function getWhatsAppUrl(phone: string = WHATSAPP_PHONE, text = '') {
  const digits = digitsWithCountry(phone);
  if (!digits) return null;

  if (isMobileDevice()) {
    const query = text ? `?text=${encodeURIComponent(text)}` : '';
    return `https://wa.me/${digits}${query}`;
  }

  return `https://web.whatsapp.com/send/?phone=${digits}&text=${encodeURIComponent(text)}&type=phone_number&app_absent=0`;
}

/** wa.me no celular, WhatsApp Web no desktop. Evita mismatch de hidratação. */
export function useWhatsAppUrl(phone: string = WHATSAPP_PHONE, text = '') {
  const [url, setUrl] = useState(() => `https://wa.me/${digitsWithCountry(phone)}`);

  useEffect(() => {
    setUrl(getWhatsAppUrl(phone, text) ?? '');
  }, [phone, text]);

  return url;
}
