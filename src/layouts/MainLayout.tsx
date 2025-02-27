
import React from 'react';
import { useApp } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import { 
  MenuIcon, 
  BellIcon, 
  UserIcon, 
  Mail, 
  MessageSquare, 
  Phone, 
  LayoutDashboard
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUnreadMessagesCount } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { 
    isSidebarCollapsed, 
    toggleSidebar,
    activeView,
    setActiveView
  } = useApp();
  
  const unreadCount = getUnreadMessagesCount();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className={cn(
        "flex flex-col flex-grow transition-all duration-300",
        isSidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Top navigation bar */}
        <header className="w-full h-16 flex items-center justify-between px-4 sm:px-6 border-b shadow-sm backdrop-blur-sm bg-background/80 z-10">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              {activeView === 'inbox' && (
                <>
                  <MessageSquare className="h-5 w-5 text-brand-500" />
                  <h1 className="text-lg font-medium">Inbox</h1>
                </>
              )}
              {activeView === 'dashboard' && (
                <>
                  <LayoutDashboard className="h-5 w-5 text-brand-500" />
                  <h1 className="text-lg font-medium">Dashboard</h1>
                </>
              )}
              {activeView === 'templates' && (
                <>
                  <Mail className="h-5 w-5 text-brand-500" />
                  <h1 className="text-lg font-medium">Response Templates</h1>
                </>
              )}
              {activeView === 'customers' && (
                <>
                  <UserIcon className="h-5 w-5 text-brand-500" />
                  <h1 className="text-lg font-medium">Customers</h1>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-brand-500">
                  <span className="text-xs">{unreadCount}</span>
                </Badge>
              )}
            </Button>
            
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-grow p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
