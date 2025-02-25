"use client";

import { useState, useEffect, useCallback } from "react";
import { useDatastore } from "@/contexts/DatastoreContext";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Plus, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EntryList() {
  const {
    selectedDatastore,
    selectedEntryKey,
    setSelectedEntryKey,
    fetchEntries,
    saveEntry,
    deleteEntry,
    isLoading
  } = useDatastore();
  
  const { toast } = useToast();
  const [entries, setEntries] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newEntryKey, setNewEntryKey] = useState("");
  const [newEntryValue, setNewEntryValue] = useState("{}");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState("");

  const loadEntries = useCallback(async () => {
    if (!selectedDatastore) return;
    
    const fetchedEntries = await fetchEntries(selectedDatastore);
    setEntries(fetchedEntries);
  }, [selectedDatastore, fetchEntries]);

  useEffect(() => {
    if (selectedDatastore) {
      loadEntries();
    } else {
      setEntries([]);
    }
  }, [selectedDatastore, loadEntries]);

  const handleCreateEntry = async () => {
    if (!newEntryKey.trim()) {
      toast("Entry key cannot be empty", "error");
      return;
    }

    try {
      const parsedValue = JSON.parse(newEntryValue);
      await saveEntry(selectedDatastore, newEntryKey, parsedValue);
      setNewEntryKey("");
      setNewEntryValue("{}");
      setIsCreateDialogOpen(false);
      loadEntries();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast("JSON parse error: " + message, "error");
    }
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;
    
    await deleteEntry(selectedDatastore, entryToDelete);
    setIsDeleteDialogOpen(false);
    loadEntries();
  };

  const filteredEntries = entries.filter(entry => 
    entry.toLowerCase().includes(searchTerm.toLowerCase())
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
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          Entries
          {entries.length > 0 && (
            <Badge variant="outline" className="ml-2 font-normal">
              {entries.length}
            </Badge>
          )}
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={loadEntries}
            disabled={isLoading}
            aria-label="Refresh entries"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsCreateDialogOpen(true)}
            aria-label="Add new entry"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
          </div>
        ) : filteredEntries.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-24rem)] pr-3">
            <div className="space-y-1">
              {filteredEntries.map((entry) => (
                <div
                  key={entry}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                    selectedEntryKey === entry
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  }`}
                  onClick={() => setSelectedEntryKey(entry)}
                >
                  <span className="truncate font-mono text-sm">{entry}</span>
                  {selectedEntryKey === entry && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEntryToDelete(entry);
                        setIsDeleteDialogOpen(true);
                      }}
                      aria-label="Delete entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            {searchTerm ? (
              <>
                <Search className="h-8 w-8 mb-2 opacity-20" />
                <p>No entries match your search</p>
              </>
            ) : (
              <>
                <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
                <p>No entries found in this datastore</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="mt-2"
                >
                  Create your first entry
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t bg-muted/30 py-2 px-3">
        <p className="text-xs text-muted-foreground">
          Datastore: <span className="font-medium text-foreground">{selectedDatastore}</span>
        </p>
      </CardFooter>

      {/* Create Entry Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="entryKey" className="text-sm font-medium">
                Entry Key
              </label>
              <Input
                id="entryKey"
                value={newEntryKey}
                onChange={(e) => setNewEntryKey(e.target.value)}
                placeholder="Enter unique key"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="entryValue" className="text-sm font-medium">
                Entry Value (JSON)
              </label>
              <textarea
                id="entryValue"
                value={newEntryValue}
                onChange={(e) => setNewEntryValue(e.target.value)}
                placeholder="Enter JSON data"
                className="w-full min-h-[120px] p-2 border rounded-md font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEntry}>Create Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Entry Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Entry</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the entry <span className="font-mono font-medium">{entryToDelete}</span>?
            This action cannot be undone.
          </p>
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

