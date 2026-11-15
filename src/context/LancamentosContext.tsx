import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STORAGE_KEYS, isOneOf, isRecord, lerStorage, salvarStorage, textoOuVazio as texto } from '@/utils/storage';
import {
  METODOS_PAGAMENTO,
  STATUS_INVESTIMENTO,
  STATUS_PAGAMENTO,
  TIPOS_LANCAMENTO,
  type Lancamento,
} from '@/types/lancamento';

interface LancamentosContextValue {
  lancamentos: Lancamento[];
  adicionarLancamento: (novo: Lancamento) => void;
  removerLancamento: (id: Lancamento['id']) => void;
}

const LancamentosContext = createContext<LancamentosContextValue | null>(null);

const STATUS_VALIDOS = [...STATUS_PAGAMENTO, ...STATUS_INVESTIMENTO];

// Converte um item lido do storage. Itens que não são um lançamento
// reconhecível são descartados. A primeira versão do formulário gravava
// `valor` como texto, então ele é convertido para número.
function interpretarLancamento(item: unknown): Lancamento | null {
  if (!isRecord(item)) return null;
  const { id, tipo, status, metodo, valor } = item;
  if (typeof id !== 'number') return null;
  if (!isOneOf(TIPOS_LANCAMENTO, tipo)) return null;
  if (!isOneOf(STATUS_VALIDOS, status)) return null;
  if (!isOneOf(METODOS_PAGAMENTO, metodo)) return null;

  return {
    id,
    tipo,
    status,
    metodo,
    valor: typeof valor === 'number' ? valor : Number(valor) || 0,
    data: texto(item.data),
    dataDisplay: texto(item.dataDisplay),
    categoria: texto(item.categoria),
    conta: texto(item.conta),
    outroBanco: texto(item.outroBanco),
  };
}

function interpretarLancamentos(dados: unknown): Lancamento[] {
  if (!Array.isArray(dados)) return [];
  return dados.map(interpretarLancamento).filter((l) => l !== null);
}

interface LancamentosProviderProps {
  children: ReactNode;
}

// Fonte única dos lançamentos do app (persistidos no localStorage).
export function LancamentosProvider({ children }: LancamentosProviderProps) {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(
    () => lerStorage(STORAGE_KEYS.lancamentos, [], interpretarLancamentos)
  );

  useEffect(() => {
    salvarStorage(STORAGE_KEYS.lancamentos, lancamentos);
  }, [lancamentos]);

  const adicionarLancamento = useCallback((novo: Lancamento) => {
    setLancamentos((prev) => [novo, ...prev]);
  }, []);

  const removerLancamento = useCallback((id: Lancamento['id']) => {
    setLancamentos((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const value = useMemo(
    () => ({ lancamentos, adicionarLancamento, removerLancamento }),
    [lancamentos, adicionarLancamento, removerLancamento]
  );

  return <LancamentosContext.Provider value={value}>{children}</LancamentosContext.Provider>;
}

export const useLancamentos = (): LancamentosContextValue => {
  const contexto = useContext(LancamentosContext);
  if (!contexto) throw new Error('useLancamentos precisa estar dentro de <LancamentosProvider>');
  return contexto;
};
