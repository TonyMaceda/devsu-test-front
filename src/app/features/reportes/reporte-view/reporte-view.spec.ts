import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Reporte } from '../../../models/reporte.model';
import { ReporteService } from '../../../services/reporte';
import { ReporteView } from './reporte-view';

describe('ReporteView', () => {
  let component: ReporteView;
  let fixture: ComponentFixture<ReporteView>;
  let reporteService: jest.Mocked<Pick<ReporteService, 'getReporte' | 'getReportePdf'>>;
  let originalCreateObjectUrl: PropertyDescriptor | undefined;
  let originalRevokeObjectUrl: PropertyDescriptor | undefined;

  const reporte: Reporte = {
    clienteId: 'CLI001',
    fechaInicio: '2026-01-01',
    fechaFin: '2026-01-31',
    cuentas: [
      {
        numeroCuenta: 123,
        tipoCuenta: 'AHORROS',
        saldo: 150,
        totalCreditos: 50,
        totalDebitos: 0,
      },
    ],
  };

  beforeEach(async () => {
    reporteService = {
      getReporte: jest
        .fn<ReturnType<ReporteService['getReporte']>, Parameters<ReporteService['getReporte']>>()
        .mockReturnValue(of(reporte)),
      getReportePdf: jest
        .fn<
          ReturnType<ReporteService['getReportePdf']>,
          Parameters<ReporteService['getReportePdf']>
        >()
        .mockReturnValue(of({ pdfBase64: 'JVBERi0=' })),
    };
    originalCreateObjectUrl = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
    originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');

    await TestBed.configureTestingModule({
      imports: [ReporteView],
      providers: [{ provide: ReporteService, useValue: reporteService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    if (originalCreateObjectUrl) {
      Object.defineProperty(URL, 'createObjectURL', originalCreateObjectUrl);
    } else {
      Reflect.deleteProperty(URL, 'createObjectURL');
    }
    if (originalRevokeObjectUrl) {
      Object.defineProperty(URL, 'revokeObjectURL', originalRevokeObjectUrl);
    } else {
      Reflect.deleteProperty(URL, 'revokeObjectURL');
    }
    jest.restoreAllMocks();
  });

  it('should reject report queries when a required filter is missing', () => {
    component.consultar();

    expect(component.errorMsg()).toBe('Complete Cliente ID y el rango de fechas');
    expect(reporteService.getReporte).not.toHaveBeenCalled();
  });

  it('should retrieve and render the report for a complete filter', () => {
    component.clienteId = 'CLI001';
    component.fechaInicio = '2026-01-01';
    component.fechaFin = '2026-01-31';

    component.consultar();
    fixture.detectChanges();

    expect(reporteService.getReporte).toHaveBeenCalledWith(
      'CLI001',
      '2026-01-01',
      '2026-01-31',
    );
    expect(component.reporte()).toEqual(reporte);
    expect(fixture.nativeElement.textContent).toContain('123');
    expect(fixture.nativeElement.textContent).toContain('AHORROS');
  });

  it('should display the backend message when report generation fails', () => {
    reporteService.getReporte.mockReturnValueOnce(
      throwError(() => ({ error: { mensaje: 'Cliente no encontrado' } })),
    );
    component.clienteId = 'CLI001';
    component.fechaInicio = '2026-01-01';
    component.fechaFin = '2026-01-31';

    component.consultar();

    expect(component.errorMsg()).toBe('Cliente no encontrado');
  });

  it('should download the returned PDF and release its object URL', () => {
    const createObjectURL = jest.fn().mockReturnValue('blob:estado-cuenta');
    const revokeObjectURL = jest.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectURL,
    });
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.download).toBe('estado-cuenta-CLI001.pdf');
      });
    component.clienteId = 'CLI001';
    component.fechaInicio = '2026-01-01';
    component.fechaFin = '2026-01-31';

    component.descargarPdf();

    expect(reporteService.getReportePdf).toHaveBeenCalledWith(
      'CLI001',
      '2026-01-01',
      '2026-01-31',
    );
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect((createObjectURL.mock.calls[0][0] as Blob).type).toBe('application/pdf');
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:estado-cuenta');
  });

  it('should display the backend message when PDF generation fails', () => {
    reporteService.getReportePdf.mockReturnValueOnce(
      throwError(() => ({ error: { mensaje: 'No se pudo generar PDF' } })),
    );

    component.descargarPdf();

    expect(component.errorMsg()).toBe('No se pudo generar PDF');
  });
});
