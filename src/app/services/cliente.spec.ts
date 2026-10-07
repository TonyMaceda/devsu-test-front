import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ClienteService } from './cliente';
import { Cliente } from '../models/cliente.model';
import { environment } from '../../environments/environment';

describe('ClienteService', () => {
  let service: ClienteService;
  let httpTestingController: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/clientes`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClienteService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should retrieve all clients without a name filter', () => {
    const response: Cliente[] = [];

    service.getAll().subscribe((clientes) => expect(clientes).toEqual(response));

    const request = httpTestingController.expectOne(baseUrl);
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });

  it('should retrieve clients filtered by name', () => {
    const response: Cliente[] = [];

    service.getAll('Ana').subscribe((clientes) => expect(clientes).toEqual(response));

    const request = httpTestingController.expectOne(`${baseUrl}?nombre=Ana`);
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });

  it('should retrieve a client by its database id', () => {
    const response = { id: 7 } as Cliente;

    service.getById(7).subscribe((cliente) => expect(cliente).toEqual(response));

    const request = httpTestingController.expectOne(`${baseUrl}/7`);
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });

  it('should create a client', () => {
    const cliente = { nombre: 'Ana' } as Cliente;

    service.create(cliente).subscribe((response) => expect(response).toEqual(cliente));

    const request = httpTestingController.expectOne(baseUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(cliente);
    request.flush(cliente);
  });

  it('should update a client by its database id', () => {
    const cliente = { nombre: 'Ana' } as Cliente;

    service.update(7, cliente).subscribe((response) => expect(response).toEqual(cliente));

    const request = httpTestingController.expectOne(`${baseUrl}/7`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(cliente);
    request.flush(cliente);
  });

  it('should delete a client by its database id', () => {
    service.delete(7).subscribe();

    const request = httpTestingController.expectOne(`${baseUrl}/7`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
