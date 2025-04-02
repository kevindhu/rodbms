'use client';

import { useDatastore } from '@/contexts/DatastoreContext';
import EntryList from '@/components/EntryList';

export function EntryListPanel() {
  const { selectedDatastore } = useDatastore();

  return (
    <div className="h-full">
      {selectedDatastore ? (
        <EntryList />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground border rounded-md p-4">
          Please select a datastore first
        </div>
      )}
    </div>
  );
}
