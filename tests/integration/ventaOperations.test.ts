import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { registrarDetalle, pagarEntity } from '../../src/lib/utils/api.js';

describe('Frontend Test Integrador 2 - Operaciones de Venta y Formulario (registrarDetalle y pagarEntity)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    // Simular reload de window en el entorno JSDOM
    Object.defineProperty(window, 'location', {
      value: { reload: vi.fn() },
      writable: true,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // Test Integrador 2.1: Flujo integrado de registro de detalle de venta
  it('debe enviar la línea de venta por POST, cerrar el formulario modal (showForm=false) y recargar la vista al tener éxito', async () => {
    const payloadDetalle = {
      producto: 12,
      cantidad: 3,
      precio: 2500,
      descuento: 5,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        message: 'Detalle de venta registrado exitosamente',
      }),
    } as any);

    // Estado inicial en el componente de UI
    const resultado = await registrarDetalle(
      '45', // id de la venta
      true, // formulario modal abierto
      payloadDetalle,
      false, // loading
      '' // error previo
    );

    // 1. Verifica la construcción y envío del request
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/ventas/registrar_detalle/45'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadDetalle),
        credentials: 'include',
      })
    );

    // 2. Verifica la actualización del estado del componente
    expect(resultado.loading).toBe(false);
    expect(resultado.showForm).toBe(false); // Modal cerrado tras éxito
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });

  // Test Integrador 2.2: Manejo de errores de negocio desde el backend (ej. stock insuficiente)
  it('debe formatear los errores de validación devueltos por el backend y mantener el estado de error en el formulario', async () => {
    const payloadDetalle = {
      producto: 12,
      cantidad: 999, // Stock superior al disponible
      precio: 2500,
      descuento: 0,
    };

    // Simular error 409 Conflict retornado por el backend
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: vi.fn().mockResolvedValue({
        message: 'Stock insuficiente',
      }),
    } as any);

    const resultado = await registrarDetalle(
      '45',
      true,
      payloadDetalle,
      false,
      ''
    );

    // El error debe ser formateado y capturado para la UI
    expect(resultado.loading).toBe(false);
    expect(resultado.error).toContain('Stock insuficiente');
    // No debe haber recargado la ventana porque la operación falló
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  // Test Integrador 2.3: Flujo de pago de venta en caja
  it('debe registrar el pago de la venta en la caja seleccionada y cerrar el formulario', async () => {
    const payloadPago = {
      caja: 2,
      monto_pagar: 7125,
      descripcion: 'Cobro venta VEN_1 en efectivo',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        message: 'Venta pagada exitosamente',
      }),
    } as any);

    const resultado = await pagarEntity(
      'ventas',
      '45',
      'venta',
      true,
      payloadPago,
      false,
      ''
    );

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/ventas/pagar/45'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payloadPago),
      })
    );

    expect(resultado.loading).toBe(false);
    expect(resultado.showForm).toBe(false);
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
});
