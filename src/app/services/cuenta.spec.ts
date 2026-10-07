import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Cuenta } from '../models/cuenta.model';
import { environment } from '../../environments/environment';
import { CuentaService } from './cuenta';

describe('CuentaService', () => {
  let service: CuentaService;
  let httpTestingController: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/cuentas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CuentaService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should retrieve all accounts without a client filter', () => {
    const response: Cuenta[] = [];

    service.getAll().subscribe((cuentas) => expect(cuentas).toEqual(response));

    const request = httpTestingController.expectOne(baseUrl);
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });

  it('should retrieve accounts filtered by client id', () => {
    const response: Cuenta[] = [];

    service.getAll('CLI001').subscribe((cuentas) => expect(cuentas).toEqual(response));

    const request = httpTestingController.expectOne(`${baseUrl}?clienteId=CLI001`);
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });

  it('should retrieve an account by account number', () => {
    const response: Cuenta = {
      numeroCuenta: 123,
      tipoCuenta: 'AHORROS',
      saldoInicial: 100,
      estado: true,
      clienteId: 'CLI001',
    };

    service.getByNumero(123).subscribe((cuenta) => expect(cuenta).toEqual(response));

    const request = httpTestingController.expectOne(`${baseUrl}/123`);
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });

  it('should create an account', () => {
    const cuenta: Cuenta = {
      numeroCuenta: 123,
      tipoCuenta: 'AHORROS',
      saldoInicial: 100,
      estado: true,
      clienteId: 'CLI001',
    };

    service.create(cuenta).subscribe((response) => expect(response).toEqual(cuenta));

    const request = httpTestingController.expectOne(baseUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(cuenta);
    request.flush(cuenta);
  });

  it('should update an account by account number', () => {
    const changes: Partial<Cuenta> = { estado: false };

    service.update(123, changes).subscribe((response) => expect(response).toEqual(changes));

    const request = httpTestingController.expectOne(`${baseUrl}/123`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(changes);
    request.flush(changes);
  });

  it('should delete an account by account number', () => {
    service.delete(123).subscribe();

    const request = httpTestingController.expectOne(`${baseUrl}/123`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
