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
    "venta", "ventas", "costo", "costos", "costo_fijo", "costos_fijos", 
    "cliente", "moneda", "caja", "visible", "detalles", "usuario", "caja_origen", "caja_destino", 
    "actualizadoen", "moneda_origen", "moneda_destino", "eliminadoen", "id", 
    "nombre_cliente", "apellido_cliente", "costofijo",
    "moneda_asociada", "nombre_caja_origen", "nombre_caja_destino", "tipo_moneda",
    "nombre_moneda_origen", "nombre_moneda_destino", "nombre_moneda", "creadoen",
    "subtotal", "monto_pagado", "nombre_caja", "codigo",
    "pedidos", "lineas", "lineas_pedidos", "lineas_pedido", "lineaspedidos", "lineaspedido", "proveedor", "pedido", "proveedores",
    "movf", "mov_f", "movimiento", "movimientos", "movimientofinanciero", "movimiento_financiero", "mov"
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
    cajas: {
        name: "caja",
        title: "Cajas",
        route: "cajas",
        fields: {
            nombre: "text"
        }
    },
    ventas: {
        name: "venta",
        title: "Ventas",
        route: "ventas",
        fields: {
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
            stock: "number",
            costo_actual: "number",
            precio_venta: "number"
        }
    },
    costos: {
        name: "costo",
        title: "Costos",
        route: "costos",
        fields: {
            descripcion: "text",
            monto: "number",
            categoria: "text"
        },
        hasDateFilter: true,
        hasStatusFilter: true
    },
    costos_fijos: {
        name: "costo",
        title: "Costos",
        route: "costos",
        fields: {
            descripcion: "text",
            monto: "number",
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
    },
    historial_financiero: {
        name: "movimiento",
        title: "Historial Financiero",
        route: "historial_financiero",
        fields: {},
        hasDateFilter: true,
        hasStatusFilter: true
    },
    movimientos: {
        name: "movimiento",
        title: "Historial Financiero",
        route: "movimientos",
        fields: {},
        hasDateFilter: true,
        hasStatusFilter: true
    },
    proveedores: {
        name: "proveedor",
        title: "Proveedores",
        route: "proveedores",
        fields: {
            razon_social: "text",
            cuit: "text",
            telefono: "text",
            email: "email",
            direccion: "text"
        },
        hasDateFilter: true
    },
    pedidos: {
        name: "pedido",
        title: "Pedidos",
        route: "pedidos",
        fields: {
            proveedor: "select",
            fecha_emision: "date",
            fecha_recepcion: "date"
        },
        hasDateFilter: true,
        hasStatusFilter: true
    },
    lineas_pedidos: {
        name: "linea_pedido",
        title: "Líneas de Pedido",
        route: "lineas_pedidos",
        fields: {
            pedido: "select",
            producto: "select",
            cantidad: "number"
        }
    }
};

export function normalizeKey(key: string): string {
    if (!key) return '';
    return key.toLowerCase().replace(/_/g, '');
}

export function shouldExclude(key: string): boolean {
    const normalized = normalizeKey(key);
    const lower = (key || '').toLowerCase();
    return EXCLUDED_TABLE_FIELDS.includes(normalized) || EXCLUDED_TABLE_FIELDS.includes(lower);
}
