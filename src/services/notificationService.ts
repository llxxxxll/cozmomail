
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/data/mockData";

// In a real application, this would be more sophisticated with proper WebSocket or Server-Sent Events
export const subscribeToNewMessages = (
  callback: (message: Message) => void,
  errorCallback: (error: Error) => void
) => {
  const subscription = supabase
    .channel('public:messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        try {
          // Convert database format to application format
          const message = {
            id: payload.new.id,
            customerId: payload.new.customer_id,
            channel: payload.new.channel,
            content: payload.new.content,
            subject: payload.new.subject,
            timestamp: payload.new.timestamp,
            isRead: payload.new.is_read,
            category: payload.new.category,
            isReplied: payload.new.is_replied,
            replyContent: payload.new.reply_content,
            replyTimestamp: payload.new.reply_timestamp
          };
          callback(message as Message);
        } catch (error) {
          errorCallback(error as Error);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription);
  };
};

export const showBrowserNotification = async (title: string, body: string, icon?: string) => {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return;
  }

  // Request permission if needed
  if (Notification.permission !== "granted") {
    await Notification.requestPermission();
  }

  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      body,
      icon: icon || '/favicon.ico'
    });

    notification.onclick = function () {
      window.focus();
      notification.close();
    };

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }
};
