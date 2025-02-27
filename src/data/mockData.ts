
import { MessageSquare, Mail, Phone } from "lucide-react";

export type Channel = 'email' | 'whatsapp' | 'instagram' | 'facebook';
export type MessageCategory = 'inquiry' | 'complaint' | 'feedback' | 'support' | 'other';
export type CustomerStatus = 'new' | 'returning' | 'vip' | 'active';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: CustomerStatus;
  lastContact: string; // ISO date string
  totalMessages: number;
  avatar?: string;
  notes?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  url: string;
}

export interface Message {
  id: string;
  customerId: string;
  channel: Channel;
  content: string;
  subject?: string;
  timestamp: string; // ISO date string
  isRead: boolean;
  category?: MessageCategory;
  isReplied: boolean;
  replyContent?: string;
  replyTimestamp?: string; // ISO date string
  customer?: Customer; // For joined customer data
  attachments?: Attachment[]; // For file attachments
}

export interface ResponseTemplate {
  id: string;
  name: string;
  content: string;
  category?: MessageCategory;
  keywords: string[];
}

export interface ChannelStats {
  channel: Channel;
  messageCount: number;
  responseRate: number;
  averageResponseTime: number; // in minutes
}

export const mockCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    status: 'vip',
    lastContact: '2023-06-15T10:30:00Z',
    totalMessages: 24,
    notes: 'Prefers email communication. Interested in premium plans.'
  },
  {
    id: 'c2',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    phone: '+1 (555) 987-6543',
    status: 'returning',
    lastContact: '2023-06-18T14:45:00Z',
    totalMessages: 12,
    notes: 'Looking for specific product features.'
  },
  {
    id: 'c3',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    status: 'new',
    lastContact: '2023-06-20T09:15:00Z',
    totalMessages: 3
  },
  {
    id: 'c4',
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    phone: '+1 (555) 234-5678',
    status: 'returning',
    lastContact: '2023-06-17T11:20:00Z',
    totalMessages: 8,
    notes: 'Has had issues with previous orders.'
  },
  {
    id: 'c5',
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    status: 'new',
    lastContact: '2023-06-21T16:10:00Z',
    totalMessages: 2
  },
  {
    id: 'c6',
    name: 'Olivia Martinez',
    email: 'olivia.martinez@example.com',
    phone: '+1 (555) 876-5432',
    status: 'vip',
    lastContact: '2023-06-16T13:25:00Z',
    totalMessages: 18,
    notes: 'Frequent purchaser, responds quickly.'
  }
];

export const mockMessages: Message[] = [
  {
    id: 'm1',
    customerId: 'c1',
    channel: 'email',
    subject: 'Question about premium subscription',
    content: 'Hello, I would like to know more details about your premium subscription plan. What features are included?',
    timestamp: '2023-06-20T10:30:00Z',
    isRead: true,
    category: 'inquiry',
    isReplied: true,
    replyContent: 'Thank you for your interest in our premium plan! The premium subscription includes advanced analytics, priority support, and unlimited storage. Would you like me to send you our detailed brochure?',
    replyTimestamp: '2023-06-20T11:45:00Z'
  },
  {
    id: 'm2',
    customerId: 'c2',
    channel: 'whatsapp',
    content: 'Hi, I haven\'t received my order #12345 yet. It\'s been 5 days. Can you check the status?',
    timestamp: '2023-06-21T09:15:00Z',
    isRead: true,
    category: 'complaint',
    isReplied: false
  },
  {
    id: 'm3',
    customerId: 'c3',
    channel: 'instagram',
    content: 'Just discovered your products and they look amazing! Do you ship internationally?',
    timestamp: '2023-06-21T14:20:00Z',
    isRead: false,
    category: 'inquiry',
    isReplied: false
  },
  {
    id: 'm4',
    customerId: 'c4',
    channel: 'email',
    subject: 'Feedback on recent purchase',
    content: 'I recently purchased your product and wanted to share my experience. Overall, I\'m satisfied but there are a few improvements you could make...',
    timestamp: '2023-06-19T16:40:00Z',
    isRead: true,
    category: 'feedback',
    isReplied: true,
    replyContent: "Thank you so much for your valuable feedback! We're always looking to improve our products, and your insights are incredibly helpful. I've forwarded your suggestions to our product team.",
    replyTimestamp: '2023-06-20T08:30:00Z'
  },
  {
    id: 'm5',
    customerId: 'c5',
    channel: 'facebook',
    content: 'Does your software integrate with Shopify?',
    timestamp: '2023-06-21T11:10:00Z',
    isRead: false,
    category: 'inquiry',
    isReplied: false
  },
  {
    id: 'm6',
    customerId: 'c6',
    channel: 'whatsapp',
    content: 'Hi there! I\'m having trouble resetting my password. Can you help?',
    timestamp: '2023-06-21T10:05:00Z',
    isRead: true,
    category: 'support',
    isReplied: true,
    replyContent: "I'd be happy to help you reset your password! Please visit our password reset page at example.com/reset and follow the instructions. If you continue to have issues, please let me know.",
    replyTimestamp: '2023-06-21T10:15:00Z'
  },
  {
    id: 'm7',
    customerId: 'c1',
    channel: 'email',
    subject: 'Follow-up on our previous conversation',
    content: 'Following up on our discussion about the premium plan. I\'d like to proceed with the annual subscription. How do I get started?',
    timestamp: '2023-06-21T15:45:00Z',
    isRead: false,
    category: 'inquiry',
    isReplied: false
  },
  {
    id: 'm8',
    customerId: 'c2',
    channel: 'instagram',
    content: 'Your new collection looks great! When will it be available in stores?',
    timestamp: '2023-06-20T13:20:00Z',
    isRead: true,
    category: 'inquiry',
    isReplied: true,
    replyContent: 'Thank you for your enthusiasm about our new collection! It will be available in stores starting next Monday, June 27th. You can also pre-order items now on our website!',
    replyTimestamp: '2023-06-20T14:30:00Z'
  }
];

