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
        type="button"
        onClick={handleOpen}
        title="Central de notificações operacionais"
        className="os-icon-btn relative"
        aria-label="Notificações"
      >
        <Bell className="w-4 h-4" aria-hidden />
        {unreadCount > 0 && (
          <span className="os-notify-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="os-notify-panel">
          <div className="os-notify-head">
            <div className="flex items-center gap-2 min-w-0">
              <Bell className="w-4 h-4 os-notify-icon" aria-hidden />
              <h3>Central de alertas</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="os-icon-btn"
              aria-label="Fechar notificações"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="os-notify-list">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link}
                  onClick={() => setIsOpen(false)}
                  className="os-notify-item"
                >
                  <span className={`os-metric-icon is-${n.type}`} aria-hidden>
                    {n.type === 'call' && <Phone className="w-4 h-4" />}
                    {n.type === 'quote' && <FileText className="w-4 h-4" />}
                    {n.type === 'lead' && <UserPlus className="w-4 h-4" />}
                    {n.type === 'system' && <CheckCircle2 className="w-4 h-4" />}
                  </span>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="os-notify-title">{n.title}</p>
                    <p className="os-notify-message">{n.message}</p>
                    {n.date && (
                      <p className="os-notify-date">
                        {new Date(n.date).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="os-notify-empty">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2" aria-hidden />
                <p>Nenhum alerta pendente</p>
                <p>Tudo em dia na operação.</p>
              </div>
            )}
          </div>

          <div className="os-notify-foot">
            <Link
              href="/leads"
              onClick={() => setIsOpen(false)}
            >
              Ver leads e reuniões
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
