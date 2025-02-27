
import React from 'react';
import { useApp } from '@/context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Clock, MessageSquare, User } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomerProfileProps {
  customerId: string;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({ customerId }) => {
  const { 
    customers, 
    messages, 
    updateCustomerNotes, 
    updateCustomerStatus 
  } = useApp();
  
  const customer = customers.find(c => c.id === customerId);
  const customerMessages = messages.filter(m => m.customerId === customerId);
  
  if (!customer) return null;
  
  const handleNotesChange = (notes: string) => {
    updateCustomerNotes(customer.id, notes);
  };
  
  const handleStatusChange = (status: string) => {
    updateCustomerStatus(customer.id, status as any);
  };
  
  const lastContactText = customer.lastContact 
    ? formatDistanceToNow(new Date(customer.lastContact), { addSuffix: true }) 
    : 'No recent contact';
  
  const renderStatusBadge = () => {
    switch (customer.status) {
      case 'new':
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
            New
          </Badge>
        );
      case 'returning':
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
            Returning
          </Badge>
        );
      case 'vip':
        return (
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800">
            VIP
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800">
            {customer.status || 'Unknown'}
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">Customer Profile</CardTitle>
          {renderStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14">
            <AvatarImage src={customer.avatar || ""} alt={customer.name} />
            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-medium text-lg">{customer.name}</h3>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
            {customer.phone && (
              <p className="text-sm text-muted-foreground mt-1">{customer.phone}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Status</span>
            <Select defaultValue={customer.status || "active"} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="returning">Returning</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Last Contact</span>
            <div className="text-sm flex items-center gap-1.5 h-9 px-3 py-1 border rounded-md">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{lastContactText}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Messages</span>
            <div className="text-sm flex items-center gap-1.5 h-9 px-3 py-1 border rounded-md">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{customerMessages.length || 0}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Conversation</span>
            <div className="text-sm flex items-center gap-1.5 h-9 px-3 py-1 border rounded-md">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{customerMessages.length} messages</span>
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Notes</span>
          </div>
          <Textarea 
            placeholder="Add notes about this customer..." 
            className="min-h-24 resize-none"
            value={customer.notes || ''}
            onChange={(e) => handleNotesChange(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">View Full History</Button>
      </CardFooter>
    </Card>
  );
};

export default CustomerProfile;
