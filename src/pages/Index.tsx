
import React from 'react';
import { useApp } from '@/context/AppContext';
import MainLayout from '@/layouts/MainLayout';
import Dashboard from '@/components/Dashboard';
import Inbox from '@/components/Inbox';
import ResponseTemplates from '@/components/ResponseTemplates';
import MessageCategorization from '@/components/MessageCategorization';
import Settings from '@/components/Settings';

const Index: React.FC = () => {
  const { activeView } = useApp();

  return (
    <MainLayout>
      {activeView === 'dashboard' && <Dashboard />}
      {activeView === 'inbox' && <Inbox />}
      {activeView === 'templates' && <ResponseTemplates />}
      {activeView === 'customers' && <MessageCategorization />}
      {activeView === 'settings' && <Settings />}
    </MainLayout>
  );
};

export default Index;
