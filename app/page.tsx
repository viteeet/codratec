import { ScrollToHash } from '@/components/ScrollToHash';
import { Hero } from '@/components/Hero';
import { Services } from '@/components/Services';
import { Stats } from '@/components/Stats';
import { Portfolio } from '@/components/Portfolio';
import { Contact } from '@/components/Contact';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { PortfolioPreview } from '@/src/components/home/PortfolioPreview';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <ScrollToHash />
        <Hero />
        <Services />
        <PortfolioPreview />
        <Stats />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

