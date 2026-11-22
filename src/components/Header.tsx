import React from 'react';

export type ActiveTab = 'studio' | 'examples' | 'reference' | 'history';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onNewPrompt: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onNewPrompt,
  historyCount,
}) => {
  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'studio', label: 'Studio' },
    { id: 'examples', label: 'Contoh Kasus' },
    { id: 'reference', label: 'Referensi' },
    { id: 'history', label: historyCount > 0 ? `Riwayat (${historyCount})` : 'Riwayat' },
  ];

  return (
    <header className="border-b border-[#262830] bg-[#111214]/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-[1320px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('studio')}
          className="font-display text-xl font-semibold tracking-tight text-[#F5F4F0] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E06D3B] rounded-sm"
        >
          AnatomiPrompt
        </button>

        {/* Zone 2: 4 single-line navigation links */}
        <nav
          aria-label="Navigasi utama"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E06D3B] rounded-sm ${
                  isActive
                    ? 'text-[#F5F4F0]'
                    : 'text-[#9A9CA5] hover:text-[#F5F4F0]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-[21px] h-[2px] bg-[#E06D3B]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onNewPrompt}
            className="px-4 py-2 text-xs font-semibold text-[#111214] bg-[#F5F4F0] hover:bg-[#E5E3DC] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E06D3B]"
          >
            Prompt Baru
          </button>
        </div>
      </div>

      {/* Mobile navigation strip */}
      <nav
        aria-label="Navigasi mobile"
        className="flex md:hidden items-center gap-5 px-6 pb-3 overflow-x-auto text-xs font-medium border-t border-[#1D1F25]"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`pt-2.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive ? 'text-[#E06D3B]' : 'text-[#9A9CA5] hover:text-[#F5F4F0]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
