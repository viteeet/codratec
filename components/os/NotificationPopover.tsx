'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Phone, FileText, UserPlus, CheckCircle2, X } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'call' | 'quote' | 'lead' | 'system';
  link: string;
  date?: string;
}

interface NotificationPopoverProps {
  initialNotifications?: NotificationItem[];
}

export function NotificationPopover({ initialNotifications = [] }: NotificationPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialNotifications.length);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora do popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0); // Marcar como lido ao abrir
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Botão de Notificações com Badge */}
      <button
        onClick={handleOpen}
        title="Central de Notificações Operacionais"
        className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition relative flex items-center justify-center"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-blue-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-slate-900 shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown de Notificações */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-none z-50 overflow-hidden">
          {/* Header do Popover */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-xs text-white">Central de Alertas & Notificações</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lista de Notificações */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50 custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link}
                  onClick={() => setIsOpen(false)}
                  className="p-3 flex items-start gap-3 hover:bg-slate-800/50 transition group block"
                >
                  <div className="p-2 rounded-md shrink-0 bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition">
                    {n.type === 'call' && <Phone className="w-4 h-4 text-emerald-400" />}
                    {n.type === 'quote' && <FileText className="w-4 h-4 text-amber-400" />}
                    {n.type === 'lead' && <UserPlus className="w-4 h-4 text-purple-400" />}
                    {n.type === 'system' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white group-hover:text-blue-400 transition leading-tight">
                      {n.title}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                      {n.message}
                    </p>
                    {n.date && (
                      <p className="text-[9px] text-slate-500 font-mono mt-1">
                        {new Date(n.date).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-6 text-center text-slate-500 space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-400">Nenhum alerta pendente</p>
                <p className="text-[11px] text-slate-500">Tudo em dia na sua operação!</p>
              </div>
            )}
          </div>

          {/* Footer do Popover */}
          <div className="p-2 bg-slate-950/80 border-t border-slate-800 text-center">
            <Link
              href="/leads"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 block py-1"
            >
              Ver todos os leads e reuniões →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
