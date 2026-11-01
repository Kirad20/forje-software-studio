/**
 * The eval set: realistic requests an owner would type, from a one-page site to a multi-role
 * business app. They are fixed on purpose: the same cases before and after a change to a
 * prompt, a tool or a model are what make the scores comparable. Change them rarely, and
 * bump `EVAL_SET_VERSION` when you do, so old reports are not compared with new ones.
 */
export const EVAL_SET_VERSION = 1;

export type EvalSize = "small" | "medium" | "large";

export interface EvalCase {
  id: string;
  size: EvalSize;
  title: string;
  /** Sent to the builder as the owner's first message. */
  prompt: string;
  /** Public pages worth opening for the smoke test and the design review. */
  routes: string[];
  /** The app needs accounts: also review it signed in as its owner. */
  needsAuth?: boolean;
}

export const EVAL_CASES: EvalCase[] = [
  {
    id: "small-cafe-landing",
    size: "small",
    title: "Landing de una cafetería",
    prompt:
      "Hazme la página web de una cafetería de especialidad llamada «Grano Norte» en Monterrey. Quiero una portada con una foto o ilustración que dé ganas de entrar, el menú con precios (café, té, repostería), el horario, la ubicación con indicaciones y un botón para escribirnos por WhatsApp. Estilo cálido y moderno.",
    routes: ["/"],
  },
  {
    id: "small-pricing-page",
    size: "small",
    title: "Página de precios",
    prompt:
      "Necesito una página de precios para mi herramienta de facturación «Cuentas Claras»: tres planes (Básico, Equipo, Empresa) con lo que incluye cada uno, un selector mensual/anual con descuento, una tabla comparativa y preguntas frecuentes desplegables. Que se vea seria y profesional.",
    routes: ["/"],
  },
  {
    id: "medium-tasks-auth",
    size: "medium",
    title: "Tareas con cuentas",
    prompt:
      "Quiero una app de tareas personal con cuentas: registro e inicio de sesión (con recuperar contraseña), crear, editar, completar y borrar tareas, ponerles fecha límite y prioridad, filtrar por estado y buscar por texto. Cada persona solo ve sus tareas.",
    routes: ["/", "/login"],
    needsAuth: true,
  },
  {
    id: "medium-booking",
    size: "medium",
    title: "Reservas de citas",
    prompt:
      "Hazme una web para que los clientes de mi estudio de fisioterapia reserven cita: lista de servicios con duración y precio, elegir día y hora libres, dejar nombre y teléfono, y ver la confirmación. Yo necesito un panel privado para ver y cancelar las reservas del día y de la semana.",
    routes: ["/"],
    needsAuth: true,
  },
  {
    id: "large-mini-crm",
    size: "large",
    title: "CRM para una agencia",
    prompt:
      "Construye un CRM para una agencia pequeña: contactos y empresas, un tablero tipo kanban de oportunidades con etapas (nuevo, contactado, propuesta, ganado, perdido) donde se arrastren las tarjetas, notas y tareas por oportunidad, un panel con métricas (valor del pipeline, tasa de cierre, oportunidades por etapa) y dos roles: administrador (ve todo y gestiona usuarios) y miembro (solo lo suyo).",
    routes: ["/"],
    needsAuth: true,
  },
  {
    id: "large-store",
    size: "large",
    title: "Tienda con pedidos",
    prompt:
      "Quiero una tienda en línea de plantas: catálogo con categorías y búsqueda, ficha de producto con fotos y existencias, carrito, pago con Stripe (si todavía no hay clave, que lo avise con claridad), correo de confirmación del pedido y un panel de administración para gestionar productos, existencias y pedidos con su estado.",
    routes: ["/"],
    needsAuth: true,
  },
];

export const caseById = (id: string) => EVAL_CASES.find((c) => c.id === id);
