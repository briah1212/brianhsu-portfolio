"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Folder, 
  FileImage, 
  FileText, 
  FileCode, 
  FileArchive,
  Trash2,
  ChevronRight,
  X
} from "lucide-react";

interface TrashItem {
  name: string;
  type: "folder" | "image" | "text" | "code" | "archive";
  size: string;
  date: string;
  path: string | null;
  children?: TrashItem[];
}

const getIcon = (type: string) => {
  switch (type) {
    case "folder":
      return <Folder size={16} className="text-blue-400" />;
    case "image":
      return <FileImage size={16} className="text-purple-400" />;
    case "code":
      return <FileCode size={16} className="text-green-400" />;
    case "archive":
      return <FileArchive size={16} className="text-orange-400" />;
    default:
      return <FileText size={16} className="text-gray-400" />;
  }
};

export function TrashApp() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<TrashItem | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<TrashItem | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);

  useEffect(() => {
    // Load trash items from manifest
    fetch("/trash/manifest.json")
      .then((res) => res.json())
      .then((data) => setItems(data.items))
      .catch((err) => console.error("Failed to load trash items:", err));
  }, []);

  const handleItemClick = (item: TrashItem) => {
    setSelectedItem(item);
    if (item.type === "image" && item.path) {
      setPreviewImage(item.path);
    } else if (item.type === "folder") {
      // Don't auto-open folder on single click
      setPreviewImage(null);
    } else {
      setPreviewImage(null);
    }
  };

  const handleItemDoubleClick = (item: TrashItem) => {
    if (item.type === "folder") {
      setCurrentFolder(item);
      setSelectedItem(null);
      setPreviewImage(null);
    }
  };

  const handleBackClick = () => {
    setCurrentFolder(null);
    setSelectedItem(null);
    setPreviewImage(null);
  };

  const handleEmptyTrash = () => {
    setShowEmptyConfirm(true);
  };

  const confirmEmpty = () => {
    // Simulate emptying trash with animation
    setShowEmptyConfirm(false);
    // In a real app, this would delete items
    alert("Just kidding! These easter eggs are staying forever. 😏");
  };

  const currentItems = currentFolder?.children || items;

  return (
    <div className="app-content h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-2.5 bg-background/95">
        <div className="flex items-center gap-2">
          {currentFolder && (
            <button
              onClick={handleBackClick}
              className="flex items-center gap-1 text-xs text-foreground/60 hover:text-foreground/90 transition-colors"
            >
              <ChevronRight size={14} className="rotate-180" />
              Back
            </button>
          )}
          <span className="text-sm font-medium text-foreground/70">
            {currentFolder ? currentFolder.name : "Trash"}
          </span>
          <span className="text-xs text-foreground/40">
            {currentItems.length} {currentItems.length === 1 ? "item" : "items"}
          </span>
        </div>
        <button
          onClick={handleEmptyTrash}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
        >
          <Trash2 size={14} />
          Empty Trash
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* File list */}
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-foreground/5">
            {currentItems.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                  selectedItem?.name === item.name
                    ? "bg-blue-500/20"
                    : "hover:bg-foreground/5"
                }`}
                onClick={() => handleItemClick(item)}
                onDoubleClick={() => handleItemDoubleClick(item)}
              >
                <div className="shrink-0">{getIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground/80 truncate">
                    {item.name}
                  </p>
                </div>
                <div className="shrink-0 text-xs text-foreground/40 tabular-nums">
                  {item.size}
                </div>
                <div className="shrink-0 text-xs text-foreground/40 w-28">
                  {item.date}
                </div>
                {item.type === "folder" && (
                  <ChevronRight size={14} className="text-foreground/30" />
                )}
              </motion.div>
            ))}
          </div>

          {currentItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-foreground/30">
              <Trash2 size={48} className="mb-3" />
              <p className="text-sm">Trash is empty</p>
            </div>
          )}
        </div>

        {/* Preview pane */}
        <AnimatePresence>
          {previewImage && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-64 border-l border-foreground/10 p-4 bg-background/50 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-foreground/60">
                  Preview
                </span>
                <button
                  onClick={() => {
                    setPreviewImage(null);
                    setSelectedItem(null);
                  }}
                  className="text-foreground/40 hover:text-foreground/70 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center bg-black/20 rounded-lg overflow-hidden">
                <img
                  src={previewImage}
                  alt={selectedItem?.name || "Preview"}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-xs font-medium text-foreground/70 truncate">
                  {selectedItem?.name}
                </p>
                <p className="text-xs text-foreground/40">{selectedItem?.size}</p>
                <p className="text-xs text-foreground/40">{selectedItem?.date}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty trash confirmation modal */}
      <AnimatePresence>
        {showEmptyConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowEmptyConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background border border-foreground/20 rounded-lg p-6 max-w-sm mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                <Trash2 size={20} className="text-red-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground/90 mb-1">
                    Empty Trash?
                  </h3>
                  <p className="text-xs text-foreground/60 leading-relaxed">
                    Are you sure you want to permanently delete all {items.length} items? 
                    This includes cursed selfies, embarrassing code, and whatever else 
                    you&apos;ve been hiding in here...
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowEmptyConfirm(false)}
                  className="px-4 py-2 text-xs font-medium text-foreground/60 hover:text-foreground/90 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEmpty}
                  className="px-4 py-2 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                >
                  Empty Trash
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
