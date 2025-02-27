
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  Customer, 
  Message, 
  ResponseTemplate, 
  Channel, 
  MessageCategory,
  Attachment
} from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import * as supabaseService from '@/services/supabaseService';
import { uploadAttachment, getAttachmentsByMessageId, deleteAttachment } from '@/services/fileUploadService';
import { subscribeToNewMessages, showBrowserNotification } from '@/services/notificationService';

interface AppContextProps {
  customers: Customer[];
  messages: Message[];
  responseTemplates: ResponseTemplate[];
  selectedCustomerId: string | null;
  selectedMessageId: string | null;
  activeView: 'inbox' | 'dashboard' | 'templates' | 'customers' | 'settings';
  channelFilter: Channel | 'all';
  categoryFilter: MessageCategory | 'all';
  searchQuery: string;
  isSidebarCollapsed: boolean;
  isLoading: boolean;
  error: Error | null;
  notifications: boolean;
  
  // Actions
  setSelectedCustomerId: (id: string | null) => void;
  setSelectedMessageId: (id: string | null) => void;
  setActiveView: (view: 'inbox' | 'dashboard' | 'templates' | 'customers' | 'settings') => void;
  setChannelFilter: (channel: Channel | 'all') => void;
  setCategoryFilter: (category: MessageCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  toggleNotifications: () => void;
  
  // Message actions
  markMessageAsRead: (id: string) => Promise<void>;
  replyToMessage: (id: string, content: string) => Promise<void>;
  categorizeMessage: (id: string, category: MessageCategory) => Promise<void>;
  createNewMessage: (message: Omit<Message, 'id'>) => Promise<Message>;
  
  // Attachment actions
  uploadAttachments: (messageId: string, files: File[]) => Promise<Attachment[]>;
  removeAttachment: (attachmentId: string) => Promise<void>;
  
  // Customer actions
  updateCustomerNotes: (id: string, notes: string) => Promise<void>;
  updateCustomerStatus: (id: string, status: Customer['status']) => Promise<void>;
  createNewCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  
  // Template actions
  addResponseTemplate: (template: Omit<ResponseTemplate, 'id'>) => Promise<void>;
  updateResponseTemplate: (id: string, updates: Partial<Omit<ResponseTemplate, 'id'>>) => Promise<void>;
  deleteResponseTemplate: (id: string) => Promise<void>;
  
  // Communication channel integration actions
  sendEmailToCustomer: (customerId: string, subject: string, content: string) => Promise<void>;
  sendWhatsAppToCustomer: (customerId: string, content: string) => Promise<void>;
  
  // Refresh data
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [responseTemplates, setResponseTemplates] = useState<ResponseTemplate[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'inbox' | 'dashboard' | 'templates' | 'customers' | 'settings'>('inbox');
  const [channelFilter, setChannelFilter] = useState<Channel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<MessageCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [notifications, setNotifications] = useState<boolean>(
    typeof window !== 'undefined' 
      ? localStorage.getItem('notifications') === 'true'
      : false
  );
  
  const { toast } = useToast();

  // Initial data loading
  useEffect(() => {
    refreshData();
  }, []);
  
  // Set up message notifications
  useEffect(() => {
    // Only set up real-time notifications when they're enabled
    if (!notifications) return;
    
    // Subscribe to new messages
    const unsubscribe = subscribeToNewMessages(
      (message) => {
        // Add the message to our state
        setMessages(prev => [message, ...prev]);
        
        // Show a browser notification
        const customerName = customers.find(c => c.id === message.customerId)?.name || 'Unknown';
        showBrowserNotification(
          `New message from ${customerName}`,
          message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
          '/favicon.ico'
        );
        
        // Show a toast notification as well
        toast({
          title: `New message from ${customerName}`,
          description: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
        });
      },
      (error) => {
        console.error('Error in message subscription:', error);
      }
    );
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [notifications, customers, toast]);
  
  // Save notification preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications', notifications.toString());
    }
  }, [notifications]);

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load all data in parallel
      const [customersData, messagesData, templatesData] = await Promise.all([
        supabaseService.fetchCustomers(),
        supabaseService.fetchMessages(),
        supabaseService.fetchResponseTemplates()
      ]);
      
