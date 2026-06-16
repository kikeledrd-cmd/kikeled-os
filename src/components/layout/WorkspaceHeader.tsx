import { LogIn, LogOut, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore, useSession } from '../../store/useAppStore';

export function WorkspaceHeader() {
  const { user, role } = useSession();
  const logout = useAppStore((state) => state.logout);

  if (!user || !role) return null;

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="label mb-2">Sesión activa</p>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 font-semibold text-white">
            {user.avatar}
          </div>
          <div>
            <p className="font-semibold text-white">{user.name}</p>
            <p className="text-sm text-soft">{role.name}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-ink/60 px-3 py-2 text-sm text-soft">
          <Shield size={16} />
          Auth real con sesión backend
        </div>
        <Link to="/acceso" className="btn-secondary">
          <LogIn size={16} className="mr-2" />
          Cambiar usuario
        </Link>
        <button className="btn-ghost" onClick={() => void logout()}>
          <LogOut size={16} className="mr-2" />
          Salir
        </button>
      </div>
    </div>
  );
}
