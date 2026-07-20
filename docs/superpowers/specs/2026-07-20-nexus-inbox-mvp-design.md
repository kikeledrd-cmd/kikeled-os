# Kikeled OS — Diseño oficial de Nexus Inbox MVP

**Fecha:** 20 de julio de 2026  
**Estado:** Aprobado para planificación  
**Producto:** Kikeled OS  
**Módulo:** Nexus Core / Nexus Inbox  
**Organización inicial:** Kikeled Studio SRL  
**Idioma de interfaz:** Español  
**Moneda:** RD$  
**Zona horaria:** America/Santo_Domingo

---

## 1. Resumen ejecutivo

Nexus Inbox será el primer módulo funcional de Nexus Core dentro de Kikeled OS. Su propósito es convertir conversaciones comerciales y formularios de cotización en leads organizados, análisis comerciales accionables y respuestas sugeridas, sin entregar control total a la inteligencia artificial.

El MVP procesará dos fuentes iniciales:

1. Solicitudes recibidas desde el formulario público `/cotizar`.
2. Conversaciones de WhatsApp pegadas manualmente por el equipo en Kikeled OS.

El sistema extraerá información comercial, detectará datos faltantes, evaluará intención de compra, sentimiento, urgencia y nivel de oportunidad, buscará posibles duplicados y propondrá una respuesta basada en plantillas aprobadas. Según la confianza y el riesgo, podrá crear un lead automáticamente o solicitar revisión humana.

La arquitectura será híbrida:

- La lógica crítica, permisos, validaciones, auditoría e integración con datos vivirán en el backend Express de Kikeled OS.
- Las entidades de Nexus se guardarán en tablas propias.
- Leads, clientes y cotizaciones actuales se consumirán mediante un adaptador temporal hacia `AppData`.
- n8n se reservará para integraciones externas futuras.
- La capa de modelos de IA será intercambiable mediante `AIProvider`.

El MVP será interno para Kikeled Studio, pero todos los registros nuevos de Nexus incluirán `organizationId` para facilitar una futura evolución multiempresa.

---

## 2. Objetivos

### 2.1 Objetivo principal

Reducir el tiempo y la pérdida de información entre la llegada de una conversación comercial y su conversión en un lead correctamente registrado y listo para seguimiento o cotización.

### 2.2 Objetivos operativos

- Centralizar conversaciones pendientes en una bandeja única.
- Extraer datos comerciales sin duplicar el CRM.
- Detectar clientes o leads existentes antes de crear registros.
- Identificar intención de compra, urgencia, sentimiento, objeciones y datos faltantes.
- Proponer la próxima acción comercial más conveniente.
- Redactar respuestas breves, cálidas y profesionales.
- Mantener aprobación humana en precios, descuentos, fechas, contratos y decisiones sensibles.
- Registrar cada análisis, sugerencia, aprobación, error y acción.
- Preparar la base técnica para futuros agentes especializados.

### 2.3 Métricas de éxito del MVP

- Al menos 80 % de los chats de prueba extraen correctamente nombre o identificador, servicio e intención.
- Cero duplicados creados automáticamente cuando existe una coincidencia clara.
- Cero precios, descuentos o fechas inventadas por la IA.
- Cien por ciento de las acciones automáticas quedan auditadas.
- Un operador puede procesar una conversación estándar en menos de dos minutos.
- El flujo existente lead → cliente → cotización → orden → factura → pago no se rompe.

---

## 3. Alcance del MVP

### 3.1 Incluido

- Módulo administrativo `Nexus Inbox`.
- Acción rápida `Importar conversación` desde Leads.
- Ingesta automática de solicitudes de `/cotizar` hacia Nexus Inbox.
- Pegado manual de conversaciones de WhatsApp.
- Normalización básica del contenido.
- Extracción estructurada de datos.
- Coincidencia con servicios activos del catálogo.
- Búsqueda de posibles duplicados en leads y clientes.
- Análisis de intención, sentimiento, urgencia y oportunidad.
- Cálculo de confianza por campo y confianza general.
- Clasificación automática o revisión humana según reglas.
- Creación o actualización de leads mediante `CRMAdapter`.
- Biblioteca de plantillas comerciales aprobadas.
- Respuesta sugerida editable.
- Acciones rápidas: copiar a WhatsApp, solicitar datos, crear tarea, preparar cotización, editar respuesta y asignar atención humana.
- Tablas independientes de Nexus.
- Auditoría técnica y comercial.
- Capa `AIProvider` intercambiable.
- OpenAI como proveedor inicial.

