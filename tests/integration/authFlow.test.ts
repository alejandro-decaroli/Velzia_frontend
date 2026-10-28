import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';

// Mock del módulo de navegación de SvelteKit
const mockGoto = vi.fn();
vi.mock('$app/navigation', () => ({
  goto: mockGoto,
}));

describe('Frontend Test Integrador 1 - Flujo de Autenticación y Store de Usuario (auth.ts)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('debe coordinar la llamada HTTP de logout, limpiar el store reactivo de usuario y redirigir al inicio', async () => {
    // Importamos dinámicamente los módulos para asegurar el mock de navegación
    const { user, logout } = await import('../../src/lib/stores/auth.js');

    // 1. Simular que hay un usuario autenticado en el store reactivo
    user.set({
      nombre: 'Gonzalo',
      apellido: 'Zinni',
      email: 'gonzalo@velzia.com',
    });

    expect(get(user)).not.toBeNull();
    expect(get(user)?.nombre).toBe('Gonzalo');

    // 2. Simular respuesta exitosa del backend al cerrar sesión
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ message: 'Sesión cerrada exitosamente' }),
    } as any);

    // 3. Ejecutar la acción de logout
    await logout();

    // 4. Verificar la interacción con la API
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/usuarios/logout'),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      })
    );

    // 5. Verificar que el store reactivo se actualizó a null
    expect(get(user)).toBeNull();

    // 6. Verificar que se coordinó la redirección a la raíz '/'
    expect(mockGoto).toHaveBeenCalledWith('/');
  });

  it('no debe limpiar el store de usuario ni redirigir si la llamada al backend falla', async () => {
    const { user, logout } = await import('../../src/lib/stores/auth.js');

    const usuarioActual = {
      nombre: 'Alejandro',
      apellido: 'Decaroli',
      email: 'alejandro@velzia.com',
    };
    user.set(usuarioActual);

    // Simular error 500 del servidor
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as any);

    // El console.error está esperado ante el error capturado
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await logout();

    // El store debe conservar el usuario al haber fallado el logout
    expect(get(user)).toEqual(usuarioActual);

    // No debe haber redirigido
    expect(mockGoto).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
