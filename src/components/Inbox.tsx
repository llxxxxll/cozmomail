
import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/data/mockData';
import { format } from 'date-fns';
import InboxMessage from './InboxMessage';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail,
  MailOpen, 
  MessageCircle, 
  ChevronLeft,
  Search,
  RefreshCw,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const Inbox: React.FC = () => {
  const { messages, refreshData, markMessageAsRead, selectedMessageId, setSelectedMessageId } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

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

  // Handle refreshing data
  const handleRefresh = async () => {
    setLoading(true);
    await refreshData();
    setLoading(false);
  };

  // Handle message selection
  const handleSelectMessage = (messageId: string) => {
    setSelectedMessageId(messageId);
    markMessageAsRead(messageId);
  };

  // Handle back button
  const handleBackToList = () => {
    setSelectedMessageId(null);
  };

  // Filter messages based on search query
  const filteredMessages = searchQuery 
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
        msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  // Get the selected message
  const selectedMessage = selectedMessageId 
    ? messages.find(msg => msg.id === selectedMessageId) 
    : null;

  // Render message item
  const renderMessageItem = (message: Message) => {
    const isUnread = !message.isRead;
    const truncatedContent = message.content.length > 100 
      ? `${message.content.substring(0, 100)}...` 
      : message.content;
    
    return (
      <div 
        key={message.id}
        className={`
          p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 
          cursor-pointer transition-colors ${isUnread ? 'bg-gray-50 dark:bg-gray-900/50' : ''}
        `}
        onClick={() => handleSelectMessage(message.id)}
      >
        <div className="flex items-start gap-3">
          <div className="mt-1">
            {isUnread ? (
              <Mail className="h-5 w-5 text-blue-500" />
            ) : (
              <MailOpen className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`text-sm font-medium ${isUnread ? 'font-semibold' : ''} truncate`}>
                {message.subject || '(No subject)'}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                {message.timestamp ? format(new Date(message.timestamp), 'MMM d') : ''}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="capitalize">
                {message.channel}
              </Badge>
              {message.category && (
                <Badge variant="secondary" className="capitalize">
                  {message.category}
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {truncatedContent}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      {selectedMessageId && selectedMessage ? (
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBackToList}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Inbox
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <InboxMessage message={selectedMessage} />
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Inbox</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter messages</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Card className="flex-1 overflow-hidden border">
            <CardContent className="p-0 h-full overflow-auto">
              {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
                  {searchQuery ? (
                    <>
                      <h3 className="text-lg font-medium mb-1">No messages found</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Try adjusting your search terms
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium mb-1">Your inbox is empty</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        New messages will appear here
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  {filteredMessages.map(renderMessageItem)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Inbox;