### 3.2 Fuera de alcance

- Envío automático por WhatsApp.
- WhatsApp Cloud API.
- Instagram o Facebook Messenger API.
- Cotización enviada sin aprobación humana.
- Descuentos automáticos.
- Promesas automáticas de fecha.
- Pagos, reembolsos o modificaciones bancarias.
- Multiempresa visible para usuarios finales.
- Portal de clientes específico para Nexus.
- RAG complejo con documentos externos.
- Agentes autónomos de producción, finanzas o soporte.
- Migración completa del CRM actual desde `AppData` a tablas normalizadas.
- n8n como dependencia obligatoria del MVP.

---

## 4. Usuarios y permisos

### 4.1 Roles iniciales

#### Admin

- Acceso completo a Nexus Inbox.
- Ver todas las conversaciones y análisis.
- Aprobar, editar, descartar o reprocesar.
- Administrar plantillas.
- Ver auditoría y errores.
- Configurar proveedor, modelo y umbrales.

#### Ventas

- Importar conversaciones.
- Ver y procesar inbox.
- Editar datos extraídos.
- Crear o actualizar leads.
- Copiar respuestas sugeridas.
- Crear tareas y preparar borradores de cotización.
- No puede cambiar configuración global, claves, umbrales ni plantillas bloqueadas.

#### Producción

- Sin acceso en el MVP.

#### Cliente

- Sin acceso a Nexus Inbox.

### 4.2 Principio de mínimo privilegio

Cada endpoint verificará sesión, rol y organización. Las credenciales de proveedores de IA solo vivirán en variables de entorno del backend. Ningún prompt tendrá claves, secretos o credenciales.

---

## 5. Experiencia del usuario

### 5.1 Entrada desde Leads

En `/admin/leads` aparecerá un botón:

**Importar conversación**

Al abrirlo, el usuario podrá:

- Pegar una conversación.
- Seleccionar origen: WhatsApp, Instagram, Facebook, llamada, correo u otro.
- Añadir teléfono conocido opcional.
- Añadir nombre conocido opcional.
- Procesar inmediatamente o guardar para después.

### 5.2 Módulo Nexus Inbox

Ruta propuesta:

`/admin/nexus/inbox`

La bandeja mostrará filtros por:

- Pendiente.
- Procesando.
- Revisión requerida.
- Aprobado.
- Guardado automáticamente.
- Fallido.
- Descartado.
- Canal.
- Nivel de oportunidad.
- Responsable.
- Fecha.

Cada fila mostrará:

- Identificador.
- Nombre detectado.
- Negocio detectado.
- Canal.
- Servicio probable.
- Oportunidad.
- Confianza.
- Estado.
- Responsable.
- Tiempo desde ingreso.

### 5.3 Vista de detalle

La pantalla de detalle tendrá cuatro zonas:

#### A. Conversación original

Texto inmutable, fecha, origen y usuario que lo importó.

#### B. Datos extraídos

Campos editables con confianza individual:

- Nombre.
- Negocio.
- Teléfono.
- WhatsApp.
- Correo.
- Ubicación.
- Tipo de negocio.
- Servicio.
- Medidas.
- Presupuesto.
- Urgencia.
- Descripción.

#### C. Señales inteligentes

- Intención de compra.
- Nivel de oportunidad.
- Sentimiento.
- Urgencia calculada.
- Objeciones.
- Datos faltantes.
- Resumen.
- Próxima acción.
- Posibles duplicados.

#### D. Respuesta y acciones

- Respuesta sugerida editable.
- Copiar a WhatsApp.
- Solicitar datos.
- Crear tarea.
- Preparar cotización.
- Vincular a lead o cliente existente.
- Crear lead.
- Hablar personalmente.
- Descartar.

---

## 6. Personalidad y política de comunicación

