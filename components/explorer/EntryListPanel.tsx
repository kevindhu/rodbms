'use client';

import { useDatastore } from '@/contexts/DatastoreContext';
import EntryList from '@/components/EntryList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function EntryListPanel() {
  const { selectedDatastore } = useDatastore();

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Entries</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedDatastore ? (
          <EntryList />
        ) : (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            Please select a datastore first
          </div>
        )}
      </CardContent>
    </Card>
  );
}