      setCustomers(customersData);
      setMessages(messagesData);
      setResponseTemplates(templatesData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err);
      toast({
        title: "Error loading data",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  const toggleNotifications = async () => {
    // If turning on notifications, request permission
    if (!notifications && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast({
          title: "Notification permission denied",
          description: "You need to allow notifications in your browser settings.",
          variant: "destructive"
        });
        return;
      }
    }
    
    setNotifications(!notifications);
    
    toast({
      title: !notifications ? "Notifications enabled" : "Notifications disabled",
    });
  };

  // Message actions
  const markMessageAsRead = async (id: string) => {
    try {
      const updatedMessage = await supabaseService.updateMessage(id, { isRead: true });
      
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message.id === id ? { ...message, isRead: true } : message
        )
      );
      
      toast({
        title: "Message marked as read"
      });
    } catch (err: any) {
      console.error('Error marking message as read:', err);
      toast({
        title: "Error marking message as read",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const replyToMessage = async (id: string, content: string) => {
    try {
      const updatedMessage = await supabaseService.updateMessage(id, { 
        isReplied: true, 
        replyContent: content,
        replyTimestamp: new Date().toISOString()
      });
      
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message.id === id ? { 
            ...message, 
            isReplied: true, 
            replyContent: content,
            replyTimestamp: new Date().toISOString()
          } : message
        )
      );
      
      // Get the original message to determine the channel
      const message = messages.find(m => m.id === id);
      if (message) {
        // Send the reply through the appropriate channel
        if (message.channel === 'email') {
          const customer = customers.find(c => c.id === message.customerId);
          if (customer) {
            await supabaseService.sendEmailMessage(customer.email, `Re: ${message.subject || 'Your message'}`, content);
          }
        } else if (message.channel === 'whatsapp') {
          const customer = customers.find(c => c.id === message.customerId);
          if (customer && customer.phone) {
            await supabaseService.sendWhatsAppMessage(customer.phone, content);
          }
        }
      }
      
      toast({
        title: "Reply sent successfully"
      });
    } catch (err: any) {
      console.error('Error replying to message:', err);
      toast({
        title: "Error sending reply",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const categorizeMessage = async (id: string, category: MessageCategory) => {
    try {
      const updatedMessage = await supabaseService.updateMessage(id, { category });
      
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message.id === id ? { ...message, category } : message
        )
      );
      
      toast({
        title: `Message categorized as ${category}`
      });
    } catch (err: any) {
      console.error('Error categorizing message:', err);
      toast({
        title: "Error categorizing message",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const createNewMessage = async (message: Omit<Message, 'id'>) => {
    try {
      const newMessage = await supabaseService.createMessage(message);
      
      setMessages(prevMessages => [newMessage, ...prevMessages]);
      
      toast({
        title: "Message created successfully"
      });
      
      return newMessage;
    } catch (err: any) {
      console.error('Error creating message:', err);
      toast({
        title: "Error creating message",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };
  
  // Attachment actions
  const uploadAttachments = async (messageId: string, files: File[]): Promise<Attachment[]> => {
    if (files.length === 0) return [];
    
    try {
      const uploadPromises = files.map(file => uploadAttachment(file, messageId));
      const attachmentsData = await getAttachmentsByMessageId(messageId);
      
      // Update the message in state with the new attachments
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message.id === messageId 
            ? { ...message, attachments: attachmentsData } 
            : message
        )
      );
      
      return attachmentsData;
    } catch (err: any) {
      console.error('Error uploading attachments:', err);
      toast({
        title: "Error uploading attachments",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };
  
  const removeAttachment = async (attachmentId: string) => {
    try {
      // First, get the attachment to know which message it belongs to
      const { data, error } = await supabase
        .from('attachments')
        .select('message_id')
        .eq('id', attachmentId)
        .single();
      
      if (error) throw error;
      
      const messageId = data.message_id;
      
      // Delete the attachment
      await deleteAttachment(attachmentId);
      
      // Get updated attachments
      const updatedAttachments = await getAttachmentsByMessageId(messageId);
      
      // Update the message in state
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message.id === messageId 
            ? { ...message, attachments: updatedAttachments } 
            : message
        )
      );
      
      toast({
        title: "Attachment removed"
      });
    } catch (err: any) {
      console.error('Error removing attachment:', err);
      toast({
        title: "Error removing attachment",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  // Customer actions
  const updateCustomerNotes = async (id: string, notes: string) => {
    try {
      const updatedCustomer = await supabaseService.updateCustomer(id, { notes });
      
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.id === id ? { ...customer, notes } : customer
        )
      );
      
      toast({
        title: "Customer notes updated"
      });
    } catch (err: any) {
      console.error('Error updating customer notes:', err);
      toast({
        title: "Error updating customer notes",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const updateCustomerStatus = async (id: string, status: Customer['status']) => {
    try {
      const updatedCustomer = await supabaseService.updateCustomer(id, { status });
      
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.id === id ? { ...customer, status } : customer
        )
      );
      
      toast({
        title: `Customer status updated to ${status}`
      });
    } catch (err: any) {
      console.error('Error updating customer status:', err);
      toast({
        title: "Error updating customer status",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const createNewCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      const newCustomer = await supabaseService.createCustomer(customer);
      
      setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
      
      toast({
        title: "Customer created successfully"
      });
    } catch (err: any) {
      console.error('Error creating customer:', err);
      toast({
        title: "Error creating customer",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  // Template actions
  const addResponseTemplate = async (template: Omit<ResponseTemplate, 'id'>) => {
    try {
      const newTemplate = await supabaseService.createResponseTemplate(template);
      
      setResponseTemplates(prev => [...prev, newTemplate]);
      
      toast({
        title: "Template created successfully"
      });
    } catch (err: any) {
      console.error('Error creating template:', err);
      toast({
        title: "Error creating template",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const updateResponseTemplate = async (id: string, updates: Partial<Omit<ResponseTemplate, 'id'>>) => {
    try {
      const updatedTemplate = await supabaseService.updateResponseTemplate(id, updates);
      
      setResponseTemplates(prev => 
        prev.map(template => 
          template.id === id ? { ...template, ...updatedTemplate } : template
        )
      );
      
      toast({
        title: "Template updated successfully"
      });
    } catch (err: any) {
      console.error('Error updating template:', err);
      toast({
        title: "Error updating template",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const deleteResponseTemplate = async (id: string) => {
    try {
      await supabaseService.deleteResponseTemplate(id);
      
      setResponseTemplates(prev => prev.filter(template => template.id !== id));
      
      toast({
        title: "Template deleted successfully"
      });
    } catch (err: any) {
      console.error('Error deleting template:', err);
      toast({
        title: "Error deleting template",
        description: err.message,
        variant: "destructive"
      });
    }
  };
  
  // Communication channel integration actions
  const sendEmailToCustomer = async (customerId: string, subject: string, content: string) => {
    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }
      
      // Send the email
      await supabaseService.sendEmailMessage(customer.email, subject, content);
      
      // Create a new message record
      const newMessage = await createNewMessage({
        customerId,
        channel: 'email',
        content,
        subject,
        timestamp: new Date().toISOString(),
        isRead: true,
        isReplied: true,
        replyContent: content,
        replyTimestamp: new Date().toISOString()
      });
      
      toast({
        title: "Email sent successfully"
      });
    } catch (err: any) {
      console.error('Error sending email:', err);
      toast({
        title: "Error sending email",
        description: err.message,
        variant: "destructive"
      });
    }
  };
  
  const sendWhatsAppToCustomer = async (customerId: string, content: string) => {
    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }
      
      if (!customer.phone) {
        throw new Error("Customer has no phone number");
      }
      
      // Send the WhatsApp message
      await supabaseService.sendWhatsAppMessage(customer.phone, content);
      
      // Create a new message record
      const newMessage = await createNewMessage({
        customerId,
        channel: 'whatsapp',
        content,
        timestamp: new Date().toISOString(),
        isRead: true,
        isReplied: true,
        replyContent: content,
        replyTimestamp: new Date().toISOString()
      });
      
      toast({
        title: "WhatsApp message sent successfully"
      });
    } catch (err: any) {
      console.error('Error sending WhatsApp message:', err);
      toast({
        title: "Error sending WhatsApp message",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const value = {
    customers,
    messages,
    responseTemplates,
    selectedCustomerId,
    selectedMessageId,
    activeView,
    channelFilter,
    categoryFilter,
    searchQuery,
    isSidebarCollapsed,
    isLoading,
    error,
    notifications,
    
    // Actions
    setSelectedCustomerId,
    setSelectedMessageId,
    setActiveView,
    setChannelFilter,
    setCategoryFilter,
    setSearchQuery,
    toggleSidebar,
    toggleNotifications,
    
    // Message actions
    markMessageAsRead,
    replyToMessage,
    categorizeMessage,
    createNewMessage,
    
    // Attachment actions
    uploadAttachments,
    removeAttachment,
    
    // Customer actions
    updateCustomerNotes,
    updateCustomerStatus,
    createNewCustomer,
    
    // Template actions
    addResponseTemplate,
    updateResponseTemplate,
    deleteResponseTemplate,
    
    // Communication channel integration actions
    sendEmailToCustomer,
    sendWhatsAppToCustomer,
    
    // Refresh data
    refreshData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextProps => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
