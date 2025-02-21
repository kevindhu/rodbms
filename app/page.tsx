"use client";

import type React from "react";
import { useState, createContext, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import EntryList from "@/components/EntryList";
import EntryDetailEditor from "@/components/EntryDetailEditor";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// Toast context and hook
type ToastType = "success" | "error" | "info";

interface Toast {
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type: ToastType) => void;
  toasts: Toast[];
  removeToast: (index: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Toast component
const Toast: React.FC<{
  message: string;
  type: ToastType;
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <div className={`${bgColor} text-white p-3 rounded-md shadow-md mb-2`}>
      {message}
    </div>
  );
};

export default function HomePage() {
  const [universeId, setUniverseId] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [datastores, setDatastores] = useState<any[]>([]);
  const [selectedDatastore, setSelectedDatastore] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedEntryKey, setSelectedEntryKey] = useState<string>("");
  const [entryData, setEntryData] = useState<string>("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (message: string, type: ToastType) => {
    setToasts((prev) => [...prev, { message, type }]);
  };

  const removeToast = (index: number) => {
    setToasts((prev) => prev.filter((_, i) => i !== index));
  };

  async function fetchJSON(url: string, options?: RequestInit) {
    const res = await fetch(url, options);
    return res.json();
  }

  const handleListDatastores = async () => {
    if (!universeId || !apiToken) {
      toast("Please enter Universe ID and API Token", "error");
      return;
    }

    try {
      const data = await fetchJSON(
        `/api/datastores?universeId=${universeId}&apiToken=${apiToken}`
      );

      if (data.error) {
        toast("Invalid credentials or Universe ID", "error");
        return;
      }

      // Save valid credentials to localStorage
      localStorage.setItem("universeId", universeId);
      localStorage.setItem("apiToken", apiToken);

      setDatastores(data.datastores || []);
      setSelectedDatastore("");
      setEntries([]);
      setSelectedEntryKey("");

      toast("Successfully connected!", "success");
    } catch (error: any) {
      toast("Failed to connect: " + error.message, "error");
    }
  };

  const handleSelectDatastore = async (name: string) => {
    setSelectedDatastore(name);
    const data = await fetchJSON(
      `/api/datastores/${encodeURIComponent(name)}?universeId=${universeId}&apiToken=${apiToken}`
    );
    setEntries(data.entries || []);
    setSelectedEntryKey("");
  };

  const handleSelectEntry = async (key: string) => {
    setSelectedEntryKey(key);
    const url = `/api/datastores/${encodeURIComponent(
      selectedDatastore
    )}/entry?universeId=${universeId}&apiToken=${apiToken}&entryKey=${key}`;
    const data = await fetchJSON(url);
    if (data.error) {
      toast("Failed to fetch entry: " + data.error, "error");
      return;
    }
    setEntryData(JSON.stringify(data, null, 2));
  };

  const handleSaveEntry = async () => {
    try {
      const parsedValue = JSON.parse(entryData);
      const body = {
        entryKey: selectedEntryKey,
        value: parsedValue,
      };
      const res = await fetchJSON(
        `/api/datastores/${encodeURIComponent(selectedDatastore)}/entry?universeId=${universeId}&apiToken=${apiToken}`,
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
      toast("JSON parse error: " + err, "error");
    }
  };

  useEffect(() => {
    const savedUniverseId = localStorage.getItem("universeId");
    const savedApiToken = localStorage.getItem("apiToken");

    if (savedUniverseId && savedApiToken) {
      setUniverseId(savedUniverseId);
      setApiToken(savedApiToken);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Roblox DBMS
          </h1>

          <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500">
              <CardTitle className="text-white">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Universe ID"
                  value={universeId}
                  onChange={(e) => setUniverseId(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="password"
                  placeholder="API Token"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleListDatastores}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white transition-all duration-300"
                >
                  List Datastores
                </Button>
              </div>
            </CardContent>
          </Card>

          {datastores.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500">
                  <CardTitle className="text-white">Datastores</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {datastores.map((ds) => (
                      <Button
                        key={ds.name}
                        onClick={() => handleSelectDatastore(ds.name)}
                        variant={selectedDatastore === ds.name ? "secondary" : "outline"}
                        className="w-full justify-start text-left"
                      >
                        {ds.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="md:col-span-2">
                <Tabs defaultValue="entries" className="w-full">
                  <TabsList className="w-full justify-start mb-4">
                    <TabsTrigger value="entries">Entries</TabsTrigger>
                    <TabsTrigger value="editor" disabled={!selectedEntryKey}>
                      Editor
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="entries">
                    <EntryList
                      universeId={universeId}
                      apiToken={apiToken}
                      datastoreName={selectedDatastore}
                      selectedEntryKey={selectedEntryKey}
                      onSelectEntry={handleSelectEntry}
                    />
                  </TabsContent>

                  <TabsContent value="editor">
                    {selectedEntryKey && (
                      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500">
                          <CardTitle className="text-white">Editing: {selectedEntryKey}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <MonacoEditor
                            height="400px"
                            language="json"
                            theme="vs-dark"
                            value={entryData}
                            onChange={(value) => setEntryData(value || "")}
                            options={{
                              minimap: { enabled: false },
                              scrollBeyondLastLine: false,
                              fontSize: 14,
                            }}
                          />
                          <Button
                            onClick={handleSaveEntry}
                            className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white transition-all duration-300"
                          >
                            Save Changes
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
        <div className="fixed bottom-4 right-4 space-y-2">
          {toasts.map((toast, index) => (
            <Toast
              key={index}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(index)}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