La identidad visible para el cliente será:

> Nexus, asistente virtual de Kikeled Studio.

El cliente no verá los nombres internos de los agentes.

### 6.1 Tono

- Profesional.
- Cálido.
- Dominicano neutro.
- Breve para WhatsApp.
- Claro y sin tecnicismos innecesarios.
- Una pregunta principal por mensaje.
- Sin presión comercial agresiva.
- Sin exceso de confianza.

### 6.2 Sistema híbrido de respuestas

La respuesta se construirá así:

1. Nexus clasifica la intención.
2. Selecciona una plantilla aprobada.
3. Inserta datos reales del cliente.
4. Ajusta redacción y tono.
5. Pasa por guardrails.
6. Se muestra editable al operador.

### 6.3 Contenido prohibido

La IA no puede inventar ni prometer:

- Precios.
- Descuentos.
- Fechas de entrega.
- Disponibilidad de materiales.
- Garantías no registradas.
- Condiciones de pago no configuradas.
- Aprobaciones legales.
- Reembolsos.
- Datos bancarios.

---

## 7. Arquitectura técnica

```text
React Admin UI
      ↓
Express API / Nexus Routes
      ↓
Nexus Application Services
      ├── InboxService
      ├── ConversationAnalyzer
      ├── DuplicateDetector
      ├── ApprovalEngine
      ├── ResponseComposer
      ├── CRMAdapter
      └── AuditService
      ↓
Repositories
      ├── NexusRepository → tablas Nexus
      └── CRMAdapter → AppData actual
      ↓
AIProvider
      ├── OpenAIProvider
      ├── ClaudeProvider futuro
      └── GeminiProvider futuro
```

### 7.1 Ubicación propuesta en el repositorio

```text
server/
  nexus/
    routes.ts
    schemas.ts
    config.ts
    services/
      inboxService.ts
      conversationAnalyzer.ts
      duplicateDetector.ts
      approvalEngine.ts
      responseComposer.ts
      auditService.ts
    providers/
      AIProvider.ts
      openAIProvider.ts
    repositories/
      nexusRepository.ts
      crmAdapter.ts
    guardrails/
      commercialGuardrails.ts
    prompts/
      conversationAnalysis.ts
      replyGeneration.ts

src/
  pages/admin/nexus/
    NexusInboxPage.tsx
    NexusInboxDetailPage.tsx
    NexusTemplatesPage.tsx
  components/nexus/
  lib/nexusApi.ts
  types/nexus.ts

docs/
  superpowers/specs/
```

### 7.2 Regla de aislamiento

Los componentes de Nexus no escribirán directamente en Zustand ni manipularán colecciones de `AppData`. Toda interacción con leads, clientes y cotizaciones pasará por `CRMAdapter`.

Cuando el CRM sea migrado a tablas propias, solo cambiará la implementación del adaptador.

---

## 8. Capa AIProvider

```ts
interface AIProvider {
  analyzeConversation(input: ConversationInput): Promise<LeadAnalysisResult>;
  generateReply(input: ReplyGenerationInput): Promise<SuggestedReplyResult>;
  healthCheck(): Promise<AIProviderHealth>;
}
```

### 8.1 Requisitos

- Salidas estructuradas y validadas con Zod.
- Timeout configurable.
- Reintento limitado.
- Registro de proveedor, modelo, latencia y uso disponible.
- Ninguna salida se considera confiable hasta pasar validación.
- Si el proveedor devuelve contenido inválido, no se modifica el CRM.

### 8.2 Proveedor inicial

OpenAI será el proveedor inicial. La selección del modelo se realizará por variable de entorno y configuración backend.

Variables propuestas:

```text
NEXUS_AI_PROVIDER=openai
OPENAI_API_KEY=
NEXUS_OPENAI_MODEL=
NEXUS_AI_TIMEOUT_MS=30000
NEXUS_AUTO_SAVE_THRESHOLD=0.90
NEXUS_REVIEW_THRESHOLD=0.70
```

No se incluirán valores reales en el repositorio.

---

## 9. Modelo de datos

Todas las tablas nuevas incluirán `organization_id`.

### 9.1 organizations

