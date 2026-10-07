import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Movimiento } from '../../../models/movimiento.model';
import { MovimientoService } from '../../../services/movimiento';
import { MovimientoList } from './movimiento-list';

describe('MovimientoList', () => {
  let component: MovimientoList;
  let fixture: ComponentFixture<MovimientoList>;
  let movimientoService: jest.Mocked<Pick<MovimientoService, 'getByCuenta' | 'delete'>>;

  const movimiento: Movimiento = {
    id: 9,
    numeroCuenta: 123,
    tipoMovimiento: 'CREDITO',
    valor: 50,
    saldoDisponible: 150,
    fecha: '2026-01-15',
  };

  beforeEach(async () => {
    movimientoService = {
      getByCuenta: jest
        .fn<
          ReturnType<MovimientoService['getByCuenta']>,
          Parameters<MovimientoService['getByCuenta']>
        >()
        .mockReturnValue(of([])),
      delete: jest
        .fn<ReturnType<MovimientoService['delete']>, Parameters<MovimientoService['delete']>>()
        .mockReturnValue(of(void 0)),
    };

    await TestBed.configureTestingModule({
      imports: [MovimientoList],
      providers: [{ provide: MovimientoService, useValue: movimientoService }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MovimientoList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should request and display movements for the entered account', () => {
    component.numeroCuenta = 123;
    movimientoService.getByCuenta.mockReturnValueOnce(of([movimiento]));

    component.buscar();
    fixture.detectChanges();

    expect(movimientoService.getByCuenta).toHaveBeenCalledWith(123);
    expect(component.movimientos()).toEqual([movimiento]);
    expect(component.consultado()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('2026-01-15');
  });

  it('should require an account number before searching', () => {
    component.buscar();

    expect(component.errorMsg()).toBe('Ingrese un número de cuenta');
    expect(movimientoService.getByCuenta).not.toHaveBeenCalled();
  });

  it('should display the server message when searching fails', () => {
    component.numeroCuenta = 123;
    movimientoService.getByCuenta.mockReturnValueOnce(
      throwError(() => ({ error: { mensaje: 'Cuenta no encontrada' } })),
    );

    component.buscar();

    expect(component.errorMsg()).toBe('Cuenta no encontrada');
  });

  it('should not delete a movement when confirmation is declined', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);

    component.eliminar(9);

    expect(movimientoService.delete).not.toHaveBeenCalled();
  });

  it('should delete a confirmed movement and refresh the search', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    component.numeroCuenta = 123;

    component.eliminar(9);

    expect(movimientoService.delete).toHaveBeenCalledWith(9);
    expect(movimientoService.getByCuenta).toHaveBeenCalledWith(123);
  });

  it('should display the server message when movement deletion fails', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    movimientoService.delete.mockReturnValueOnce(
      throwError(() => ({ error: { mensaje: 'No se puede eliminar' } })),
    );

    component.eliminar(9);

    expect(component.errorMsg()).toBe('No se puede eliminar');
  });
});
