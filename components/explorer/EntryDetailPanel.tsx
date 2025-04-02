'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { VersionSelector } from '@/components/versions/VersionSelector';

// Define a type for JSON data
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export function EntryDetailPanel() {
  const {
    selectedDatastore,
    selectedEntryKey,
    fetchEntry,
    fetchEntryVersion,
    saveEntry,
    isLoading,
    selectedVersion,
    setSelectedVersion,
    setVersions,
  } = useDatastore();

  const { toast } = useToast();
  const [entryData, setEntryData] = useState('');
  const [formattedData, setFormattedData] = useState<JsonValue | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);

  // Add a ref to track previous values
  const prevValuesRef = useRef({
    selectedDatastore,
    selectedEntryKey,
    selectedVersion: selectedVersion?.version,
  });

  // Memoize loadEntryData to avoid dependency issues
  const loadEntryData = useCallback(async () => {
    if (!selectedDatastore || !selectedEntryKey) return;

    setIsLoadingEntry(true);
    try {
      // console.log('Loading entry data for:', selectedDatastore, selectedEntryKey);

      let data;

      // If a version is selected, fetch that specific version
      if (selectedVersion) {
        console.log(`Loading version ${selectedVersion.version} of entry ${selectedEntryKey}`);
        data = await fetchEntryVersion(
          selectedDatastore,
          selectedEntryKey,
          selectedVersion.version
        );
      } else {
        // Otherwise fetch the latest version
        data = await fetchEntry(selectedDatastore, selectedEntryKey);
      }

      console.log('Data:', data);

      // Check if we got an error response
      if (data && data.error === true) {
        // Handle 404 or other error responses
        console.log('Error:', data.message);

        // Format the error as JSON to display in the editor
        const errorJson = JSON.stringify(
          {
            error: true,
            status: data.status,
            message: data.message,
          },
          null,
          2
        );

        setEntryData(errorJson);
        setFormattedData({
          error: true,
          status: data.status,
          message: data.message,
        } as JsonValue);

        // No need to show another toast as fetchEntry already did
        return;
      }

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
  }, [selectedDatastore, selectedEntryKey, fetchEntry, fetchEntryVersion, selectedVersion]);

  // Load entry data when selected entry changes or when a version is selected/deselected
  useEffect(() => {
    // Compare current values with previous values
    const prevValues = prevValuesRef.current;
    const currentVersionId = selectedVersion?.version;

    // Only proceed if there's an actual change in the values we care about
    const hasChanged =
      prevValues.selectedDatastore !== selectedDatastore ||
      prevValues.selectedEntryKey !== selectedEntryKey ||
      prevValues.selectedVersion !== currentVersionId;

    if (!hasChanged) {
      return;
    }

    // Update the ref with current values
    prevValuesRef.current = {
      selectedDatastore,
      selectedEntryKey,
      selectedVersion: currentVersionId,
    };

    if (selectedDatastore && selectedEntryKey) {
      loadEntryData();
    } else {
      setEntryData('');
      setFormattedData(null);
    }
  }, [selectedDatastore, selectedEntryKey, selectedVersion, loadEntryData]);

  // Handle data changes in the editor
  const handleDataChange = (value: string) => {
    setEntryData(value);
    setHasChanges(true);

    try {
      // Try to parse the JSON to validate it
      const parsed = JSON.parse(value);
      setFormattedData(parsed);
      setJsonError(null);
    } catch (err) {
      // If parsing fails, set an error message
      setJsonError((err as Error).message);
    }
  };

  // Handle save button click
  const handleSave = async () => {
    if (!selectedDatastore || !selectedEntryKey || jsonError) return;

    try {
      // Parse the JSON data
      const data = JSON.parse(entryData);

      // If we're viewing a version, warn the user they're overwriting with an old version
      if (selectedVersion) {
        const confirmOverwrite = window.confirm(
          `You are about to save data from version ${selectedVersion.version} as the current version. Continue?`
        );

        if (!confirmOverwrite) {
          return;
        }
      }

      // Save the entry
      await saveEntry(selectedDatastore, selectedEntryKey, data);

      // After saving, clear the selected version since we're now on the latest version
      setSelectedVersion(null);
      setVersions([]);

      // Update the last saved timestamp
      setLastSaved(new Date());
      setHasChanges(false);

      // // Refresh the entry data to show the latest version
      // loadEntryData();
    } catch (err) {
      console.error('Error saving entry:', err);
      toast('Failed to save entry', 'error');
    }
  };

  // Handle keyboard shortcuts
  const handleShortcut = (action: string) => {
    if (action === 'save' && !jsonError && hasChanges) {
      handleSave();
    } else if (action === 'refresh') {
      console.log('Load entry data 2');
      loadEntryData();
    }
  };

  return (
    <div className="h-full">
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl flex items-center">
              Entry Details
              {selectedEntryKey && (
                <Badge variant="outline" className="ml-2 font-mono">
                  <Key className="h-3 w-3 mr-1" />
                  {selectedEntryKey}
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
              onClick={() => {
                console.log('Load entry data 3');
                loadEntryData();
              }}
              disabled={isLoading || !selectedEntryKey}
            >
              <RefreshCw size={16} /> Refresh
            </Button>
            <Button
              variant={jsonError ? 'outline' : 'default'}
              size="sm"
              className="flex items-center gap-1"
              onClick={handleSave}
              disabled={isLoading || !!jsonError || !hasChanges || !selectedEntryKey}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />} Save
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Show a message when no entry is selected */}
          {!selectedEntryKey ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Key className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Entry Selected</h3>
              <p className="text-muted-foreground max-w-md">
                Select an entry from the list on the left to view and edit its data.
              </p>
            </div>
          ) : (
            <>
              {/* Version selector */}
              <VersionSelector
                selectedDatastore={selectedDatastore}
                selectedEntryKey={selectedEntryKey}
              />

              {/* Error message display */}
              {jsonError && (
                <div className="mb-3 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md flex items-center text-sm text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{jsonError}</span>
                </div>
              )}

              {/* Warning when viewing a version (except the latest version) */}
              {selectedVersion && !selectedVersion.isLatest && (
                <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-md flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    You are viewing a historical version of this entry. Saving will overwrite the
                    current version.
                  </span>
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
                    onChange={(value) => handleDataChange(value || '')}
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
            </>
          )}
        </CardContent>

        {/* Last saved timestamp */}
        {lastSaved && selectedEntryKey && (
          <CardFooter className="text-xs text-muted-foreground flex items-center pt-0">
            <Clock className="h-3 w-3 mr-1" />
            Last saved: {format(lastSaved, 'MMM d, yyyy h:mm a')}
            {selectedVersion && (
              <span className="ml-2">
                (Viewing version from{' '}
                {format(new Date(selectedVersion.createdTime), 'MMM d, yyyy h:mm a')})
              </span>
            )}
          </CardFooter>
        )}

        {/* Keyboard shortcuts handler */}
        <KeyboardShortcuts onShortcut={handleShortcut} />
      </Card>
    </div>
  );
}
