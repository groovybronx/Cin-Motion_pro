import React from 'react';

interface ViewfinderOverlayProps {
  readonly showGrid: boolean;
  readonly hideHud?: boolean;
}

export const ViewfinderOverlay: React.FC<ViewfinderOverlayProps> = ({
  showGrid,
  hideHud = false,
}) => {
  if (hideHud) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center select-none">
      {/* Rule of thirds grid (when enabled) */}
      {showGrid && (
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 border border-white/10 pointer-events-none">
          <div className="border-r border-b border-white/10" />
          <div className="border-r border-b border-white/10" />
          <div className="border-b border-white/10" />
          <div className="border-r border-b border-white/10" />
          <div className="border-r border-b border-white/10" />
          <div className="border-b border-white/10" />
          <div className="border-r border-b border-white/10" />
          <div className="border-r border-b border-white/10" />
          <div />
        </div>
      )}

      {/* Cadre de visée : 4 coins délimités & bordure discrète */}
      <div className="absolute inset-3 border border-white/15 pointer-events-none rounded-sm">
        <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
        <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-amber-400" />
      </div>

      {/* Viseur central épuré */}
      <div className="relative w-7 h-7 pointer-events-none opacity-70">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-amber-400 -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-amber-400 -translate-x-1/2" />
        <div className="absolute inset-1 border border-amber-400/60 rounded-full" />
      </div>
    </div>
  );
};
