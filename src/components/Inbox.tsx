
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import InboxMessage from './InboxMessage';
import { Channel, MessageCategory } from '@/data/mockData';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  SendIcon, 
  SearchIcon,
  Filter
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CustomerProfile from './CustomerProfile';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const channelOptions: { value: Channel | 'all'; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All Channels', icon: MessageSquare },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'whatsapp', label: 'WhatsApp', icon: Phone },
  { value: 'instagram', label: 'Instagram', icon: MessageSquare },
  { value: 'facebook', label: 'Facebook', icon: MessageSquare }
];

const categoryOptions: { value: MessageCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'inquiry', label: 'Inquiry' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'support', label: 'Support' },
  { value: 'other', label: 'Other' }
];

const Inbox: React.FC = () => {
  const {
    messages,
    selectedMessageId,
    channelFilter,
    categoryFilter,
    searchQuery,
    setChannelFilter,
    setCategoryFilter,
    setSearchQuery,
    replyToMessage
  } = useApp();
  
  const [replyContent, setReplyContent] = useState<string>('');
  
  const filteredMessages = messages
    .filter(message => 
      (channelFilter === 'all' || message.channel === channelFilter) &&
      (categoryFilter === 'all' || message.category === categoryFilter) &&
      (
        searchQuery === '' || 
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (message.subject && message.subject.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  const selectedMessage = messages.find(message => message.id === selectedMessageId);
  
  const handleChannelFilterChange = (value: string) => {
    setChannelFilter(value as Channel | 'all');
  };
  
  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value as MessageCategory | 'all');
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSendReply = () => {
    if (selectedMessageId && replyContent.trim()) {
      replyToMessage(selectedMessageId, replyContent);
      setReplyContent('');
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
          <div className="relative w-full sm:w-80">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..." 
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background">
                <DropdownMenuLabel>Channel</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={channelFilter} onValueChange={handleChannelFilterChange}>
                  {channelOptions.map(option => (
                    <DropdownMenuRadioItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>Category</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={categoryFilter} onValueChange={handleCategoryFilterChange}>
                  {categoryOptions.map(option => (
                    <DropdownMenuRadioItem key={option.value} value={option.value}>
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center gap-1">
              {channelFilter !== 'all' && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "gap-1",
                    channelFilter === 'email' && "channel-badge-email",
                    channelFilter === 'whatsapp' && "channel-badge-whatsapp",
                    channelFilter === 'instagram' && "channel-badge-instagram",
                    channelFilter === 'facebook' && "channel-badge-facebook"
                  )}
                >
                  {channelOptions.find(option => option.value === channelFilter)?.label}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 p-0 ml-1" 
                    onClick={() => setChannelFilter('all')}
                  >
                    &times;
                  </Button>
                </Badge>
              )}
              
              {categoryFilter !== 'all' && (
                <Badge variant="outline">
                  {categoryOptions.find(option => option.value === categoryFilter)?.label}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 p-0 ml-1" 
                    onClick={() => setCategoryFilter('all')}
                  >
                    &times;
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          {filteredMessages.length > 0 ? (
            filteredMessages.map(message => (
              <InboxMessage 
                key={message.id} 
                message={message} 
                isSelected={message.id === selectedMessageId} 
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium">No messages found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "Try adjusting your search or filters"
                      : "Your inbox is empty or no messages match the current filters"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <div className="lg:col-span-1">
        {selectedMessage ? (
          <div className="space-y-4">
            <CustomerProfile customerId={selectedMessage.customerId} />
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Reply</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="thank-you">Thank you for your inquiry</SelectItem>
                      <SelectItem value="order-status">Order Status Update</SelectItem>
                      <SelectItem value="product-info">Product Information</SelectItem>
                      <SelectItem value="support">Technical Support</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Textarea 
                    placeholder="Type your reply here..." 
                    className="min-h-32"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full gap-2" 
                  onClick={handleSendReply}
                  disabled={!replyContent.trim()}
                >
                  <SendIcon className="h-4 w-4" />
                  Send Reply
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-3">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">No message selected</h3>
                <p className="text-muted-foreground">
                  Select a message from the inbox to view details and reply
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Inbox;
