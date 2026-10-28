import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchEntity } from '../../src/lib/utils/api.js';

describe('Frontend Unit Tests - Cliente API (fetchEntity)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // Test Unitario 2.1: Respuesta exitosa y extracción de datos
  it('debe enviar los parámetros de filtro/fecha y retornar la lista de entidades correctamente', async () => {
    const mockVentas = [
      { id: 1, cod: 'VEN_1', total: 15000, estado: 'Pendiente' },
      { id: 2, cod: 'VEN_2', total: 32000, estado: 'Pagado' },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ ventas: mockVentas }),
    } as any);

    const resultado = await fetchEntity(
      'ventas',
      [],
      false,
      null,
      'Pendiente',
      '2026-10-28'
    );

    // Verificar que se llamó a la URL con los query parameters correctos
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/ventas?filtro=Pendiente&fecha=2026-10-28'),
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      })
    );

    // Verificar el formato de retorno
    expect(resultado.loading).toBe(false);
    expect(resultado.error).toBeNull();
    expect(resultado.entities).toEqual(mockVentas);
  });

  // Test Unitario 2.2: Manejo y formateo de errores de la API
  it('debe capturar errores HTTP y devolver el mensaje de error con lista de entidades vacía', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ message: 'Error al cargar ventas desde el servidor' }),
    } as any);

    const resultado = await fetchEntity(
      'ventas',
      [],
      false,
      null,
      '',
      ''
    );

    expect(resultado.loading).toBe(false);
    expect(resultado.error).toBe('Error al cargar ventas desde el servidor');
    expect(resultado.entities).toEqual([]);
  });
});
