export type TipoMovimiento = 'CREDITO' | 'DEBITO';

export interface Movimiento {
  id?: number;
  numeroCuenta: number;
  tipoMovimiento: TipoMovimiento;
  valor: number;
  saldoDisponible?: number;
  fecha?: string;
}
