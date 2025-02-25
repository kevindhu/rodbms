"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
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
}

const DatastoreContext = createContext<DatastoreContextType | undefined>(undefined);

export function useDatastore() {
  const context = useContext(DatastoreContext);
  if (!context) {
    throw new Error("useDatastore must be used within a DatastoreProvider");
  }
  return context;
}

export function DatastoreProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [universeId, setUniverseId] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [datastores, setDatastores] = useState<string[]>([]);
  const [selectedDatastore, setSelectedDatastore] = useState("");
  const [selectedEntryKey, setSelectedEntryKey] = useState("");
  const [entryData, setEntryData] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Restore credentials from localStorage
  useEffect(() => {
    const savedUniverseId = localStorage.getItem("universeId");
    const savedApiToken = localStorage.getItem("apiToken");

    if (savedUniverseId && savedApiToken) {
      setUniverseId(savedUniverseId);
      setApiToken(savedApiToken);
    }
  }, []);

  // This will clear the selected entry when the datastore changes
  useEffect(() => {
    // Clear selected entry when datastore changes
    setSelectedEntryKey("");
  }, [selectedDatastore]);

  // Helper function for JSON fetching
  async function fetchJSON(url: string, options?: RequestInit) {
    const res = await fetch(url, options);
    return res.json();
  }

  // Fetch all datastores
  const fetchDatastores = async () => {
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

  // Fetch entries for a datastore
  const fetchEntries = async (datastoreName: string): Promise<string[]> => {
    setIsLoading(true);
    try {
      const data = await fetchJSON(
        `/api/datastores/${encodeURIComponent(datastoreName)}/entries?universeId=${universeId}&apiToken=${apiToken}`
      );
      
      if (data.error) {
        toast("Failed to fetch entries: " + data.error, "error");
        return [];
      }
      
      // Extract the key from each object in the keys array
      return data.keys?.map((item: any) => typeof item === 'object' ? item.key : item) || [];
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast("Failed to fetch entries: " + message, "error");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a specific entry
  const fetchEntry = async (datastoreName: string, key: string) => {
    setIsLoading(true);
    try {
      const url = `/api/datastores/${encodeURIComponent(
        datastoreName
      )}/entry?universeId=${universeId}&apiToken=${apiToken}&entryKey=${key}`;
      
      const data = await fetchJSON(url);
      
      if (data.error) {
        toast("Failed to fetch entry: " + data.error, "error");
        return null;
      }
      
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast("Failed to fetch entry: " + message, "error");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Save an entry
  const saveEntry = async (datastoreName: string, key: string, value: any) => {
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
    setIsLoading(true);
    try {
      const res = await fetchJSON(
        `/api/datastores/${encodeURIComponent(
          datastoreName
        )}/entry?universeId=${universeId}&apiToken=${apiToken}&entryKey=${key}`,
        {
          method: "DELETE",
        }
      );
      
      if (res.error) {
        toast("Failed to delete: " + res.error, "error");
      } else {
        toast("Entry deleted successfully!", "success");
        if (selectedEntryKey === key) {
          setSelectedEntryKey("");
          setEntryData("");
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast("Error deleting entry: " + message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const clearCredentials = () => {
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

  const createDatastore = async (datastoreName: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetchJSON(
        `/api/datastores/create`,
        {
          method: "POST",
          body: JSON.stringify({
            universeId,
            apiToken,
            datastoreName
          }),
        }
      );
      
      if (res.error) {
        toast("Failed to create datastore: " + res.error, "error");
        return false;
      }
      
      toast("Datastore created successfully!", "success");
      
      // Refresh the datastores list
      await fetchDatastores();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast("Failed to create datastore: " + message, "error");
      return false;
    } finally {
      setIsLoading(false);
    }
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
        setSelectedDatastore,
        selectedEntryKey,
        setSelectedEntryKey,
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
      }}
    >
      {children}
    </DatastoreContext.Provider>
  );
} 