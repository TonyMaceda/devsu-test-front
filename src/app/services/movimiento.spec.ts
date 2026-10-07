import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Movimiento } from '../models/movimiento.model';
import { environment } from '../../environments/environment';
import { MovimientoService } from './movimiento';

describe('MovimientoService', () => {
  let service: MovimientoService;
  let httpTestingController: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/movimientos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MovimientoService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should retrieve movements by account number', () => {
    const response: Movimiento[] = [];

    service.getByCuenta(123).subscribe((movimientos) => expect(movimientos).toEqual(response));

    const request = httpTestingController.expectOne(`${baseUrl}?numeroCuenta=123`);
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });

  it('should create a movement', () => {
    const movimiento: Movimiento = {
      numeroCuenta: 123,
      tipoMovimiento: 'CREDITO',
      valor: 50,
    };

    service.create(movimiento).subscribe((response) => expect(response).toEqual(movimiento));

    const request = httpTestingController.expectOne(baseUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(movimiento);
    request.flush(movimiento);
  });

  it('should delete a movement by id', () => {
    service.delete(9).subscribe();

    const request = httpTestingController.expectOne(`${baseUrl}/9`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
