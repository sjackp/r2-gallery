"use client";

import { GalleryGrid } from '@/components/GalleryGrid';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { BulkActions } from '@/components/BulkActions';
import BulkLinksModal from '@/components/BulkLinksModal';
import { useObjectStore } from '@/hooks/useObjectStore';
import { useEffect } from 'react';
import UploadManager from '@/components/UploadManager';

export default function Home() {
  const { linksModalOpen, modalLinks, hideLinksModal, setCurrentPrefix } = useObjectStore();

  useEffect(() => {
    const applyFromUrl = () => {
      try {
        const url = new URL(window.location.href);
        let p = url.searchParams.get('prefix') || '';
        p = p.replace(/^\/+|\/+$/g, '');
        setCurrentPrefix(p ? p + '/' : '');
      } catch {}
    };
    applyFromUrl();
    const onPop = () => applyFromUrl();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [setCurrentPrefix]);
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <BulkActions />
        <section className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <GalleryGrid />
          </div>
        </section>
        <UploadManager />
      </main>
      <BulkLinksModal open={linksModalOpen} onClose={hideLinksModal} links={modalLinks} />
    </div>
  );
}
