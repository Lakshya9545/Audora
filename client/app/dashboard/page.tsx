'use client';

import DashboardLayout from '@/components/DashboardLayout';
import withAuth from '@/components/hoc/withAuth';
import SidebarNav from '@/components/Dashboardlayout2';

function DashboardPage() {
  return <DashboardLayout />;
  // return <SidebarNav />;
  
}

export default withAuth(DashboardPage);