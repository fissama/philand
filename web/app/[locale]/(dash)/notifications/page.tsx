'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  const fetchNotifications = async () => {
    try {
      const data = await apiRequest<Notification[]>('/api/notifications?limit=50');
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
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-24 md:pb-6">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="md:hidden h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary" />
                {t('notifications.title')}
              </h1>
            </div>
          </div>
          
          {/* Stats and Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {unreadCount > 0 ? (
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {unreadCount} new
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>All caught up!</span>
                </div>
              )}
            </div>
            
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={markingAllRead}
                className="h-8 text-xs"
              >
                {markingAllRead ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                )}
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="container max-w-4xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <Bell className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('notifications.noNotifications')}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {t('notifications.allCaughtUp')} We'll notify you when something new happens.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "group relative rounded-xl border p-4 cursor-pointer transition-all active:scale-[0.98]",
                  !notification.is_read 
                    ? "bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-950/30 dark:to-blue-950/10 border-blue-200 dark:border-blue-900 shadow-sm hover:shadow-md" 
                    : "bg-card hover:bg-muted/50 hover:shadow-sm"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Unread Indicator */}
                {!notification.is_read && (
                  <div className="absolute top-4 right-4">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-blue-100 dark:ring-blue-900" />
                  </div>
                )}
                
                <div className="pr-6">
                  {/* Title */}
                  <h3 className={cn(
                    "text-sm leading-tight mb-2",
                    !notification.is_read ? "font-semibold" : "font-medium"
                  )}>
                    {notification.title}
                  </h3>
                  
                  {/* Message */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {notification.message}
                  </p>
                  
                  {/* Timestamp */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                    {!notification.is_read && (
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        • New
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Hover Arrow Indicator */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowLeft className="h-3.5 w-3.5 rotate-180 text-primary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
