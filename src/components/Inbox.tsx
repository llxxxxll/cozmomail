import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/data/mockData';

const Inbox: React.FC = () => {
  const { messages, refreshData } = useApp();

  // Set up real-time subscription for messages table
  useEffect(() => {
    const channel = supabase
      .channel('inbox-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Refresh data when any message changes
          refreshData();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshData]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <ul>
        {messages.map((message: Message) => (
          <li key={message.id}>
            <div>
              <strong>{message.subject}</strong>
              <p>{message.content}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Inbox;
