'use client';

import { useDatastore } from '@/contexts/DatastoreContext';
import { Credits } from '@/components/Credits';
import { Clock, Database, Server, Activity, HardDrive, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function StatusBar() {
  const { universeId, selectedDatastore, isLoading, datastores } = useDatastore();

  // Use state for the current time to avoid hydration errors
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  // Update the time on the client side only
  useEffect(() => {
    // Set initial time
    setCurrentTime(new Date().toLocaleString('en-US'));

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('en-US'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-secondary/80 backdrop-blur-sm border-t z-50">
      <div className="h-8 flex items-center px-4 text-xs text-muted-foreground">
        <div className="flex-1 flex items-center gap-4">
          {universeId && (
            <div className="flex items-center gap-1.5">
              <Server className="h-3 w-3" />
              <span>Universe: {universeId}</span>
            </div>
          )}

          {selectedDatastore && (
            <div className="flex items-center gap-1.5">
              <Database className="h-3 w-3" />
              <span>Datastore: {selectedDatastore}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>{currentTime}</span>
          </div>

          {isLoading && (
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
              <span>Loading...</span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-5 text-xs px-1.5"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        </div>

        {/* <Credits /> */}
      </div>

      {showDetails && (
        <div className="px-4 py-2 text-xs border-t bg-background/50 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-1.5">
            <HardDrive className="h-3 w-3" />
            <span>Datastores: {datastores.length}</span>
          </div>

          {/* TODO: This is hardcoded - should be connected to actual API status */}
          <div className="flex items-center gap-1.5">
            <Activity className="h-3 w-3" />
            <span>API Status: Operational</span>
          </div>

          {/* TODO: This is hardcoded - should reflect actual session state */}
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            <span>Session: Active</span>
          </div>
        </div>
      )}
    </div>
  );
}
