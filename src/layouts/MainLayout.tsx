
import React from 'react';
import Sidebar from '@/components/Sidebar';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MenuIcon } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isSidebarCollapsed, toggleSidebar } = useApp();
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={toggleSidebar}
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">CozmoMail</h1>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm hidden md:inline-block">
              Welcome, {user?.user_metadata?.full_name || user?.email}
            </span>
          </div>
        </header>
        
        <main className={cn(
          "flex-1 overflow-auto p-4 sm:p-6",
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
