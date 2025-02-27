
import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  getUnreadMessagesCount, 
  getUnansweredMessagesCount, 
  mockChannelStats, 
  getCategoryDistribution,
  MessageCategory 
} from '@/data/mockData';
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

const Dashboard: React.FC = () => {
  const channelData = mockChannelStats.map(stat => ({
    name: stat.channel,
    value: stat.messageCount
  }));
  
  const categoryData = Object.entries(getCategoryDistribution()).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count
  }));
  
  // Response time data
  const responseTimeData = mockChannelStats.map(stat => ({
    name: stat.channel.charAt(0).toUpperCase() + stat.channel.slice(1),
    time: stat.averageResponseTime
  }));
  
  // Calculate total message counts
  const totalMessages = mockChannelStats.reduce((sum, stat) => sum + stat.messageCount, 0);
  const unreadMessages = getUnreadMessagesCount();
  const unansweredMessages = getUnansweredMessagesCount();
  const responseRate = Math.round(((totalMessages - unansweredMessages) / totalMessages) * 100);
  
  // Colors for charts
  const COLORS = ['#0ea5e9', '#f97316', '#8b5cf6', '#10b981', '#ef4444'];
  
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
                <p className="text-3xl font-bold">{unreadMessages}</p>
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
                <p className="text-3xl font-bold">102<span className="text-base font-normal ml-1">min</span></p>
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
                  data={channelData}
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
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
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
                  data={responseTimeData}
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
