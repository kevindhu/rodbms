"use client";

import { useDatastore } from "@/contexts/DatastoreContext";
import { Credits } from "@/components/Credits";
import { Clock, Database, Server } from "lucide-react";
import { useState, useEffect } from "react";

export function StatusBar() {
  const { 
    universeId, 
    selectedDatastore, 
    isLoading 
  } = useDatastore();
  
  // Use state for the current time to avoid hydration errors
  const [currentTime, setCurrentTime] = useState<string>("");
  
  // Update the time on the client side only
  useEffect(() => {
    // Set initial time
    setCurrentTime(new Date().toLocaleString('en-US'));
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('en-US'));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 bg-secondary/80 backdrop-blur-sm border-t flex items-center px-4 text-xs text-muted-foreground z-50">
      <div className="flex-1 flex items-center gap-4">
        {universeId && (
          <div className="flex items-center gap-1.5">
            <Server className="h-3 w-3" />
            <span>Universe: {universeId}</span>
          </div>
        )}
        
        {selectedDatastore && (
          <div className="flex items-center gap-1.5">
            <Database className="h-3 w-3" />
            <span>Datastore: {selectedDatastore}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          <span>{currentTime}</span>
        </div>
        
        {isLoading && (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
            <span>Loading...</span>
          </div>
        )}
      </div>
      

    </div>
  );
} 