import type { Metadata } from 'next';
import { About } from '@/components/About';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';

export const metadata: Metadata = {
  title: 'Sobre nós',
  description:
    'Conheça a CODRATEC: software house focada em sistemas sob medida, automações e produtos digitais para operações críticas.',
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <About />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
