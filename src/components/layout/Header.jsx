import { useState } from 'react';
import { LayoutDashboard, Calendar, ChevronDown, Sun, Moon, User, LogOut } from 'lucide-react';
import CalendarPicker from '@/components/ui/CalendarPicker';
import NotificationBell from '@/components/ui/NotificationBell';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';
import { USUARIO } from '@/constants/usuario';


const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());

  const handleDateChange = (dateString) => {
    const novaData = new Date(dateString + 'T00:00:00');
    setDataSelecionada(novaData);
  };

  const diaParaExibir = dataSelecionada.getDate();

  return (
    <header className="sticky top-0 z-50 -mx-4 px-4 md:mx-0 md:px-0 pt-2 pb-1 md:pt-4 md:pb-0 bg-[#111111]/95 md:bg-transparent transition-all duration-300">

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
            <div className="w-10 h-10 rounded-full border-[1.5px] border-[#1fba11] p-[1.5px] shrink-0">
              <img src={USUARIO.avatar} className="w-full h-full rounded-full object-cover" alt="Perfil" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-white font-base text-sm">Olá {USUARIO.apelido}!</span>
              <ChevronDown size={16}
                className={`text-neutral-400 border border-white/10 rounded-full w-5 h-5 transition-transform hover:scale-110 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-3 w-52 rounded-2xl bg-neutral-900/40 backdrop-blur-xl border border-white/10 shadow-2xl p-2 z-[100]">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/5 rounded-xl transition">
                <User size={16} className="text-[#1fba11]" /> Perfil
              </button>
              <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-white/5 rounded-xl transition">
                {isDarkMode ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-blue-400" />} Tema
              </button>
              <div className="h-[1px] bg-white/5 my-1" />
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
            customTrigger={
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 relative">
                <Calendar size={24} className="text-gray-200" strokeWidth={1.5} />
                <span className="absolute top-[50%] text-[9px] font-bold text-[#1fba11]/90 leading-none tracking-tighter">
                  {diaParaExibir}
                </span>
              </div>
            }
          />
          <NotificationBell modulo="geral" />
        </div>

      </div>

      {/* ESTRUTURA NOTEBOOK */}
      <div className="hidden md:flex items-center justify-between border border-white/10 rounded-full bg-[#141414]/85 backdrop-blur-md px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-[#1fba11]/10 p-2 rounded-lg">
            <LayoutDashboard size={28} className="text-[#1fba11]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-gray-200 leading-[0.9] tracking-tight">Dashboard</h1>
            <p className="text-sm text-[#1fba11] font-medium mt-1">Olá {USUARIO.nome}, que bom te ver!</p>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className='relative'>
            <CalendarPicker
              onChange={handleDateChange}
              value={dataSelecionada.toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="flex items-center gap-5">
          <ThemeToggle />

          <NotificationBell modulo="geral" />

        </div>
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mt-6" />
    </header>
  );
};

export default Header;