import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { SectionCard } from '../../components/shared/SectionCard';
import { apiExportAppData, apiImportAppData } from '../../lib/api';
import { useAppStore } from '../../store/useAppStore';

export function SettingsPage() {
  const { roles, users, resetDemo, initialize } = useAppStore((state) => state);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [dataStatus, setDataStatus] = useState('');

  async function handleExport() {
    setDataStatus('');
    try {
      await apiExportAppData();
      setDataStatus('Exportación descargada.');
    } catch (error) {
      setDataStatus(error instanceof Error ? error.message : 'No se pudo exportar.');
    }
  }

  async function handleImportFile(file: File) {
    setDataStatus('');
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      await apiImportAppData(parsed);
      await initialize();
      setDataStatus('Importación completada. Datos restaurados.');
    } catch (error) {
      setDataStatus(error instanceof Error ? error.message : 'No se pudo importar el archivo.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Sistema" title="Configuracion" description="Usuarios, roles, precios, respaldos y reinicio controlado del entorno." />
      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Usuarios" description="Crea y edita accesos de admin, ventas y clientes.">
          <div className="mb-4 space-y-3">
            {users.map((user) => (
              <div key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-soft">{user.email}</p>
              </div>
            ))}
          </div>
          <Link className="btn-secondary" to="/admin/usuarios">Gestionar usuarios</Link>
        </SectionCard>
        <SectionCard title="Roles" description="Permisos activos del sistema.">
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
                <p className="font-medium">{role.name}</p>
                <p className="text-sm text-soft">{role.permissions.join(', ')}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Respaldo de datos" description="Descarga una copia completa o restaura desde un archivo exportado.">
          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary" onClick={handleExport}>Exportar datos</button>
            <button className="btn-secondary" onClick={() => importInputRef.current?.click()}>Importar datos</button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) void handleImportFile(file);
              }}
            />
          </div>
          {dataStatus ? <p className="mt-3 text-sm text-soft">{dataStatus}</p> : null}
        </SectionCard>
        <SectionCard title="Datos operativos" description="Restablece la persistencia local si quieres reiniciar pruebas.">
          <button className="btn-primary" onClick={resetDemo}>Dejar sistema en cero</button>
        </SectionCard>
        <SectionCard title="Reglas de precios" description="Materiales, instalacion, ciudades y multiplicadores del cotizador.">
          <Link className="btn-secondary" to="/admin/configuracion/precios">Editar reglas</Link>
        </SectionCard>
      </div>
    </div>
  );
}
