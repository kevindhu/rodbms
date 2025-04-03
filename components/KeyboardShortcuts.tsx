'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';

export function KeyboardShortcuts({ onShortcut }: { onShortcut: (action: string) => void }) {
  const [showHelp, setShowHelp] = useState(false);
  const [lastPressed, setLastPressed] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs or textareas
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onShortcut('save');
        showKeyFeedback('Save');
      }

      // Ctrl/Cmd + R to refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        onShortcut('refresh');
        showKeyFeedback('Refresh');
      }

      // ? to show help
      if (e.key === '?') {
        e.preventDefault();
        setShowHelp(true);
      }

      // Escape to close help
      if (e.key === 'Escape') {
        setShowHelp(false);
      }
    };

    const showKeyFeedback = (action: string) => {
      setLastPressed(action);
      setTimeout(() => setLastPressed(null), 1000);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onShortcut]);

  return (
    <>
      {lastPressed && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in-out">
          <div className="text-center">
            <div className="text-2xl font-bold">{lastPressed}</div>
          </div>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 h-8 w-8 p-0 rounded-full shadow-md hover:shadow-lg transition-all"
        onClick={() => setShowHelp(true)}
      >
        <Keyboard className="h-4 w-4" />
        <span className="sr-only">Keyboard Shortcuts</span>
      </Button>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="font-mono bg-muted p-2 rounded text-center">?</div>
              <div className="flex items-center">Show this help dialog</div>

              <div className="font-mono bg-muted p-2 rounded text-center">Ctrl+S</div>
              <div className="flex items-center">Save current entry</div>

              <div className="font-mono bg-muted p-2 rounded text-center">Ctrl+R</div>
              <div className="flex items-center">Refresh current entry</div>

              <div className="font-mono bg-muted p-2 rounded text-center">Esc</div>
              <div className="flex items-center">Close dialogs</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
