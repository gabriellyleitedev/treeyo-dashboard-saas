import React, { useState, useRef } from 'react';
import { LayoutDashboard, Bell, Calendar, ChevronDown, Sun, Moon, User, Settings, LogOut } from 'lucide-react';
import CalendarPicker from './CalendarPicker';

const Header = ({ isDarkMode, toggleTheme, isMenuOpen, setIsMenuOpen }) => {
  const [diaSelecionado, setDiaSelecionado] = useState(new Date().getDate());

  const handleDateChange = (dateString) => {
    const dia = new Date(dateString + 'T00:00:00').getDate();
    setDiaSelecionado(dia);
  };


  return (
    <header className="sticky top-0 z-50 w-full px-4 md:px-0 pt-4 md:pt-0 md:-mt-8 transition-all duration-300">

      {/* ESTRUTURA MOBILE */}
      <div className="md:hidden flex items-center justify-between px-1 py-0 relative">
        <div className="absolute inset-0 -z-10 bg-[#1a1a1a]/10 rounded-md backdrop-blur-md" />

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
              <img src="https://github.com/gabriellyleitedev.png" className="w-full h-full rounded-full object-cover" alt="Perfil" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-white font-base text-[13px]">Olá Gabi!</span>
              <ChevronDown size={16} className={`text-neutral-400 border border-white/10 rounded-full w-4 h-4 transition-transform hover:scale-110 ${isMenuOpen ? 'rotate-180' : ''}`} />
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
                  {diaSelecionado}
                </span>
              </div>
            }
          />

          <div className="relative p-1.5 border bg-white/5 rounded-full border-white/10">
            <Bell size={22} className="text-gray-200" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#1fba11] rounded-full border border-[#1fba11]" />
          </div>
        </div>
      </div>

      {/* ESTRUTURA NOTEBOOK */}
      <div className="hidden md:flex items-center justify-between bg-transparent px-0 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-[#1fba11]/10 p-2 rounded-lg">
            <LayoutDashboard size={28} className="text-[#1fba11]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-gray-200 leading-[0.9] tracking-tight">Dashboard</h1>
            <p className="text-sm text-[#1fba11] font-medium mt-1">Olá Gabrielly, que bom te ver!</p>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className='relative'>
            <CalendarPicker
              onChange={handleDateChange}
              value={`2026-02-${String(diaSelecionado).padStart(2, '0')}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center p-0.5 rounded-full bg-black/40 border border-white/10 relative">
            <button
              onClick={() => !isDarkMode && toggleTheme()}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition cursor-pointer ${!isDarkMode ? 'bg-[#333333] text-white shadow-md' : 'text-gray-500 hover:bg-white/5'}`}
            >
              <Sun size={16} />
            </button>
            <button
              onClick={() => isDarkMode && toggleTheme()}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition cursor-pointer ${isDarkMode ? 'bg-[#333333] text-white shadow-md' : 'text-gray-500 hover:bg-white/5'}`}
            >
              <Moon size={16} />
            </button>
          </div>

          <div className="w-10 h-10 rounded-full border bg-[#1A1A1A] border-white/5 hover:bg-white/5 transition flex items-center justify-center cursor-pointer relative">
            <Bell size={20} className="text-gray-200" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#1fba11] rounded-full border border-black" />
          </div>
        </div>
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mt-6" />
    </header>
  );
};

export default Header;