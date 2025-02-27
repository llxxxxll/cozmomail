
import { supabase } from "@/integrations/supabase/client";
import { 
  Customer, 
  Message, 
  ResponseTemplate, 
  Channel, 
  MessageCategory 
} from '@/data/mockData';

// Customer services
export const fetchCustomers = async () => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
  
  return data;
};

export const fetchCustomerById = async (id: string) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
  
  return data;
};

export const createCustomer = async (customer: Omit<Customer, 'id'>) => {
  const { data, error } = await supabase
    .from('customers')
    .insert([{ 
      ...customer,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
  
  return data;
};

export const updateCustomer = async (id: string, updates: Partial<Customer>) => {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
  
  return data;
};

export const deleteCustomer = async (id: string) => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
  
  return true;
};

// Message services
export const fetchMessages = async () => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      customers (id, name, email, phone, avatar_url)
    `)
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
  
  return data;
};

export const fetchMessageById = async (id: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      customers (id, name, email, phone, avatar_url)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching message:', error);
    throw error;
  }
  
  return data;
};

export const fetchMessagesByCustomerId = async (customerId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('customer_id', customerId)
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error('Error fetching customer messages:', error);
    throw error;
  }
  
  return data;
};

export const createMessage = async (message: Omit<Message, 'id'>) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ 
      ...message,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating message:', error);
    throw error;
  }
  
  return data;
};

export const updateMessage = async (id: string, updates: Partial<Message>) => {
  const { data, error } = await supabase
    .from('messages')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating message:', error);
    throw error;
  }
  
  return data;
};

export const deleteMessage = async (id: string) => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
  
  return true;
};

// Response Template services
export const fetchResponseTemplates = async () => {
  const { data, error } = await supabase
    .from('response_templates')
    .select('*')
    .order('title');
  
  if (error) {
    console.error('Error fetching response templates:', error);
    throw error;
  }
  
  // Transform from DB format to application format
  return data.map((template: any) => ({
    id: template.id,
    name: template.title,
    content: template.content,
    category: template.category,
    keywords: template.keywords || []
  }));
};

export const createResponseTemplate = async (template: Omit<ResponseTemplate, 'id'>) => {
  const { data, error } = await supabase
    .from('response_templates')
    .insert([{ 
      title: template.name,
      content: template.content,
      category: template.category,
      keywords: template.keywords,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating response template:', error);
    throw error;
  }
  
  // Transform from DB format to application format
  return {
    id: data.id,
    name: data.title,
    content: data.content,
    category: data.category,
    keywords: data.keywords || []
  };
};

export const updateResponseTemplate = async (id: string, updates: Partial<Omit<ResponseTemplate, 'id'>>) => {
  const dbUpdates: any = {};
  
  if (updates.name) dbUpdates.title = updates.name;
  if (updates.content) dbUpdates.content = updates.content;
  if (updates.category) dbUpdates.category = updates.category;
  if (updates.keywords) dbUpdates.keywords = updates.keywords;
  
  const { data, error } = await supabase
    .from('response_templates')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating response template:', error);
    throw error;
  }
  
  // Transform from DB format to application format
  return {
    id: data.id,
    name: data.title,
    content: data.content,
    category: data.category,
    keywords: data.keywords || []
  };
};

export const deleteResponseTemplate = async (id: string) => {
  const { error } = await supabase
    .from('response_templates')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting response template:', error);
    throw error;
  }
  
  return true;
};

// Statistics
export const getMessageStats = async () => {
  // Get unread message count
  const { count: unreadCount, error: unreadError } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);
  
  if (unreadError) {
    console.error('Error fetching unread count:', unreadError);
    throw unreadError;
  }
  
  // Get unanswered message count
  const { count: unansweredCount, error: unansweredError } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('is_replied', false);
  
  if (unansweredError) {
    console.error('Error fetching unanswered count:', unansweredError);
    throw unansweredError;
  }
  
  // Get channel distribution
  const { data: channelData, error: channelError } = await supabase
    .from('messages')
    .select('channel, count')
    .group('channel');
  
  if (channelError) {
    console.error('Error fetching channel stats:', channelError);
    throw channelError;
  }
  
  // Get category distribution
  const { data: categoryData, error: categoryError } = await supabase
    .from('messages')
    .select('category, count')
    .not('category', 'is', null)
    .group('category');
  
  if (categoryError) {
    console.error('Error fetching category stats:', categoryError);
    throw categoryError;
  }
  
  return {
    unreadCount: unreadCount || 0,
    unansweredCount: unansweredCount || 0,
    channelDistribution: channelData || [],
    categoryDistribution: categoryData || []
  };
};
