"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Info } from "lucide-react";

interface Photo {
  filename: string;
  path: string;
  date: string;
  dimensions: string;
}

const PHOTOS: Photo[] = [
  {
    filename: "vacation_2024.png",
    path: "/photos/vacation_2024.png",
    date: "January 15, 2024",
    dimensions: "800 × 600",
  },
  {
    filename: "portfolio_screenshot.png",
    path: "/photos/portfolio_screenshot.png",
    date: "February 8, 2024",
    dimensions: "800 × 600",
  },
  {
    filename: "mountain_hike.png",
    path: "/photos/mountain_hike.png",
    date: "March 22, 2024",
    dimensions: "800 × 600",
  },
  {
    filename: "coffee_shop.png",
    path: "/photos/coffee_shop.png",
    date: "April 5, 2024",
    dimensions: "800 × 600",
  },
  {
    filename: "sunset_beach.png",
    path: "/photos/sunset_beach.png",
    date: "May 18, 2024",
    dimensions: "800 × 600",
  },
  {
    filename: "coding_session.png",
    path: "/photos/coding_session.png",
    date: "June 10, 2024",
    dimensions: "800 × 600",
  },
  {
    filename: "art_museum.png",
    path: "/photos/art_museum.png",
    date: "June 25, 2024",
    dimensions: "800 × 600",
  },
  {
    filename: "city_lights.png",
    path: "/photos/city_lights.png",
    date: "July 4, 2024",
    dimensions: "800 × 600",
  },
];

export function PhotosApp() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const selectedPhoto = selectedIndex !== null ? PHOTOS[selectedIndex] : null;

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < PHOTOS.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (selectedIndex === null) return;
    
    if (e.key === "ArrowLeft") {
      handlePrevious();
    } else if (e.key === "ArrowRight") {
      handleNext();
    } else if (e.key === "Escape") {
      setSelectedIndex(null);
      setShowInfo(false);
    }
  };

  return (
    <div className="app-content h-full overflow-hidden" onKeyDown={handleKeyDown} tabIndex={0}>
      <AnimatePresence mode="wait">
        {selectedIndex === null ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto p-4"
          >
            <div className="mb-4">
              <h2 className="text-lg font-semibold">All Photos</h2>
              <p className="text-xs text-foreground/50">{PHOTOS.length} items</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3 pb-4">
              {PHOTOS.map((photo, index) => (
                <motion.button
                  key={photo.filename}
                  onClick={() => setSelectedIndex(index)}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-foreground/5 transition-transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <img
                    src={photo.path}
                    alt={photo.filename}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="truncate text-xs text-white">{photo.filename.replace('.png', '')}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative h-full bg-black/95"
          >
            {/* Top bar */}
            <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-3">
              <button
                onClick={() => {
                  setSelectedIndex(null);
                  setShowInfo(false);
                }}
                className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
              <p className="text-xs text-white/80">
                {selectedIndex + 1} of {PHOTOS.length}
              </p>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`rounded-lg p-1.5 transition-colors ${
                  showInfo
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Info size={18} />
              </button>
            </div>

            {/* Image container */}
            <div className="flex h-full items-center justify-center p-16">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedPhoto?.filename}
                  src={selectedPhoto?.path}
                  alt={selectedPhoto?.filename}
                  className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                />
              </AnimatePresence>
            </div>

            {/* Navigation arrows */}
            <button
              onClick={handlePrevious}
              disabled={selectedIndex === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white disabled:opacity-30 disabled:hover:bg-black/40"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              disabled={selectedIndex === PHOTOS.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 backdrop-blur-sm transition-all hover:bg-black/60 hover:text-white disabled:opacity-30 disabled:hover:bg-black/40"
            >
              <ChevronRight size={24} />
            </button>

            {/* Info panel */}
            <AnimatePresence>
              {showInfo && selectedPhoto && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-4 right-4 w-64 rounded-lg bg-black/80 p-4 backdrop-blur-md"
                >
                  <h3 className="mb-3 text-sm font-semibold text-white">Photo Info</h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="text-white/50">Filename</p>
                      <p className="text-white/90">{selectedPhoto.filename}</p>
                    </div>
                    <div>
                      <p className="text-white/50">Date</p>
                      <p className="text-white/90">{selectedPhoto.date}</p>
                    </div>
                    <div>
                      <p className="text-white/50">Dimensions</p>
                      <p className="text-white/90">{selectedPhoto.dimensions}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
