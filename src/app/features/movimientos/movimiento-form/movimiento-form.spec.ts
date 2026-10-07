import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Movimiento } from '../../../models/movimiento.model';
import { MovimientoService } from '../../../services/movimiento';
import { MovimientoForm } from './movimiento-form';

describe('MovimientoForm', () => {
  let component: MovimientoForm;
  let fixture: ComponentFixture<MovimientoForm>;
  let movimientoService: jest.Mocked<Pick<MovimientoService, 'create'>>;
  let router: jest.Mocked<Pick<Router, 'navigate'>>;

  const movimiento: Movimiento = {
    numeroCuenta: 123,
    tipoMovimiento: 'CREDITO',
    valor: 50,
  };

  beforeEach(async () => {
    movimientoService = {
      create: jest
        .fn<ReturnType<MovimientoService['create']>, Parameters<MovimientoService['create']>>()
        .mockReturnValue(of(movimiento)),
    };
    router = {
      navigate: jest.fn<ReturnType<Router['navigate']>, Parameters<Router['navigate']>>(),
    };

    await TestBed.configureTestingModule({
      imports: [MovimientoForm],
      providers: [
        { provide: MovimientoService, useValue: movimientoService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovimientoForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should show the movement form and require its fields', () => {
    expect(component.form.invalid).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Nuevo Movimiento');
  });

  it('should reject a movement value less than or equal to zero', () => {
    component.form.patchValue({ valor: 0 });

    expect(component.form.get('valor')?.hasError('min')).toBe(true);
  });

  it('should create a valid movement, show success, and reset the form', () => {
    component.form.patchValue(movimiento);

    component.registrar();

    expect(movimientoService.create).toHaveBeenCalledWith(movimiento);
    expect(component.successMsg()).toBe('Movimiento registrado correctamente');
    expect(component.form.value).toEqual({
      numeroCuenta: null,
      tipoMovimiento: null,
      valor: null,
    });
  });

  it('should not submit an invalid movement', () => {
    component.registrar();

    expect(movimientoService.create).not.toHaveBeenCalled();
  });

  it('should display the exact backend message when movement registration fails', () => {
    movimientoService.create.mockReturnValueOnce(
      throwError(() => ({ error: { mensaje: 'Saldo no disponible' } })),
    );
    component.form.patchValue(movimiento);

    component.registrar();

    expect(component.errorMsg()).toBe('Saldo no disponible');
  });

  it('should display a fallback message when registration fails without a backend message', () => {
    movimientoService.create.mockReturnValueOnce(throwError(() => new Error('network error')));
    component.form.patchValue(movimiento);

    component.registrar();

    expect(component.errorMsg()).toBe('Error al registrar el movimiento');
  });

  it('should navigate to the movements list when cancelling', () => {
    component.cancelar();

    expect(router.navigate).toHaveBeenCalledWith(['/movimientos']);
  });
});
