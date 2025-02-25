"use client";

import { useState, useEffect, useCallback, JSX } from "react";
import { useDatastore } from "@/contexts/DatastoreContext";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, Save, Clock, AlertTriangle, ChevronRight, ChevronDown, Plus, Trash } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Key } from "lucide-react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[400px] bg-muted/20 rounded-md">
      <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
    </div>
  ),
});

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
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set([""]));
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

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
          // Expand top-level paths by default
          if (typeof data === 'object' && data !== null) {
            const topLevelPaths = new Set([""]); 
            Object.keys(data).forEach(key => topLevelPaths.add(`.${key}`));
            setExpandedPaths(topLevelPaths);
          }
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
    setEntryData("");
    setFormattedData(null);
    setLastSaved(null);
    setHasChanges(false);
    setJsonError(null);
    setExpandedPaths(new Set([""]));
    
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

  const togglePath = (path: string) => {
    const newExpandedPaths = new Set(expandedPaths);
    if (newExpandedPaths.has(path)) {
      newExpandedPaths.delete(path);
    } else {
      newExpandedPaths.add(path);
    }
    setExpandedPaths(newExpandedPaths);
  };

  const startEditing = (path: string, value: JsonValue) => {
    setEditingPath(path);
    setEditValue(typeof value === 'string' ? value : JSON.stringify(value));
  };

  const saveEdit = (path: string) => {
    if (!path || path === '') return;
    
    try {
      // Parse the path to navigate the object
      const pathParts = path.split('.').filter(p => p !== '');
      const newData: JsonValue = JSON.parse(JSON.stringify(formattedData));
      
      // Try to parse the edit value based on the original type
      let parsedValue: JsonValue;
      try {
        parsedValue = JSON.parse(editValue);
      } catch {
        // If parsing fails, treat as string
        parsedValue = editValue;
      }
      
      // Navigate to the parent object
      let current: Record<string, JsonValue> | JsonValue[] = newData as Record<string, JsonValue> | JsonValue[];
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!isNaN(Number(part))) {
          // Array index
          if (Array.isArray(current)) {
            current = current[Number(part)] as Record<string, JsonValue> | JsonValue[];
          } else {
            throw new Error(`Cannot use numeric index on non-array at path: ${pathParts.slice(0, i).join('.')}`);
          }
        } else {
          // Object key
          if (!Array.isArray(current) && typeof current === 'object' && current !== null) {
            current = current[part] as Record<string, JsonValue> | JsonValue[];
          } else {
            throw new Error(`Cannot use string key on non-object at path: ${pathParts.slice(0, i).join('.')}`);
          }
        }
      }
      
      // Update the value
      const lastPart = pathParts[pathParts.length - 1];
      if (!isNaN(Number(lastPart))) {
        (current as JsonValue[])[Number(lastPart)] = parsedValue;
      } else {
        (current as Record<string, JsonValue>)[lastPart] = parsedValue;
      }
      
      // Update state
      const newEntryData = JSON.stringify(newData, null, 2);
      setEntryData(newEntryData);
      setFormattedData(newData);
      setHasChanges(true);
      setEditingPath(null);
    } catch (err) {
      toast("Failed to update value", "error");
    }
  };

  const cancelEdit = () => {
    setEditingPath(null);
  };

  const renderFormattedView = () => {
    if (!formattedData) {
      return <div className="text-muted-foreground">No data to display</div>;
    }
    
    return renderObjectTree(formattedData, 0);
  };

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
                  <span className={`${typeof item === 'string' ? 'text-green-600 dark:text-green-400' : typeof item === 'number' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>
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
                <span className={`${typeof value === 'string' ? 'text-green-600 dark:text-green-400' : typeof value === 'number' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>
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

  const renderVisualExplorer = () => {
    if (!formattedData) {
      return <div className="text-muted-foreground p-4">No data to display</div>;
    }
    
    const togglePath = (path: string) => {
      const newExpandedPaths = new Set(expandedPaths);
      if (newExpandedPaths.has(path)) {
        newExpandedPaths.delete(path);
      } else {
        newExpandedPaths.add(path);
      }
      setExpandedPaths(newExpandedPaths);
    };
    
    const startEditing = (path: string, value: JsonValue) => {
      setEditingPath(path);
      setEditValue(typeof value === 'string' ? value : JSON.stringify(value));
    };
    
    const renderNode = (value: JsonValue, path: string = '') => {
      // Handle primitive values
      if (value === null) {
        return (
          <div className="flex items-center py-1 group">
            <span className="text-gray-500 font-mono">null</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 ml-2 h-6 w-6 p-0"
              onClick={() => startEditing(path, null)}
            >
              <span className="sr-only">Edit</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                <path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </Button>
          </div>
        );
      }
      
      if (typeof value === 'boolean') {
        return (
          <div className="flex items-center py-1 group">
            {editingPath === path ? (
              <div className="flex items-center gap-2">
                <select 
                  className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
                <Button size="sm" variant="ghost" onClick={() => saveEdit(path)}>Save</Button>
                <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
              </div>
            ) : (
              <>
                <span className={`font-mono ${value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {String(value)}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 ml-2 h-6 w-6 p-0"
                  onClick={() => startEditing(path, value)}
                >
                  <span className="sr-only">Edit</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                    <path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </Button>
              </>
            )}
          </div>
        );
      }
      
      if (typeof value === 'number') {
        return (
          <div className="flex items-center py-1 group">
            {editingPath === path ? (
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-8 w-32"
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={() => saveEdit(path)}>Save</Button>
                <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
              </div>
            ) : (
              <>
                <span className="text-blue-600 dark:text-blue-400 font-mono">{value}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 ml-2 h-6 w-6 p-0"
                  onClick={() => startEditing(path, value)}
                >
                  <span className="sr-only">Edit</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                    <path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </Button>
              </>
            )}
          </div>
        );
      }
      
      if (typeof value === 'string') {
        return (
          <div className="flex items-center py-1 group">
            {editingPath === path ? (
              <div className="flex items-center gap-2">
                <Input 
                  type="text" 
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="h-8 min-w-[200px]"
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={() => saveEdit(path)}>Save</Button>
                <Button size="sm" variant="ghost" onClick={cancelEdit}>Cancel</Button>
              </div>
            ) : (
              <>
                <span className="text-green-600 dark:text-green-400 font-mono">&ldquo;{value}&rdquo;</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 ml-2 h-6 w-6 p-0"
                  onClick={() => startEditing(path, value)}
                >
                  <span className="sr-only">Edit</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                    <path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </Button>
              </>
            )}
          </div>
        );
      }
      
      // Handle arrays
      if (Array.isArray(value)) {
        const isExpanded = expandedPaths.has(path);
        
        return (
          <div className="py-1">
            <div 
              className="flex items-center cursor-pointer hover:bg-accent/50 rounded px-1 -ml-1"
              onClick={() => togglePath(path)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 mr-1 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
              )}
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                Array [{value.length}]
              </span>
            </div>
            
            {isExpanded && (
              <div className="pl-4 mt-1 border-l border-border">
                {value.map((item, index) => (
                  <div key={index} className="py-1">
                    <div className="flex items-start">
                      <span className="text-muted-foreground mr-2 font-mono">{index}:</span>
                      {renderNode(item, `${path}[${index}]`)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
      
      // Handle objects
      if (typeof value === 'object') {
        const isExpanded = expandedPaths.has(path);
        const keys = Object.keys(value);
        
        return (
          <div className="py-1">
            <div 
              className="flex items-center cursor-pointer hover:bg-accent/50 rounded px-1 -ml-1"
              onClick={() => togglePath(path)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 mr-1 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
              )}
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                Object {`{${keys.length}}`}
              </span>
            </div>
            
            {isExpanded && (
              <div className="pl-4 mt-1 border-l border-border">
                {keys.map(key => (
                  <div key={key} className="py-1">
                    <div className="flex items-start">
                      <span className="text-orange-600 dark:text-orange-400 mr-2 font-mono">{key}:</span>
                      {renderNode(value[key], path ? `${path}.${key}` : `.${key}`)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
      
      return <span>{String(value)}</span>;
    };
    
    return (
      <div className="p-4 overflow-auto">
        {renderNode(formattedData)}
      </div>
    );
  };

  const handleShortcut = (action: string) => {
    if (action === 'save' && !jsonError && hasChanges) {
      handleSave();
    } else if (action === 'refresh') {
      loadEntryData();
    }
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
              <Badge variant="outline" className="ml-2 text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
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
          <div className="mb-3 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md flex items-center text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{jsonError}</span>
          </div>
        )}
        
        <Tabs defaultValue="json" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="json">JSON Editor</TabsTrigger>
            <TabsTrigger value="formatted">Formatted View</TabsTrigger>
            <TabsTrigger value="visual">Visual Explorer</TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="min-h-[400px]">
            <MonacoEditor
              height="400px"
              language="json"
              value={entryData}
              onChange={handleDataChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                tabSize: 2,
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
              }}
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
          
          <TabsContent value="visual">
            <div className="min-h-[400px] border rounded-md overflow-auto bg-card">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                </div>
              ) : (
                renderVisualExplorer()
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {lastSaved && (
        <CardFooter className="text-xs text-muted-foreground flex items-center pt-0">
          <Clock className="h-3 w-3 mr-1" />
          Last saved: {format(lastSaved, "MMM d, yyyy h:mm a")}
        </CardFooter>
      )}
      <KeyboardShortcuts onShortcut={handleShortcut} />
    </Card>
  );
}
