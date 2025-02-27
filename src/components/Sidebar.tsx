
import React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  BellIcon,
  LayoutDashboardIcon,
  InboxIcon,
  UsersIcon,
  FileTextIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BellOffIcon,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { 
    activeView, 
    setActiveView, 
    isSidebarCollapsed, 
    toggleSidebar,
    messages,
    notifications,
    toggleNotifications
  } = useApp();
  
  const { signOut } = useAuth();
  
  // Calculate unread message count
  const unreadCount = messages.filter(msg => !msg.isRead).length;
  
  // Determine if the current path is active
  const isActive = (view: string) => activeView === view;
  
  const navItems = [
    { 
      name: 'Dashboard', 
      icon: <LayoutDashboardIcon className="h-5 w-5" />, 
      view: 'dashboard',
      badge: null
    },
    { 
      name: 'Inbox', 
      icon: <InboxIcon className="h-5 w-5" />, 
      view: 'inbox',
      badge: unreadCount > 0 ? unreadCount : null
    },
    { 
      name: 'Customers', 
      icon: <UsersIcon className="h-5 w-5" />, 
      view: 'customers',
      badge: null
    },
    { 
      name: 'Templates', 
      icon: <FileTextIcon className="h-5 w-5" />, 
      view: 'templates',
      badge: null
    },
    { 
      name: 'Settings', 
      icon: <SettingsIcon className="h-5 w-5" />, 
      view: 'settings',
      badge: null
    }
  ];

  const handleNavigation = (view: 'inbox' | 'dashboard' | 'templates' | 'customers' | 'settings') => {
    setActiveView(view);
  };

  return (
    <div className={cn(
      "h-screen fixed left-0 top-0 bottom-0 z-20 flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 shadow-sm",
      isSidebarCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex items-center p-4 h-16 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        {!isSidebarCollapsed && (
          <div className="text-xl font-bold text-primary">CozmoMail</div>
        )}
        <Button 
          variant="ghost" 
          size="icon"
          className={cn("ml-auto", isSidebarCollapsed && "mx-auto")}
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto py-6 bg-white dark:bg-gray-950">
        <div className="space-y-2 px-3">
          {navItems.map((item) => (
            <Button
              key={item.view}
              variant={isActive(item.view) ? "default" : "ghost"}
              className={cn(
                "w-full justify-start font-normal transition-all",
                isSidebarCollapsed ? "px-3" : "px-4",
                isActive(item.view) 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-900"
              )}
              onClick={() => handleNavigation(item.view as any)}
            >
              {item.icon}
              {!isSidebarCollapsed && (
                <span className="ml-2">{item.name}</span>
              )}
              {!isSidebarCollapsed && item.badge && (
                <Badge variant="destructive" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
              {isSidebarCollapsed && item.badge && (
                <Badge variant="destructive" className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center p-0">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size={isSidebarCollapsed ? "icon" : "default"} 
                className={cn(
                  "w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-800",
                  isSidebarCollapsed && "p-2"
                )}
                onClick={toggleNotifications}
              >
                {notifications ? (
                  <BellIcon className="h-5 w-5" />
                ) : (
                  <BellOffIcon className="h-5 w-5" />
                )}
                {!isSidebarCollapsed && (
                  <span className="ml-2">
                    {notifications ? "Notifications On" : "Notifications Off"}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isSidebarCollapsed ? "right" : "top"}>
              <p>{notifications ? "Turn off notifications" : "Turn on notifications"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button 
          variant="ghost" 
          size={isSidebarCollapsed ? "icon" : "default"}
          className={cn(
            "w-full justify-start mt-2 hover:bg-gray-100 dark:hover:bg-gray-800",
            isSidebarCollapsed && "p-2"
          )}
          onClick={signOut}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
          {!isSidebarCollapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
