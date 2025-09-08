"use client";
import { useObjectStore } from '@/hooks/useObjectStore';
import { Button } from './ui/Button';

export function BulkActions() {
  const {
    selectedKeys,
    selectAll,
    clearSelection,
    bulkCopyLinks,
    bulkDownload,
    bulkDelete,
    gridLimit,
    setGridLimit,
  } = useObjectStore();

  const hasSelection = selectedKeys.length > 0;

  return (
    <div className="bg-white/70 backdrop-blur-md border-b border-black/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 items-center h-16">
          <span className="text-sm text-gray-600 mr-2">
            {hasSelection ? `${selectedKeys.length} selected` : 'No items selected'}
          </span>
          <Button variant="outline" onClick={selectAll}>Select All</Button>
          <Button variant="outline" onClick={clearSelection}>Clear</Button>
          <div className="mx-2 h-6 w-px bg-black/10" />
          <Button variant="outline" disabled={!hasSelection} onClick={bulkCopyLinks}>Copy Links</Button>
          <Button variant="outline" disabled={!hasSelection} onClick={bulkDownload}>Download</Button>
          <Button variant="destructive" disabled={!hasSelection} onClick={bulkDelete}>Delete</Button>
          <div className="mx-2 h-6 w-px bg-black/10" />
          <label className="text-sm text-gray-600">Limit</label>
          <select
            className="text-sm border border-black/10 rounded-md px-2 py-1 bg-white"
            value={gridLimit}
            onChange={(e) => setGridLimit(Number(e.target.value))}
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
          </select>
        </div>
      </div>
    </div>
  );
}


