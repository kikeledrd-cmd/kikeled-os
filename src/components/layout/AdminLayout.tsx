import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { adminNavigation } from './navigation';
import { WorkspaceHeader } from './WorkspaceHeader';

export function AdminLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen bg-noise text-white lg:flex">
      <Sidebar title="Kikeled OS" subtitle="Operacion central del negocio visual." items={adminNavigation} />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
          <WorkspaceHeader />
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  );
}
