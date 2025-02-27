
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import InboxMessage from './InboxMessage';
import { Channel, MessageCategory } from '@/data/mockData';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter,
  CardDescription
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  Filter,
  Loader2,
  BellRing,
  BellOff,
  PaperclipIcon
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
import FileUploader from './FileUploader';
import AttachmentComponent from './Attachment';

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
    responseTemplates,
    selectedMessageId,
    channelFilter,
    categoryFilter,
    searchQuery,
    setChannelFilter,
    setCategoryFilter,
    setSearchQuery,
    replyToMessage,
    isLoading,
    error,
    refreshData,
    notifications,
    toggleNotifications,
    uploadAttachments,
    removeAttachment
  } = useApp();
  
  const [replyContent, setReplyContent] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [showAttachments, setShowAttachments] = useState<boolean>(false);
  
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
  
  const handleSendReply = async () => {
    if (selectedMessageId && replyContent.trim()) {
      setIsReplying(true);
      
      try {
        await replyToMessage(selectedMessageId, replyContent);
        setReplyContent('');
        setSelectedTemplateId('');
        setShowAttachments(false);
      } catch (err) {
        console.error('Error sending reply:', err);
      } finally {
        setIsReplying(false);
      }
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId) {
      const template = responseTemplates.find(t => t.id === templateId);
      if (template) {
        setReplyContent(template.content);
      }
    }
  };
  
  const handleFileUpload = async (files: File[]) => {
    if (!selectedMessageId || files.length === 0) return [];
    
    try {
      const attachments = await uploadAttachments(selectedMessageId, files);
      return attachments;
    } catch (error) {
      console.error('Error uploading files:', error);
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading messages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Error loading messages</h3>
        <p className="text-red-600 dark:text-red-400">{error.message}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={refreshData}
        >
          Retry
        </Button>
      </div>
    );
  }
  
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
            
            <div className="flex items-center ml-auto">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleNotifications}
                className={cn(
                  "h-9 w-9",
                  notifications && "text-green-500"
                )}
              >
                {notifications ? (
                  <BellRing className="h-5 w-5" />
                ) : (
                  <BellOff className="h-5 w-5" />
                )}
              </Button>
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
                  <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {responseTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Textarea 
                    placeholder="Type your reply here..." 
                    className="min-h-32"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                  
                  {/* Attachments section */}
                  {showAttachments ? (
                    <div className="border rounded-md p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium">Attachments</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowAttachments(false)}
                        >
                          Hide
                        </Button>
                      </div>
                      <FileUploader 
                        onFileUpload={handleFileUpload}
                        files={selectedMessage.attachments || []}
                        onFileDelete={removeAttachment}
                        maxFiles={5}
                        maxSizeMB={10}
                      />
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAttachments(true)}
                      className="gap-2"
                    >
                      <PaperclipIcon className="h-4 w-4" />
                      Add Attachments
                    </Button>
                  )}
                  
                  {/* Show message attachments if any */}
                  {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div className="border rounded-md p-3">
                      <h4 className="text-sm font-medium mb-2">Message Attachments</h4>
                      <div className="space-y-2">
                        {selectedMessage.attachments.map(attachment => (
                          <AttachmentComponent 
                            key={attachment.id} 
                            attachment={attachment}
                            showDelete={false}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full gap-2" 
                  onClick={handleSendReply}
                  disabled={!replyContent.trim() || isReplying}
                >
                  {isReplying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <SendIcon className="h-4 w-4" />
                      Send Reply
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Channel integration card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Communication Channels</CardTitle>
                <CardDescription>Connect with your customers across multiple channels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">Email</div>
                        <div className="text-xs text-muted-foreground">Send emails directly</div>
                      </div>
                    </div>
                    <Switch id="email-integration" defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="text-sm font-medium">WhatsApp</div>
                        <div className="text-xs text-muted-foreground">Connect with WhatsApp Business</div>
                      </div>
                    </div>
                    <Switch id="whatsapp-integration" defaultChecked={false} />
                  </div>
                  
                  <div className="flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-purple-500" />
                      <div>
                        <div className="text-sm font-medium">Instagram</div>
                        <div className="text-xs text-muted-foreground">Chat via Instagram DMs</div>
                      </div>
                    </div>
                    <Switch id="instagram-integration" disabled />
                  </div>
                  
                  <div className="flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-sm font-medium">Facebook</div>
                        <div className="text-xs text-muted-foreground">Connect with Messenger</div>
                      </div>
                    </div>
                    <Switch id="facebook-integration" disabled />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled
                >
                  Configure Channels
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
