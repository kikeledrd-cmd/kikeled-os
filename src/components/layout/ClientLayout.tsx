import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { clientNavigation } from './navigation';
import { WorkspaceHeader } from './WorkspaceHeader';

export function ClientLayout() {
  return (
    <div className="min-h-screen bg-noise text-white lg:flex">
      <Sidebar title="Portal Cliente" subtitle="Seguimiento claro, premium y conectado." items={clientNavigation} />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
          <WorkspaceHeader />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
