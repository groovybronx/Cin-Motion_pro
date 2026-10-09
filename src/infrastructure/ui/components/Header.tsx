import React from 'react';
import { Film } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-lg font-cinema font-bold tracking-wider text-neutral-100 hover:text-amber-400 transition-colors flex items-center gap-2"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Film className="h-4 w-4" />
            </div>
            <span>CINÉMOTION</span>
          </a>
        </div>

        {/* Studio Subtitle / Label */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono-tech uppercase text-neutral-400 tracking-wider hidden sm:inline">
            Studio & Pédagogie de Cadrage
          </span>
        </div>
      </div>
    </header>
  );
};
