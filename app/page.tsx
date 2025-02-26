"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomToastProvider } from "@/components/ui/toast";
import { DatastoreProvider, useDatastore } from "@/contexts/DatastoreContext";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Credits } from "@/components/Credits";
import { LiveMode } from "@/components/LiveMode";
import EntryList from "@/components/EntryList";
import EntryDetailEditor from "@/components/EntryDetailEditor";
import { WelcomeModal } from "@/components/WelcomeModal";
import { OnboardingTour } from "@/components/OnboardingTour";
import { Loader2, Database, Key, Server, LogOut, CheckCircle2, Plus } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { StatusBar } from "@/components/StatusBar";
import { Badge } from "@/components/ui/badge";
import { QuickActionBar } from "@/components/QuickActionBar";
import { DataVisualizer } from "@/components/DataVisualizer";
import { NotificationCenter } from "@/components/NotificationCenter";
// import { CommandPalette } from "@/components/CommandPalette";
import { RecentActivity } from "@/components/RecentActivity";

export default function Home() {
  return (
    <CustomToastProvider>
      <DatastoreProvider>
        <WelcomeModal />
        {/* <OnboardingTour /> */}
        <NotificationCenter />
        {/* Temporarily disabled due to issues */}
        {/* <CommandPalette /> */}
        <main className="min-h-screen bg-background">
          <div className="container mx-auto p-4">
            <DatastoreManager />
          </div>
        </main>
        <StatusBar />
      </DatastoreProvider>
    </CustomToastProvider>
  );
}

function DatastoreManager() {
  const {
    universeId,
    setUniverseId,
    apiToken,
    setApiToken,
    datastores,
    fetchDatastores,
    selectedDatastore,
    setSelectedDatastore,
    isLoading,
    clearCredentials
  } = useDatastore();
  
  const { toast } = useToast();
  const [newDatastoreName, setNewDatastoreName] = useState("");
  const [isCreatingDatastore, setIsCreatingDatastore] = useState(false);
  
  const handleConnect = async () => {
    if (!universeId || !apiToken) {
      toast("Please enter both Universe ID and API Token", "error");
      return;
    }
    
    try {
      await fetchDatastores();
    } catch (error) {
      console.error("Failed to fetch datastores:", error);
    }
  };
  
  const handleDatastoreSelect = (name: string) => {
    setSelectedDatastore(name);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Roblox Datastore Manager</h1>
        <div className="flex items-center gap-2">
          <LiveMode />
          <ThemeToggle />
        </div>
      </div>
      
      {!datastores.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect to Datastore</CardTitle>
            <CardDescription>
              Enter your Roblox Universe ID and API Token to connect
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="universe-id-input" className="text-sm font-medium">
                Universe ID
              </label>
              <Input
                id="universe-id-input"
                value={universeId}
                onChange={(e) => setUniverseId(e.target.value)}
                placeholder="Enter your Universe ID"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="api-token-input" className="text-sm font-medium">
                API Token
              </label>
              <Input
                id="api-token-input"
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Enter your API Token"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              id="connect-button"
              onClick={handleConnect} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Connect
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Datastores</CardTitle>
                  <Badge variant="outline" className="font-normal">
                    {datastores.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-1" id="datastore-list">
                <div className="space-y-2">
                  {datastores.map((datastore) => (
                    <Button
                      key={datastore.name}
                      variant={datastore.name === selectedDatastore ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleDatastoreSelect(datastore.name)}
                    >
                      <Database className="mr-2 h-4 w-4" />
                      {datastore.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <div className="flex gap-2 w-full">
                  <Input
                    placeholder="New datastore name"
                    value={newDatastoreName}
                    onChange={(e) => setNewDatastoreName(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    disabled={!newDatastoreName || isCreatingDatastore}
                    onClick={async () => {
                      setIsCreatingDatastore(true);
                      try {
                        // Add your create datastore logic here
                        toast("Datastore created successfully!", "success");
                        setNewDatastoreName("");
                        await fetchDatastores();
                      } catch (error) {
                        toast("Failed to create datastore", "error");
                      } finally {
                        setIsCreatingDatastore(false);
                      }
                    }}
                  >
                    {isCreatingDatastore ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={clearCredentials}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              </CardFooter>
            </Card>
            
            {/* RecentActivity component doesn't accept className prop directly
            <div className="mt-6">
              <RecentActivity />
            </div> */}
          </div>
          
          <div className="col-span-9">
            <Tabs defaultValue="entries" className="h-full flex flex-col">
              {/* <TabsList>
                <TabsTrigger value="entries">Entries</TabsTrigger>
                <TabsTrigger value="visualize">Visualize</TabsTrigger>
              </TabsList> */}
              
              <TabsContent value="entries" className="flex-1">
                <div className="grid grid-cols-12 gap-6 h-full">
                  <div className="col-span-4" id="entry-list">
                    {/* <QuickActionBar /> */}
                    <EntryList />
                  </div>
                  <div className="col-span-8" id="entry-editor">
                    <EntryDetailEditor />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="visualize">
                {/* <DataVisualizer /> */}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      <Credits />
    </div>
  );
}
