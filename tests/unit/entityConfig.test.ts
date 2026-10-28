import { describe, it, expect } from 'vitest';
import { ENTITY_CONFIGS, EXCLUDED_TABLE_FIELDS } from '../../src/lib/utils/entityConfig.js';

describe('Frontend Unit Tests - Configuración de Entidades (entityConfig)', () => {
  // Test Unitario 1.1: Validación de la configuración y rutas de entidades del sistema
  it('debe definir correctamente las rutas, títulos y tipos de campos para Ventas, Clientes y Productos', () => {
    // Configuración de Ventas
    const configVentas = ENTITY_CONFIGS.ventas;
    expect(configVentas).toBeDefined();
    expect(configVentas.route).toBe('ventas');
    expect(configVentas.title).toBe('Ventas');
    expect(configVentas.fields.cliente).toBe('select');
    expect(configVentas.hasDateFilter).toBe(true);
    expect(configVentas.hasStatusFilter).toBe(true);

    // Configuración de Productos
    const configProductos = ENTITY_CONFIGS.productos;
    expect(configProductos).toBeDefined();
    expect(configProductos.route).toBe('productos');
    expect(configProductos.fields.nombre).toBe('text');
    expect(configProductos.fields.stock).toBe('number');

    // Configuración de Clientes
    const configClientes = ENTITY_CONFIGS.clientes;
    expect(configClientes).toBeDefined();
    expect(configClientes.route).toBe('clientes');
    expect(configClientes.fields.nombre).toBe('text');
    expect(configClientes.fields.apellido).toBe('text');
    expect(configClientes.fields.email).toBe('email');
  });

  // Test Unitario 1.2: Filtrado de campos excluidos de visualización en tablas
  it('debe excluir de visualización campos internos y sensibles mediante EXCLUDED_TABLE_FIELDS', () => {
    const camposDePrueba = [
      'nombre',
      'id',
      'usuario',
      'creadoen',
      'eliminadoen',
      'stock',
      'precio_unitario',
      'cliente'
    ];

    // Función pura de filtrado tal como la utilizan las tablas genéricas
    const camposVisibles = camposDePrueba.filter(
      (campo) => !EXCLUDED_TABLE_FIELDS.includes(campo.toLowerCase())
    );

    // Los campos de negocio deben permanecer visibles
    expect(camposVisibles).toContain('nombre');
    expect(camposVisibles).toContain('stock');
    expect(camposVisibles).toContain('precio_unitario');

    // Los campos internos o sensibles no deben mostrarse
    expect(camposVisibles).not.toContain('id');
    expect(camposVisibles).not.toContain('usuario');
    expect(camposVisibles).not.toContain('creadoen');
    expect(camposVisibles).not.toContain('eliminadoen');
    expect(camposVisibles).not.toContain('cliente');
  });
});
