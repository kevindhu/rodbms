"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomToastProvider } from "@/components/ui/toast";
import { DatastoreProvider, useDatastore } from "@/contexts/DatastoreContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Credits } from "@/components/Credits";
import { LiveMode } from "@/components/LiveMode";
import EntryList from "@/components/EntryList";
import EntryDetailEditor from "@/components/EntryDetailEditor";
import { Loader2, Database, Key, Server, LogOut, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { StatusBar } from "@/components/StatusBar";
import { Badge } from "@/components/ui/badge";
import { CreateDatastore } from "@/components/CreateDatastore";

function DatastoreManager() {
  const { 
    universeId, 
    setUniverseId, 
    apiToken, 
    setApiToken, 
    fetchDatastores,
    datastores,
    selectedDatastore,
    setSelectedDatastore,
    selectedEntryKey,
    isLoading,
    clearCredentials
  } = useDatastore();

  // Track if we're actually connected (have datastores)
  const isConnected = datastores.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Header with connection info */}
      <Card className="lg:col-span-12 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-semibold">Roblox Database Management System</CardTitle>
            <CardDescription>
              {isConnected ? (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 animate-pulse-slow" /> 
                  <span>Connected to Universe: {universeId}</span>
                </span>
              ) : (
                "Connect to your Roblox universe"
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isConnected && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearCredentials}
                className="text-xs flex items-center gap-1"
              >
                <LogOut className="h-3.5 w-3.5" /> Disconnect
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Connection form */}
      <Card className={`lg:col-span-12 shadow-sm ${isConnected ? 'border-green-500/30' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            Connection Settings
            {isConnected && (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                Connected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <label htmlFor="universeId" className="text-sm font-medium block mb-1.5">
                Universe ID
              </label>
              <Input
                id="universeId"
                value={universeId}
                onChange={(e) => setUniverseId(e.target.value)}
                placeholder="Enter Universe ID"
                className={`w-full ${isConnected ? 'border-green-500/30' : ''}`}
              />
            </div>
            <div className="md:col-span-6">
              <label htmlFor="apiToken" className="text-sm font-medium block mb-1.5">
                API Token
              </label>
              <Input
                id="apiToken"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                type="password"
                placeholder="Enter API Token"
                className={`w-full ${isConnected ? 'border-green-500/30' : ''}`}
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <Button 
                onClick={fetchDatastores} 
                disabled={isLoading || !universeId || !apiToken}
                className="w-full"
                variant={isConnected ? "outline" : "default"}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : isConnected ? (
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                {isConnected ? "Refresh Connection" : "Connect"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datastores selection */}
      {isConnected && (
        <Card className="lg:col-span-12 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">Datastores</CardTitle>
            <CreateDatastore />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {datastores.map((ds) => (
                <Button
                  key={ds}
                  variant={selectedDatastore === ds ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDatastore(ds)}
                  className="text-sm"
                >
                  {ds}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main content area */}
      {selectedDatastore && (
        <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <EntryList />
          </div>
          <div className="lg:col-span-8">
            {selectedEntryKey ? (
              <EntryDetailEditor />
            ) : (
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
            )}
          </div>
        </div>
      )}
      
      {/* Footer with credits */}
      <div className="lg:col-span-12 flex justify-center mt-4">
        <Credits />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ThemeProvider>
      <CustomToastProvider>
        <DatastoreProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200 pb-12">
            <div className="max-w-7xl mx-auto">
              <DatastoreManager />
            </div>
          </div>
          <StatusBar />
        </DatastoreProvider>
      </CustomToastProvider>
    </ThemeProvider>
  );
}
