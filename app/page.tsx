import { ScrollToHash } from '@/components/ScrollToHash';
import { Hero } from '@/components/Hero';
import { Services } from '@/components/Services';
import { Products } from '@/components/Products';
import { Contact } from '@/components/Contact';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { MarketingShell } from '@/components/MarketingShell';

export default function HomePage() {
  return (
    <MarketingShell>
      <Navbar />
      <main className="overflow-x-clip max-w-[100vw]">
        <ScrollToHash />
        <Hero />
        <Services />
        <Products />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </MarketingShell>
  );
}

