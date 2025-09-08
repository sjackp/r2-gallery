'use client';

import { Folder } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/Card';
import { useObjectStore } from '@/hooks/useObjectStore';

interface FolderCardProps {
  prefix: string; // e.g. photos/ or photos/2024/
}

export default function FolderCard({ prefix }: FolderCardProps) {
  const { setCurrentPrefix } = useObjectStore();

  const name = (() => {
    const p = prefix.replace(/\/+$/,'');
    const parts = p.split('/');
    return parts[parts.length - 1] || p;
  })();

  const open = () => {
    const next = prefix;
    // push URL state so mouse back navigates correctly
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('prefix', next.replace(/\/+$/,'').replace(/^\/+/, ''));
      window.history.pushState({ prefix: next }, '', url.toString());
    } catch {}
    setCurrentPrefix(next);
  };

  return (
    <Card className="flex flex-col cursor-pointer select-none" onClick={open} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
    >
      <CardContent className="flex flex-col items-center justify-center">
        <div className="w-full h-44 bg-amber-50 rounded-xl mb-3 flex items-center justify-center border border-black/5">
          <Folder className="w-12 h-12 text-amber-500" />
        </div>
        <p className="text-sm font-medium truncate w-full text-center text-gray-800 select-text">{name}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="ml-auto text-xs text-gray-500">Folder</div>
      </CardFooter>
    </Card>
  );
}
