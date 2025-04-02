'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useToast } from '@/components/ui/toast';

interface DatastoreContextType {
  universeId: string;
  setUniverseId: (id: string) => void;
  apiToken: string;
  setApiToken: (token: string) => void;
  datastores: { name: string; createdTime: string }[];
  setDatastores: (datastores: { name: string; createdTime: string }[]) => void;
  selectedDatastore: string;
  setSelectedDatastore: (datastore: string) => void;
  selectedEntryKey: string;
  setSelectedEntryKey: (key: string) => void;
  entryData: string;
  setEntryData: (data: string) => void;
  selectedVersion: Version | null;
  setSelectedVersion: (version: Version | null) => void;
  versions: Version[];
  setVersions: (versions: Version[]) => void;
  fetchDatastores: () => Promise<void>;
  fetchEntries: (datastoreName: string, searchQuery?: string) => Promise<string[]>;
  fetchEntry: (datastoreName: string, key: string) => Promise<any>;
  saveEntry: (datastoreName: string, key: string, data: any) => Promise<void>;
  deleteEntry: (datastoreName: string, key: string) => Promise<void>;
  isLoading: boolean;
  clearCredentials: () => void;
  createDatastore: (datastoreName: string) => Promise<boolean>;
  fetchEntryVersions: (datastoreName: string, key: string) => Promise<any[]>;
  fetchEntryVersion: (datastoreName: string, key: string, versionId: string) => Promise<any>;
}

interface Version {
  version: string;
  createdTime: string;
  contentLength: number;
  deleted: boolean;
  objectCreatedTime?: string;
  isLatest?: boolean;
}

const DatastoreContext = createContext<DatastoreContextType | undefined>(undefined);

export function useDatastore() {
  const context = useContext(DatastoreContext);
  if (context === undefined) {
    throw new Error('useDatastore must be used within a DatastoreProvider');
  }
  return context;
}

const DEBUG_PREFIX = '🔍 [DatastoreContext]';