- `id`
- `name`
- `slug`
- `timezone`
- `currency`
- `is_active`
- `created_at`
- `updated_at`

Semilla inicial:

- `id`: `kikeled-studio`
- `name`: `Kikeled Studio SRL`
- `timezone`: `America/Santo_Domingo`
- `currency`: `DOP`

### 9.2 nexus_inbox_items

- `id`
- `organization_id`
- `source_channel`
- `source_reference`
- `raw_content`
- `normalized_content`
- `known_name`
- `known_phone`
- `status`
- `assigned_to`
- `lead_id`
- `customer_id`
- `created_by`
- `created_at`
- `updated_at`

Estados:

- `pending`
- `processing`
- `review_required`
- `auto_saved`
- `approved`
- `failed`
- `discarded`

### 9.3 nexus_analyses

- `id`
- `organization_id`
- `inbox_item_id`
- `lead_id`
- `provider`
- `model`
- `schema_version`
- `extracted_data_json`
- `field_confidence_json`
- `overall_confidence`
- `purchase_intent`
- `opportunity_level`
- `sentiment`
- `urgency_score`
- `objections_json`
- `missing_fields_json`
- `detected_services_json`
- `recommended_next_action`
- `conversation_summary`
- `requires_human_review`
- `review_reasons_json`
- `created_at`

### 9.4 nexus_templates

- `id`
- `organization_id`
- `name`
- `intent_key`
- `channel`
- `body_template`
- `allowed_variables_json`
- `is_locked`
- `is_active`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

Plantillas iniciales:

- Bienvenida.
- Solicitud de medidas.
- Solicitud de logo.
- Consulta de ubicación.
- Solicitud de presupuesto.
- Seguimiento de cotización.
- Confirmación de recepción.
- Agenda de reunión.
- Escalamiento humano.
- Cliente molesto.
- Proyecto institucional.
- Cierre sin interés.

### 9.5 nexus_approvals

- `id`
- `organization_id`
- `inbox_item_id`
- `analysis_id`
- `approval_type`
- `status`
- `requested_by`
- `reviewed_by`
- `requested_at`
- `reviewed_at`
- `notes`
- `snapshot_json`

Estados:

- `pending`
- `approved`
- `edited_and_approved`
- `rejected`
- `expired`

### 9.6 nexus_agent_runs

- `id`
- `organization_id`
- `inbox_item_id`
- `agent_name`
- `provider`
- `model`
- `input_hash`
- `status`
- `latency_ms`
- `error_code`
- `error_message`
- `metadata_json`
- `started_at`
- `finished_at`

No se guardarán secretos. El contenido completo solo se conservará donde sea necesario y permitido.

### 9.7 nexus_events

- `id`
- `organization_id`
- `event_type`
- `aggregate_type`
- `aggregate_id`
- `actor_type`
- `actor_id`
- `payload_json`
- `created_at`

Eventos iniciales:

- `nexus.inbox.created`
- `nexus.analysis.started`
- `nexus.analysis.completed`
- `nexus.analysis.failed`
- `nexus.review.required`
- `nexus.lead.created`
- `nexus.lead.updated`
- `nexus.reply.generated`
- `nexus.reply.copied`
- `nexus.task.requested`
- `nexus.quote.requested`
- `nexus.item.discarded`

---

## 10. Contrato de análisis

La salida del modelo deberá ajustarse a un esquema equivalente a:

```ts
interface NexusConversationAnalysis {
  extracted: {
    name?: string;
    business?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    city?: string;
    businessType?: string;
    serviceInterest?: string;
    measures?: string;
    urgency?: 'alta' | 'media' | 'baja';
    estimatedBudget?: number;
    description: string;
  };
  fieldConfidence: Record<string, number>;
  overallConfidence: number;
  purchaseIntent: 'alta' | 'media' | 'baja' | 'desconocida';
  opportunityLevel: 'alta' | 'media' | 'baja' | 'riesgo';
  sentiment: 'positivo' | 'neutral' | 'negativo' | 'mixto';
  urgencyScore: number;
  objections: string[];
  missingFields: string[];
  detectedServiceIds: string[];
  recommendedNextAction: string;
  conversationSummary: string;
  requiresHumanReview: boolean;
  reviewReasons: string[];
}
```

