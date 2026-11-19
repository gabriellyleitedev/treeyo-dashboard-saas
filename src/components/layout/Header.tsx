import { LayoutDashboard } from 'lucide-react';
import CalendarPicker from '@/components/ui/CalendarPicker';
import NotificationBell from '@/components/ui/NotificationBell';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { usePreferencias } from '@/context/PreferenciasContext';
import { dataLocalISO } from '@/domain/datas';
import HeaderMobile from './HeaderMobile';

interface HeaderProps {
  /** Data de referência do painel (AAAA-MM-DD) */
  data: string;
  onDataChange: (dataISO: string) => void;
}

// Cabeçalho da Visão Geral. Celular: HeaderMobile (perfil, busca, sino).
// md+: título, seletor de data, tema e notificações.
const Header = ({ data, onDataChange }: HeaderProps) => {
  const { preferencias } = usePreferencias();
  const ehHoje = data === dataLocalISO();

  return (
    <>
      <HeaderMobile />

      <header className="hidden md:block sticky top-0 z-50 pt-4">
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl border border-line bg-fg/[0.03] flex items-center justify-center text-fg">
              <LayoutDashboard size={18} strokeWidth={1.75} />
            </span>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-medium text-fg leading-none">Dashboard</p>
                {/* Indica se o painel mostra hoje ou uma data escolhida no calendário */}
                {ehHoje ? (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-marca bg-[#1fba11]/10 rounded-md px-1.5 py-0.5 leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1fba11]" /> Hoje
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-fg-muted bg-fg/5 rounded-md px-1.5 py-0.5 leading-none">Histórico</span>
                )}
              </div>
              <p className="hidden lg:block text-xs text-fg-subtle">Olá, {preferencias.apelido || preferencias.nomeCompleto.split(' ')[0]}. Acompanhe seu caixa e suas pendências.</p>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <CalendarPicker onChange={onDataChange} value={data} />
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell modulo="geral" />
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-fg/10 to-transparent mt-4" />
      </header>
    </>
  );
};

export default Header;
