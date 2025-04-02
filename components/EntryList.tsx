'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDatastore } from '@/contexts/DatastoreContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Plus, Trash2, RefreshCw, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const LOAD_ENTRIES_PREFIX = '📥 [LOAD_ENTRIES]';

export function EntryList() {
  // Add a render counter
  const renderCount = useRef(0);
  renderCount.current++;

  const {
    selectedDatastore,
    fetchEntries,
    selectedEntryKey,
    setSelectedEntryKey,
    saveEntry,
    deleteEntry,
    isLoading,
  } = useDatastore();

  const { toast } = useToast();

  const [entries, setEntries] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEntryKey, setNewEntryKey] = useState('');
  const [newEntryValue, setNewEntryValue] = useState('{}');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState('');

  // Track previous entries to prevent unnecessary updates
  const prevEntriesRef = useRef<string[]>([]);

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  // Add a ref to track if we're currently viewing search results
  const isViewingSearchResults = useRef(false);

  // Track when loadEntries is recreated
  const loadEntriesRecreationCount = useRef(0);

  // Set up mount/unmount tracking
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Modified loadEntries to track recreation
  const loadEntries = useCallback(
    async (search?: string) => {
      // Increment recreation counter
      loadEntriesRecreationCount.current++;

      if (!selectedDatastore) {
        return;
      }

      setIsSearching(true);

      try {
        isViewingSearchResults.current = !!search;

        const newEntries = await fetchEntries(selectedDatastore, search);

        if (!isMountedRef.current) {
          return;
        }

        setEntries(newEntries);
      } catch (error) {
        console.error(`Error loading entries:`, error);
        toast(
          `Error loading entries: ${error instanceof Error ? error.message : String(error)}`,
          'error'
        );
      } finally {
        setIsSearching(false);
      }
    },
    [selectedDatastore, fetchEntries, toast]
  );

  // Add debugging to the useEffect
  useEffect(() => {
    if (selectedDatastore) {
      // Reset search state when datastore changes
      const wasViewingSearchResults = isViewingSearchResults.current;
      isViewingSearchResults.current = false;

      // Clear search term if we were viewing search results
      if (wasViewingSearchResults) {
        setSearchTerm('');
      }

      loadEntries();
    } else if (!selectedDatastore) {
      setEntries([]);
    }
  }, [selectedDatastore, loadEntries, setSearchTerm]);

  // Handle search submission
  const handleSearch = useCallback(() => {
    if (selectedDatastore && searchTerm) {
      loadEntries(searchTerm);
    }
  }, [selectedDatastore, searchTerm, loadEntries]);

  // Handle search on Enter key
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  // Clear search - modify to be more explicit about what it's doing
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    isViewingSearchResults.current = false;
    loadEntries();
  }, [loadEntries]);

  const handleCreateEntry = async () => {
    if (!newEntryKey) {
      toast('Entry key is required', 'error');
      return;
    }

    try {
      // Validate JSON
      const parsedValue = JSON.parse(newEntryValue);

      // Call API to create entry
      await saveEntry(selectedDatastore, newEntryKey, parsedValue);

      // Reset form and refresh entries
      setNewEntryKey('');
      setNewEntryValue('{}');
      setIsCreateDialogOpen(false);
      loadEntries();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast('JSON parse error: ' + message, 'error');
    }
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;

    try {
      await deleteEntry(selectedDatastore, entryToDelete);

      // If we deleted the currently selected entry, clear the selection
      if (entryToDelete === selectedEntryKey) {
        setSelectedEntryKey('');
      }

      setIsDeleteDialogOpen(false);
      loadEntries();
    } catch (error) {
      toast(
        `Error deleting entry: ${error instanceof Error ? error.message : String(error)}`,
        'error'
      );
    }
  };

  // Modify the handleEntryClick function
  const handleEntryClick = useCallback(
    (key: string) => {
      setSelectedEntryKey(key);
    },
    [setSelectedEntryKey]
  );

  if (!selectedDatastore) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Entries</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-muted-foreground">
          Please select a datastore first
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Entries</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadEntries()}
              disabled={isLoading || isSearching}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading || isSearching ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
              disabled={isLoading || isSearching}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entries by prefix..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                disabled={isLoading || isSearching}
              />
              {searchTerm && (
                <button
                  className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSearch}
              disabled={isLoading || isSearching}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                disabled={isLoading || isSearching}
              >
                Clear
              </Button>
            )}
          </div>

          {isViewingSearchResults.current && searchTerm && (
            <div className="mb-2 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded flex items-center justify-between">
              <span>
                Showing results for: <strong>{searchTerm}</strong>
              </span>
              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={clearSearch}>
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          )}

          <ScrollArea className="h-[400px] rounded-md border">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p className="text-muted-foreground">Searching...</p>
              </div>
            ) : entries.length > 0 ? (
              <div className="p-4">
                {entries.map((entry) => (
                  <div
                    key={entry}
                    className={`p-3 rounded cursor-pointer flex justify-between items-center ${
                      selectedEntryKey === entry
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                    onClick={() => handleEntryClick(entry)}
                  >
                    <span className="font-mono text-sm truncate">{entry}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEntryToDelete(entry);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p>No entries found</p>
                <p className="text-xs mt-1">
                  {searchTerm ? (
                    <>
                      No entries match &quot;<strong>{searchTerm}</strong>&quot;
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={clearSearch}
                      >
                        Clear search
                      </Button>
                    </>
                  ) : (
                    'Create an entry to get started'
                  )}
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>

      {/* Create Entry Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="entryKey" className="text-sm font-medium">
                Entry Key
              </label>
              <Input
                id="entryKey"
                value={newEntryKey}
                onChange={(e) => setNewEntryKey(e.target.value)}
                placeholder="Enter key name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="entryValue" className="text-sm font-medium">
                Entry Value (JSON)
              </label>
              <textarea
                id="entryValue"
                className="w-full min-h-[200px] p-2 border rounded-md font-mono text-sm"
                value={newEntryValue}
                onChange={(e) => setNewEntryValue(e.target.value)}
                placeholder="{}"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEntry}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Entry Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Entry</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete the entry{' '}
              <span className="font-mono font-bold">{entryToDelete}</span>?
            </p>
            <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEntry}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default EntryList;
