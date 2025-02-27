
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  Customer, 
  Message, 
  ResponseTemplate, 
  Channel, 
  MessageCategory 
} from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import * as supabaseService from '@/services/supabaseService';

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
  
  // Actions
  setSelectedCustomerId: (id: string | null) => void;
  setSelectedMessageId: (id: string | null) => void;
  setActiveView: (view: 'inbox' | 'dashboard' | 'templates' | 'customers' | 'settings') => void;
  setChannelFilter: (channel: Channel | 'all') => void;
  setCategoryFilter: (category: MessageCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  
  // Message actions
  markMessageAsRead: (id: string) => Promise<void>;
  replyToMessage: (id: string, content: string) => Promise<void>;
  categorizeMessage: (id: string, category: MessageCategory) => Promise<void>;
  createNewMessage: (message: Omit<Message, 'id'>) => Promise<void>;
  
  // Customer actions
  updateCustomerNotes: (id: string, notes: string) => Promise<void>;
  updateCustomerStatus: (id: string, status: Customer['status']) => Promise<void>;
  createNewCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  
  // Template actions
  addResponseTemplate: (template: Omit<ResponseTemplate, 'id'>) => Promise<void>;
  updateResponseTemplate: (id: string, updates: Partial<Omit<ResponseTemplate, 'id'>>) => Promise<void>;
  deleteResponseTemplate: (id: string) => Promise<void>;
  
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
  
  const { toast } = useToast();

  // Initial data loading
  useEffect(() => {
    refreshData();
  }, []);

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

  // Message actions
  const markMessageAsRead = async (id: string) => {
    try {
      const updatedMessage = await supabaseService.updateMessage(id, { is_read: true });
      
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
        is_replied: true, 
        reply_content: content,
        reply_timestamp: new Date().toISOString()
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
    } catch (err: any) {
      console.error('Error creating message:', err);
      toast({
        title: "Error creating message",
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
    
    // Actions
    setSelectedCustomerId,
    setSelectedMessageId,
    setActiveView,
    setChannelFilter,
    setCategoryFilter,
    setSearchQuery,
    toggleSidebar,
    
    // Message actions
    markMessageAsRead,
    replyToMessage,
    categorizeMessage,
    createNewMessage,
    
    // Customer actions
    updateCustomerNotes,
    updateCustomerStatus,
    createNewCustomer,
    
    // Template actions
    addResponseTemplate,
    updateResponseTemplate,
    deleteResponseTemplate,
    
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
