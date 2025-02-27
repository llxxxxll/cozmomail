
import { supabase } from "@/integrations/supabase/client";
import { Message, Attachment } from '@/data/mockData';
import { dbToMessage, messageToDb, dbToAttachment } from '@/utils/dataAdapters';

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
