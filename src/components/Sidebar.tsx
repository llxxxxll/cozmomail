import React from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Inbox, LayoutDashboard, Settings, Users, LayoutTemplate, MenuIcon, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

const menuItems = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  const { activeView, setActiveView, isSidebarCollapsed, toggleSidebar } = useApp();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const initials = user?.user_metadata?.full_name 
    ? `${user.user_metadata.full_name.split(' ')[0][0]}${user.user_metadata.full_name.split(' ')[1]?.[0] || ''}`
    : user?.email?.[0]?.toUpperCase() || '?';
    
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div
      className={cn(
        'h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300',
        isSidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h1 
          className={cn(
            "font-bold text-primary transition-opacity duration-300",
            isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100"
          )}
        >
          CozmoMail
        </h1>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <MenuIcon className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 py-6">
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeView === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start mb-1",
                  isSidebarCollapsed ? "justify-center px-2" : ""
                )}
                onClick={() => setActiveView(item.id as any)}
              >
                <Icon className={cn("h-5 w-5", isSidebarCollapsed ? "mr-0" : "mr-2")} />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </Button>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-3", isSidebarCollapsed ? "hidden" : "")}>
            <Avatar>
              <AvatarImage src="" alt={user?.user_metadata?.full_name || user?.email} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.user_metadata?.full_name || user?.email}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSignOut}
            title="Sign Out"
          >
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
