
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { MessageCategory } from '@/data/mockData';
import { Mail, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { getMessageStats } from '@/services/statisticsService';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    unreadCount: 0,
    unansweredCount: 0,
    channelDistribution: [] as { channel: string, count: number }[],
    categoryDistribution: [] as { category: string, count: number }[]
  });
  const [averageResponseTime, setAverageResponseTime] = useState(0);
  const [responseTimeByChannel, setResponseTimeByChannel] = useState<{ name: string, time: number }[]>([]);
  
  // Load initial data
  useEffect(() => {
    fetchStats();
  }, []);

  // Set up real-time subscription for messages table
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Refresh stats when any message changes
          fetchStats();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const messageStats = await getMessageStats();
      
      // Calculate average response time (mock data for now)
      // In a real implementation, you would calculate this from the data
      const avgTime = Math.round(Math.random() * 100) + 50; // For demo purposes
      
      // Format channel data for charts
      const channelData = messageStats.channelDistribution.map(item => ({
        name: item.channel.charAt(0).toUpperCase() + item.channel.slice(1),
        value: Number(item.count)
      }));
      
      // Format category data for charts
      const categoryData = messageStats.categoryDistribution.map(item => ({
        name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
        value: Number(item.count)
      }));
      
      // Mock response time data by channel
      // In a real implementation, you would calculate this from the database
      const responseTimeData = messageStats.channelDistribution.map(item => ({
        name: item.channel.charAt(0).toUpperCase() + item.channel.slice(1),
        time: Math.round(Math.random() * 200) + 30 // For demo purposes
      }));
      
      setStats({
        unreadCount: messageStats.unreadCount,
        unansweredCount: messageStats.unansweredCount,
        channelDistribution: messageStats.channelDistribution,
        categoryDistribution: messageStats.categoryDistribution
      });
      
      setAverageResponseTime(avgTime);
      setResponseTimeByChannel(responseTimeData);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate total message count
  const totalMessages = stats.channelDistribution.reduce(
    (sum, channel) => sum + Number(channel.count), 
    0
  );
  
  // Calculate response rate
  const responseRate = totalMessages > 0 
    ? Math.round(((totalMessages - stats.unansweredCount) / totalMessages) * 100) 
    : 0;
  
  // Format channel data for the bar chart
  const channelChartData = stats.channelDistribution.map(item => ({
    name: item.channel.charAt(0).toUpperCase() + item.channel.slice(1),
    value: Number(item.count)
  }));
  
  // Format category data for the pie chart
  const categoryChartData = stats.categoryDistribution.map(item => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    value: Number(item.count)
  }));
  
  // Colors for charts
  const COLORS = ['#0ea5e9', '#f97316', '#8b5cf6', '#10b981', '#ef4444'];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight">Analytics Dashboard</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="animate-slide-in animate-once animate-delay-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Messages</p>
                <p className="text-3xl font-bold">{totalMessages}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <MessageSquare className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-in animate-once animate-delay-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Unread Messages</p>
                <p className="text-3xl font-bold">{stats.unreadCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Mail className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-in animate-once animate-delay-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Response Rate</p>
                <p className="text-3xl font-bold">{responseRate}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-in animate-once animate-delay-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg. Response Time</p>
                <p className="text-3xl font-bold">{averageResponseTime}<span className="text-base font-normal ml-1">min</span></p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2 animate-slide-in animate-once animate-delay-100">
          <CardHeader>
            <CardTitle>Message Volume by Channel</CardTitle>
            <CardDescription>
              Number of messages received across different communication channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={channelChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis width={40} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--background)', 
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar 
                    dataKey="value" 
                    name="Messages" 
                    fill="var(--brand-500)" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-in animate-once animate-delay-200">
          <CardHeader>
            <CardTitle>Message Categories</CardTitle>
            <CardDescription>
              Distribution of messages by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--background)', 
                      borderColor: 'var(--border)',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-in animate-once animate-delay-300">
          <CardHeader>
            <CardTitle>Response Times</CardTitle>
            <CardDescription>
              Average response time by channel (minutes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={responseTimeByChannel}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--background)', 
                      borderColor: 'var(--border)',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${value} minutes`, 'Response Time']}
                  />
                  <Bar 
                    dataKey="time" 
                    name="Minutes" 
                    fill="var(--brand-600)" 
                    radius={[0, 4, 4, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
