import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { dataLocalISO, diferencaEmDias, isDataISO } from '@/domain/datas';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const montarISO = (ano: number, mes0: number, dia: number) =>
  `${ano}-${String(mes0 + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

interface CalendarPickerProps {
  /** Data selecionada em ISO (AAAA-MM-DD); se ausente, usa hoje */
  value?: string;
  /** Recebe a data escolhida em ISO (AAAA-MM-DD) */
  onChange?: (dataISO: string) => void;
  /** Substitui o botão padrão que abre o calendário */
  customTrigger?: ReactNode;
}

// Seletor de data. Abre num portal com o fundo desfocado (mesmo padrão das
// notificações): painel de vidro ancorado ao botão no desktop, centralizado
// no celular.
export default function CalendarPicker({ value, onChange, customTrigger }: CalendarPickerProps) {
  const hoje = dataLocalISO();
  const selecionada = value && isDataISO(value) ? value : hoje;
  const [anoSel, mesSel, diaSel] = selecionada.split('-').map(Number);

  const gatilhoRef = useRef<HTMLButtonElement>(null);
  const [ancora, setAncora] = useState<{ top: number; left: number } | null>(null);
  const aberto = ancora !== null;

  // Mês exibido (navegação), independente da data selecionada
  const [mes, setMes] = useState(mesSel - 1);
  const [ano, setAno] = useState(anoSel);

  const abrir = () => {
    const r = gatilhoRef.current?.getBoundingClientRect();
    if (!r) return;
    setMes(mesSel - 1);
    setAno(anoSel);
    setAncora({ top: r.bottom + 10, left: r.left + r.width / 2 });
  };
  const fechar = () => setAncora(null);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAncora(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aberto]);

  const navegar = (passo: number) => {
    const d = new Date(ano, mes + passo, 1);
    setMes(d.getMonth());
    setAno(d.getFullYear());
  };

  const escolher = (iso: string) => {
    onChange?.(iso);
    fechar();
  };

  // Data escolhida diferente de hoje: faixa ligando as duas no calendário
  const temFaixa = selecionada !== hoje;
  const [inicioFaixa, fimFaixa] = selecionada < hoje ? [selecionada, hoje] : [hoje, selecionada];
  const distancia = Math.abs(diferencaEmDias(selecionada, hoje));

  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  return (
    <>
      <button ref={gatilhoRef} type="button" onClick={() => (aberto ? fechar() : abrir())} aria-haspopup="dialog" aria-expanded={aberto} className="cursor-pointer">
        {customTrigger ?? (
          <span className="flex items-center gap-2.5 h-9 pl-3 pr-2.5 rounded-full bg-fg/5 border border-line text-fg hover:bg-fg/10 transition">
            <CalendarDays size={16} className="text-fg-muted" />
            <span className="text-sm font-medium">
              {String(diaSel).padStart(2, '0')} {MESES[mesSel - 1]} {anoSel}
            </span>
            <ChevronDown size={15} className={`text-fg-subtle transition ${aberto ? 'rotate-180' : ''}`} />
          </span>
        )}
      </button>

      {createPortal(
        <AnimatePresence>
          {ancora && (
            <div className="fixed inset-0 z-[400]">
              <motion.div
                className="absolute inset-0 bg-black/35 backdrop-blur-xl"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={fechar}
              />

              {/* Celular: centralizado. md+: abaixo do botão (posição calculada ao abrir) */}
              <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none md:block md:p-0">
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Escolher data"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  style={{ '--top': `${ancora.top}px`, '--left': `${ancora.left}px` } as CSSProperties}
                  className="pointer-events-auto w-full max-w-[300px] p-4 rounded-3xl vidro md:absolute md:top-[var(--top)] md:left-[var(--left)] md:-translate-x-1/2"
                >
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navegar(-1)} aria-label="Mês anterior" className="w-8 h-8 rounded-full flex items-center justify-center text-fg-muted hover:bg-fg/10 transition cursor-pointer">
                      <ChevronLeft size={18} />
                    </button>
                    {/* Mês em destaque e o ano pequeno embaixo */}
                    <p className="flex flex-col items-center leading-tight">
                      <span className="text-sm font-medium text-fg">{MESES[mes]}</span>
                      <span className="text-[11px] text-fg-subtle tabular-nums">{ano}</span>
                    </p>
                    <button onClick={() => navegar(1)} aria-label="Próximo mês" className="w-8 h-8 rounded-full flex items-center justify-center text-fg-muted hover:bg-fg/10 transition cursor-pointer">
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 mb-1 text-[10px] font-semibold text-fg-subtle">
                    {DIAS_SEMANA.map((d, i) => <div key={i} className="text-center py-1">{d}</div>)}
                  </div>

                  {/* Sem espaço entre colunas: a faixa entre hoje e a data escolhida fica contínua */}
                  <div className="grid grid-cols-7 gap-y-1">
                    {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={`v${i}`} />)}
                    {Array.from({ length: diasNoMes }).map((_, i) => {
                      const dia = i + 1;
                      const iso = montarISO(ano, mes, dia);
                      // Compara a data inteira: o dia 17 só fica marcado no mês/ano certos
                      const ehSelecionado = iso === selecionada;
                      const ehHoje = iso === hoje;
                      const naFaixa = temFaixa && iso >= inicioFaixa && iso <= fimFaixa;
                      const ehInicio = naFaixa && iso === inicioFaixa;
                      const ehFim = naFaixa && iso === fimFaixa;
                      const semana = (primeiroDiaSemana + i) % 7; // 0 = domingo
                      // A faixa arredonda nas pontas do intervalo e nas bordas da semana
                      const arredondaEsq = ehInicio || semana === 0 || dia === 1;
                      const arredondaDir = ehFim || semana === 6 || dia === diasNoMes;
                      return (
                        <div key={dia} className="relative aspect-square">
                          {naFaixa && (
                            <span
                              aria-hidden="true"
                              className={`absolute inset-y-[3px] bg-[#1fba11]/15 ${ehInicio ? 'left-1/2' : 'left-0'} ${ehFim ? 'right-1/2' : 'right-0'} ${arredondaEsq && !ehInicio ? 'rounded-l-full' : ''} ${arredondaDir && !ehFim ? 'rounded-r-full' : ''}`}
                            />
                          )}
                          <button
                            onClick={() => escolher(iso)}
                            aria-pressed={ehSelecionado}
                            aria-current={ehHoje ? 'date' : undefined}
                            className={`relative w-full h-full flex items-center justify-center rounded-full text-[13px] transition cursor-pointer ${
                              ehSelecionado
                                ? 'bg-[#1fba11] text-white font-semibold shadow-[0_4px_14px_rgba(31,186,17,0.4)]'
                                : ehHoje
                                  ? temFaixa
                                    // Hoje como a outra ponta da faixa: círculo verde mais suave
                                    ? 'bg-[#1fba11]/35 text-fg font-semibold ring-1 ring-[#1fba11]/70'
                                    : 'text-marca font-semibold ring-1 ring-[#1fba11]/50 hover:bg-fg/10'
                                  : 'text-fg hover:bg-fg/10'
                            }`}
                          >
                            {dia}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {temFaixa && (
                    <p className="mt-3 text-[11px] text-fg-subtle text-center">
                      {distancia === 1 ? '1 dia' : `${distancia} dias`} {selecionada < hoje ? 'antes de hoje' : 'depois de hoje'}
                    </p>
                  )}

                  <div className="flex justify-end mt-3 pt-3 border-t border-line">
                    <button onClick={() => escolher(hoje)} className="text-xs font-medium text-marca hover:underline cursor-pointer">
                      Ir para hoje
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
