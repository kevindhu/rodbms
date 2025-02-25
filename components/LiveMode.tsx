"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Activity, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDatastore } from "@/contexts/DatastoreContext";
import { DataActivity } from "@/components/DataActivity";

export function LiveMode() {
  const [isLive, setIsLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [hasActivity, setHasActivity] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { selectedDatastore, fetchEntries } = useDatastore();

  useEffect(() => {
    if (isLive && selectedDatastore) {
      // Start polling
      intervalRef.current = setInterval(async () => {
        await fetchEntries(selectedDatastore);
        setLastUpdate(new Date());
        setUpdateCount(prev => prev + 1);
        
        // Show activity indicator
        setHasActivity(true);
        
        // Clear previous timeout
        if (activityTimeoutRef.current) {
          clearTimeout(activityTimeoutRef.current);
        }
        
        // Set activity to false after 1 second
        activityTimeoutRef.current = setTimeout(() => {
          setHasActivity(false);
        }, 1000);
        
        // Create a visual pulse effect
        const pulseEl = document.createElement('div');
        pulseEl.className = 'fixed inset-0 bg-primary/5 z-50 pointer-events-none animate-pulse-once';
        document.body.appendChild(pulseEl);
        
        setTimeout(() => {
          pulseEl.remove();
        }, 500);
        
      }, 5000); // Poll every 5 seconds
    } else if (intervalRef.current) {
      // Stop polling
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [isLive, selectedDatastore, fetchEntries]);

  // Stop live mode if datastore changes
  useEffect(() => {
    setIsLive(false);
  }, [selectedDatastore]);

  const toggleLiveMode = () => {
    setIsLive(!isLive);
    if (!isLive) {
      setUpdateCount(0);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={isLive ? "default" : "outline"}
        size="sm"
        onClick={toggleLiveMode}
        className={`gap-1.5 ${isLive ? 'animate-pulse-slow' : ''}`}
        disabled={!selectedDatastore}
      >
        {isLive ? (
          <>
            <Pause className="h-3.5 w-3.5" /> Stop Live
          </>
        ) : (
          <>
            <Activity className="h-3.5 w-3.5" /> Live Mode
          </>
        )}
      </Button>
      
      {isLive && (
        <>
          <Badge variant="outline" className="text-xs">
            {updateCount} updates
          </Badge>
          <DataActivity isActive={hasActivity} />
        </>
      )}
    </div>
  );
} 