Todos los puntajes estarán entre 0 y 1, salvo `urgencyScore`, que podrá representarse entre 0 y 100.

---

## 11. Detección de duplicados

La búsqueda se realizará antes de crear o actualizar un lead.

### 11.1 Coincidencias fuertes

- Teléfono normalizado exacto.
- WhatsApp normalizado exacto.
- Correo exacto.

### 11.2 Coincidencias medias

- Nombre similar + negocio similar.
- Nombre similar + misma ciudad + mismo servicio.
- Número parcial con nombre consistente.

### 11.3 Reglas

- Una coincidencia fuerte bloquea creación automática y propone vinculación.
- Varias coincidencias medias requieren revisión.
- Sin coincidencias y confianza alta permite creación automática.
- Nexus nunca fusionará clientes automáticamente.

---

## 12. Motor de aprobación

### 12.1 Guardado automático

Solo podrá ocurrir cuando:

- `overallConfidence >= 0.90`.
- Existe nombre o identificador usable.
- Existe teléfono o WhatsApp válido.
- Existe servicio o interés suficientemente claro.
- No existen duplicados fuertes o medios relevantes.
- No se detectan precios, descuentos o fechas comprometidas.
- No es un proyecto institucional o complejo.
- No existen datos sensibles.
- No hay contradicciones importantes.

El lead se crea con:

- Estado `nuevo`.
- Fuente correspondiente.
- Nota de origen Nexus.
- Actividad de auditoría.

### 12.2 Revisión rápida

Cuando:

- `0.70 <= overallConfidence < 0.90`.
- Faltan campos secundarios.
- Existe una sola ambigüedad menor.

### 12.3 Revisión obligatoria

Cuando:

- `overallConfidence < 0.70`.
- Posible duplicado.
- Precio mencionado.
- Descuento solicitado.
- Fecha prometida.
- Cliente molesto.
- Proyecto institucional.
- Datos sensibles.
- Servicio no identificado.
- Información contradictoria.
- El modelo o esquema falla.

---

## 13. CRMAdapter

El adaptador será la única capa autorizada para interactuar con el CRM actual.

```ts
interface CRMAdapter {
  findLeadMatches(input: LeadMatchInput): Promise<LeadMatch[]>;
  findCustomerMatches(input: CustomerMatchInput): Promise<CustomerMatch[]>;
  createLead(input: CreateLeadInput, actor: ActorContext): Promise<Lead>;
  updateLead(id: string, input: UpdateLeadInput, actor: ActorContext): Promise<Lead>;
  createActivity(input: ActivityInput, actor: ActorContext): Promise<void>;
  requestQuoteDraft(input: QuoteDraftRequest, actor: ActorContext): Promise<void>;
}
```

### 13.1 Reglas

- No se escribirá directamente desde componentes React.
- No se inventarán campos que no existan.
- Los cambios llevarán autor real.
- Se respetará `stateVersion` y el manejo de conflictos existente.
- Un conflicto 409 no se reintentará silenciosamente sin recargar datos.
- Los datos comerciales derivados de IA se etiquetarán como sugeridos o confirmados.

---

## 14. Endpoints propuestos

### Inbox

- `GET /api/nexus/inbox`
- `POST /api/nexus/inbox`
- `GET /api/nexus/inbox/:id`
- `POST /api/nexus/inbox/:id/analyze`
- `POST /api/nexus/inbox/:id/retry`
- `POST /api/nexus/inbox/:id/discard`

### Revisión y CRM

- `POST /api/nexus/inbox/:id/approve`
- `POST /api/nexus/inbox/:id/link-lead`
- `POST /api/nexus/inbox/:id/link-customer`
- `POST /api/nexus/inbox/:id/create-lead`
- `POST /api/nexus/inbox/:id/update-lead`

### Respuestas

- `POST /api/nexus/inbox/:id/generate-reply`
- `POST /api/nexus/inbox/:id/mark-reply-copied`

### Acciones rápidas

- `POST /api/nexus/inbox/:id/request-task`
- `POST /api/nexus/inbox/:id/request-quote`
- `POST /api/nexus/inbox/:id/assign-human`

