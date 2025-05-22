
import React, { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return <AppLayout>{children}</AppLayout>;
};

export default MainLayout;
