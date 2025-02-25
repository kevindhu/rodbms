"use client";

import { useState, useEffect, useCallback, JSX } from "react";
import { useDatastore } from "@/contexts/DatastoreContext";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, Save, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Key } from "lucide-react";

// Define a type for JSON data
type JsonValue = 
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export default function EntryDetailEditor() {
  const { 
    selectedDatastore, 
    selectedEntryKey, 
    fetchEntry, 
    saveEntry,
    isLoading 
  } = useDatastore();
  
  const { toast } = useToast();
  const [entryData, setEntryData] = useState("");
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
      console.error("Error loading entry data:", error);
      setEntryData("");
      setFormattedData(null);
    } finally {
      setIsLoadingEntry(false);
    }
  }, [selectedDatastore, selectedEntryKey, fetchEntry]);

  // Reset state when datastore or entry key changes
  useEffect(() => {
    // Clear data when datastore or entry key changes
    setEntryData("");
    setFormattedData(null);
    setLastSaved(null);
    setHasChanges(false);
    setJsonError(null);
    
    // Only load data if both datastore and entry key are selected
    if (selectedDatastore && selectedEntryKey) {
      loadEntryData();
    }
  }, [selectedDatastore, selectedEntryKey, loadEntryData]); // Fixed dependency array

  const handleDataChange = (value: string) => {
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
        setJsonError("Invalid JSON");
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
      toast("Entry saved successfully", "success");
    } catch (err) {
      toast("Failed to save entry", "error");
    }
  };

  const renderFormattedView = () => {
    if (!formattedData) {
      return <div className="text-muted-foreground">No data to display</div>;
    }
    
    return renderObjectTree(formattedData, 0);
  };

  // Fix the any type in renderObjectTree
  const renderObjectTree = (obj: JsonValue, depth: number): JSX.Element => {
    if (obj === null) {
      return <span className="text-gray-500">null</span>;
    }
    
    if (Array.isArray(obj)) {
      return (
        <div className={depth > 0 ? "pl-4 border-l border-border" : ""}>
          {obj.length === 0 ? (
            <span className="text-gray-500">[]</span>
          ) : (
            obj.map((item, index) => (
              <div key={index} className="py-1">
                <span className="text-gray-500 mr-2">[{index}]</span>
                {typeof item === 'object' && item !== null ? (
                  renderObjectTree(item, depth + 1)
                ) : (
                  <span className={`${typeof item === 'string' ? 'text-green-600' : typeof item === 'number' ? 'text-blue-600' : 'text-purple-600'}`}>
                    {JSON.stringify(item)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      );
    }
    
    if (typeof obj === 'object') {
      return (
        <div className={depth > 0 ? "pl-4 border-l border-border" : ""}>
          {Object.entries(obj).map(([key, value]) => (
            <div key={key} className="py-1">
              <span className="font-medium mr-2">{key}:</span>
              {typeof value === 'object' && value !== null ? (
                renderObjectTree(value, depth + 1)
              ) : (
                <span className={`${typeof value === 'string' ? 'text-green-600' : typeof value === 'number' ? 'text-blue-600' : 'text-purple-600'}`}>
                  {JSON.stringify(value)}
                </span>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    return <span>{String(obj)}</span>;
  };

  // If no datastore or entry is selected, show placeholder
  if (!selectedDatastore || !selectedEntryKey) {
    return (
      <Card className="shadow-sm h-full">
        <CardHeader>
          <CardTitle>Entry Details</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <Key className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Select an entry to view and edit its data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center">
            Entry Details
            {hasChanges && (
              <Badge variant="outline" className="ml-2 text-amber-500 border-amber-200 bg-amber-50">
                Unsaved changes
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1 font-mono">
            {selectedEntryKey}
          </p>
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
            variant={jsonError ? "outline" : "default"}
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
        {jsonError && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md flex items-center text-sm text-red-600">
            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{jsonError}</span>
          </div>
        )}
        
        <Tabs defaultValue="json" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="json">JSON Editor</TabsTrigger>
            <TabsTrigger value="formatted">Formatted View</TabsTrigger>
          </TabsList>

          <TabsContent value="json">
            <textarea
              className={`w-full min-h-[400px] p-4 border rounded-md font-mono text-sm ${
                jsonError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
              }`}
              value={entryData}
              onChange={(e) => handleDataChange(e.target.value)}
              placeholder="JSON data will appear here"
              spellCheck="false"
            />
          </TabsContent>

          <TabsContent value="formatted">
            <div className="min-h-[400px] p-4 border rounded-md overflow-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                </div>
              ) : (
                renderFormattedView()
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground flex flex-col items-start gap-1">
        <div>Datastore: <span className="font-medium text-foreground">{selectedDatastore}</span></div>
        {lastSaved && (
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" /> Last refreshed: {format(lastSaved, "MMM d, yyyy HH:mm:ss")}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