export function DatastoreProvider({ children }: { children: ReactNode }) {
  // Add a render counter to track how many times the component renders
  const renderCount = useRef(0);
  renderCount.current++;

  const { toast } = useToast();
  const [universeId, setUniverseId] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [datastores, setDatastores] = useState<{ name: string; createdTime: string }[]>([]);
  const [selectedDatastore, setSelectedDatastore] = useState('');
  const [selectedEntryKey, setSelectedEntryKey] = useState('');
  const [entryData, setEntryData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);

  // Use a ref to track live mode state to avoid unnecessary re-renders
  const liveMode = useRef(false);

  // Use a ref to track if we're currently fetching an entry
  const fetchingRef = useRef(false);

  // Tracks the previous datastore to prevent unnecessary re-renders
  const prevDatastoreRef = useRef<string>('');

  // Add a ref to track known deleted entries
  const deletedEntriesRef = useRef<Set<string>>(new Set());

  // Helper function for JSON fetching - moved up before it's used
  async function fetchJSON(url: string, options?: RequestInit) {
    // console.log('fetchJSON called with URL:', url);
    const res = await fetch(url, options);
    return res.json();
  }

  // Update the fetchEntries function to support searching
  const fetchEntries = useCallback(
    async (datastoreName: string, searchQuery?: string): Promise<string[]> => {
      // Don't set loading state if this is an automated/background refresh
      const isManualFetch = !liveMode.current;
      if (isManualFetch) {
        setIsLoading(true);
      }

      try {
        // Build the URL with search parameter if provided
        let baseUrl = `/api/datastores/${encodeURIComponent(
          datastoreName
        )}/entries?universeId=${universeId}`;
        if (searchQuery) {
          baseUrl += `&search=${encodeURIComponent(searchQuery)}`;
        }

        // Add a cache-busting parameter for live mode to prevent browser caching
        const finalUrl = liveMode.current ? `${baseUrl}&_t=${Date.now()}` : baseUrl;

        // Use fetch with headers instead of fetchJSON
        const response = await fetch(finalUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiToken, // Pass API token in header
          },
        });

        const data = await response.json();

        if (data.error) {
          console.error('API returned error:', data.error);
          if (isManualFetch) {
            toast('Failed to fetch entries: ' + data.error, 'error');
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

        // console.log('Parsed entries:', entries);

        return entries;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching entries:', message);
        if (isManualFetch) {
          toast('Failed to fetch entries: ' + message, 'error');
        }
        return [];
      } finally {
        if (isManualFetch) {
          setIsLoading(false);
        }
      }
    },
    [universeId, apiToken, toast]
  );

  // Updated setSelectedDatastoreWithCheck function
  const setSelectedDatastoreWithCheck = useCallback(
    (datastore: string) => {
      if (datastore !== prevDatastoreRef.current) {
        // Reset entry key and data when datastore changes
        setSelectedEntryKey('');
        setEntryData('');
        setSelectedVersion(null);

        // Update the selected datastore
        setSelectedDatastore(datastore);
        prevDatastoreRef.current = datastore;
      }
    },
    [setSelectedDatastore, setSelectedEntryKey, setEntryData]
  );

  // Updated setSelectedEntryKeyWithCheck function that uses current state values
  const setSelectedEntryKeyWithCheck = useCallback(
    (key: string) => {
      if (key === selectedEntryKey) {
        return;
      }
      setSelectedEntryKey(key);
    },
    [selectedEntryKey]
  );

  // Add this to your DatastoreProvider
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add this function to start/stop polling - now fetchEntries is defined before this
  const startPolling = useCallback(
    (datastoreName: string, intervalMs = 5000) => {
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
    },
    [fetchEntries]
  );

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
    const savedUniverseId = localStorage.getItem('universeId');
    const savedApiToken = localStorage.getItem('apiToken');

    if (savedUniverseId && savedApiToken) {
      setUniverseId(savedUniverseId);
      setApiToken(savedApiToken);
    }
  }, []);

  // Fetch a single entry from a datastore
  const fetchEntry = useCallback(
    async (datastoreName: string, key: string) => {
      // Create a composite key to track deleted entries
      const compositeKey = `${datastoreName}:${key}`;

      // Skip fetching if we already know this entry is deleted
      if (deletedEntriesRef.current.has(compositeKey)) {
        return {
          error: true,
          status: 404,
          message: 'Entry not found or has been deleted',
        };
      }

      if (fetchingRef.current) {
        return null;
      }

      fetchingRef.current = true;
      setIsLoading(true);

      try {
        const url = `/api/datastores/${encodeURIComponent(
          datastoreName
        )}/entry?universeId=${universeId}&entryKey=${encodeURIComponent(key)}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiToken,
          },
        });

        // Special handling for 404 errors (deleted entries)
        if (response.status === 404) {
          toast('Entry not found or has been deleted', 'error');
          setEntryData(''); // Clear entry data for deleted entries
          setSelectedVersion(null);
          // Mark this entry as deleted to prevent future fetch attempts
          deletedEntriesRef.current.add(compositeKey);
          return {
            error: true,
            status: 404,
            message: 'Entry not found or has been deleted',
          };
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // If we get here, the entry exists, so remove it from deleted entries if it was there
        deletedEntriesRef.current.delete(compositeKey);

        const result = await response.json();

        try {
          // Try to parse the data if it's JSON
          if (typeof result === 'string') {
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
          console.log('⚠️ Error formatting data, using as string:', e);
          setEntryData(String(result));
        }

        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        toast('Failed to fetch entry: ' + message, 'error');
        return null;
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    },
    [universeId, apiToken, toast]
  );

  // Update saveEntry to use headers
  const saveEntry = async (datastoreName: string, key: string, value: any) => {
    console.log('saveEntry called with datastoreName:', datastoreName, 'key:', key);
    setIsLoading(true);
    try {
      const body = {
        entryKey: key,
        value: value,
      };

      const url = `/api/datastores/${encodeURIComponent(
        datastoreName
      )}/entry?universeId=${universeId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiToken, // Pass API token in header
        },
        body: JSON.stringify(body),
      });

      const res = await response.json();

      if (res.error) {
        toast('Failed to save: ' + res.error, 'error');
      } else {
        toast('Entry saved successfully!', 'success');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast('Error saving entry: ' + message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Update deleteEntry to use headers
  const deleteEntry = async (datastoreName: string, key: string) => {
    console.log('deleteEntry called with datastoreName:', datastoreName, 'key:', key);
    setIsLoading(true);
    try {
      const url = `/api/datastores/${encodeURIComponent(
        datastoreName
      )}/entry?universeId=${universeId}&entryKey=${encodeURIComponent(key)}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiToken, // Pass API token in header
        },
      });

      const res = await response.json();

      if (res.error) {
        toast('Failed to delete: ' + res.error, 'error');
      } else {
        toast('Entry deleted successfully!', 'success');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast('Error deleting entry: ' + message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Update fetchDatastores to use headers
  const fetchDatastores = async () => {
    if (!universeId || !apiToken) {
      toast('Please enter Universe ID and API Token', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/datastores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiToken, // Pass API token in header
        },
        body: JSON.stringify({
          universeId,
          // No need to include apiToken in body since it's in the header
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast(data.error, 'error');
        return;
      }

      // Save credentials after successful connection
      localStorage.setItem('universeId', universeId);
      localStorage.setItem('apiToken', apiToken);
      setDatastores(data.datastores || []);
      toast('Successfully connected!', 'success');
    } catch (error) {
      toast('Failed to connect', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new datastore
  const createDatastore = async (datastoreName: string): Promise<boolean> => {
    console.log('createDatastore called with datastoreName:', datastoreName);
    setIsLoading(true);
    try {
      // Make sure we have all required parameters
      if (!datastoreName || !universeId || !apiToken) {
        console.error('Missing required parameters for datastore creation');
        toast('Missing required parameters for datastore creation', 'error');
        return false;
      }

      const res = await fetchJSON(`/api/datastores/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          universeId,
          apiToken, // Move API token to the request body
          datastoreName,
        }),
      });

      if (res.error) {
        toast('Failed to create datastore: ' + res.error, 'error');
        return false;
      } else {
        toast('Datastore created successfully!', 'success');
        // Add the new datastore to the list
        setDatastores([
          ...datastores,
          { name: datastoreName, createdTime: new Date().toISOString() },
        ]);
        return true;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast('Error creating datastore: ' + message, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCredentials = () => {
    console.log('clearCredentials called');
    setUniverseId('');
    setApiToken('');
    setDatastores([]);
    setSelectedDatastore('');
    setSelectedEntryKey('');
    setEntryData('');
    setSelectedVersion(null);
    localStorage.removeItem('universeId');
    localStorage.removeItem('apiToken');
    toast('Disconnected successfully', 'success');
  };

  // Fetch versions of an entry
  const fetchEntryVersions = useCallback(
    async (datastoreName: string, key: string) => {
      setIsLoading(true);
      try {
        const url = `/api/datastores/${encodeURIComponent(
          datastoreName
        )}/entry/versions?universeId=${universeId}&entryKey=${encodeURIComponent(key)}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiToken,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
          toast('Failed to fetch versions: ' + result.error, 'error');
          return [];
        }

        return result.versions || [];
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        toast('Failed to fetch entry versions: ' + message, 'error');
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [universeId, apiToken, toast]
  );

  // Fetch a specific version of an entry
  const fetchEntryVersion = useCallback(
    async (datastoreName: string, key: string, versionId: string) => {
      setIsLoading(true);
      try {
        console.log(`Fetching version ${versionId} of entry ${key} in datastore ${datastoreName}`);

        const url = `/api/datastores/${encodeURIComponent(
          datastoreName
        )}/entry/versions/version?universeId=${universeId}&entryKey=${encodeURIComponent(
          key
        )}&versionId=${encodeURIComponent(versionId)}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiToken,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // Handle empty string response
        let processedData = data;
        if (data === '') {
          processedData = {
            error: true,
            status: 404,
            message: 'Entry not found or has been deleted',
          };
        }
        console.log('Version data:', processedData);

        // Update the entry data with the version data
        if (processedData) {
          try {
            const formattedJson = JSON.stringify(processedData, null, 2);
            setEntryData(formattedJson);

            // Log the formatted JSON
            console.log('Formatted version data:', formattedJson);

            return processedData;
          } catch (err) {
            console.error('Error formatting version data:', err);
            return processedData;
          }
        }

        return null;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching entry version:', message);
        toast('Failed to fetch entry version: ' + message, 'error');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [universeId, apiToken, toast, setEntryData]
  );

  // Reset versions when selectedEntryKey changes
  useEffect(() => {
    setVersions([]);
    setSelectedVersion(null);
  }, [selectedEntryKey]);

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
        selectedVersion,
        setSelectedVersion,
        versions,
        setVersions,
        fetchDatastores,
        fetchEntries,
        fetchEntry,
        saveEntry,
        deleteEntry,
        isLoading,
        clearCredentials,
        createDatastore,
        fetchEntryVersions,
        fetchEntryVersion,
      }}
    >
      {children}
    </DatastoreContext.Provider>
  );
}

// Add this debounce utility function at the top of your file
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        resolve(func(...args));
      }, wait);
    });
  };
}
