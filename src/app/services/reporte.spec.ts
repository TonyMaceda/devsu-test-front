import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Reporte } from '../models/reporte.model';
import { environment } from '../../environments/environment';
import { ReporteService } from './reporte';

describe('ReporteService', () => {
  let service: ReporteService;
  let httpTestingController: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/reportes`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReporteService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should request a JSON account report for the client and date range', () => {
    const response: Reporte = {
      clienteId: 'CLI001',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-01-31',
      cuentas: [],
    };

    service.getReporte('CLI001', '2026-01-01', '2026-01-31').subscribe((reporte) => {
      expect(reporte).toEqual(response);
    });

    const request = httpTestingController.expectOne(
      `${baseUrl}?clienteId=CLI001&fechaInicio=2026-01-01&fechaFin=2026-01-31&formato=json`,
    );
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });

  it('should request the PDF report using the same client and date range', () => {
    const response = { pdfBase64: 'JVBERi0=' };

    service.getReportePdf('CLI001', '2026-01-01', '2026-01-31').subscribe((pdf) => {
      expect(pdf).toEqual(response);
    });

    const request = httpTestingController.expectOne(
      `${baseUrl}?clienteId=CLI001&fechaInicio=2026-01-01&fechaFin=2026-01-31&formato=pdf`,
    );
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });
});
