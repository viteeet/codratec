'use client';

import React, { useState } from 'react';
import { motion, MotionProps } from 'framer-motion';

interface SpotlightCardProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className = '',
  onClick,
  spotlightColor = 'rgba(37, 99, 235, 0.08)',
  ...motionProps
}: SpotlightCardProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-slate-200/90 bg-white/80 backdrop-blur-md shadow-xs hover:shadow-md transition-all duration-300 group ${className}`}
      {...motionProps}
    >
      {/* 1. Mouse Spotlight Radial Glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />

      {/* 4. Glassmorphism Shimmer Sweep Effect */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/50 to-transparent z-0" />

      {/* Card Content */}
      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </motion.div>
  );
}
