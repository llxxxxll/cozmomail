
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Customer, 
  Message, 
  ResponseTemplate, 
  mockCustomers, 
  mockMessages, 
  mockResponseTemplates, 
  Channel, 
  MessageCategory 
} from '@/data/mockData';

interface AppContextProps {
  customers: Customer[];
  messages: Message[];
  responseTemplates: ResponseTemplate[];
  selectedCustomerId: string | null;
  selectedMessageId: string | null;
  activeView: 'inbox' | 'dashboard' | 'templates' | 'customers' | 'profile';
  channelFilter: Channel | 'all';
  categoryFilter: MessageCategory | 'all';
  searchQuery: string;
  isSidebarCollapsed: boolean;
  
  // Actions
  setSelectedCustomerId: (id: string | null) => void;
  setSelectedMessageId: (id: string | null) => void;
  setActiveView: (view: 'inbox' | 'dashboard' | 'templates' | 'customers' | 'profile') => void;
  setChannelFilter: (channel: Channel | 'all') => void;
  setCategoryFilter: (category: MessageCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  
  // Message actions
  markMessageAsRead: (id: string) => void;
  replyToMessage: (id: string, content: string) => void;
  categorizeMessage: (id: string, category: MessageCategory) => void;
  
  // Customer actions
  updateCustomerNotes: (id: string, notes: string) => void;
  updateCustomerStatus: (id: string, status: Customer['status']) => void;
  
  // Template actions
  addResponseTemplate: (template: Omit<ResponseTemplate, 'id'>) => void;
  updateResponseTemplate: (id: string, updates: Partial<Omit<ResponseTemplate, 'id'>>) => void;
  deleteResponseTemplate: (id: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [responseTemplates, setResponseTemplates] = useState<ResponseTemplate[]>(mockResponseTemplates);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'inbox' | 'dashboard' | 'templates' | 'customers' | 'profile'>('inbox');
  const [channelFilter, setChannelFilter] = useState<Channel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<MessageCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const markMessageAsRead = (id: string) => {
    setMessages(prevMessages => 
      prevMessages.map(message => 
        message.id === id ? { ...message, isRead: true } : message
      )
    );
  };

  const replyToMessage = (id: string, content: string) => {
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
  };

  const categorizeMessage = (id: string, category: MessageCategory) => {
    setMessages(prevMessages => 
      prevMessages.map(message => 
        message.id === id ? { ...message, category } : message
      )
    );
  };

  const updateCustomerNotes = (id: string, notes: string) => {
    setCustomers(prevCustomers => 
      prevCustomers.map(customer => 
        customer.id === id ? { ...customer, notes } : customer
      )
    );
  };

  const updateCustomerStatus = (id: string, status: Customer['status']) => {
    setCustomers(prevCustomers => 
      prevCustomers.map(customer => 
        customer.id === id ? { ...customer, status } : customer
      )
    );
  };

  const addResponseTemplate = (template: Omit<ResponseTemplate, 'id'>) => {
    const newTemplate: ResponseTemplate = {
      ...template,
      id: `t${responseTemplates.length + 1}`
    };
    setResponseTemplates(prev => [...prev, newTemplate]);
  };

  const updateResponseTemplate = (id: string, updates: Partial<Omit<ResponseTemplate, 'id'>>) => {
    setResponseTemplates(prev => 
      prev.map(template => 
        template.id === id ? { ...template, ...updates } : template
      )
    );
  };

  const deleteResponseTemplate = (id: string) => {
    setResponseTemplates(prev => prev.filter(template => template.id !== id));
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
    
    // Customer actions
    updateCustomerNotes,
    updateCustomerStatus,
    
    // Template actions
    addResponseTemplate,
    updateResponseTemplate,
    deleteResponseTemplate
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
