'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ImageIcon, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import portfolioImagesFallback from '@/lib/portfolio-images.json';

const PROJECT_KEYS = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7'] as const;
type ProjectKey = (typeof PROJECT_KEYS)[number];
type ProjectCategory = 'products' | 'custom';
const PROJECT_CATEGORIES: ProjectCategory[] = ['products', 'custom'];
const FOLDER_BY_KEY: Record<(typeof PROJECT_KEYS)[number], string> = {
  item1: 'projeto 1',
  item2: 'projeto 2',
  item3: 'projeto 3',
  item4: 'projeto 4',
  item5: 'projeto 5',
  item6: 'projeto 6',
  item7: 'projeto 7',
};

type ProjectItem = {
  category?: ProjectCategory;
  type: string;
  name: string;
  description: string;
  cta: string;
  url?: string;
  image?: string;
  images?: string[];
  imageDisplay?: 'gallery' | 'logo';
};

function resolveProjectImages(
  key: ProjectKey,
  projectData: ProjectItem,
  projectImages: Record<string, string[]>
): string[] {
  const { images: jsonImages, imageDisplay } = projectData;
  const folderName = FOLDER_BY_KEY[key];
  const fetchedImages = projectImages[folderName] || [];
  const preferJsonImages = imageDisplay === 'logo' && (jsonImages?.length ?? 0) > 0;

  return preferJsonImages
    ? (jsonImages ?? [])
    : fetchedImages.length > 0
      ? fetchedImages
      : (jsonImages || []);
}

function ProjectShowcase({
  index,
  type,
  name,
  description,
  cta,
  url,
  hasLink,
  images,
  imageDisplay = 'gallery',
}: {
  index: number;
  type: string;
  name: string;
  description: string;
  cta: string;
  url: string;
  hasLink: boolean;
  images: string[];
  imageDisplay?: 'gallery' | 'logo';
}) {
  const isLogoDisplay = imageDisplay === 'logo';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const hasMultipleImages = images.length > 1;
  const isEven = index % 2 === 0;

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-10 items-center`}
    >
      {/* Image Section */}
      <div className="w-full lg:w-1/2 relative group">
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700" />
        <motion.div
          className={`relative aspect-video w-full rounded-sm border border-slate-700/50 overflow-hidden shadow-xl backdrop-blur-sm ${
            isLogoDisplay ? 'bg-slate-950 flex items-center justify-center p-12 md:p-16' : 'bg-slate-800/80'
          }`}
        >
          {images.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={encodeURI(images[currentImageIndex])}
                  alt={name}
                  className={
                    isLogoDisplay
                      ? 'max-h-full max-w-full w-auto h-auto object-contain'
                      : 'w-full h-full object-cover'
                  }
                  initial={{ opacity: 0, scale: isLogoDisplay ? 0.95 : 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              </AnimatePresence>
              {hasMultipleImages && !isLogoDisplay && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentImageIndex(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-secondary w-6' : 'bg-white/40 w-1.5 hover:bg-white/70'}`}
                        aria-label={`Ver imagem ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <ImageIcon className="w-16 h-16 opacity-50" />
            </div>
          )}
        </motion.div>
      </div>

      {/* Content Section */}
      <motion.div
        className="w-full lg:w-1/2 flex flex-col justify-center"
      >
        <motion.div
          initial={{ opacity: 0, x: isEven ? 20 : -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${
            type.includes('CODRATEC') 
              ? 'bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]' 
              : 'text-primary'
          }`}>
            {type}
          </p>
          <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-100 mb-4 leading-tight">
            {name}
          </h3>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
            {description}
          </p>
          
          <div>
            {hasLink ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-primary/10 text-primary hover:bg-primary hover:text-slate-900 font-semibold transition-all duration-300 group"
              >
                {cta}
                <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
            ) : (
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-slate-800 text-slate-200 border border-slate-700 hover:bg-secondary hover:text-slate-900 hover:border-secondary font-semibold transition-all duration-300 group"
              >
                {cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

export function Portfolio() {
  const { t, get } = useLocale();
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('products');
  const [projectImages, setProjectImages] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch('/api/portfolio-images');
        if (response.ok) {
          const data = await response.json();
          setProjectImages(data);
        } else {
          setProjectImages(portfolioImagesFallback);
        }
      } catch (error) {
        console.error('Failed to fetch portfolio images:', error);
        setProjectImages(portfolioImagesFallback);
      }
    }
    fetchImages();
  }, []);

  const visibleKeys = PROJECT_KEYS.filter((key) => {
    const projectData = get(`projects.${key}`) as ProjectItem | undefined;
    return projectData?.category === activeCategory;
  });

  return (
    <section id="projects" className="py-16 bg-slate-900 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-40 left-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full -translate-x-1/2" />
      <div className="absolute bottom-40 right-0 w-1/4 h-1/4 bg-secondary/5 blur-[100px] rounded-full translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-slate-100">
            {t('projects.title')}
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            {t('projects.subtitle')}
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mb-14"
          role="tablist"
          aria-label={t('projects.title')}
        >
          {PROJECT_CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-3 text-sm md:text-base font-semibold rounded-sm border transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-slate-900 border-primary'
                    : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-slate-100'
                }`}
              >
                {t(`projects.tabs.${category}`)}
              </button>
            );
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            role="tabpanel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-16 md:space-y-20"
          >
            {visibleKeys.map((key, index) => {
              const projectData = get(`projects.${key}`) as ProjectItem | undefined;
              if (!projectData) return null;

              const { type, name, description, cta, url, imageDisplay } = projectData;
              const images = resolveProjectImages(key, projectData, projectImages);
              const hasLink = Boolean(url && String(url).trim() !== '');

              return (
                <ProjectShowcase
                  key={key}
                  index={index}
                  type={type}
                  name={name}
                  description={description}
                  cta={cta}
                  url={url || ''}
                  hasLink={hasLink}
                  images={images}
                  imageDisplay={imageDisplay}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
