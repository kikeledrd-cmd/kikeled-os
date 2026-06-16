import { FormEvent, useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore, useSession } from '../../store/useAppStore';

function defaultRouteForRole(roleKind?: 'admin' | 'sales' | 'client') {
  if (roleKind === 'client') return '/portal';
  if (roleKind === 'sales') return '/admin/leads';
  return '/admin';
}

export function AccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAppStore((state) => state.login);
  const { authError, authStatus } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const redirectTo = (location.state as { from?: string } | null)?.from;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sessionUser = await login(email.trim(), password);
    navigate(redirectTo ?? defaultRouteForRole(sessionUser.roleKind), { replace: true });
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[0.9fr,1.1fr]">
        <div className="panel p-8">
          <div className="mb-6 inline-grid h-12 w-12 place-items-center rounded-2xl border border-glow/30 bg-glow/10 text-glow">
            <LockKeyhole size={22} />
          </div>
          <p className="label mb-3">Acceso privado</p>
          <h1 className="text-4xl font-semibold text-white">Inicia sesion en Kikeled OS.</h1>
          <p className="mt-4 leading-7 text-soft">
            Usa tu usuario y contrasena asignados. El sistema abrira automaticamente el area correcta segun tu rol.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="panel grid gap-4 p-8">
          <div className="mb-2 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <ShieldCheck className="mt-0.5 text-glow" size={20} />
            <p className="text-sm leading-6 text-soft">
              Acceso para administracion, ventas y clientes autorizados.
            </p>
          </div>
          <input
            className="field"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Usuario o correo"
            type="email"
            autoComplete="username"
            required
          />
          <input
            className="field"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Contrasena"
            type="password"
            autoComplete="current-password"
            required
          />
          {authError ? <p className="text-sm text-rose">{authError}</p> : null}
          <button className="btn-primary" type="submit" disabled={authStatus === 'loading'}>
            {authStatus === 'loading' ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </section>
  );
}
