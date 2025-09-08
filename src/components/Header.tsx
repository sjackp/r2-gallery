"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Upload, FolderPlus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useObjectStore } from '@/hooks/useObjectStore';
import { Button } from './ui/Button';
import BulkLinksModal from './BulkLinksModal';
import { filesFromDirectoryInput } from '@/lib/dnd';

export function Header() {
  const { searchQuery, setSearchQuery, fetchObjects, showLinksModal, currentPrefix, createFolder, addFolderPickerUploads } = useObjectStore();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  // moved to global store (linksModalOpen, modalLinks)
  const inputRef = useRef<HTMLInputElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 180);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Close on click outside or Escape
  useEffect(() => {
    function handleDown(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node | null;
      const inPopover = popoverRef.current?.contains(target as Node) ?? false;
      const inTrigger = triggerRef.current?.contains(target as Node) ?? false;
      if (!inPopover && !inTrigger) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-black/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-gray-800">Media Gallery</h1>
            <div className="text-sm text-gray-500 truncate" title={currentPrefix || '/'}>{currentPrefix || '/'}</div>
          </div>
          <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={async (e) => {
              const filesList = e.target.files;
              if (!filesList || filesList.length === 0) return;
              const files = Array.from(filesList);
              try {
                setUploading(true);
                const formData = new FormData();
                const base = currentPrefix ? currentPrefix : '';
                const keys: string[] = files.map((file) => (base ? `${base}${file.name}` : file.name));
                files.forEach((file, idx) => {
                  formData.append('file', file);
                  formData.append('key', keys[idx]);
                });

                const res = await fetch('/api/uploads/direct', {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_PASSWORD}`,
                  },
                  body: formData,
                });
                if (!res.ok) {
                  let message = 'Failed to upload files';
                  try {
                    const err = await res.json();
                    if (err?.error) message = err.error;
                  } catch {}
                  throw new Error(message);
                }
                await fetchObjects();

                // Fetch signed GET links for the uploaded keys
                const linkRes = await fetch('/api/download', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_PASSWORD}`,
                  },
                  body: JSON.stringify({ keys }),
                });
                if (linkRes.ok) {
                  const data = await linkRes.json();
                  const links = (data?.links || []) as string[];
                  showLinksModal(links);
                }
              } catch (err) {
                console.error(err);
                // No-op UI error for now; keep minimal surface
              } finally {
                setUploading(false);
                // Reset the input so selecting the same files again will retrigger change
                if (fileInputRef.current) fileInputRef.current.value = '';
              }
            }}
          />
          <input
            ref={folderInputRef}
            type="file"
            multiple
            // @ts-ignore - Chromium specific folder selection
            webkitdirectory=""
            className="hidden"
            onChange={async (e) => {
              const list = e.target.files;
              if (!list || list.length === 0) return;
              try {
                const entries = filesFromDirectoryInput(list);
                await addFolderPickerUploads(entries);
              } finally {
                if (folderInputRef.current) folderInputRef.current.value = '';
              }
            }}
          />
          <Button
            variant="secondary"
            onClick={async () => {
              const name = window.prompt('New folder name');
              if (!name) return;
              try { await createFolder(name); } catch (e) { console.error(e); }
            }}
            className="group gap-2 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
            title="Create Folder"
          >
            <FolderPlus className="w-4 h-4" /> New Folder
          </Button>
          <Button
            variant="secondary"
            onClick={() => folderInputRef.current?.click()}
            className="group gap-2 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
            title="Upload Folder"
          >
            <Upload className="w-4 h-4" /> Upload Folder
          </Button>
          <Button
            variant="secondary"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="group gap-2 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            <Upload className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
            <div>
              <button
                aria-label="Open search"
                onClick={() => setOpen((v) => !v)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                ref={triggerRef}
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mt-2 flex justify-end"
              ref={popoverRef}
            >
              <div className="flex items-center gap-2 bg-white shadow-md border border-black/5 rounded-full pl-3 pr-2 py-1">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={(e) => {
                    // Close if focus moved outside of popover
                    const next = e.relatedTarget as Node | null;
                    const inPopover = popoverRef.current?.contains(next as Node) ?? false;
                    const inTrigger = triggerRef.current?.contains(next as Node) ?? false;
                    if (!inPopover && !inTrigger) setOpen(false);
                  }}
                  placeholder="Search..."
                  className="w-56 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Global modal is rendered in Page using store state now */}
    </header>
  );
}
