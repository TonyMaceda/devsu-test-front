import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Cuenta } from '../../../models/cuenta.model';
import { CuentaService } from '../../../services/cuenta';
import { CuentaForm } from './cuenta-form';

describe('CuentaForm', () => {
  let component: CuentaForm;
  let fixture: ComponentFixture<CuentaForm>;
  let cuentaService: jest.Mocked<
    Pick<CuentaService, 'getByNumero' | 'create' | 'update'>
  >;
  let router: jest.Mocked<Pick<Router, 'navigate'>>;

  const cuenta: Cuenta = {
    numeroCuenta: 123,
    tipoCuenta: 'AHORROS',
    saldoInicial: 100,
    estado: true,
    clienteId: 'CLI001',
  };

  async function createComponent(numeroCuenta?: string): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [CuentaForm],
      providers: [
        { provide: CuentaService, useValue: cuentaService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(numeroCuenta ? { numeroCuenta } : {}),
            },
          },
        },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CuentaForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    cuentaService = {
      getByNumero: jest
        .fn<ReturnType<CuentaService['getByNumero']>, Parameters<CuentaService['getByNumero']>>()
        .mockReturnValue(of(cuenta)),
      create: jest
        .fn<ReturnType<CuentaService['create']>, Parameters<CuentaService['create']>>()
        .mockReturnValue(of(cuenta)),
      update: jest
        .fn<ReturnType<CuentaService['update']>, Parameters<CuentaService['update']>>()
        .mockReturnValue(of(cuenta)),
    };
    router = {
      navigate: jest.fn<ReturnType<Router['navigate']>, Parameters<Router['navigate']>>(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should show a new-account form with required fields', async () => {
    await createComponent();

    expect(component.esEdicion()).toBe(false);
    expect(component.form.invalid).toBe(true);
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Nueva Cuenta');
    expect(cuentaService.getByNumero).not.toHaveBeenCalled();
  });

  it('should reject a negative initial balance', async () => {
    await createComponent();
    component.form.patchValue({ saldoInicial: -1 });

    expect(component.form.get('saldoInicial')?.hasError('min')).toBe(true);
  });

  it('should create a valid account and navigate to the account list', async () => {
    await createComponent();
    component.form.patchValue(cuenta);

    component.guardar();

    expect(cuentaService.create).toHaveBeenCalledWith(cuenta);
    expect(router.navigate).toHaveBeenCalledWith(['/cuentas']);
  });

  it('should not submit an invalid account', async () => {
    await createComponent();

    component.guardar();

    expect(cuentaService.create).not.toHaveBeenCalled();
    expect(cuentaService.update).not.toHaveBeenCalled();
  });

  it('should load the selected account for editing', async () => {
    await createComponent('123');

    expect(cuentaService.getByNumero).toHaveBeenCalledWith(123);
    expect(component.esEdicion()).toBe(true);
    expect(component.numeroCuentaOriginal()).toBe(123);
    expect(component.form.get('numeroCuenta')?.value).toBe(123);
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Editar Cuenta');
  });

  it('should update a valid account and navigate to the account list', async () => {
    await createComponent('123');
    component.form.patchValue(cuenta);

    component.guardar();

    expect(cuentaService.update).toHaveBeenCalledWith(123, cuenta);
    expect(router.navigate).toHaveBeenCalledWith(['/cuentas']);
  });

  it('should show the server message when saving fails', async () => {
    cuentaService.create.mockReturnValueOnce(
      throwError(() => ({ error: { mensaje: 'El número de cuenta ya existe' } })),
    );
    await createComponent();
    component.form.patchValue(cuenta);

    component.guardar();

    expect(component.errorMsg()).toBe('El número de cuenta ya existe');
  });

  it('should return to the account list when cancelling', async () => {
    await createComponent();

    component.cancelar();

    expect(router.navigate).toHaveBeenCalledWith(['/cuentas']);
  });
});
