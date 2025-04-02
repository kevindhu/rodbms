'use client';

import { useDatastore } from '@/contexts/DatastoreContext';
import EntryDetailEditor from '@/components/EntryDetailEditor';
import { Key } from 'lucide-react';

export function EntryDetailPanel() {
  const { selectedEntryKey } = useDatastore();

  return (
    <div className="h-full">
      {selectedEntryKey ? (
        <EntryDetailEditor />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground border rounded-md p-4">
          <Key className="h-16 w-16 mb-4 opacity-20" />
          <p>Select an entry to view and edit its data</p>
        </div>
      )}
    </div>
  );
}
