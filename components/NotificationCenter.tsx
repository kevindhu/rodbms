'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Demo notifications
  useEffect(() => {
    setNotifications([
      {
        id: '1',
        title: 'Welcome to DBMS',
        message: 'You are awesome for using this tool!',
        timestamp: new Date(),
        read: false,
        type: 'info',
      },
    ]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="mb-4">
          <SheetTitle className="flex justify-between items-center">
            Notifications
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear all
              </Button>
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)]">
          {notifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No notifications</div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.read ? 'bg-background' : 'bg-muted/50'
                  } ${
                    notification.type === 'success'
                      ? 'border-green-200 dark:border-green-800'
                      : notification.type === 'warning'
                      ? 'border-yellow-200 dark:border-yellow-800'
                      : notification.type === 'error'
                      ? 'border-red-200 dark:border-red-800'
                      : 'border-blue-200 dark:border-blue-800'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex justify-between">
                    <h4 className="font-medium">{notification.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {notification.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{notification.message}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