### Plantillas

- `GET /api/nexus/templates`
- `POST /api/nexus/templates`
- `PUT /api/nexus/templates/:id`
- `POST /api/nexus/templates/:id/activate`
- `POST /api/nexus/templates/:id/deactivate`

### Administración

- `GET /api/nexus/config`
- `PUT /api/nexus/config`
- `GET /api/nexus/agent-runs`
- `GET /api/nexus/events`
- `GET /api/nexus/health`

Todos los bodies y respuestas se validarán con Zod.

---

## 15. Flujo principal

```text
Formulario / chat pegado
          ↓
Crear nexus_inbox_item
          ↓
Normalizar contenido
          ↓
Ejecutar ConversationAnalyzer
          ↓
Validar salida con Zod
          ↓
Buscar servicios y duplicados
          ↓
ApprovalEngine
     ┌────┴────────┐
Auto guardado   Revisión humana
     ↓                ↓
Crear lead       Editar / vincular / aprobar
     └──────┬─────────┘
            ↓
Generar respuesta sugerida
            ↓
Acciones rápidas
            ↓
Tarea / cotización / seguimiento
```

---

## 16. Integración con `/cotizar`

La solicitud pública seguirá creando un lead según el flujo actual. Adicionalmente, después de una creación exitosa:

1. Se crea un `nexus_inbox_item` vinculado al lead.
2. Nexus analiza la solicitud de forma asíncrona o diferida.
3. El análisis añade señales comerciales y respuesta sugerida.
4. No duplica el lead ya creado.
5. Si la IA falla, el formulario y el lead siguen funcionando normalmente.

Nexus nunca se convertirá en un punto único de fallo para `/cotizar`.

---

## 17. Manejo de errores

### 17.1 Proveedor de IA caído

- El inbox queda en estado `failed`.
- Se registra `nexus.analysis.failed`.
- No se modifica el CRM.
- El operador puede reintentar o procesar manualmente.

### 17.2 Respuesta inválida

- Se intenta una reparación estructurada una sola vez.
- Si vuelve a fallar, se marca revisión manual.
- Nunca se aceptan valores fuera del esquema.

### 17.3 Conflicto de estado CRM

- Se muestra el conflicto al usuario.
- Se recargan los datos actuales.
- No se sobrescribe silenciosamente.

### 17.4 Duplicado

- Se bloquea creación automática.
- Se muestran coincidencias y razones.
- El usuario decide vincular, actualizar o crear de todos modos, según permisos.

### 17.5 Error al generar respuesta

- El análisis permanece disponible.
- Se permite seleccionar una plantilla manualmente.
- No se pierde la conversación.

---

## 18. Seguridad y privacidad

- Claves API solo en backend.
- Autorización por rol y organización.
- Rate limit en endpoints de análisis.
- Límites de tamaño para conversaciones.
- Sanitización de contenido.
- Registros sin secretos.
- Auditoría de acciones.
- El texto original será inmutable desde la UI.
- Los datos sensibles detectados activarán revisión humana.
- El sistema indicará que Nexus es un asistente virtual.
- No se permitirá ejecución de instrucciones incluidas por clientes dentro de sus mensajes.
- Los prompts tratarán el contenido de la conversación como datos no confiables.

---

## 19. Observabilidad

Panel mínimo de administración:

- Procesamientos del día.
- Tasa de éxito.
- Tasa de revisión humana.
- Tiempo promedio.
- Errores por proveedor y modelo.
- Leads creados automáticamente.
- Duplicados detectados.
- Respuestas copiadas.
- Cotizaciones solicitadas desde Nexus.

Cada ejecución tendrá correlación entre inbox, análisis, aprobación, evento y agente.

---

## 20. Estrategia de pruebas

### 20.1 Pruebas unitarias

- Normalización de teléfonos dominicanos y extranjeros.
- Cálculo de confianza.
- Reglas de ApprovalEngine.
- Detección de contenido prohibido.
- Renderizado seguro de plantillas.
- Coincidencia de servicios.
- Detección de duplicados.

### 20.2 Pruebas de integración

