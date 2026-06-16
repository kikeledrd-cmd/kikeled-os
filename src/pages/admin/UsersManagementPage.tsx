import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { apiCreateUser, apiDeleteUser, apiListUsers, apiUpdateUser, type UserInput } from '../../lib/api';
import { useAppStore } from '../../store/useAppStore';
import type { User } from '../../types/entities';

type UserDraft = UserInput & {
  password: string;
};

const emptyDraft: UserDraft = {
  name: '',
  email: '',
  roleId: 'role-sales',
  password: '',
  avatar: '',
  customerId: '',
};

const roleLabels: Record<UserDraft['roleId'], string> = {
  'role-admin': 'Admin',
  'role-sales': 'Ventas',
  'role-client': 'Cliente',
};

export function UsersManagementPage() {
  const sessionUser = useAppStore((state) => state.sessionUser);
  const customers = useAppStore((state) => state.customers);
  const roles = useAppStore((state) => state.roles);
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<UserDraft>(emptyDraft);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const editingUser = useMemo(() => users.find((user) => user.id === editingId) ?? null, [editingId, users]);

  async function loadUsers() {
    const response = await apiListUsers();
    setUsers(response.users);
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  function updateDraft<K extends keyof UserDraft>(key: K, value: UserDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function startEdit(user: User) {
    setEditingId(user.id);
    setDraft({
      name: user.name,
      email: user.email,
      roleId: user.roleId as UserDraft['roleId'],
      password: '',
      avatar: user.avatar,
      customerId: user.customerId ?? '',
    });
  }

  function resetForm() {
    setEditingId(null);
    setDraft(emptyDraft);
    setError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      if (editingId) {
        await apiUpdateUser(editingId, {
          ...draft,
          password: draft.password || '',
          customerId: draft.roleId === 'role-client' ? draft.customerId || null : null,
        });
        setMessage('Usuario actualizado.');
      } else {
        if (!draft.password) {
          setError('La contrasena es obligatoria para usuarios nuevos.');
          return;
        }
        await apiCreateUser({
          ...draft,
          password: draft.password,
          customerId: draft.roleId === 'role-client' ? draft.customerId || null : null,
        });
        setMessage('Usuario creado.');
        resetForm();
      }
      await loadUsers();
      window.setTimeout(() => setMessage(''), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el usuario.');
    }
  }

  async function handleDelete(user: User) {
    setError('');
    if (user.id === sessionUser?.id) {
      setError('No puedes eliminar tu propio usuario activo.');
      return;
    }
    await apiDeleteUser(user.id);
    await loadUsers();
    setMessage('Usuario eliminado.');
    if (editingId === user.id) resetForm();
    window.setTimeout(() => setMessage(''), 1800);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Seguridad"
        title="Gestion de usuarios"
        description="Administra accesos para administradores, ventas y clientes. Solo admin puede entrar a esta pantalla."
        action={message ? <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">{message}</span> : null}
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <SectionCard title={editingUser ? `Editando: ${editingUser.name}` : 'Nuevo usuario'} description="Define credenciales, rol y cliente asociado si aplica.">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <input className="field" value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} placeholder="Nombre completo" required />
            <input className="field" value={draft.email} onChange={(event) => updateDraft('email', event.target.value)} placeholder="Correo / usuario" type="email" required />
            <div className="grid gap-3 md:grid-cols-2">
              <select className="field" value={draft.roleId} onChange={(event) => updateDraft('roleId', event.target.value as UserDraft['roleId'])}>
                <option value="role-admin">Admin</option>
                <option value="role-sales">Ventas</option>
                <option value="role-client">Cliente</option>
              </select>
              <input className="field" value={draft.avatar} onChange={(event) => updateDraft('avatar', event.target.value)} placeholder="Iniciales / avatar" />
            </div>
            {draft.roleId === 'role-client' ? (
              <select className="field" value={draft.customerId ?? ''} onChange={(event) => updateDraft('customerId', event.target.value)}>
                <option value="">Sin cliente asociado todavia</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.business}</option>
                ))}
              </select>
            ) : null}
            <input
              className="field"
              value={draft.password}
              onChange={(event) => updateDraft('password', event.target.value)}
              placeholder={editingId ? 'Nueva contrasena opcional' : 'Contrasena'}
              type="password"
              required={!editingId}
            />
            {error ? <p className="text-sm text-rose">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary" type="submit">
                <Save size={16} className="mr-2" />
                {editingId ? 'Guardar cambios' : 'Crear usuario'}
              </button>
              {editingId ? (
                <button className="btn-secondary" type="button" onClick={resetForm}>
                  <X size={16} className="mr-2" />
                  Cancelar
                </button>
              ) : (
                <button className="btn-secondary" type="button" onClick={() => setDraft({ ...emptyDraft, roleId: 'role-client' })}>
                  <Plus size={16} className="mr-2" />
                  Preparar cliente
                </button>
              )}
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Usuarios registrados" description="Estos son los usuarios que pueden iniciar sesion en Kikeled OS.">
          <div className="grid gap-4">
            {users.map((user) => {
              const role = roles.find((item) => item.id === user.roleId);
              const customer = customers.find((item) => item.id === user.customerId);
              return (
                <article key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                        <StatusBadge label={roleLabels[user.roleId as UserDraft['roleId']] ?? role?.name ?? 'Usuario'} />
                      </div>
                      <p className="mt-1 text-sm text-soft">{user.email}</p>
                      {customer ? <p className="mt-2 text-sm text-cyan-100">Cliente: {customer.business}</p> : null}
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary" type="button" onClick={() => startEdit(user)}>
                        <Pencil size={15} className="mr-2" />
                        Editar
                      </button>
                      <button className="btn-ghost" type="button" onClick={() => void handleDelete(user)} disabled={user.id === sessionUser?.id}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
