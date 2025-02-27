
import React from 'react';
import { useApp } from '@/context/AppContext';
import { Message, getChannelIcon } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CheckIcon, XIcon, TagIcon } from 'lucide-react';
import { 
  Card,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface InboxMessageProps {
  message: Message;
  isSelected: boolean;
}

const InboxMessage: React.FC<InboxMessageProps> = ({ message, isSelected }) => {
  const { 
    setSelectedMessageId, 
    markMessageAsRead,
    categorizeMessage
  } = useApp();
  
  // With the new Supabase structure, customer details are included in the message
  const customer = message.customers;
  const ChannelIcon = getChannelIcon(message.channel);
  
  const handleMessageClick = () => {
    setSelectedMessageId(message.id);
    if (!message.is_read) {
      markMessageAsRead(message.id);
    }
  };
  
  const getChannelBadgeClass = () => {
    switch (message.channel) {
      case 'email':
        return 'channel-badge-email';
      case 'whatsapp':
        return 'channel-badge-whatsapp';
      case 'instagram':
        return 'channel-badge-instagram';
      case 'facebook':
        return 'channel-badge-facebook';
      default:
        return '';
    }
  };
  
  const formattedDate = format(new Date(message.timestamp), 'MMM d, h:mm a');
  
  const getCategoryLabel = (category?: string) => {
    if (!category) return 'Uncategorized';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };
  
  const handleCategoryChange = (category: any) => {
    categorizeMessage(message.id, category);
  };

  return (
    <Card 
      className={cn(
        "mb-2 transition-all duration-200 hover:shadow-md cursor-pointer border",
        isSelected ? "border-brand-400 shadow-sm" : "hover:border-gray-300",
        !message.is_read && "bg-brand-50 dark:bg-brand-900/10"
      )}
      onClick={handleMessageClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 mt-1">
            <AvatarImage src={customer?.avatar_url || ""} alt={customer?.name} />
            <AvatarFallback>{customer?.name?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "font-medium truncate",
                !message.is_read && "font-semibold"
              )}>
                {customer?.name || 'Unknown Customer'}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{formattedDate}</span>
              
              <div className="ml-auto flex items-center gap-2">
                <span className={cn(
                  "channel-badge flex items-center gap-1",
                  getChannelBadgeClass()
                )}>
                  <ChannelIcon className="h-3 w-3" />
                  <span className="capitalize">{message.channel}</span>
                </span>
                
                {message.category && (
                  <Badge variant="outline" className="text-xs">
                    {getCategoryLabel(message.category)}
                  </Badge>
                )}
                
                {message.is_replied ? (
                  <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
                    <CheckIcon className="h-3 w-3 mr-1" />
                    Replied
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                    <XIcon className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
            
            {message.subject && (
              <div className="text-sm font-medium mb-1">{message.subject}</div>
            )}
            
            <div className={cn(
              "text-sm line-clamp-2",
              !message.is_read ? "text-foreground" : "text-muted-foreground"
            )}>
              {message.content}
            </div>
            
            <div className="flex justify-between mt-2">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8" onClick={(e) => e.stopPropagation()}>
                  Reply
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-8">
                      <TagIcon className="h-4 w-4 mr-1" />
                      Categorize
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-background">
                    <DropdownMenuLabel>Choose Category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleCategoryChange('inquiry')}>
                      Inquiry
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCategoryChange('complaint')}>
                      Complaint
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCategoryChange('feedback')}>
                      Feedback
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCategoryChange('support')}>
                      Support
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCategoryChange('other')}>
                      Other
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InboxMessage;
