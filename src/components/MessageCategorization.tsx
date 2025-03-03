
import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDownIcon,
  TagIcon 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MessageCategorization: React.FC = () => {
  const { messages, categorizeMessage, setSelectedMessageId, refreshData } = useApp();
  const [categoryDistribution, setCategoryDistribution] = useState<Record<string, number>>({});
  const [customersMap, setCustomersMap] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const uncategorizedMessages = messages.filter(message => !message.category);

  // Fetch real category distribution from Supabase
  const fetchCategoryDistribution = async () => {
    try {
      const { data, error } = await supabase.rpc('get_category_distribution');
      if (error) throw error;
      
      const distribution: Record<string, number> = {
        inquiry: 0,
        complaint: 0,
        feedback: 0,
        support: 0,
        other: 0
      };
      
      data.forEach((item: { category: string, count: number }) => {
        if (item.category) {
          distribution[item.category] = item.count;
        }
      });
      
      setCategoryDistribution(distribution);
    } catch (error) {
      console.error('Error fetching category distribution:', error);
    }
  };

  // Fetch customers for the messages
  const fetchCustomers = async () => {
    try {
      const customerIds = [...new Set(messages.map(m => m.customerId))].filter(Boolean);
      if (customerIds.length === 0) return;

      const { data: customers, error } = await supabase
        .from('customers')
        .select('id, name')
        .in('id', customerIds);

      if (error) throw error;

      const customersById = (customers || []).reduce((acc, customer) => {
        acc[customer.id] = customer;
        return acc;
      }, {} as Record<string, any>);

      setCustomersMap(customersById);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchCategoryDistribution(),
        fetchCustomers()
      ]);
      setIsLoading(false);
    };
    
    fetchData();
  }, [messages]);

  // Real-time subscriptions
  useEffect(() => {
    const customersChannel = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        () => {
          fetchCustomers();
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchCategoryDistribution();
          refreshData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [refreshData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Message Categories</h2>
        <p className="text-sm text-muted-foreground">
          Classify messages to better understand customer needs
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(categoryDistribution).map(([category, count]) => (
          <Card key={category}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Badge 
                  className="mb-2 capitalize" 
                  variant={count > 0 ? "default" : "outline"}
                >
                  {category}
                </Badge>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-muted-foreground">messages</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {uncategorizedMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uncategorized Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uncategorizedMessages.slice(0, 5).map((message) => {
                  const customer = customersMap[message.customerId || ''];
                  return (
                    <TableRow key={message.id}>
                      <TableCell className="font-medium">
                        {customer?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {message.channel}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {message.content}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedMessageId(message.id)}
                          >
                            View
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <TagIcon className="h-4 w-4 mr-1" />
                                <span>Categorize</span>
                                <ChevronDownIcon className="h-4 w-4 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-background">
                              <DropdownMenuItem onClick={() => categorizeMessage(message.id, 'inquiry')}>
                                Inquiry
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => categorizeMessage(message.id, 'complaint')}>
                                Complaint
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => categorizeMessage(message.id, 'feedback')}>
                                Feedback
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => categorizeMessage(message.id, 'support')}>
                                Support
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => categorizeMessage(message.id, 'other')}>
                                Other
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MessageCategorization;
