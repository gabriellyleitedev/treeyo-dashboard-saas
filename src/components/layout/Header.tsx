import { useState } from 'react';
import { LayoutDashboard, Calendar, ChevronDown, Sun, Moon, User, LogOut } from 'lucide-react';
import CalendarPicker from '@/components/ui/CalendarPicker';
import NotificationBell from '@/components/ui/NotificationBell';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';
import { USUARIO } from '@/constants/usuario';
import { dataLocalISO } from '@/domain/datas';


interface HeaderProps {
  /** Data de referência do painel (AAAA-MM-DD) */
  data: string;
  onDataChange: (dataISO: string) => void;
}

const Header = ({ data, onDataChange }: HeaderProps) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleDateChange = onDataChange;
  const diaParaExibir = Number(data.slice(8, 10));
  const ehHoje = data === dataLocalISO();

  return (
    <header className="sticky top-0 z-50 -mx-4 px-4 md:mx-0 md:px-0 pt-2 pb-1 md:pt-4 md:pb-0 bg-surface/95 md:bg-transparent transition-all duration-300">

      {/* ESTRUTURA MOBILE */}
      <div className="md:hidden flex items-center justify-between px-1 py-0 relative">

        {/* PERFIL */}
        <div className='relative'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className='flex items-center gap-1 bg-transparent border-none outline-none'
          >
            <div aria-hidden="true" className="w-10 h-10 rounded-full bg-[#1fba11]/15 border-[1.5px] border-[#1fba11] text-marca text-sm font-semibold flex items-center justify-center shrink-0">
              {USUARIO.iniciais}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-fg font-base text-sm">Olá {USUARIO.apelido}!</span>
              <ChevronDown size={16}
                className={`text-fg-muted border border-line rounded-full w-5 h-5 transition-transform hover:scale-110 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-3 w-52 rounded-2xl bg-card backdrop-blur-xl border border-line shadow-2xl p-2 z-[100]">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-fg hover:bg-fg/5 rounded-xl transition">
                <User size={16} className="text-marca" /> Perfil
              </button>
              <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-fg hover:bg-fg/5 rounded-xl transition">
                {isDarkMode ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-blue-400" />} Tema
              </button>
              <div className="h-[1px] bg-fg/5 my-1" />
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 rounded-xl transition">
                <LogOut size={16} /> Sair
              </button>
            </div>
          )}
        </div>

        {/* DIREITA - CALENDÁRIO */}
        <div className="flex items-center gap-3">
          <CalendarPicker
            onChange={handleDateChange}
            value={data}
            customTrigger={
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-fg/5 border border-line relative">
                <Calendar size={22} className="text-fg" strokeWidth={1.5} />
                <span className="absolute top-[50%] text-[9px] font-bold text-marca leading-none tracking-tighter">
                  {diaParaExibir}
                </span>
              </span>
            }
          />
          <NotificationBell modulo="geral" />
        </div>

      </div>

      {/* ESTRUTURA NOTEBOOK */}
      <div className="hidden md:flex items-center justify-between py-2">
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
            <p className="text-xs text-fg-subtle">Olá, {USUARIO.nome}. Acompanhe seu caixa e suas pendências.</p>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className='relative'>
            <CalendarPicker
              onChange={handleDateChange}
              value={data}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <NotificationBell modulo="geral" />

        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-fg/10 to-transparent mt-4" />
    </header>
  );
};

export default Header;