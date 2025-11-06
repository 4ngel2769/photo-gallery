'use client';

import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DragDropZoneProps {
  onFilesDropped: (files: FileList) => void;
}

export function DragDropZone({ onFilesDropped }: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Only count if dragging files
      if (e.dataTransfer?.types.includes('Files')) {
        setDragCounter(prev => prev + 1);
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setDragCounter(prev => {
        const newCount = prev - 1;
        if (newCount === 0) {
          setIsDragging(false);
        }
        return newCount;
      });
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsDragging(false);
      setDragCounter(0);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        // Filter for image files only
        const imageFiles = Array.from(files).filter(file => 
          file.type.startsWith('image/')
        );
        
        if (imageFiles.length > 0) {
          const dt = new DataTransfer();
          imageFiles.forEach(file => dt.items.add(file));
          onFilesDropped(dt.files);
        }
      }
    };

    // Add event listeners to the entire document
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [onFilesDropped]);

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          style={{ pointerEvents: 'none' }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center gap-6 text-white"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="rounded-full bg-white/10 p-12 backdrop-blur-md border-2 border-white/20"
            >
              <Upload className="w-24 h-24" strokeWidth={1.5} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold mb-2">Drop Photos Here</h2>
              <p className="text-lg text-white/70">Release to upload to your gallery</p>
            </motion.div>

            {/* Animated border */}
            <motion.div
              className="absolute inset-8 border-4 border-dashed border-white/30 rounded-2xl"
              animate={{
                scale: [1, 1.02, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
