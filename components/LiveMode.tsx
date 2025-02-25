"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDatastore } from "@/contexts/DatastoreContext";
import { DataActivity } from "@/components/DataActivity";

export function LiveMode() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const [hasActivity, setHasActivity] = useState(false);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { selectedDatastore, fetchEntries } = useDatastore();

  const handleManualRefresh = async () => {
    if (!selectedDatastore || isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      await fetchEntries(selectedDatastore);
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
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleManualRefresh}
        disabled={isRefreshing || !selectedDatastore}
      >
        <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      
      {updateCount > 0 && (
        <Badge variant="outline" className="text-xs">
          {updateCount} updates
        </Badge>
      )}
      
      {hasActivity && <DataActivity isActive={false} />}
    </div>
  );
} 