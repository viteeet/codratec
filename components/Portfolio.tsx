'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Maximize2,
  X,
  Layers,
} from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import portfolioImagesFallback from '@/lib/portfolio-images.json';

const PROJECT_KEYS = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7'] as const;
type ProjectKey = (typeof PROJECT_KEYS)[number];
type ProjectCategory = 'products' | 'custom';
type CategoryFilter = 'all' | ProjectCategory;

const FOLDER_BY_KEY: Record<ProjectKey, string> = {
  item1: 'projeto 1',
  item2: 'projeto 2',
  item3: 'projeto 3',
  item4: 'projeto 4',
  item5: 'projeto 5',
  item6: 'projeto 6',
  item7: 'projeto 7',
};

type ProjectItem = {
  num?: string;
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

type ResolvedProject = {
  key: ProjectKey;
  data: ProjectItem;
  images: string[];
  hasLink: boolean;
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

export function Portfolio() {
  const { t, get } = useLocale();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [projectImages, setProjectImages] = useState<Record<string, string[]>>({});
  const [selectedProject, setSelectedProject] = useState<ResolvedProject | null>(null);
  const [activeModalImageIndex, setActiveModalImageIndex] = useState(0);

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

  // Fechar modal com ESC e navegação por setas do teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedProject) return;

      if (e.key === 'Escape') {
        setSelectedProject(null);
      } else if (e.key === 'ArrowLeft' && selectedProject.images.length > 1) {
        setActiveModalImageIndex((prev) =>
          prev === 0 ? selectedProject.images.length - 1 : prev - 1
        );
      } else if (e.key === 'ArrowRight' && selectedProject.images.length > 1) {
        setActiveModalImageIndex((prev) =>
          prev === selectedProject.images.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedProject]);

  const openProjectModal = (proj: ResolvedProject) => {
    setSelectedProject(proj);
    setActiveModalImageIndex(0);
  };

  const allProjects: ResolvedProject[] = PROJECT_KEYS.map((key) => {
    const data = get(`projects.${key}`) as ProjectItem | undefined;
    const defaultData: ProjectItem = {
      type: '',
      name: '',
      description: '',
      cta: 'Ver projeto',
    };
    const projectData = data || defaultData;
    const images = resolveProjectImages(key, projectData, projectImages);
    const hasLink = Boolean(projectData.url && String(projectData.url).trim() !== '');

    return {
      key,
      data: projectData,
      images,
      hasLink,
    };
  }).filter((p) => p.data.name !== '');

  const filteredProjects = allProjects.filter((proj) => {
    if (activeCategory === 'all') return true;
    return proj.data.category === activeCategory;
  });

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: t('projects.tabs.all') || 'Todos os projetos' },
    { id: 'products', label: t('projects.tabs.products') || 'Produtos da casa' },
    { id: 'custom', label: t('projects.tabs.custom') || 'Desenvolvimento sob demanda' },
  ];

  return (
    <section id="projects" className="py-12 md:py-16 bg-slate-50 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-40 left-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-40 right-0 w-1/4 h-1/4 bg-secondary/5 blur-[100px] rounded-full translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-1.5 text-slate-900 tracking-tight">
            {t('projects.title')}
          </h2>
          <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto font-medium">
            {t('projects.subtitle')}
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mb-6"
          role="tablist"
          aria-label={t('projects.title')}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 text-sm md:text-base font-bold rounded-lg border transition-all duration-200 shadow-sm ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-md scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* Compact Grid Gallery */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            role="tabpanel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
          >
            {filteredProjects.map((proj, idx) => {
              const { data, images, hasLink } = proj;
              const isLogoDisplay = data.imageDisplay === 'logo';
              const coverImage = images[0];

              return (
                <motion.article
                  key={proj.key}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group relative"
                >
                  {/* Thumbnail / Image Container */}
                  <div
                    onClick={() => openProjectModal(proj)}
                    className="relative aspect-video w-full bg-slate-100 overflow-hidden cursor-pointer border-b border-slate-200/80"
                  >
                    {coverImage ? (
                      <img
                        src={encodeURI(coverImage)}
                        alt={data.name}
                        className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                          isLogoDisplay ? 'object-contain p-5 bg-white' : 'object-cover'
                        }`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                        <ImageIcon className="w-8 h-8 opacity-40" />
                      </div>
                    )}

                    {/* Quick View Overlay on Hover */}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 text-slate-900 font-bold text-[11px] rounded-full shadow-md">
                        <Maximize2 className="w-3 h-3 text-primary" />
                        Detalhes
                      </span>
                    </div>

                    {/* Category & Badge Overlay */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 z-10 pointer-events-none">
                      {data.category === 'products' ? (
                        <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider rounded">
                          Produto
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-primary text-white font-bold text-[10px] uppercase tracking-wider rounded">
                          Sob Medida
                        </span>
                      )}
                    </div>

                    {/* Image Counter Badge */}
                    {images.length > 1 && (
                      <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 text-white font-bold text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-300" />
                        {images.length}
                      </div>
                    )}
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Project Type Badge */}
                    <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1 line-clamp-1">
                      {data.type}
                    </p>

                    {/* Title */}
                    <h3
                      onClick={() => openProjectModal(proj)}
                      className="text-base font-bold text-slate-900 mb-2 leading-snug hover:text-primary transition-colors cursor-pointer line-clamp-2"
                    >
                      {data.name}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-4 flex-1 font-normal">
                      {data.description}
                    </p>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                      <button
                        type="button"
                        onClick={() => openProjectModal(proj)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-primary transition-colors py-1"
                      >
                        <Maximize2 className="w-3 h-3 text-slate-500 group-hover:text-primary transition-colors" />
                        Fotos
                      </button>

                      {hasLink ? (
                        <a
                          href={data.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-white font-bold text-[11px] hover:bg-primary/90 transition-all shadow-xs group/btn"
                        >
                          {data.cta || 'Acessar'}
                          <ExternalLink className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openProjectModal(proj)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px] hover:bg-slate-200 transition-all border border-slate-200"
                        >
                          {data.cta || 'Info'}
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Lightbox / Full Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => setSelectedProject(null)}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 p-5 md:p-6 flex items-center justify-between z-20">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">
                      {selectedProject.data.type}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-bold text-slate-600">
                      {selectedProject.data.category === 'products'
                        ? 'Produto CODRATEC'
                        : 'Projeto Sob Medida'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                    {selectedProject.data.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
                  aria-label="Fechar"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 space-y-8">
                {/* Photo Viewer Carousel */}
                {selectedProject.images.length > 0 && (
                  <div className="relative aspect-video w-full bg-slate-950 rounded-xl overflow-hidden shadow-inner flex items-center justify-center group">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeModalImageIndex}
                        src={encodeURI(selectedProject.images[activeModalImageIndex])}
                        alt={selectedProject.data.name}
                        className={`w-full h-full ${
                          selectedProject.data.imageDisplay === 'logo'
                            ? 'object-contain p-12 bg-white'
                            : 'object-contain bg-slate-950'
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </AnimatePresence>

                    {/* Next / Prev Controls */}
                    {selectedProject.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveModalImageIndex((i) =>
                              i === 0 ? selectedProject.images.length - 1 : i - 1
                            )
                          }
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md border border-white/10 transition-all shadow-md"
                          aria-label="Foto anterior"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveModalImageIndex((i) =>
                              i === selectedProject.images.length - 1 ? 0 : i + 1
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md border border-white/10 transition-all shadow-md"
                          aria-label="Próxima foto"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Pagination Bar */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                          <span className="text-xs font-bold text-white mr-1">
                            {activeModalImageIndex + 1} / {selectedProject.images.length}
                          </span>
                          {selectedProject.images.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveModalImageIndex(idx)}
                              className={`h-2 rounded-full transition-all ${
                                idx === activeModalImageIndex
                                  ? 'w-6 bg-primary'
                                  : 'w-2 bg-white/40 hover:bg-white/70'
                              }`}
                              aria-label={`Ir para foto ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Project Details Description */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-3">Sobre o Projeto</h4>
                  <p className="text-slate-700 leading-relaxed font-medium text-base">
                    {selectedProject.data.description}
                  </p>
                </div>

                {/* Modal Footer CTA */}
                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-slate-600 text-sm font-medium">
                    {selectedProject.data.category === 'products'
                      ? 'Produto pronto para implantação rápida na sua empresa.'
                      : 'Sistema desenvolvido sob medida conforme requisitos operacionais.'}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {selectedProject.hasLink ? (
                      <a
                        href={selectedProject.data.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-md w-full sm:w-auto"
                      >
                        {selectedProject.data.cta || 'Acessar Sistema'}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <a
                        href="#contact"
                        onClick={() => setSelectedProject(null)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-md w-full sm:w-auto"
                      >
                        Solicitar Solução Similar
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

