"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/components/ui/toast";

interface DatastoreContextType {
  universeId: string;
  setUniverseId: (id: string) => void;
  apiToken: string;
  setApiToken: (token: string) => void;
  datastores: string[];
  setDatastores: (datastores: string[]) => void;
  selectedDatastore: string;
  setSelectedDatastore: (datastore: string) => void;
  selectedEntryKey: string;
  setSelectedEntryKey: (key: string) => void;
  entryData: string;
  setEntryData: (data: string) => void;
  fetchDatastores: () => Promise<void>;
  fetchEntries: (datastoreName: string) => Promise<string[]>;
  fetchEntry: (datastoreName: string, key: string) => Promise<any>;
  saveEntry: (datastoreName: string, key: string, data: any) => Promise<void>;
  deleteEntry: (datastoreName: string, key: string) => Promise<void>;
  isLoading: boolean;
  clearCredentials: () => void;
  createDatastore: (datastoreName: string) => Promise<boolean>;
  setLiveMode: (isLive: boolean) => void;
}

const DatastoreContext = createContext<DatastoreContextType | undefined>(undefined);

export function useDatastore() {
  const context = useContext(DatastoreContext);
  if (context === undefined) {
    throw new Error("useDatastore must be used within a DatastoreProvider");
  }
  return context;
}

const DEBUG_PREFIX = "🔍 [DatastoreContext]";

