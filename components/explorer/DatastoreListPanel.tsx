'use client';

import { useDatastore } from '@/contexts/DatastoreContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, LogOut, Plus } from 'lucide-react';

interface DatastoreListPanelProps {
  datastores: { name: string; createdTime: string }[];
  selectedDatastore: string;
  onDatastoreSelect: (name: string) => void;
  newDatastoreName: string;
  setNewDatastoreName: (name: string) => void;
  isCreatingDatastore: boolean;
  setIsCreatingDatastore: (isCreating: boolean) => void;
  fetchDatastores: () => Promise<void>;
  clearCredentials: () => void;
}

export function DatastoreListPanel({
  datastores,
  selectedDatastore,
  onDatastoreSelect,
  newDatastoreName,
  setNewDatastoreName,
  isCreatingDatastore,
  setIsCreatingDatastore,
  fetchDatastores,
  clearCredentials,
}: DatastoreListPanelProps) {
  const { toast } = useToast();
  const { createDatastore } = useDatastore();

  return (
    <Card className="h-full">
      {/* ===== HEADER: Title and Count Badge ===== */}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Datastores</CardTitle>
          <Badge variant="outline" className="font-normal">
            {datastores.length}
          </Badge>
        </div>
      </CardHeader>

      {/* ===== DATASTORE LIST: Scrollable List of Datastores ===== */}
      <CardContent className="pb-1 overflow-auto max-h-[calc(100vh-250px)]" id="datastore-list">
        <div className="space-y-2">
          {datastores.map((datastore) => (
            <Button
              key={datastore.name}
              variant={datastore.name === selectedDatastore ? 'default' : 'ghost'}
              className="w-full justify-start text-left"
              onClick={() => onDatastoreSelect(datastore.name)}
            >
              <Database className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{datastore.name}</span>
            </Button>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        {/* ===== CREATE DATASTORE: Input and Add Button ===== */}
        <div className="flex gap-2 w-full">
          <Input
            placeholder="Create datastore"
            value={newDatastoreName}
            onChange={(e) => setNewDatastoreName(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            disabled={!newDatastoreName || isCreatingDatastore}
            onClick={async () => {
              setIsCreatingDatastore(true);
              try {
                await createDatastore(newDatastoreName);
                setNewDatastoreName('');
                await fetchDatastores();
              } catch (error) {
                toast('Failed to create datastore', 'error');
              } finally {
                setIsCreatingDatastore(false);
              }
            }}
          >
            {isCreatingDatastore ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* ===== DISCONNECT: Logout Button ===== */}
        <Button variant="destructive" className="w-full" onClick={clearCredentials}>
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </Button>
      </CardFooter>
    </Card>
  );
}
