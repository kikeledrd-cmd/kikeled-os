# Nexus Inbox MVP — Auto-revisión normativa del plan

**Plan revisado:** `docs/superpowers/plans/2026-07-20-nexus-inbox-mvp.md`  
**Especificación:** `docs/superpowers/specs/2026-07-20-nexus-inbox-mvp-design.md`  
**Estado:** Aprobado con las correcciones obligatorias de este documento.

Este archivo forma parte del plan de implementación. Cuando exista una diferencia entre el plan principal y esta auto-revisión, **prevalece esta auto-revisión**.

## 1. Cobertura de la especificación

La revisión confirmó cobertura para:

- Entrada híbrida desde `/cotizar` y conversación pegada.
- Acceso desde Leads y Nexus Inbox.
- Extracción comercial y señales inteligentes.
- Detección de duplicados.
- Umbrales de confianza y aprobación humana.
- Respuestas basadas en plantillas.
- Proveedor de IA intercambiable.
- Tablas propias de Nexus con `organizationId`.
- Adaptador temporal al `AppData` actual.
- Roles admin/ventas.
- Auditoría, seguridad, errores y despliegue gradual.
- Pruebas de los 18 escenarios obligatorios.
- Protección del flujo lead → cliente → cotización → orden → factura → pago.

No se requiere dividir el MVP en otros planes: todos los componentes forman un solo flujo desplegable y verificable.

## 2. Correcciones obligatorias de consistencia

### C1 — ActorContext admite sistema

Definir una sola vez y reutilizar en `service.ts`, `crmAdapter.ts` y pruebas:

```ts
export type NexusActorContext = {
  id: string;
  name: string;
  roleKind: 'admin' | 'sales' | 'system';
};
```

Los usuarios autenticados solo producen `admin` o `sales`. El actor `system` se usa únicamente para `/cotizar`, migraciones y tareas internas del backend.

### C2 — El lead público vinculado nunca se vuelve a crear

`ingestPublicLead()` debe crear el inbox con `linkedLeadId = lead.id` y `sourceReference = lead.id`.

`analyze()` debe aplicar esta regla antes del auto guardado:

```ts
if (item.linkedLeadId) {
  return repository.updateInboxItem(config.organizationId, item.id, {
    status: 'review',
    latestAnalysisId: stored.id,
    reviewDecision: decision,
  });
}
```

Para un elemento proveniente de `/cotizar`, la acción humana válida es **actualizar/vincular el lead existente**, nunca `createLead`.

### C3 — El detector excluye el registro ya vinculado

Extender la firma:

```ts
export function findDuplicateCandidates(
  appData: AppData,
  input: DuplicateSearchInput,
  options: { excludeLeadId?: string; excludeCustomerId?: string } = {},
): DuplicateCandidate[]
```

Antes de inspeccionar:

```ts
if (entityType === 'lead' && entity.id === options.excludeLeadId) return;
if (entityType === 'customer' && entity.id === options.excludeCustomerId) return;
```

`NexusService.analyze()` pasará:

```ts
{
  excludeLeadId: item.linkedLeadId,
  excludeCustomerId: item.linkedCustomerId,
}
```

### C4 — Unicidad compatible con elementos descartados

Eliminar `UNIQUE (organization_id, content_hash)` de la definición de `nexus_inbox_items`.

Crear índices parciales:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS nexus_inbox_active_hash_unique
ON nexus_inbox_items (organization_id, content_hash)
WHERE status <> 'discarded';

CREATE UNIQUE INDEX IF NOT EXISTS nexus_inbox_source_reference_unique
ON nexus_inbox_items (organization_id, source, source_reference)
WHERE source_reference IS NOT NULL AND status <> 'discarded';
```

El repositorio JSON mantendrá la misma semántica: un elemento descartado no bloquea una importación posterior.

### C5 — Agent run registra el resultado real

Sustituir el bloque `finally` de Task 7 por esta lógica:

```ts
let runStatus: 'completed' | 'failed' = 'completed';
let runErrorCode: string | undefined;
let runErrorMessage: string | undefined;
let runOutput: unknown;

try {
  // análisis, duplicados, decisión y persistencia
  runOutput = { analysisId: stored.id, decision, riskFlags };
  return result;
} catch (error) {
  runStatus = 'failed';
  runErrorCode = error instanceof SyntaxError ? 'invalid_provider_json' : 'analysis_failed';
  runErrorMessage = error instanceof Error ? error.message : 'Error desconocido.';
  await repository.updateInboxItem(config.organizationId, item.id, {
    status: 'failed',
    errorMessage: runErrorMessage,
  });
  throw error;
} finally {
  await repository.saveAgentRun({
    organizationId: config.organizationId,
    inboxItemId: item.id,
    agentName: 'conversation-analyzer',
    provider: provider.name,
    model: provider.model,
    status: runStatus,
    inputHash: item.contentHash,
    output: runOutput,
    errorCode: runErrorCode,
    errorMessage: runErrorMessage,
    durationMs: Date.now() - startedAt,
  });
}
```

Nunca registrar `completed` después de una excepción.

### C6 — Revisión efectiva depende del modo de despliegue

Mantener dos conceptos separados:

```ts
const modelDecision = decideReview(reviewInput);
const effectiveRequiresHumanReview =
  modelDecision !== 'auto' || config.automationMode !== 'limited' || Boolean(item.linkedLeadId);
