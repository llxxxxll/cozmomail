
import React from 'react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { MessageSquare, LayoutDashboard, Users, MessageCircle, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUnreadMessagesCount, getUnansweredMessagesCount } from '@/data/mockData';

const Sidebar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    isSidebarCollapsed, 
    toggleSidebar 
  } = useApp();
  
  const unreadCount = getUnreadMessagesCount();
  const unansweredCount = getUnansweredMessagesCount();
  
  const menuItems = [
    {
      id: 'inbox',
      label: 'Inbox',
      icon: MessageSquare,
      badge: unreadCount,
      onClick: () => setActiveView('inbox')
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      onClick: () => setActiveView('dashboard')
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: MessageCircle,
      onClick: () => setActiveView('templates')
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      onClick: () => setActiveView('customers')
    }
  ];

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-20 h-screen transition-all duration-300 border-r shadow-sm bg-sidebar py-4",
      isSidebarCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={cn(
          "flex items-center px-4 py-2 mb-6",
          isSidebarCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                CozmoMail
              </span>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-muted-foreground hover:text-foreground"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Menu Items */}
        <div className="flex-grow px-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={cn(
                "sidebar-item w-full",
                activeView === item.id && "sidebar-item-active",
                isSidebarCollapsed && "justify-center"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isSidebarCollapsed && (
                <span className="flex-grow text-left">{item.label}</span>
              )}
              {!isSidebarCollapsed && item.badge && item.badge > 0 && (
                <span className="rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 text-xs font-medium px-2 py-0.5">
                  {item.badge}
                </span>
              )}
              {isSidebarCollapsed && item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 rounded-full bg-brand-500 text-white text-xs w-4 h-4 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* Bottom section */}
        <div className="px-2 py-2 mt-auto">
          <button
            onClick={() => {}}
            className={cn(
              "sidebar-item w-full",
              isSidebarCollapsed && "justify-center"
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!isSidebarCollapsed && (
              <span className="flex-grow text-left">Settings</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
