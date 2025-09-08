'use client';

import { useState, useEffect } from 'react';
import { Toast } from './ui/Toast';
import { Card, CardContent, CardFooter } from './ui/Card';
import { Link2, Download, Trash2 } from 'lucide-react';
import { useObjectStore } from '@/hooks/useObjectStore';

interface ItemCardProps {
  object: any;
}

export function ItemCard({ object }: ItemCardProps) {
  const [copied, setCopied] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImage, setIsImage] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const { selectedKeys, toggleSelect, deleteOne } = useObjectStore();
  const isSelected = selectedKeys.includes(object.Key);

  useEffect(() => {
    const loadPreview = async () => {
      setIsLoading(true);
      setImageUrl(null);
      setVideoUrl(null);
      setIsImage(false);
      setIsVideo(false);
      
      // Check if it's an image or video by file extension and content type
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
      const videoExtensions = ['.mp4', '.webm', '.mov', '.m4v', '.ogg', '.ogv'];
      const hasImageExtension = imageExtensions.some(ext => 
        object.Key?.toLowerCase().endsWith(ext)
      );
      const hasImageContentType = object.ContentType?.startsWith('image/');
      const hasVideoExtension = videoExtensions.some(ext =>
        object.Key?.toLowerCase().endsWith(ext)
      );
      const hasVideoContentType = object.ContentType?.startsWith('video/');
      
      const isImg = hasImageExtension || hasImageContentType;
      const isVid = hasVideoExtension || hasVideoContentType;

      if (isImg || isVid) {
        setIsImage(isImg);
        setIsVideo(isVid);

        try {
          const response = await fetch('/api/objects/signed-get', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_APP_PASSWORD}`,
            },
            body: JSON.stringify({ key: object.Key }),
          });

          if (response.ok) {
            const data = await response.json();
            if (isImg) setImageUrl(data.url);
            if (isVid) setVideoUrl(data.url);
          }
        } catch (error) {
          console.error('Failed to load preview:', error);
        }
      }
      
      setIsLoading(false);
    };

    if (object.Key) {
      loadPreview();
    }
  }, [object.Key, object.ContentType]);

  // Close focused view with Escape
  useEffect(() => {
    if (!isFocused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFocus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFocused]);

  const copyLink = async () => {
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_PASSWORD}`,
      },
      body: JSON.stringify({ keys: [object.Key] }),
    });
    const data = await res.json();
    const url = Array.isArray(data?.links) ? data.links[0] : undefined;
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    // Fallback: try signed-get if /api/download didn't return a link
    try {
      const alt = await fetch('/api/objects/signed-get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_PASSWORD}`,
        },
        body: JSON.stringify({ key: object.Key }),
      });
      const { url: signed } = await alt.json();
      if (signed) {
        navigator.clipboard.writeText(signed);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  const downloadFile = async () => {
    const filename = object.Key?.split('/').pop() || 'file';
    // Always use same-origin endpoint to avoid CORS and force attachment
    try {
      const sameOrigin = `/api/download/file?key=${encodeURIComponent(object.Key)}`;
      const fileResp = await fetch(sameOrigin, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_PASSWORD}`,
        },
      });
      if (!fileResp.ok) throw new Error('fetch-failed');
      const blob = await fileResp.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Last resort: open signed link flow (may open in tab)
      try {
        const res = await fetch('/api/objects/signed-get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_PASSWORD}`,
          },
          body: JSON.stringify({ key: object.Key }),
        });
        const data = await res.json();
        const fallbackUrl = data?.url as string | undefined;
        if (fallbackUrl) {
          const a = document.createElement('a');
          a.href = fallbackUrl;
          a.download = filename;
          a.target = '_blank';
          a.rel = 'noopener';
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      } catch {}
    }
  };

  const deleteFile = async () => {
    await deleteOne(object.Key);
  };

  const openFocus = () => {
    setIsFocused(true);
    // next tick to trigger transition
    requestAnimationFrame(() => setIsFocusVisible(true));
  };

  const closeFocus = () => {
    setIsFocusVisible(false);
    setTimeout(() => setIsFocused(false), 200);
  };

  const renderPreview = () => {
    if (isLoading) {
      return <div className="text-sm text-gray-400">Loading...</div>;
    }
    
    if (isImage && imageUrl) {
      return (
        <img 
          src={imageUrl} 
          alt={object.Key} 
          className="max-h-full max-w-full object-contain rounded"
          onError={() => setImageUrl(null)}
        />
      );
    }
    
    if (isImage && !imageUrl) {
      return <div className="text-sm text-red-400">Failed to load</div>;
    }
    
    if (isVideo && videoUrl) {
      return (
        <video
          src={videoUrl}
          className="max-h-full max-w-full object-contain rounded"
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          onError={() => setVideoUrl(null)}
        />
      );
    }

    if (isVideo && !videoUrl) {
      return <div className="text-sm text-red-400">Failed to load</div>;
    }
    
    return <div className="text-sm text-gray-400">No preview</div>;
  };

  return (
    <>
    <Card
      className={`flex flex-col cursor-pointer select-none ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => openFocus()}
      onContextMenu={(e) => {
        e.preventDefault();
        toggleSelect(object.Key);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          openFocus();
        } else if (e.key === ' ') {
          e.preventDefault();
          toggleSelect(object.Key);
        }
      }}
    >
      <CardContent className="flex flex-col items-center justify-center relative">
        <div className="w-full h-44 bg-gray-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden border border-black/5">
          {renderPreview()}
        </div>
        <p
          className="text-sm font-medium truncate w-full text-center text-gray-800 select-text"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {object.Key}
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={(e) => { e.stopPropagation(); copyLink(); }} className="p-2 rounded-md hover:bg-gray-200/70 transition-colors" title="Copy Link">
            <Link2 className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); downloadFile(); }} className="p-2 rounded-md hover:bg-gray-200/70 transition-colors" title="Download">
            <Download className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); deleteFile(); }} className="p-2 rounded-md hover:bg-red-100/70 transition-colors" title="Delete">
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </CardFooter>
      <Toast message="Link Copied!" show={copied} />
    </Card>
    {isFocused && (
      <div
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-200 ${isFocusVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeFocus}
      >
        <div
          className={`max-w-5xl w-full max-h-[85vh] bg-white rounded-xl overflow-hidden shadow-xl transform transition-transform duration-200 ${isFocusVisible ? 'scale-100' : 'scale-95'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full h-[70vh] bg-black flex items-center justify-center">
            {isImage && imageUrl && (
              <img src={imageUrl} alt={object.Key} className="w-full h-full object-contain" />
            )}
            {isVideo && videoUrl && (
              <video
                src={videoUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
              />
            )}
            {!imageUrl && !videoUrl && (
              <div className="text-white/80">Loading...</div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
