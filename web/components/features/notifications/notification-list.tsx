'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  user_id: string;
  budget_id: string;
  notification_type: string;
  title: string;
  message: string;
  link_url: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

interface NotificationListProps {
  onNotificationRead: () => void;
  onClose: () => void;
}

export function NotificationList({ onNotificationRead, onClose }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const data = await apiRequest<Notification[]>('/api/notifications?limit=20');
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await apiRequest('/api/notifications/mark-read', {
        method: 'POST',
        body: { notification_ids: [notificationId] },
      });
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      onNotificationRead();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAllRead(true);
    try {
      await apiRequest('/api/notifications/mark-all-read', {
        method: 'POST',
      });
      
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      onNotificationRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    if (notification.link_url) {
      router.push(notification.link_url);
      onClose();
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex flex-col h-full max-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            disabled={markingAllRead}
            className="h-8 text-xs"
          >
            {markingAllRead ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <CheckCheck className="h-3 w-3 mr-1" />
            )}
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <Bell className="h-12 w-12 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground font-medium">No notifications</p>
            <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                  !notification.is_read && "bg-blue-50/50 dark:bg-blue-950/20"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium leading-tight">
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
