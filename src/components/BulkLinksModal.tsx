'use client';

import * as React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface BulkLinksModalProps {
  open: boolean;
  onClose: () => void;
  links: string[];
}

export function BulkLinksModal({ open, onClose, links }: BulkLinksModalProps) {
  const [copied, setCopied] = React.useState(false);

  const allLinks = React.useMemo(() => links.join('\n'), [links]);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(allLinks);
      setCopied(true);
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    } catch (e) {
      // ignore
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Uploaded links">
      {links.length === 0 ? (
        <div className="text-sm text-gray-500">No links</div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-600">{links.length} item(s)</div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={copyAll}>{copied ? 'Copied' : 'Copy all'}</Button>
              <Button size="sm" variant="secondary" onClick={onClose}>Close</Button>
            </div>
          </div>
          <div className="rounded-xl border border-black/10 bg-white/60">
            <div className="p-3 text-sm text-gray-800 space-y-2">
              {links.map((url, idx) => (
                <div key={idx} className="truncate">
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default BulkLinksModal;