export function DatastoreProvider({ children }: { children: ReactNode }) {
  console.log(`${DEBUG_PREFIX} Provider rendering`);
  
  // Add a render counter to track how many times the component renders
  const renderCount = useRef(0);
  renderCount.current++;
  console.log(`${DEBUG_PREFIX} Render count: ${renderCount.current}`);
  
  const { toast } = useToast();
  const [universeId, setUniverseId] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [datastores, setDatastores] = useState<string[]>([]);
  const [selectedDatastore, setSelectedDatastore] = useState("");
  const [selectedEntryKey, setSelectedEntryKey] = useState("");
  const [entryData, setEntryData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Use a ref to track live mode state to avoid unnecessary re-renders
  const liveMode = useRef(false);

  // Use a ref to track if we're currently fetching an entry
  const fetchingRef = useRef(false);

  // Add this near the top of your DatastoreProvider function
  const prevStateRef = useRef({
    selectedDatastore: "",
    selectedEntryKey: "",
    isLoading: false
  });

  // Helper function for JSON fetching - moved up before it's used
  async function fetchJSON(url: string, options?: RequestInit) {
    console.log("fetchJSON called with URL:", url);
    const res = await fetch(url, options);
    return res.json();
  }

  // Convert fetchEntries to useCallback to prevent recreating on each render
  const fetchEntries = useCallback(async (datastoreName: string): Promise<string[]> => {
    console.log(`${DEBUG_PREFIX} fetchEntries called with datastoreName: ${datastoreName}`);
    console.log(`${DEBUG_PREFIX} Current liveMode: ${liveMode.current}`);
    
    // Don't set loading state if this is an automated/background refresh
    const isManualFetch = !liveMode.current;
    if (isManualFetch) {
      setIsLoading(true);
    }
    
    try {
      const url = `/api/datastores/${encodeURIComponent(datastoreName)}/entries?universeId=${universeId}&apiToken=${apiToken}`;
      
      // Add a cache-busting parameter for live mode to prevent browser caching
      const finalUrl = liveMode.current ? `${url}&_t=${Date.now()}` : url;
      
      console.log("Fetching entries from URL:", finalUrl);
      const data = await fetchJSON(finalUrl);
      console.log("Received data from entries API:", data);
      
      if (data.error) {
        console.error("API returned error:", data.error);
        if (isManualFetch) {
          toast("Failed to fetch entries: " + data.error, "error");
        }
        return [];
      }
      
      // Handle the actual response format - extract keys from the keys array
      let entries: string[] = [];
      if (data.keys && Array.isArray(data.keys)) {
        entries = data.keys.map((item: { key: string }) => item.key);
      } else if (data.entries && Array.isArray(data.entries)) {
        // Keep backward compatibility with any existing code
        entries = data.entries;
      }
      
      console.log("Parsed entries:", entries);
      return entries;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching entries:", message);
      if (isManualFetch) {
        toast("Failed to fetch entries: " + message, "error");
      }
      return [];
    } finally {
      if (isManualFetch) {
        setIsLoading(false);
      }
    }
  }, [universeId, apiToken, toast]);

  // Replace your setSelectedEntryKey with this
  const setSelectedEntryKeyWithCheck = useCallback((key: string) => {
    if (key !== prevStateRef.current.selectedEntryKey) {
      prevStateRef.current.selectedEntryKey = key;
      setSelectedEntryKey(key);
    }
  }, []);

  // Replace your setSelectedDatastore with this
  const setSelectedDatastoreWithCheck = useCallback((datastore: string) => {
    console.log("setSelectedDatastore called with:", datastore);
    if (datastore !== prevStateRef.current.selectedDatastore) {
      prevStateRef.current.selectedDatastore = datastore;
      setSelectedDatastore(datastore);
    }
  }, []);

  // Replace your setIsLoading with this
  const setIsLoadingWithCheck = useCallback((loading: boolean) => {
    if (loading !== prevStateRef.current.isLoading) {
      prevStateRef.current.isLoading = loading;
      setIsLoading(loading);
    }
  }, []);

  // Add this function to set live mode state
  const setLiveMode = (isLive: boolean) => {
    console.log("setLiveMode called with:", isLive);
    liveMode.current = isLive;
  };

  // Add this to your DatastoreProvider
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add this function to start/stop polling - now fetchEntries is defined before this
  const startPolling = useCallback((datastoreName: string, intervalMs = 5000) => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Set up new polling interval
    if (liveMode.current) {
      console.log(`${DEBUG_PREFIX} Starting polling for ${datastoreName} every ${intervalMs}ms`);
      pollingIntervalRef.current = setInterval(() => {
        console.log(`${DEBUG_PREFIX} Polling: fetching entries for ${datastoreName}`);
        fetchEntries(datastoreName);
      }, intervalMs);
    }
    
    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchEntries]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Restore credentials from localStorage
  useEffect(() => {
    console.log(`${DEBUG_PREFIX} Credentials restoration effect running`);
    const savedUniverseId = localStorage.getItem("universeId");
    const savedApiToken = localStorage.getItem("apiToken");

    if (savedUniverseId && savedApiToken) {
      setUniverseId(savedUniverseId);
      setApiToken(savedApiToken);
    }
  }, []);

  // This will clear the selected entry when the datastore changes
  useEffect(() => {
    console.log(`${DEBUG_PREFIX} Datastore change effect running, selectedDatastore: ${selectedDatastore}`);
    
    // Clear selected entry when datastore changes
    if (selectedEntryKey) {
      console.log(`${DEBUG_PREFIX} Clearing selected entry key due to datastore change`);
      setSelectedEntryKey("");
      setEntryData("");
    }
  }, [selectedDatastore]);

  // Fetch all datastores
  const fetchDatastores = async () => {
    console.log("fetchDatastores called");
    if (!universeId || !apiToken) {
      toast("Please enter Universe ID and API Token", "error");
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchJSON(
        `/api/datastores?universeId=${universeId}&apiToken=${apiToken}`
      );

      if (data.error) {
        toast("Invalid credentials or Universe ID", "error");
        return;
      }

      // Save credentials to local storage
      localStorage.setItem("universeId", universeId);
      localStorage.setItem("apiToken", apiToken);

      const sanitizedDatastores = data.datastores.map((ds: any) => ds.name);
      
      setDatastores(sanitizedDatastores || []);
      setSelectedDatastore("");
      setSelectedEntryKey("");
      toast("Successfully connected!", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast("Failed to connect: " + message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Convert fetchEntry to useCallback to properly handle React hooks
  const fetchEntry = useCallback(async (datastoreName: string, key: string) => {
    console.log(`fetchEntry called with datastoreName: ${datastoreName}, key: ${key}`);
    
    if (fetchingRef.current) {
      console.log("🛑 SKIPPING fetchEntry while loading");
      return null;
    }
    
    if (isLoading) {
      console.log("🛑 SKIPPING fetchEntry while loading");
      return null;
    }
    
    fetchingRef.current = true;
    setIsLoading(true);
    
    try {
      const url = `/api/datastores/${encodeURIComponent(
        datastoreName
      )}/entry?universeId=${universeId}&apiToken=${apiToken}&entryKey=${encodeURIComponent(
        key
      )}`;
      
      console.log(`Fetching entry from URL: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("📥 Received entry data:", result);
      
      try {
        // Try to parse the data if it's JSON
        if (typeof result === "string") {
          try {
            const parsed = JSON.parse(result);
            setEntryData(JSON.stringify(parsed, null, 2));
          } catch {
            setEntryData(result);
          }
        } else {
          setEntryData(JSON.stringify(result, null, 2));
        }
      } catch (e) {
        console.log("⚠️ Error formatting data, using as string:", e);
        setEntryData(String(result));
      }
      
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Error fetching entry:", message);
      
      toast("Failed to fetch entry: " + message, "error");
      return null;
    } finally {
      console.log("⏳ Setting isLoading to FALSE");
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [universeId, apiToken, isLoading, toast]);

  // Save an entry
  const saveEntry = async (datastoreName: string, key: string, value: any) => {
    console.log("saveEntry called with datastoreName:", datastoreName, "key:", key);
    setIsLoading(true);
    try {
      const body = {
        entryKey: key,
        value: value,
      };
      
      const res = await fetchJSON(
        `/api/datastores/${encodeURIComponent(
          datastoreName
        )}/entry?universeId=${universeId}&apiToken=${apiToken}`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );
      
      if (res.error) {
        toast("Failed to save: " + res.error, "error");
      } else {
        toast("Entry saved successfully!", "success");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast("Error saving entry: " + message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an entry
  const deleteEntry = async (datastoreName: string, key: string) => {
    console.log("deleteEntry called with datastoreName:", datastoreName, "key:", key);
    setIsLoading(true);
    try {
      const res = await fetchJSON(
        `/api/datastores/${encodeURIComponent(
          datastoreName
        )}/entry?universeId=${universeId}&apiToken=${apiToken}&entryKey=${encodeURIComponent(
          key
        )}`,
        {
          method: "DELETE",
        }
      );
      
      if (res.error) {
        toast("Failed to delete: " + res.error, "error");
      } else {
        toast("Entry deleted successfully!", "success");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast("Error deleting entry: " + message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new datastore
  const createDatastore = async (datastoreName: string): Promise<boolean> => {
    console.log("createDatastore called with datastoreName:", datastoreName);
    setIsLoading(true);
    try {
      const res = await fetchJSON(
        `/api/datastores/${encodeURIComponent(
          datastoreName
        )}/create?universeId=${universeId}&apiToken=${apiToken}`,
        {
          method: "POST",
        }
      );
      
      if (res.error) {
        toast("Failed to create datastore: " + res.error, "error");
        return false;
      } else {
        toast("Datastore created successfully!", "success");
        // Add the new datastore to the list
        setDatastores([...datastores, datastoreName]);
        return true;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast("Error creating datastore: " + message, "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCredentials = () => {
    console.log("clearCredentials called");
    setUniverseId("");
    setApiToken("");
    setDatastores([]);
    setSelectedDatastore("");
    setSelectedEntryKey("");
    setEntryData("");
    localStorage.removeItem("universeId");
    localStorage.removeItem("apiToken");
    toast("Disconnected successfully", "success");
  };

  return (
    <DatastoreContext.Provider
      value={{
        universeId,
        setUniverseId,
        apiToken,
        setApiToken,
        datastores,
        setDatastores,
        selectedDatastore,
        setSelectedDatastore: setSelectedDatastoreWithCheck,
        selectedEntryKey,
        setSelectedEntryKey: setSelectedEntryKeyWithCheck,
        entryData,
        setEntryData,
        fetchDatastores,
        fetchEntries,
        fetchEntry,
        saveEntry,
        deleteEntry,
        isLoading,
        clearCredentials,
        createDatastore,
        setLiveMode,
      }}
    >
      {children}
    </DatastoreContext.Provider>
  );
} 