
import { supabase } from "@/integrations/supabase/client";
import { 
  Customer, 
  Message, 
  ResponseTemplate, 
  Channel, 
  MessageCategory,
  Attachment
} from '@/data/mockData';
import {
  dbToCustomer,
  dbToMessage,
  dbToResponseTemplate,
  dbToAttachment,
  customerToDb,
  messageToDb,
  responseTemplateToDb
} from '@/utils/dataAdapters';

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
  
  return data.map(dbToCustomer);
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
  
  return dbToCustomer(data);
};

export const createCustomer = async (customer: Omit<Customer, 'id'>) => {
  const dbCustomer = customerToDb(customer);
  
  const { data, error } = await supabase
    .from('customers')
    .insert([{ 
      ...dbCustomer,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
  
  return dbToCustomer(data);
};

export const updateCustomer = async (id: string, updates: Partial<Customer>) => {
  const dbUpdates = customerToDb(updates);
  
  const { data, error } = await supabase
    .from('customers')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
  
  return dbToCustomer(data);
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

// Attachment services
export const fetchAttachmentsByMessageId = async (messageId: string): Promise<Attachment[]> => {
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('message_id', messageId);
  
  if (error) {
    console.error('Error fetching attachments:', error);
    throw error;
  }
  
  return data.map(dbToAttachment);
};

// Message services with attachment handling
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
  
  const messages = data.map(dbToMessage);
  
  // Load attachments for each message
  for (const message of messages) {
    try {
      message.attachments = await fetchAttachmentsByMessageId(message.id);
    } catch (err) {
      console.error(`Error loading attachments for message ${message.id}:`, err);
      message.attachments = [];
    }
  }
  
  return messages;
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
  
  const message = dbToMessage(data);
  
  // Load attachments
  try {
    message.attachments = await fetchAttachmentsByMessageId(message.id);
  } catch (err) {
    console.error(`Error loading attachments for message ${message.id}:`, err);
    message.attachments = [];
  }
  
  return message;
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
  
  const messages = data.map(dbToMessage);
  
  // Load attachments for each message
  for (const message of messages) {
    try {
      message.attachments = await fetchAttachmentsByMessageId(message.id);
    } catch (err) {
      console.error(`Error loading attachments for message ${message.id}:`, err);
      message.attachments = [];
    }
  }
  
  return messages;
};

export const createMessage = async (message: Omit<Message, 'id'>) => {
  const dbMessage = messageToDb(message);
  
  const { data, error } = await supabase
    .from('messages')
    .insert([{ 
      ...dbMessage,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating message:', error);
    throw error;
  }
  
  return dbToMessage(data);
};

export const updateMessage = async (id: string, updates: Partial<Message>) => {
  const dbUpdates = messageToDb(updates);
  
  const { data, error } = await supabase
    .from('messages')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating message:', error);
    throw error;
  }
  
  return dbToMessage(data);
};

export const deleteMessage = async (id: string) => {
  // Delete attachments first
  try {
    const attachments = await fetchAttachmentsByMessageId(id);
    
    for (const attachment of attachments) {
      // Delete from storage
      await supabase.storage
        .from('message_attachments')
        .remove([attachment.filePath]);
      
      // Delete record
      await supabase
        .from('attachments')
        .delete()
        .eq('id', attachment.id);
    }
  } catch (err) {
    console.error('Error deleting message attachments:', err);
  }
  
  // Then delete the message
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
  
  return data.map(dbToResponseTemplate);
};

export const createResponseTemplate = async (template: Omit<ResponseTemplate, 'id'>) => {
  const dbTemplate = responseTemplateToDb(template);
  
  const { data, error } = await supabase
    .from('response_templates')
    .insert([{ 
      ...dbTemplate,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating response template:', error);
    throw error;
  }
  
  return dbToResponseTemplate(data);
};

export const updateResponseTemplate = async (id: string, updates: Partial<Omit<ResponseTemplate, 'id'>>) => {
  const dbUpdates = responseTemplateToDb(updates);
  
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
  
  return dbToResponseTemplate(data);
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
  
  // Get channel distribution - we'll need to use SQL query for this
  const { data: channelData, error: channelError } = await supabase
    .rpc('get_channel_distribution');
  
  if (channelError) {
    console.error('Error fetching channel stats:', channelError);
    throw channelError;
  }
  
  // Get category distribution - we'll need to use SQL query for this
  const { data: categoryData, error: categoryError } = await supabase
    .rpc('get_category_distribution');
  
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

// Communication channel integrations
export const sendEmailMessage = async (to: string, subject: string, content: string): Promise<boolean> => {
  // In a real app, this would integrate with an email service like SendGrid, Mailgun, etc.
  console.log(`[EMAIL INTEGRATION] Sending email to ${to}: ${subject}`);
  
  // Simulating an email send - in a real app would connect to a real email service
  // or use a Supabase Edge Function to handle the sending
  return true;
};

export const sendWhatsAppMessage = async (to: string, content: string): Promise<boolean> => {
  // In a real app, this would integrate with WhatsApp Business API
  console.log(`[WHATSAPP INTEGRATION] Sending WhatsApp message to ${to}`);
  
  // Simulating a WhatsApp send - in a real app would connect to WhatsApp API
  // or use a Supabase Edge Function to handle the sending
  return true;
};
