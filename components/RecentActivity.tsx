"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Edit, Save, Trash, Plus, RefreshCw, 
  Download, Upload, Clock 
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

type Activity = {
  id: string;
  action: "create" | "edit" | "save" | "delete" | "refresh" | "export" | "import";
  datastore: string;
  entryKey?: string;
  timestamp: Date;
};

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  
  // Demo activities
  useEffect(() => {
    setActivities([
      {
        id: "1",
        action: "save",
        datastore: "PlayerData",
        entryKey: "user_12345",
        timestamp: new Date(Date.now() - 5 * 60000)
      },
      {
        id: "2",
        action: "edit",
        datastore: "GameSettings",
        entryKey: "map_config",
        timestamp: new Date(Date.now() - 15 * 60000)
      },
      {
        id: "3",
        action: "create",
        datastore: "Leaderboards",
        entryKey: "weekly_scores",
        timestamp: new Date(Date.now() - 60 * 60000)
      },
      {
        id: "4",
        action: "delete",
        datastore: "TestData",
        entryKey: "temp_entry",
        timestamp: new Date(Date.now() - 2 * 60 * 60000)
      },
      {
        id: "5",
        action: "refresh",
        datastore: "PlayerData",
        timestamp: new Date(Date.now() - 3 * 60 * 60000)
      }
    ]);
  }, []);
  
  const getActionIcon = (action: Activity["action"]) => {
    switch (action) {
      case "create": return <Plus className="h-4 w-4 text-green-500" />;
      case "edit": return <Edit className="h-4 w-4 text-blue-500" />;
      case "save": return <Save className="h-4 w-4 text-green-500" />;
      case "delete": return <Trash className="h-4 w-4 text-red-500" />;
      case "refresh": return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case "export": return <Download className="h-4 w-4 text-purple-500" />;
      case "import": return <Upload className="h-4 w-4 text-orange-500" />;
    }
  };
  
  const getActionText = (activity: Activity) => {
    switch (activity.action) {
      case "create": 
        return `Created entry "${activity.entryKey}" in ${activity.datastore}`;
      case "edit": 
        return `Edited entry "${activity.entryKey}" in ${activity.datastore}`;
      case "save": 
        return `Saved entry "${activity.entryKey}" in ${activity.datastore}`;
      case "delete": 
        return `Deleted entry "${activity.entryKey}" from ${activity.datastore}`;
      case "refresh": 
        return `Refreshed ${activity.datastore} datastore`;
      case "export": 
        return `Exported ${activity.datastore} datastore`;
      case "import": 
        return `Imported data to ${activity.datastore} datastore`;
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-4 w-4" /> Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="mt-0.5">{getActionIcon(activity.action)}</div>
                <div className="flex-1">
                  <p className="text-sm">{getActionText(activity)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 