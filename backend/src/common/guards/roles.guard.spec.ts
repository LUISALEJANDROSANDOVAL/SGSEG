import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RolesGuard(reflector);
  });

  function createMockContext(user?: { rol?: string }): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('debe permitir acceso si el endpoint está marcado como @Public()', () => {
    reflector.getAllAndOverride.mockReturnValueOnce(true); // isPublic = true

    const context = createMockContext();
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('debe permitir acceso si no se especificaron roles requeridos', () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false) // isPublic = false
      .mockReturnValueOnce(undefined); // requiredRoles = undefined

    const context = createMockContext({ rol: 'CUALQUIERA' });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('debe lanzar ForbiddenException si no hay usuario o no tiene rol', () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'isPublic') return false;
      return ['COORDINACION'];
    });

    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(
      'No tienes permisos para acceder a este recurso',
    );
  });

  it('debe lanzar ForbiddenException si el rol del usuario no está en la lista requerida', () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === 'isPublic') return false;
      return ['COORDINACION', 'SUPER_ADMIN'];
    });

    const context = createMockContext({ rol: 'VICERRECTORADO' });

    expect(() => guard.canActivate(context)).toThrow(
      'Tu rol no tiene permisos para realizar esta acción',
    );
  });

  it('debe permitir el acceso si el rol del usuario coincide con alguno de los roles requeridos', () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false) // isPublic = false
      .mockReturnValueOnce(['JEFE_CARRERA', 'COORDINACION']); // requiredRoles

    const context = createMockContext({ rol: 'JEFE_CARRERA' });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });
});
