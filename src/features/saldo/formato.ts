import { formatarCentavos, type Centavos } from '@/domain/dinheiro';
import type { MesISO } from '@/domain/jornada';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_EXTENSO = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

const partes = (mes: MesISO) => mes.split('-').map(Number) as [number, number];

/** "2026-11" -> "nov" */
export const mesCurto = (mes: MesISO) => MESES[partes(mes)[1] - 1];

/** "2026-11" -> "nov/26" */
export const mesAno = (mes: MesISO) => `${mesCurto(mes)}/${String(partes(mes)[0]).slice(2)}`;

/** "2026-11" -> "novembro de 2026" */
export const mesExtenso = (mes: MesISO) => `${MESES_EXTENSO[partes(mes)[1] - 1]} de ${partes(mes)[0]}`;

/** "2026-08-10" -> "10 ago 2026" */
export const dataExtensa = (data: string) => {
  const [ano, mes, dia] = data.split('-').map(Number);
  return `${dia} ${MESES[mes - 1]} ${ano}`;
};

/** 15000 -> "+R$ 150,00"; -15000 -> "−R$ 150,00" */
export const comSinal = (c: Centavos) => `${c >= 0 ? '+' : '−'}${formatarCentavos(Math.abs(c))}`;

/** Valor compacto para espaços pequenos: "R$ 12,4 mil" */
const compacto = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 });
export const moedaCompacta = (c: Centavos) => compacto.format(c / 100);

export const plural = (n: number, singular: string, varios: string) => `${n} ${n === 1 ? singular : varios}`;
