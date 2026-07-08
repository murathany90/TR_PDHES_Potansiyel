import { useEffect, useRef } from 'react';
import { useMapToolsStore } from '../stores/useMapToolsStore';
import { Ruler, Mountain, X } from 'lucide-react';
export default function MapContextMenu() {
  const { map, contextMenu, closeContextMenu, setElevationResult, setMode } = useMapToolsStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu if clicked outside
  useEffect(() => {
    if (!contextMenu.isOpen) return;
    
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };
    
    // Slight delay to prevent immediate close on the same click that opened it
    setTimeout(() => document.addEventListener('click', handleClick), 10);
    return () => document.removeEventListener('click', handleClick);
  }, [contextMenu.isOpen, closeContextMenu]);

  if (!contextMenu.isOpen || !contextMenu.lngLat) return null;

  const handleQueryElevation = () => {
    if (map && contextMenu.lngLat) {
      const ele = map.queryTerrainElevation(contextMenu.lngLat);
      setElevationResult(ele !== null ? Math.round(ele) : null);
    }
  };

  const handleMeasure = () => {
    setMode('measure');
    closeContextMenu();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        left: contextMenu.x,
        top: contextMenu.y,
        zIndex: 50,
      }}
      className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg shadow-xl shadow-black/50 overflow-hidden text-sm min-w-[180px] animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
        <span className="text-xs text-white/50 font-mono">
          {contextMenu.lngLat.lat.toFixed(4)}, {contextMenu.lngLat.lng.toFixed(4)}
        </span>
        <button onClick={closeContextMenu} className="text-white/50 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>
      
      <div className="p-1">
        <button
          onClick={handleQueryElevation}
          className="w-full flex items-center gap-2 px-3 py-2 text-left text-white/90 hover:bg-white/10 rounded transition-colors"
        >
          <Mountain size={16} className="text-blue-400" />
          <span>Buranın Rakımı Ne?</span>
        </button>
        
        <button
          onClick={handleMeasure}
          className="w-full flex items-center gap-2 px-3 py-2 text-left text-white/90 hover:bg-white/10 rounded transition-colors"
        >
          <Ruler size={16} className="text-emerald-400" />
          <span>Mesafe Ölç (Cetvel)</span>
        </button>
      </div>

      {contextMenu.elevationResult !== null && contextMenu.elevationResult !== undefined && (
        <div className="px-3 py-2 bg-emerald-500/20 border-t border-emerald-500/30 text-emerald-100 flex items-center gap-2">
          <span className="font-semibold text-emerald-400">{contextMenu.elevationResult} m</span>
          <span className="text-xs opacity-70">deniz seviyesinden</span>
        </div>
      )}
      {contextMenu.elevationResult === null && (
        <div className="px-3 py-2 bg-red-500/20 border-t border-red-500/30 text-red-200 text-xs">
          Rakım verisi alınamadı (Arazi yüklü değil).
        </div>
      )}
    </div>
  );
}