```

Persistir:

```ts
const analysis = {
  ...aiAnalysis,
  riskFlags,
  requiresHumanReview: effectiveRequiresHumanReview,
};
```

- `shadow`: siempre revisión humana; no escritura automática.
- `review`: siempre revisión humana; acciones disponibles.
- `limited`: auto guardado solo si `modelDecision === 'auto'`, no hay registro vinculado y no existen riesgos/duplicados.

### C7 — Interfaz SQL exacta

`repository.ts` no debe ejecutar reemplazos de texto sobre SQL para convertir `$1` a `?`. Crear dos helpers explícitos:

```ts
async function pgRows<T>(sql: string, params: unknown[]): Promise<T[]> {
  const result = await queryPostgres(sql, params);
  return result.rows as T[];
}

function sqliteRows<T>(sql: string, params: unknown[]): T[] {
  return getSqliteDatabaseForInternalUse()!.prepare(sql).all(...params) as T[];
}
```

Cada método del repositorio tendrá una consulta Postgres y otra SQLite con placeholders propios. El backend JSON se mantiene en `fileRepository.ts`.

### C8 — Rutas obligatorias sin resumen ambiguo

`createNexusRouter()` debe registrar exactamente:

```text
GET    /inbox
POST   /inbox
GET    /inbox/:id
POST   /inbox/:id/analyze
POST   /inbox/:id/retry
POST   /inbox/:id/discard
POST   /inbox/:id/approve
POST   /inbox/:id/link-lead
POST   /inbox/:id/link-customer
POST   /inbox/:id/create-lead
POST   /inbox/:id/update-lead
POST   /inbox/:id/generate-reply
POST   /inbox/:id/mark-reply-copied
POST   /inbox/:id/request-task
POST   /inbox/:id/request-quote
POST   /inbox/:id/assign-human
GET    /templates
POST   /templates
PUT    /templates/:id
POST   /templates/:id/activate
POST   /templates/:id/deactivate
GET    /runs
GET    /events
```

Reglas:

- Inbox, análisis y acciones: `admin` y `sales`.
- Crear/editar/activar/desactivar plantillas: solo `admin`.
- `runs` y `events`: solo `admin`.
- `request-task` y `request-quote` crean `nexus_approvals` pendientes y eventos; no crean directamente tareas ni cotizaciones finales.

### C9 — Acción de aprobar idempotente

Antes de modificar el CRM:

```ts
if (item.status === 'processed' && item.linkedLeadId) {
  return { item, leadId: item.linkedLeadId, alreadyProcessed: true };
}
```

Después de una escritura exitosa, actualizar el inbox y aprobación en el mismo flujo lógico. Si actualizar Nexus falla después de escribir el CRM, registrar `reconciliation.required` con `linkedLeadId` para reparación; no volver a crear el lead en reintentos.

### C10 — Fallo de Nexus no cambia el contrato principal de `/cotizar`

`createPublicLead()` puede devolver `{ lead, stateVersion }` internamente, pero el endpoint mantiene `lead` como dato obligatorio. `nexusInboxId` es opcional.

Pruebas obligatorias:

```ts
expect(response.status).toBe(201);
expect(response.body.lead.id).toBeTruthy();
expect(response.body.nexusInboxId).toBeUndefined(); // cuando Nexus falla
```

### C11 — Structured Outputs usa la API disponible de Zod 4

Preferir:

```ts
import { z } from 'zod';
const schema = z.toJSONSchema(nexusLeadAnalysisSchema);
```

Usar el objeto en:

```ts
text: {
  format: {
    type: 'json_schema',
    name: 'nexus_lead_analysis',
    strict: true,
    schema,
  },
},
```

No usar JSON mode antiguo. Validar de nuevo la salida con `nexusLeadAnalysisSchema.parse()` aunque Structured Outputs esté activo.

### C12 — El proveedor falso debe compartir fixtures, no lógica de producción

Crear `tests/nexus/fixtures/fakeAnalysis.ts` con una salida válida. `FakeAIProvider` puede seleccionar fixtures por marcadores de texto en pruebas, pero no debe intentar ser un parser comercial completo.

Ejemplo:

```ts
if (input.normalizedContent.includes('[fixture:complete-lead]')) {
  return structuredClone(completeLeadAnalysisFixture);
}
return structuredClone(incompleteLeadAnalysisFixture);
```

Las pruebas de normalización y reglas deterministas cubren la lógica real que no depende del modelo.

## 3. Verificación de tipos compartidos

Los nombres canónicos son:

```text
NexusInboxItem
NexusLeadAnalysis
NexusTemplate
NexusApproval
NexusReviewDecision
NexusActorContext
NexusRepository
StoredAnalysis
AgentRunInput
AIProvider
CRMAdapter
NexusService
```

No introducir variantes como `InboxAnalysis`, `NexusAnalysisResult`, `AgentProvider` o `CrmGateway` durante este MVP.

## 4. Verificación final antes de ejecución

Ejecutar durante la implementación:

```bash
npm run test:nexus
npm test
npm run build
npx tsc -b
npx tsc -p tsconfig.server.json --noEmit
grep -rn "Ã" src/ server/
```

La implementación no se considera terminada si:

- `/cotizar` deja de crear leads cuando Nexus está apagado o falla.
- Un inbox de formulario crea un segundo lead.
- Un elemento descartado bloquea para siempre la misma conversación.
- Un run fallido aparece como completado.
- `shadow` o `review` escribe automáticamente en el CRM.
- Una respuesta sugerida introduce precio, descuento o promesa de fecha.
- Ventas puede modificar plantillas.
- Una acción repetida crea registros duplicados.
- Existen credenciales en el repositorio.
