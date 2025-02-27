
import React from 'react';
import MainLayout from '@/layouts/MainLayout';
import { AppProvider, useApp } from '@/context/AppContext';
import Inbox from '@/components/Inbox';
import Dashboard from '@/components/Dashboard';
import ResponseTemplates from '@/components/ResponseTemplates';
import { ThemeProvider } from 'next-themes';

const AppContent: React.FC = () => {
  const { activeView } = useApp();

  return (
    <MainLayout>
      {activeView === 'inbox' && <Inbox />}
      {activeView === 'dashboard' && <Dashboard />}
      {activeView === 'templates' && <ResponseTemplates />}
    </MainLayout>
  );
};

const Index: React.FC = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
};

export default Index;
