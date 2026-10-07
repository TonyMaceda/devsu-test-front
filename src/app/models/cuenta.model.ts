export type TipoCuenta = 'Corriente' | 'Ahorros';

export interface Cuenta {
  numeroCuenta: number;
  tipoCuenta: TipoCuenta | string;
  saldoInicial: number;
  estado: boolean;
  clienteId: string;
}
