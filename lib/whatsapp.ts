'use client';

import { useEffect, useState } from 'react';

export const WHATSAPP_PHONE = '5521983573881';

export const LEAD_WHATSAPP_TEXT = `Oi, tudo bem? Eu trabalho com desenvolvimento de software.

Queria saber se vocês estão precisando de algum serviço de desenvolvimento no momento, como sistema, site, automação ou alguma integração.

Vocês já têm algum sistema?`;

function digitsWithCountry(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('55') ? digits : `55${digits}`;
}

/** Celular brasileiro: o número local começa com 9 (DDD + 9XXXX-XXXX). */
export function isCellWhatsApp(phone?: string | null): boolean {
  if (!phone) return false;
  let digits = String(phone).replace(/\D/g, '');
  if (!digits) return false;
  if (digits.startsWith('55') && digits.length >= 12) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length >= 11) digits = digits.slice(1);
  if (digits.length === 11) return digits[2] === '9';
  if (digits.length === 9) return digits[0] === '9';
  return false;
}

export function cellWhatsAppNumber(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (isCellWhatsApp(value)) return String(value);
  }
  return null;
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
