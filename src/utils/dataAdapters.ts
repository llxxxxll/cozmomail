
import { Customer, Message, ResponseTemplate, MessageCategory } from '@/data/mockData';

// Adapters to convert between database schema and application models
export const dbToCustomer = (dbCustomer: any): Customer => {
  return {
    id: dbCustomer.id,
    name: dbCustomer.name,
    email: dbCustomer.email,
    phone: dbCustomer.phone || undefined,
    status: dbCustomer.status as any,
    lastContact: dbCustomer.updated_at || '', // Using updated_at as lastContact
    totalMessages: 0, // We'll need to calculate this separately
    avatar: dbCustomer.avatar_url,
    notes: dbCustomer.notes
  };
};

export const dbToMessage = (dbMessage: any): Message => {
  return {
    id: dbMessage.id,
    customerId: dbMessage.customer_id,
    channel: dbMessage.channel as any,
    content: dbMessage.content,
    subject: dbMessage.subject,
    timestamp: dbMessage.timestamp,
    isRead: dbMessage.is_read || false,
    category: dbMessage.category as MessageCategory | undefined,
    isReplied: dbMessage.is_replied || false,
    replyContent: dbMessage.reply_content,
    replyTimestamp: dbMessage.reply_timestamp,
    // Handle the joined customer data if it exists
    customer: dbMessage.customers ? dbToCustomer(dbMessage.customers) : undefined
  };
};

export const dbToResponseTemplate = (dbTemplate: any): ResponseTemplate => {
  return {
    id: dbTemplate.id,
    name: dbTemplate.title,
    content: dbTemplate.content,
    category: dbTemplate.category as MessageCategory | undefined,
    keywords: dbTemplate.keywords || []
  };
};

export const customerToDb = (customer: Partial<Customer>): any => {
  const dbCustomer: any = {};
  
  if (customer.name !== undefined) dbCustomer.name = customer.name;
  if (customer.email !== undefined) dbCustomer.email = customer.email;
  if (customer.phone !== undefined) dbCustomer.phone = customer.phone;
  if (customer.status !== undefined) dbCustomer.status = customer.status;
  if (customer.notes !== undefined) dbCustomer.notes = customer.notes;
  if (customer.avatar !== undefined) dbCustomer.avatar_url = customer.avatar;
  
  return dbCustomer;
};

export const messageToDb = (message: Partial<Message>): any => {
  const dbMessage: any = {};
  
  if (message.customerId !== undefined) dbMessage.customer_id = message.customerId;
  if (message.channel !== undefined) dbMessage.channel = message.channel;
  if (message.content !== undefined) dbMessage.content = message.content;
  if (message.subject !== undefined) dbMessage.subject = message.subject;
  if (message.timestamp !== undefined) dbMessage.timestamp = message.timestamp;
  if (message.isRead !== undefined) dbMessage.is_read = message.isRead;
  if (message.category !== undefined) dbMessage.category = message.category;
  if (message.isReplied !== undefined) dbMessage.is_replied = message.isReplied;
  if (message.replyContent !== undefined) dbMessage.reply_content = message.replyContent;
  if (message.replyTimestamp !== undefined) dbMessage.reply_timestamp = message.replyTimestamp;
  
  return dbMessage;
};

export const responseTemplateToDb = (template: Partial<ResponseTemplate>): any => {
  const dbTemplate: any = {};
  
  if (template.name !== undefined) dbTemplate.title = template.name;
  if (template.content !== undefined) dbTemplate.content = template.content;
  if (template.category !== undefined) dbTemplate.category = template.category;
  if (template.keywords !== undefined) dbTemplate.keywords = template.keywords;
  
  return dbTemplate;
};
