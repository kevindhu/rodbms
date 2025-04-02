'use client';

import { useState } from 'react';
import { useDatastore } from '@/contexts/DatastoreContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatastoreListPanel } from '@/components/explorer/DatastoreListPanel';
import { EntryListPanel } from '@/components/explorer/EntryListPanel';
import { EntryDetailPanel } from '@/components/explorer/EntryDetailPanel';

export function DatastoreExplorer() {
  const { datastores, fetchDatastores, selectedDatastore, setSelectedDatastore, clearCredentials } =
    useDatastore();

  const [newDatastoreName, setNewDatastoreName] = useState('');
  const [isCreatingDatastore, setIsCreatingDatastore] = useState(false);

  const handleDatastoreSelect = (name: string) => {
    setSelectedDatastore(name);
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Column 1: Datastore List */}
      <div className="col-span-4">
        <DatastoreListPanel
          datastores={datastores}
          selectedDatastore={selectedDatastore}
          onDatastoreSelect={handleDatastoreSelect}
          newDatastoreName={newDatastoreName}
          setNewDatastoreName={setNewDatastoreName}
          isCreatingDatastore={isCreatingDatastore}
          setIsCreatingDatastore={setIsCreatingDatastore}
          fetchDatastores={fetchDatastores}
          clearCredentials={clearCredentials}
        />
      </div>

      {/* Columns 2 & 3: Entry List and Entry Details */}
      <div className="col-span-8">
        <Tabs defaultValue="entries" className="h-full flex flex-col">
          <TabsContent value="entries" className="flex-1">
            <div className="grid grid-cols-12 gap-6 h-full">
              {/* Column 2: Entry List */}
              <div className="col-span-5" id="entry-list">
                <EntryListPanel />
              </div>

              {/* Column 3: Entry Details */}
              <div className="col-span-7" id="entry-editor">
                <EntryDetailPanel />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
