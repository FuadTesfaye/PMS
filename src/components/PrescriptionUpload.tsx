'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PrescriptionUploadProps {
  onUpload: (base64: string | null) => void;
  required?: boolean;
}

export default function PrescriptionUpload({ onUpload, required = false }: PrescriptionUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (PNG, JPG, etc.)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onUpload(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearUpload = () => {
    setPreview(null);
    onUpload(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-600" />
          Medical Prescription
          {required && <span className="text-rose-500">*</span>}
        </label>
        {preview && (
          <button 
            onClick={clearUpload}
            className="text-xs font-medium text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
          >
            <X className="h-3 w-3" />
            Remove
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer",
              isHovering 
                ? "border-emerald-500 bg-emerald-50/50" 
                : "border-slate-200 bg-slate-50 hover:border-slate-300"
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="rounded-full bg-white p-3 shadow-sm ring-1 ring-slate-200">
              <Upload className={cn("h-6 w-6 transition-colors", isHovering ? "text-emerald-600" : "text-slate-400")} />
            </div>
            <p className="mt-4 text-sm font-bold text-slate-900">Click to upload prescription</p>
            <p className="mt-1 text-xs text-slate-500">PNG, JPG or WebP (max 5MB)</p>
          </motion.div>
        ) : (
          <motion.div
            key="preview-zone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
              <img 
                src={preview} 
                alt="Prescription preview" 
                className="h-full w-full object-contain"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-xl ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Change Image
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3">
              <div className="rounded-full bg-emerald-100 p-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Prescription Attached</p>
                <p className="text-[10px] text-slate-500">Ready for pharmacist review</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
