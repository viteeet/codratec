import { ScrollToHash } from '@/components/ScrollToHash';
import { Hero } from '@/components/Hero';
import { Services } from '@/components/Services';
import { Stats } from '@/components/Stats';
import { Portfolio } from '@/components/Portfolio';
import { Contact } from '@/components/Contact';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <ScrollToHash />
        <Hero />
        <Services />
        <Stats />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

