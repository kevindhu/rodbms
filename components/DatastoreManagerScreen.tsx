'use client';

import { useDatastore } from '@/contexts/DatastoreContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LiveMode } from '@/components/live-mode/LiveMode';
import { Credits } from '@/components/Credits';
import { DatastoreLoginCard } from '@/components/DatastoreLoginCard';
import { DatastoreExplorer } from '@/components/explorer/DatastoreExplorer';

export function DatastoreManagerScreen() {
  const { datastores } = useDatastore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ROBLOX DATASTORE MANAGER</h1>
        <div className="flex items-center gap-2">
          <LiveMode />
          <ThemeToggle />
        </div>
      </div>

      {!datastores.length ? <DatastoreLoginCard /> : <DatastoreExplorer />}

      <Credits />
    </div>
  );
}