- Crear inbox → analizar → revisar → crear lead.
- Formulario `/cotizar` → lead existente → análisis vinculado.
- Error del proveedor → CRM intacto.
- Duplicado fuerte → creación automática bloqueada.
- Usuario ventas procesa lead.
- Usuario sin permiso recibe 403.
- Conflicto de estado devuelve manejo visible.

### 20.3 Escenarios funcionales obligatorios

1. Chat con todos los datos.
2. Chat incompleto.
3. Cliente existente.
4. Teléfono inválido.
5. Dos servicios posibles.
6. Precio mencionado.
7. Descuento solicitado.
8. Fecha de entrega solicitada o prometida.
9. Cliente molesto.
10. Proyecto institucional.
11. Datos sensibles.
12. Proveedor caído.
13. Respuesta JSON inválida.
14. Prompt injection dentro del chat.
15. Conversación duplicada.
16. Usuario de ventas.
17. Usuario sin permisos.
18. Conflicto simultáneo al crear lead.

### 20.4 Smoke test del sistema completo

Después de integrar Nexus se repetirá el flujo core:

`/cotizar` → lead → cliente → cotización → orden → factura → pago.

---

## 21. Criterios de aceptación

El MVP se considera listo cuando:

- Existe Nexus Inbox en el panel administrativo.
- Se pueden pegar conversaciones y guardar pendientes.
- `/cotizar` crea un inbox vinculado sin romper el flujo actual.
- El análisis devuelve estructura validada.
- Los campos muestran confianza.
- Se detectan posibles duplicados.
- Las reglas de auto guardado y revisión funcionan.
- Se puede crear o vincular un lead.
- La respuesta sugerida usa una plantilla aprobada.
- La respuesta nunca inventa precios, descuentos o fechas.
- Las acciones rápidas funcionan o generan una solicitud controlada.
- Todos los eventos quedan auditados.
- Un fallo de IA no modifica el CRM.
- Roles admin y ventas funcionan según permisos.
- Build y type-check salen verdes.
- El flujo comercial core continúa funcionando.

---

## 22. Estrategia de lanzamiento

### Etapa 1 — Shadow mode

- Nexus analiza conversaciones, pero no crea leads automáticamente.
- Se comparan resultados con decisiones humanas.
- Se ajustan prompts y umbrales.

### Etapa 2 — Revisión obligatoria

- Nexus propone datos y acciones.
- Todo requiere aprobación.
- Se recopilan errores y patrones.

### Etapa 3 — Auto guardado limitado

- Solo casos con confianza alta y sin riesgo.
- Muestreo semanal de registros automáticos.
- Opción de desactivar inmediatamente.

### Etapa 4 — Preparación de WhatsApp API

- Después de estabilidad demostrada.
- n8n podrá recibir webhooks y llamar endpoints de Nexus.
- La API oficial no cambiará la lógica central.

---

## 23. Decisiones cerradas

- Nexus Core vive dentro del repositorio Kikeled OS.
- Operará primero Kikeled Studio.
- Se preparará para multiempresa mediante `organizationId`.
- Primer MVP: flujo comercial completo.
- Entrada híbrida: `/cotizar` + chat pegado.
- Acceso doble: Leads + Nexus Inbox.
- Autonomía híbrida según confianza y riesgo.
- Extracción completa más señales inteligentes.
- Respuestas híbridas basadas en plantillas.
- Tono profesional, cálido y dominicano.
- El cliente solo ve la identidad Nexus.
- Agentes especializados permanecen internos.
- Proveedor intercambiable con OpenAI inicial.
- Lógica crítica en Express; n8n después.
- Tablas Nexus independientes y adaptador temporal al CRM actual.

---

## 24. Revisión de consistencia

- No existen campos pendientes por definir para iniciar la planificación.
- El alcance evita migrar todo Kikeled OS durante el MVP.
- Nexus no depende de WhatsApp API ni n8n para funcionar.
- Las acciones sensibles permanecen bajo control humano.
- La arquitectura permite reemplazar `AppData` sin rehacer los agentes.
- El módulo puede desactivarse sin romper el formulario público ni el CRM.
- No se introducen credenciales en el repositorio.
- El diseño respeta UTF-8, TypeScript, Express, Zod y el flujo comercial existente.
