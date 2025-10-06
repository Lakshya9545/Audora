'use client';

import { useState, useEffect } from 'react';
import { Bell, UserPlus, MessageSquare, Heart, AlertCircle, Loader2, CheckCircle } from 'lucide-react'; // Added CheckCircle
import {NotificationType,NotificationsApiResponse} from '@/lib/types' 
// Define a type for individual notifications


const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/api/notifications`, { credentials: 'include' });
        const contentType = response.headers.get("content-type");

        if (!response.ok) {
          let errorMessage = `Error: ${response.status} ${response.statusText}`;
          if (contentType && contentType.includes("application/json")) {
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
            } catch (jsonError) {
              // If parsing JSON error response fails, stick to status text
              console.error('Failed to parse JSON error response:', jsonError);
            }
          } else {
            // Attempt to read as text if not JSON, might be HTML error page
            const textError = await response.text();
            if (textError && textError.trim().toLowerCase().startsWith('<!doctype html')) {
              errorMessage = 'Server returned an HTML error page. Please check server logs for details.';
            } else if (textError) {
              errorMessage = textError.substring(0, 100); // Show a snippet of the text error
            }
          }
          throw new Error(errorMessage);
        }

        if (!contentType || !contentType.includes("application/json")) {
          throw new Error('Received non-JSON response from server. Please check API.');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch notifications (API indicated failure).');
        }

        // Map server notification shape to client-friendly NotificationType
        const mapType = (serverType: string) => {
          switch ((serverType || '').toUpperCase()) {
            case 'NEW_FOLLOWER':
              return 'new_follower';
            case 'NEW_POST':
              return 'new_post';
            case 'LIKE':
              return 'like';
            case 'COMMENT':
              return 'comment';
            default:
              return 'general';
          }
        };

        const mapped = (data.notifications || []).map((n: any) => {
          const type = mapType(n.type);
          const actor = n.triggerUser
            ? {
                id: n.triggerUser.id,
                username: n.triggerUser.username,
                avatarUrl: n.triggerUser.avatarUrl || null,
              }
            : undefined;

          // Build a simple human message for the client to render
          let message = '';
          if (type === 'new_follower') {
            message = `${actor?.username || 'Someone'} started following you.`;
          } else if (type === 'new_post') {
            message = `${actor?.username || 'Someone'} published a new post${n.post?.title ? `: ${n.post.title}` : ''}.`;
          } else if (type === 'like') {
            message = `${actor?.username || 'Someone'} liked your post${n.post?.title ? `: ${n.post.title}` : ''}.`;
          } else if (type === 'comment') {
            message = `${actor?.username || 'Someone'} commented on your post${n.post?.title ? `: ${n.post.title}` : ''}.`;
          } else {
            message = n.message || `${actor?.username || 'Someone'} sent a notification.`;
          }

          const link = n.post ? `/dashboard?post=${n.post.id}` : actor ? `/users/${actor.id}` : undefined;

          return {
            id: n.id,
            type,
            message,
            link,
            isRead: !!n.read,
            createdAt: n.createdAt,
            actor,
          } as any;
        });

        setNotifications(mapped);
      } catch (err: any) {
        // Catching JSON parsing errors specifically
        if (err instanceof SyntaxError && err.message.toLowerCase().includes('unexpected token')) {
            if (err.message.includes('<')) {
                 setError('Failed to parse server response: Expected JSON but received HTML. Check server logs.');
            } else {
                 setError('Failed to parse server response: Invalid JSON format. Check API.');
            }
        } else {
            setError(err.message || 'An unexpected error occurred while fetching notifications.');
        }
        console.error("Fetch notifications error:", err); // Log the full error for debugging
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

   const markAsRead = async (notificationId: string) => {
    // --- Optimistic UI Update ---
    // Store the original state in case we need to revert
    const originalNotifications = [...notifications];
    // Update the UI immediately for a responsive feel
    setNotifications(prevNotifications =>
      prevNotifications.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );

    try {
      // --- API Call ---
      const response = await fetch(`${apiUrl}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include', // Important for sending auth cookies
      });

      if (!response.ok) {
        // If the API call fails, throw an error to be caught below
        throw new Error('Failed to mark notification as read on the server.');
      }
      // Success! The UI is already updated.
    } catch (err) {
      console.error("Failed to mark as read:", err);
      // --- Revert UI on Failure ---
      // If the API call fails, revert the UI back to its original state
      setNotifications(originalNotifications);
      // Optionally, show an error toast to the user
      alert("Could not mark notification as read. Please try again.");
    }
  };

  // --- Functionality 2: Mark all notifications as read ---
  const handleMarkAllAsRead = async () => {
    setIsSubmitting(true);
    // --- Optimistic UI Update ---
    const originalNotifications = [...notifications];
    setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, isRead: true }))
    );

    try {
        // --- API Call ---
        const response = await fetch(`${apiUrl}/api/notifications/read-all`, {
            method: 'POST',
            credentials: 'include', // Important for auth
        });

        if (!response.ok) {
            throw new Error('Failed to mark all notifications as read on the server.');
        }
        // Success!
    } catch (err) {
        console.error("Failed to mark all as read:", err);
        // --- Revert UI on Failure ---
        setNotifications(originalNotifications);
        alert("Could not mark all notifications as read. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const getNotificationIcon = (type: NotificationType['type']) => {
    switch (type) {
      case 'new_follower':
        return <UserPlus className="h-5 w-5 text-richPurple" />;
      case 'new_post':
        return <Bell className="h-5 w-5 text-mutedGold" />;
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'mention':
        return <UserPlus className="h-5 w-5 text-green-500" />; // Example, choose appropriate
      default:
        return <Bell className="h-5 w-5 text-darkSlate" />;
    }
  };

  const timeSince = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };


  return (
    <div className="min-h-screen bg-[#F5F5DC] p-4 sm:p-6 lg:p-8"> {/* Main page background: Creamy Tan */}
      <div className="max-w-3xl mx-auto bg-[#FFFFFF] shadow-xl rounded-lg overflow-hidden"> {/* Main card: Bright White */}
        
        {/* Header Section */}
        <header className="border-b border-gray-200 p-4 sm:p-6 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#6A1B9A] flex items-center"> {/* Rich Purple text */}
            <Bell className="h-7 w-7 mr-3 text-[#D4AF37]" /> {/* Muted Gold icon */}
            Notifications
          </h1>
          {/* "Mark all as read" button, only shows if there are unread notifications */}
          {!isLoading && !error && notifications.some(n => !n.isRead) && (
            <button
                onClick={handleMarkAllAsRead}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-[#6A1B9A] border border-[#6A1B9A] rounded-md hover:bg-[#6A1B9A]/10 transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Mark all as read'}
            </button>
          )}
        </header>

        {/* Loading State */}
        {isLoading && (
          <div className="p-10 flex flex-col items-center justify-center text-[#2F3E46]"> {/* Dark Slate text */}
            <Loader2 className="h-12 w-12 animate-spin text-[#6A1B9A] mb-4" /> {/* Rich Purple spinner */}
            <p className="text-lg">Loading notifications...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-10 flex flex-col items-center justify-center text-red-600">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-lg font-semibold">Error loading notifications</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && notifications.length === 0 && (
          <div className="p-10 text-center text-[#2F3E46]">
            <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-xl font-semibold">No new notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        )}

        {/* Notifications List */}
        {!isLoading && !error && notifications.length > 0 && (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`p-4 sm:p-5 transition-colors duration-300 ${
                  notification.isRead ? 'bg-white opacity-60' : 'bg-[#F5F5DC]/50' // Unread has a Creamy Tan background
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Avatar or Icon */}
                  <div className="flex-shrink-0 pt-1">
                    {notification.actor?.avatarUrl ? (
                      <img src={notification.actor.avatarUrl} alt={notification.actor.username} className="h-10 w-10 rounded-full" />
                    ) : (
                      <span className="h-10 w-10 rounded-full bg-[#EAB5C5]/50 flex items-center justify-center"> {/* Dusty Rose icon background */}
                        {getNotificationIcon(notification.type)}
                      </span>
                    )}
                  </div>

                  {/* Notification Text */}
                  <div className="flex-1">
                    <p className={`text-sm ${notification.isRead ? 'text-[#2F3E46]' : 'text-[#212121] font-semibold'}`}> {/* Unread text is darker and bolder */}
                      {notification.actor && (
                        <a href={notification.link || '#'} className="font-bold text-[#6A1B9A] hover:underline">
                          {notification.actor.username}
                        </a>
                      )}{' '}
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {timeSince(notification.createdAt)}
                    </p>
                  </div>
                  
                  {/* "Mark as Read" Button for unread items */}
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                      className="p-1 rounded-full text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
