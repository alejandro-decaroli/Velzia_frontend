export interface FieldConfig {
    [key: string]: 'text' | 'number' | 'email' | 'select' | 'password' | 'date';
}

export interface EntityConfig {
    name: string;
    title: string;
    route: string;
    fields: FieldConfig;
    hasDateFilter?: boolean;
    hasStatusFilter?: boolean;
}

export const EXCLUDED_TABLE_FIELDS = [
    "clientes", "pago", "pagos", 
    "ajuste", "ajustes", "transferencia", "transferencias", "transferencias_origen", "transferencias_destino",
    "venta", "ventas", "costo_fijo", "costos_fijos", 
    "cliente", "moneda", "caja", "visible", "detalles", "usuario", "caja_origen", "caja_destino", 
    "actualizadoen", "moneda_origen", "moneda_destino", "eliminadoen", "id", 
    "nombre_cliente", "apellido_cliente", "costofijo",
    "moneda_asociada", "nombre_caja_origen", "nombre_caja_destino", "tipo_moneda",
    "nombre_moneda_origen", "nombre_moneda_destino", "nombre_moneda", "creadoen",
    "subtotal", "monto_pagado", "nombre_caja", "codigo"
];

export const ENTITY_CONFIGS: Record<string, EntityConfig> = {
    clientes: {
        name: "cliente",
        title: "Clientes",
        route: "clientes",
        fields: {
            nombre: "text",
            apellido: "text",
            telefono: "text",
            direccion: "text",
            email: "email"
        },
        hasDateFilter: true
    },
    monedas: {
        name: "moneda",
        title: "Monedas",
        route: "monedas",
        fields: {
            nombre: "text",
            codigo_iso: "text",
            simbolo: "text"
        }
    },
    cajas: {
        name: "caja",
        title: "Cajas",
        route: "cajas",
        fields: {
            nombre: "text",
            moneda: "select"
        }
    },
    ventas: {
        name: "venta",
        title: "Ventas",
        route: "ventas",
        fields: {
            moneda: "select",
            cliente: "select"
        },
        hasDateFilter: true,
        hasStatusFilter: true
    },
    productos: {
        name: "producto",
        title: "Productos",
        route: "productos",
        fields: {
            nombre: "text",
            descripcion: "text",
            stock: "number"
        }
    },
    costos_fijos: {
        name: "costo_fijo",
        title: "Costos Fijos",
        route: "costos_fijos",
        fields: {
            adjudicacion: "text",
            monto: "number",
            moneda: "select",
            categoria: "text"
        },
        hasDateFilter: true,
        hasStatusFilter: true
    },
    pagos: {
        name: "pago",
        title: "Pagos",
        route: "pagos",
        fields: {
            monto: "number",
            caja: "select"
        },
        hasDateFilter: true
    },
    tasas: {
        name: "tasa",
        title: "Tasas",
        route: "tasas",
        fields: {
            tasa: "number",
            moneda_origen: "select",
            moneda_destino: "select"
        }
    },
    transferencias: {
        name: "transferencia",
        title: "Transferencias",
        route: "transferencias",
        fields: {
            monto: "number",
            caja_origen: "select",
            caja_destino: "select"
        },
        hasDateFilter: true
    },
    ajustes: {
        name: "ajuste",
        title: "Ajustes",
        route: "ajustes",
        fields: {
            movimiento: "select",
            monto: "number",
            caja: "select"
        },
        hasDateFilter: true,
        hasStatusFilter: true // "ingreso" / "egreso"
    }
};

export function normalizeKey(key: string): string {
    if (!key) return '';
    return key.toLowerCase().replace(/_/g, '');
}

export function shouldExclude(key: string): boolean {
    const normalized = normalizeKey(key);
    return EXCLUDED_TABLE_FIELDS.includes(normalized);
}
