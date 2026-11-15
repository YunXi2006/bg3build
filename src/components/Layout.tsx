import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: '首頁', end: true },
  { to: '/classes', label: '職業' },
  { to: '/races', label: '種族' },
  { to: '/spells', label: '法術' },
  { to: '/skills', label: '技能與背景' },
];

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <NavLink to="/" className="text-lg font-bold tracking-wide text-amber-400">
            BG3 Build 模擬器
          </NavLink>
          <nav className="flex gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-600">
        粉絲自製工具，非官方。Baldur's Gate 3 © Larian Studios / Wizards of the Coast。
      </footer>
    </div>
  );
}
