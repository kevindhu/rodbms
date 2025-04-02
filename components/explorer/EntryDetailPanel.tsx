'use client';

import { useDatastore } from '@/contexts/DatastoreContext';
import EntryDetailEditor from '@/components/EntryDetailEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key } from 'lucide-react';

export function EntryDetailPanel() {
  const { selectedEntryKey } = useDatastore();

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Entry Details</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedEntryKey ? (
          <EntryDetailEditor />
        ) : (
          <div className="flex flex-col items-center justify-center h-80 text-muted-foreground">
            <Key className="h-16 w-16 mb-4 opacity-20" />
            <p>Select an entry to view and edit its data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
