import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Cliente } from '../../../models/cliente.model';
import { ClienteService } from '../../../services/cliente';
import { ClienteForm } from './cliente-form';

describe('ClienteForm', () => {
  let component: ClienteForm;
  let fixture: ComponentFixture<ClienteForm>;
  let clienteService: jest.Mocked<Pick<ClienteService, 'getById' | 'create' | 'update'>>;
  let router: Pick<Router, 'navigate'>;

  const cliente: Cliente = {
    id: 7,
    nombre: 'Ana Pérez',
    genero: 'F',
    edad: 32,
    identificacion: '1234567890',
    direccion: 'Calle 1',
    telefono: '5551234',
    clienteId: 'ana.perez',
    contrasena: 'secreta',
    estado: true,
  };
  const clienteSinId = {
    nombre: cliente.nombre,
    genero: cliente.genero,
    edad: cliente.edad,
    identificacion: cliente.identificacion,
    direccion: cliente.direccion,
    telefono: cliente.telefono,
    clienteId: cliente.clienteId,
    contrasena: cliente.contrasena,
    estado: cliente.estado,
  };

  async function createComponent(id?: string): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [ClienteForm],
      providers: [
        { provide: ClienteService, useValue: clienteService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(id ? { id } : {}) } },
        },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    clienteService = {
      getById: jest
        .fn<ReturnType<ClienteService['getById']>, Parameters<ClienteService['getById']>>()
        .mockReturnValue(of(cliente)),
      create: jest
        .fn<ReturnType<ClienteService['create']>, Parameters<ClienteService['create']>>()
        .mockReturnValue(of(cliente)),
      update: jest
        .fn<ReturnType<ClienteService['update']>, Parameters<ClienteService['update']>>()
        .mockReturnValue(of(cliente)),
    };
    router = {
      navigate: jest.fn<ReturnType<Router['navigate']>, Parameters<Router['navigate']>>(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should show a new-client form and require its mandatory fields', async () => {
    await createComponent();

    expect(component.esEdicion()).toBe(false);
    expect(component.form.invalid).toBe(true);
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Nuevo Cliente');
    expect(clienteService.getById).not.toHaveBeenCalled();
  });

  it('should require an age of at least 18', async () => {
    await createComponent();
    component.form.patchValue({ edad: 17 });

    expect(component.form.get('edad')?.hasError('min')).toBe(true);
  });

  it('should create a valid client and navigate back to the list', async () => {
    await createComponent();
    component.form.patchValue({
      nombre: cliente.nombre,
      genero: cliente.genero,
      edad: cliente.edad,
      identificacion: cliente.identificacion,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      clienteId: cliente.clienteId,
      contrasena: cliente.contrasena,
      estado: cliente.estado,
    });

    component.guardar();

    expect(clienteService.create).toHaveBeenCalledWith(clienteSinId);
    expect(router.navigate).toHaveBeenCalledWith(['/clientes']);
  });

  it('should not submit an invalid client', async () => {
    await createComponent();

    component.guardar();

    expect(clienteService.create).not.toHaveBeenCalled();
    expect(clienteService.update).not.toHaveBeenCalled();
  });

  it('should load the selected client in edit mode and disable its password', async () => {
    await createComponent('7');

    expect(clienteService.getById).toHaveBeenCalledWith(7);
    expect(component.esEdicion()).toBe(true);
    expect(component.form.get('nombre')?.value).toBe(cliente.nombre);
    expect(component.form.get('contrasena')?.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Editar Cliente');
  });

  it('should update a valid client and navigate back to the list', async () => {
    await createComponent('7');
    component.form.patchValue({
      nombre: cliente.nombre,
      genero: cliente.genero,
      edad: cliente.edad,
      identificacion: cliente.identificacion,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      clienteId: cliente.clienteId,
      estado: cliente.estado,
    });

    component.guardar();

    expect(clienteService.update).toHaveBeenCalledWith(7, {
      ...clienteSinId,
      contrasena: '',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/clientes']);
  });

  it('should display the server message when saving fails', async () => {
    clienteService.create.mockReturnValueOnce(
      throwError(() => ({ error: { mensaje: 'Identificación duplicada' } })),
    );
    await createComponent();
    component.form.patchValue({
      nombre: cliente.nombre,
      genero: cliente.genero,
      edad: cliente.edad,
      identificacion: cliente.identificacion,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      clienteId: cliente.clienteId,
      contrasena: cliente.contrasena,
    });

    component.guardar();

    expect(component.errorMsg()).toBe('Identificación duplicada');
  });

  it('should return to the client list when cancelling', async () => {
    await createComponent();

    component.cancelar();

    expect(router.navigate).toHaveBeenCalledWith(['/clientes']);
  });
});