export const mockResponseTemplates: ResponseTemplate[] = [
  {
    id: 't1',
    name: 'Order Status Inquiry',
    content: 'Thank you for your inquiry about your order. Your order #[ORDER_NUMBER] is currently [STATUS]. The expected delivery date is [DELIVERY_DATE]. Please let me know if you have any other questions!',
    category: 'inquiry',
    keywords: ['order', 'status', 'tracking', 'delivery', 'package']
  },
  {
    id: 't2',
    name: 'Product Information Request',
    content: 'Thank you for your interest in our [PRODUCT_NAME]! Here are the specifications you requested: [SPECS]. Would you like me to provide any additional information?',
    category: 'inquiry',
    keywords: ['product', 'information', 'details', 'specs', 'features']
  },
  {
    id: 't3',
    name: 'General Thank You',
    content: 'Thank you for reaching out to us! We appreciate your message and will get back to you as soon as possible.',
    keywords: ['thank you', 'thanks', 'appreciate']
  },
  {
    id: 't4',
    name: 'Complaint Resolution',
    content: "I'm sorry to hear about your experience with [ISSUE]. We take this feedback very seriously and would like to resolve this for you right away. Here's what we can do: [RESOLUTION_OPTIONS]. Please let me know which option works best for you.",
    category: 'complaint',
    keywords: ['issue', 'problem', 'complaint', 'unhappy', 'disappointed']
  },
  {
    id: 't5',
    name: 'Technical Support',
    content: "I understand you're experiencing technical difficulties with [PRODUCT/SERVICE]. Let's troubleshoot this together. First, could you try [TROUBLESHOOTING_STEP_1]? If that doesn't work, please [TROUBLESHOOTING_STEP_2]. Let me know the results.",
    category: 'support',
    keywords: ['help', 'support', 'technical', 'issue', 'not working']
  }
];

export const mockChannelStats: ChannelStats[] = [
  {
    channel: 'email',
    messageCount: 42,
    responseRate: 85,
    averageResponseTime: 120
  },
  {
    channel: 'whatsapp',
    messageCount: 28,
    responseRate: 92,
    averageResponseTime: 45
  },
  {
    channel: 'instagram',
    messageCount: 15,
    responseRate: 78,
    averageResponseTime: 180
  },
  {
    channel: 'facebook',
    messageCount: 10,
    responseRate: 80,
    averageResponseTime: 150
  }
];

export const getChannelIcon = (channel: Channel) => {
  switch (channel) {
    case 'email':
      return Mail;
    case 'whatsapp':
      return Phone;
    case 'instagram':
      return MessageSquare;
    case 'facebook':
      return MessageSquare;
    default:
      return MessageSquare;
  }
};

export const getCustomerById = (id: string): Customer | undefined => {
  return mockCustomers.find(customer => customer.id === id);
};

export const getMessagesByCustomerId = (id: string): Message[] => {
  return mockMessages.filter(message => message.customerId === id);
};

export const getUnreadMessagesCount = (): number => {
  return mockMessages.filter(message => !message.isRead).length;
};

export const getUnansweredMessagesCount = (): number => {
  return mockMessages.filter(message => !message.isReplied).length;
};

export const getCategoryDistribution = (): Record<MessageCategory, number> => {
  const distribution: Partial<Record<MessageCategory, number>> = {};
  
  mockMessages.forEach(message => {
    if (message.category) {
      distribution[message.category] = (distribution[message.category] || 0) + 1;
    }
  });
  
  return {
    inquiry: distribution.inquiry || 0,
    complaint: distribution.complaint || 0,
    feedback: distribution.feedback || 0,
    support: distribution.support || 0,
    other: distribution.other || 0
  };
};
