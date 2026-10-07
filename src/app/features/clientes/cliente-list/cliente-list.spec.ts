import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Cliente } from '../../../models/cliente.model';
import { ClienteService } from '../../../services/cliente';
import { ClienteList } from './cliente-list';

describe('ClienteList', () => {
  let component: ClienteList;
  let fixture: ComponentFixture<ClienteList>;
  let clienteService: jest.Mocked<Pick<ClienteService, 'getAll' | 'delete'>>;
  let router: Router;

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

  beforeEach(async () => {
    clienteService = {
      getAll: jest
        .fn<ReturnType<ClienteService['getAll']>, Parameters<ClienteService['getAll']>>()
        .mockReturnValue(of([])),
      delete: jest
        .fn<ReturnType<ClienteService['delete']>, Parameters<ClienteService['delete']>>()
        .mockReturnValue(of(void 0)),
    };
    await TestBed.configureTestingModule({
      imports: [ClienteList],
      providers: [
        { provide: ClienteService, useValue: clienteService },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ClienteList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should load and render clients on initialization', () => {
    clienteService.getAll.mockReturnValueOnce(of([cliente]));

    component.cargar();
    fixture.detectChanges();

    expect(clienteService.getAll).toHaveBeenCalledWith();
    expect(component.clientes()).toEqual([cliente]);
    expect(fixture.nativeElement.textContent).toContain('Ana Pérez');
    expect(fixture.nativeElement.textContent).toContain('Activo');
  });

  it('should show a message when loading clients fails', () => {
    clienteService.getAll.mockReturnValueOnce(throwError(() => new Error('network error')));

    component.cargar();

    expect(component.errorMsg()).toBe('No se pudo cargar la lista de clientes');
  });

  it('should search clients by the entered name', () => {
    component.busqueda = 'Ana';
    clienteService.getAll.mockReturnValueOnce(of([cliente]));

    component.buscar();

    expect(clienteService.getAll).toHaveBeenLastCalledWith('Ana');
    expect(component.clientes()).toEqual([cliente]);
  });

  it('should navigate to the selected client for editing', () => {
    const navigate = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.editar(7);

    expect(navigate).toHaveBeenCalledWith(['/clientes', 7, 'editar']);
  });

  it('should leave the client untouched when deletion is cancelled', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);

    component.eliminar(7);

    expect(clienteService.delete).not.toHaveBeenCalled();
  });

  it('should delete a confirmed client and reload the list', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    component.eliminar(7);

    expect(clienteService.delete).toHaveBeenCalledWith(7);
    expect(clienteService.getAll).toHaveBeenCalledTimes(2);
  });

  it('should display the server message when deletion fails', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    clienteService.delete.mockReturnValueOnce(
      throwError(() => ({ error: { mensaje: 'Cliente tiene cuentas asociadas' } })),
    );

    component.eliminar(7);

    expect(component.errorMsg()).toBe('Cliente tiene cuentas asociadas');
  });
});
