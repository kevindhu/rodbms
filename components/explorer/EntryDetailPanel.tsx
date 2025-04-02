'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDatastore } from '@/contexts/DatastoreContext';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw, Save, Clock, AlertTriangle, Key } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';

// Import sub-components
import { JsonEditor } from '@/components/entry-detail/JsonEditor';
import { FormattedView } from '@/components/entry-detail/FormattedView';
import { VisualExplorer } from '@/components/entry-detail/VisualExplorer';

// Define a type for JSON data
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export function EntryDetailPanel() {
  const { selectedDatastore, selectedEntryKey, fetchEntry, saveEntry, isLoading } = useDatastore();

  const { toast } = useToast();
  const [entryData, setEntryData] = useState('');
  const [formattedData, setFormattedData] = useState<JsonValue | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);

  // Memoize loadEntryData to avoid dependency issues
  const loadEntryData = useCallback(async () => {
    if (!selectedDatastore || !selectedEntryKey) return;

    setIsLoadingEntry(true);
    try {
      console.log('Loading entry data for:', selectedDatastore, selectedEntryKey);

      const data = await fetchEntry(selectedDatastore, selectedEntryKey);

      if (data) {
        try {
          const formattedJson = JSON.stringify(data, null, 2);
          setEntryData(formattedJson);
          setFormattedData(data as JsonValue);
          setLastSaved(new Date());
          setHasChanges(false);
          setJsonError(null);
        } catch (err) {
          setEntryData(JSON.stringify(data));
          setFormattedData(data as JsonValue);
        }
      }
    } catch (error) {
      console.error('Error loading entry data:', error);
      setEntryData('');
      setFormattedData(null);
    } finally {
      setIsLoadingEntry(false);
    }
  }, [selectedDatastore, selectedEntryKey, fetchEntry]);

  // Reset state when datastore or entry key changes
  useEffect(() => {
    setEntryData('');
    setFormattedData(null);
    setLastSaved(null);
    setHasChanges(false);
    setJsonError(null);

    // Only load data if both datastore and entry key are selected
    if (selectedDatastore && selectedEntryKey) {
      loadEntryData();
    }
  }, [selectedDatastore, selectedEntryKey, loadEntryData]);

  const handleDataChange = (value: string | undefined) => {
    if (value === undefined) return;

    setEntryData(value);
    setHasChanges(true);

    try {
      const parsed = JSON.parse(value);
      setFormattedData(parsed as JsonValue);
      setJsonError(null);
    } catch (err) {
      if (err instanceof Error) {
        setJsonError(err.message);
      } else {
        setJsonError('Invalid JSON');
      }
    }
  };

  const handleSave = async () => {
    if (!selectedDatastore || !selectedEntryKey || jsonError) return;

    try {
      const parsedData = JSON.parse(entryData);
      await saveEntry(selectedDatastore, selectedEntryKey, parsedData);
      setLastSaved(new Date());
      setHasChanges(false);
      toast('Entry saved successfully', 'success');
    } catch (err) {
      toast('Failed to save entry', 'error');
    }
  };

  const handleShortcut = (action: string) => {
    if (action === 'save' && !jsonError && hasChanges) {
      handleSave();
    } else if (action === 'refresh') {
      loadEntryData();
    }
  };

  // If no entry is selected, show the placeholder
  if (!selectedEntryKey) {
    return (
      <div className="h-full">
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground border rounded-md p-4">
          <Key className="h-16 w-16 mb-4 opacity-20" />
          <p>Select an entry to view and edit its data</p>
        </div>
      </div>
    );
  }

  // Otherwise, show the editor
  return (
    <div className="h-full">
      <Card className="shadow-sm h-full">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              Entry Details
              {hasChanges && (
                <Badge
                  variant="outline"
                  className="ml-2 text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800"
                >
                  Unsaved changes
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 font-mono">{selectedEntryKey}</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={loadEntryData}
              disabled={isLoading}
            >
              <RefreshCw size={16} /> Refresh
            </Button>
            <Button
              variant={jsonError ? 'outline' : 'default'}
              size="sm"
              className="flex items-center gap-1"
              onClick={handleSave}
              disabled={isLoading || !!jsonError || !hasChanges}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />} Save
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Error message display */}
          {jsonError && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md flex items-center text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{jsonError}</span>
            </div>
          )}

          {/* Tabs for different views */}
          <Tabs defaultValue="json" className="w-full">
            <TabsList className="w-full justify-start mb-4">
              <TabsTrigger value="json">JSON Editor</TabsTrigger>
              <TabsTrigger value="formatted">Formatted View</TabsTrigger>
              <TabsTrigger value="visual">Visual Explorer</TabsTrigger>
            </TabsList>

            {/* JSON Editor Tab */}
            <TabsContent value="json" className="min-h-[400px]">
              <JsonEditor
                value={entryData}
                onChange={handleDataChange}
                isLoading={isLoadingEntry}
              />
            </TabsContent>

            {/* Formatted View Tab */}
            <TabsContent value="formatted">
              <FormattedView data={formattedData} isLoading={isLoadingEntry} />
            </TabsContent>

            {/* Visual Explorer Tab */}
            <TabsContent value="visual">
              <VisualExplorer
                data={formattedData}
                isLoading={isLoadingEntry}
                onDataChange={(newData) => {
                  const newEntryData = JSON.stringify(newData, null, 2);
                  setEntryData(newEntryData);
                  setFormattedData(newData);
                  setHasChanges(true);
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>

        {/* Last saved timestamp */}
        {lastSaved && (
          <CardFooter className="text-xs text-muted-foreground flex items-center pt-0">
            <Clock className="h-3 w-3 mr-1" />
            Last saved: {format(lastSaved, 'MMM d, yyyy h:mm a')}
          </CardFooter>
        )}

        {/* Keyboard shortcuts handler */}
        <KeyboardShortcuts onShortcut={handleShortcut} />
      </Card>
    </div>
  );
}
