'use client';

import { useState } from 'react';
import { useDatastore } from '@/contexts/DatastoreContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Loader2, Database } from 'lucide-react';

export function DatastoreLoginCard() {
  const { universeId, setUniverseId, apiToken, setApiToken, fetchDatastores, isLoading } =
    useDatastore();
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!universeId || !apiToken) {
      toast('Please enter both Universe ID and API Token', 'error');
      return;
    }

    try {
      await fetchDatastores();
    } catch (error) {
      console.error('Failed to fetch datastores:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect to Datastore</CardTitle>
        <CardDescription>Enter your Roblox Universe ID and API Token to connect</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="universe-id-input" className="text-sm font-medium">
            Universe ID
          </label>
          <Input
            id="universe-id-input"
            value={universeId}
            onChange={(e) => setUniverseId(e.target.value)}
            placeholder="Enter your Universe ID"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="api-token-input" className="text-sm font-medium">
            API Token
          </label>
          <Input
            id="api-token-input"
            type="password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="Enter your API Token"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button id="connect-button" onClick={handleConnect} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Connect
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
