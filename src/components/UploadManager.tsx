"use client";

import { useObjectStore } from '@/hooks/useObjectStore';
import { Button } from './ui/Button';

export default function UploadManager() {
  const { uploadOpen, uploadTasks, cancelAllUploads, retryFailed, hideUploadPanel } = useObjectStore();
  if (!uploadOpen) return null;
  const total = uploadTasks.length;
  const done = uploadTasks.filter((t) => t.status === 'done').length;
  const failed = uploadTasks.filter((t) => t.status === 'error').length;
  const uploading = uploadTasks.filter((t) => t.status === 'uploading').length;
  // Overall progress: done/error/canceled count as complete; uploading uses live progress
  const overall = total
    ? uploadTasks.reduce((acc, t) => {
        if (t.status === 'done' || t.status === 'error' || t.status === 'canceled') return acc + 1;
        if (t.status === 'uploading') return acc + Math.max(0, Math.min(1, t.progress || 0));
        return acc; // queued -> 0
      }, 0) / total
    : 0;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(92vw,420px)] rounded-xl bg-white/90 backdrop-blur border border-black/10 shadow-xl">
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-800">Uploads</div>
          <div className="text-xs text-gray-500">{done}/{total} done • {uploading} running • {failed} failed</div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={cancelAllUploads}>Cancel</Button>
          <Button size="sm" variant="secondary" onClick={retryFailed}>Retry</Button>
          <Button size="sm" variant="ghost" onClick={hideUploadPanel}>Hide</Button>
        </div>
      </div>
      <div className="px-4 pb-3">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-[width] duration-300 ease-out"
            style={{ width: `${Math.max(0, Math.min(100, overall * 100))}%` }}
          />
        </div>
      </div>
      <div className="max-h-64 overflow-auto px-2 pb-2">
        {uploadTasks.slice(-8).map((t) => (
          <div key={t.key} className="flex items-center gap-2 px-2 py-1 text-sm">
            <div className="flex-1 truncate text-gray-700" title={t.name}>{t.name}</div>
            <div className="w-20 text-right text-xs text-gray-500">
              {t.status === 'uploading' ? `${Math.round(t.progress * 100)}%` : t.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

