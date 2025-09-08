'use client';

import { useObjectStore } from '@/hooks/useObjectStore';
import { useEffect, useMemo, useState, useCallback } from 'react';

import { ItemCard } from './ItemCard';
import FolderCard from './FolderCard';
import { Button } from './ui/Button';
import { ArrowLeft } from 'lucide-react';
import { traverseDataTransferItems } from '@/lib/dnd';

export function GalleryGrid() {
  const { objects, prefixes, fetchObjects, searchQuery, currentPrefix, startDnDUpload } = useObjectStore();
  const [dragOver, setDragOver] = useState(false);
  const [dragDepth, setDragDepth] = useState(0);

  useEffect(() => {
    fetchObjects();
  }, [fetchObjects, currentPrefix]);

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragDepth(prev => prev + 1);
    if (e.dataTransfer.types?.includes('Files')) {
      setDragOver(true);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragDepth(prev => {
      const newDepth = prev - 1;
      if (newDepth === 0) {
        setDragOver(false);
      }
      return newDepth;
    });
  }, []);

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    try {
      const items = e.dataTransfer.items;
      const { files, dirs } = await traverseDataTransferItems(items);
      if (files.length === 0) return;
      await startDnDUpload(files as any, dirs);
    } catch (err) {
      console.error('Drop failed', err);
    }
  }, [startDnDUpload]);

  const filtered = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();
    if (!q) return objects;
    return objects.filter((o: any) => (o.Key || '').toLowerCase().includes(q));
  }, [objects, searchQuery]);

  return (
    <>
    {currentPrefix ? (
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => { try { window.history.back(); } catch {} }}
          className="gap-2"
          title="Back"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>
    ) : null}
    <div
      id="grid-dropzone"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="relative"
    >
      {dragOver && (
        <div className="absolute inset-0 z-10 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/70 flex items-center justify-center text-blue-700 font-medium">
          Drop to upload into {currentPrefix || '/'}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {/* Folders first */}
      {prefixes.map((p) => (
        <FolderCard key={p} prefix={p.replace(/^\/+/, '')} />
      ))}
      {/* Files */}
      {filtered.map((object: any) => (
        <ItemCard key={object.Key} object={object} />
      ))}
      </div>
    </div>
    </>
  );
}
