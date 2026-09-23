import React, { useState, useRef, useEffect } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function CalendarPicker({
  value,
  onChange,
  isEditable = false,
  customTrigger
}) {
  const today = new Date();
  const ref = useRef(null);

  const [open, setOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  useEffect(() => {
    if (!value) return;
    const parts = value.split('-');
    if (parts.length !== 3) return;
    const y = Number(parts[0]);
    const m = Number(parts[1]) - 1;
    const d = Number(parts[2]);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      setYear(y);
      setMonth(m);
      setSelectedDay(d);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth(e) {
    e.stopPropagation();
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  }

  function nextMonth(e) {
    e.stopPropagation();
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  }

  function handleSelect(day) {
    setSelectedDay(day);
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (onChange) onChange(formatted);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(!open)}>
        {customTrigger ? customTrigger : (
          <div className="flex items-center gap-3 px-2 py-1 rounded-3xl bg-white/5 border border-white/10 text-white/80 backdrop-blur-xl hover:bg-white/10 transition cursor-pointer">
            <CalendarDays size={18} className="text-neutral-400" />
            <span className="text-sm font-medium">
              {String(selectedDay).padStart(2, '0')} {months[month]} {year}
            </span>
            <ChevronDown size={16} className={`text-white/40 transition ${open ? 'rotate-180' : ''}`} />
          </div>
        )}
      </div>

      {/* OVERLAY PARA MOBILE */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] md:hidden"
            onClick={() => setOpen(false)}
          />

          <div className="
            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-[95%] max-w-[320px] 
            md:absolute md:top-[calc(100%+12px)] md:left-1/2 md:-translate-x-1/2 md:translate-y-0
            md:w-[300px]
            z-[999] p-5
            bg-[#1a1a1a]/10 backdrop-blur-2xl
            border border-white/10 rounded-3xl
            shadow-[0_20px_50px_rgba(0,0,0,0.8)]
          ">
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/10 transition">
                <ChevronLeft size={20} className="text-white/60" />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium text-gray-200 uppercase tracking-widest">
                  {months[month]}
                </span>
                <span className="text-xs text-white/40">{year}</span>
              </div>
              <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/10 transition">
                <ChevronRight size={20} className="text-white/60" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-3 text-[10px] font-bold text-white/30 uppercase tracking-tighter">
              {weekDays.map((d, i) => (
                <div key={i} className="text-center">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={i} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = day === selectedDay;
                return (
                  <button
                    key={day}
                    onClick={() => handleSelect(day)}
                    className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition ${isSelected ? 'bg-[#1fba11] text-white shadow-[0_0_15px_rgba(31,186,17,0.4)]' : 'text-white/70 hover:bg-white/10'
                      }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}