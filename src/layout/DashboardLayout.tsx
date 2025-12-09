
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../pages/Header'; 
import Sidebar from '../routes/Sidebar'; 
import UserProfile from './UserProfile';

interface User {
  role: "GUEST" | "HOST" | "ADMIN";
  firstName: string;
}

const DashboardLayout: React.FC<{ user: User | null }> = ({ user }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Pass props to the Header */}
      <Header />

      <div className="flex">
        {/* Render the Sidebar and pass the role prop */}
        <Sidebar/>

        {/* The main content area will now take up the remaining space */}
        <main className="flex-1 p-6 space-y-6">
          {/* <UserProfile /> */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;