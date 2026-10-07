import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Cuenta } from '../../../models/cuenta.model';
import { CuentaService } from '../../../services/cuenta';
import { CuentaList } from './cuenta-list';

describe('CuentaList', () => {
  let component: CuentaList;
  let fixture: ComponentFixture<CuentaList>;
  let cuentaService: jest.Mocked<Pick<CuentaService, 'getAll' | 'delete'>>;
  let router: Router;

  const cuenta: Cuenta = {
    numeroCuenta: 123,
    tipoCuenta: 'AHORROS',
    saldoInicial: 100,
    estado: true,
    clienteId: 'CLI001',
  };

  beforeEach(async () => {
    cuentaService = {
      getAll: jest
        .fn<ReturnType<CuentaService['getAll']>, Parameters<CuentaService['getAll']>>()
        .mockReturnValue(of([])),
      delete: jest
        .fn<ReturnType<CuentaService['delete']>, Parameters<CuentaService['delete']>>()
        .mockReturnValue(of(void 0)),
    };

    await TestBed.configureTestingModule({
      imports: [CuentaList],
      providers: [{ provide: CuentaService, useValue: cuentaService }, provideRouter([])],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(CuentaList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should load and render accounts on initialization', () => {
    cuentaService.getAll.mockReturnValueOnce(of([cuenta]));

    component.cargar();
    fixture.detectChanges();

    expect(cuentaService.getAll).toHaveBeenCalledWith();
    expect(component.cuentas()).toEqual([cuenta]);
    expect(fixture.nativeElement.textContent).toContain('123');
    expect(fixture.nativeElement.textContent).toContain('CLI001');
  });

  it('should display an error when loading accounts fails', () => {
    cuentaService.getAll.mockReturnValueOnce(throwError(() => new Error('network error')));

    component.cargar();

    expect(component.errorMsg()).toBe('No se pudo cargar la lista de cuentas');
  });

  it('should search accounts by client id', () => {
    component.busqueda = 'CLI001';
    cuentaService.getAll.mockReturnValueOnce(of([cuenta]));

    component.buscar();

    expect(cuentaService.getAll).toHaveBeenLastCalledWith('CLI001');
    expect(component.cuentas()).toEqual([cuenta]);
  });

  it('should navigate to the selected account for editing', () => {
    const navigate = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.editar(123);

    expect(navigate).toHaveBeenCalledWith(['/cuentas', 123, 'editar']);
  });

  it('should not delete an account when confirmation is declined', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);

    component.eliminar(123);

    expect(cuentaService.delete).not.toHaveBeenCalled();
  });

  it('should delete a confirmed account and reload the list', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    component.eliminar(123);

    expect(cuentaService.delete).toHaveBeenCalledWith(123);
    expect(cuentaService.getAll).toHaveBeenCalledTimes(2);
  });

  it('should display the server message when account deletion fails', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    cuentaService.delete.mockReturnValueOnce(
      throwError(() => ({ error: { mensaje: 'La cuenta tiene movimientos' } })),
    );

    component.eliminar(123);

    expect(component.errorMsg()).toBe('La cuenta tiene movimientos');
  });
});
