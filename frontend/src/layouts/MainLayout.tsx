import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguage } from '../contexts/LanguageContext';
import clsx from 'clsx';
import { Globe, X, Menu } from 'lucide-react';

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: "/dashboard", icon: "dashboard", label: t('common.dashboard') },
    { to: "/inventory", icon: "inventory_2", label: t('common.inventory') },
    { to: "/sales", icon: "point_of_sale", label: t('common.sales') },
    { to: "/purchases", icon: "shopping_cart", label: t('common.purchases') },
    { to: "/reports", icon: "bar_chart", label: t('common.reports'), category: "Analítica y Admin" },
    { to: "/users", icon: "group", label: t('common.users') },
    { to: "/settings", icon: "settings", label: t('common.settings') },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-xl">menu_book</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">HolanSoft</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4 flex flex-col mb-16">
        <div>
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menú Principal</p>
          
          {navLinks.map((link) => (
            <div key={link.to}>
              {link.category && (
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">{link.category}</p>
              )}
              <NavLink 
                to={link.to} 
                className={({isActive}) => clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group", 
                  isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-300 hover:bg-white/10 hover:text-white"
                )}
              > 
                <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">{link.icon}</span>
                <span className="font-medium text-sm">{link.label}</span>
              </NavLink>
            </div>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 w-full bg-secondary dark:bg-[#1a120c] border-t border-white/10 z-10">
        <div className="p-4">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition-all group">
            <span className="material-symbols-outlined text-xl text-gray-400 group-hover:text-primary transition-colors" style={{transform: "rotate(180deg)"}}>logout</span>
            <span className="font-medium text-sm">{t('common.logout')}</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-on-surface antialiased font-display">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-secondary dark:bg-[#1a120c] text-white flex-shrink-0 transition-all duration-300 relative">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 w-72 bg-secondary dark:bg-[#1a120c] text-white z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col shadow-2xl",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
        {/* Header */}
        <header className="bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-secondary dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all active:scale-90"
            >
              <Menu size={24} />
            </button>
            <div className="md:hidden flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-white text-sm">menu_book</span>
              </div>
              <span className="font-black tracking-tighter text-secondary dark:text-white uppercase text-sm">HolanSoft</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            {/* Language Switcher */}
            <div 
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="flex items-center overflow-hidden border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer hover:shadow-md transition-all active:scale-95 text-[10px] font-black"
            >
              <div className={clsx(
                "px-3 py-2 transition-colors",
                language === 'es' ? "bg-primary text-white" : "bg-slate-50 dark:bg-white/5 text-slate-400"
              )}>ES</div>
              <div className="w-[1px] h-full bg-slate-200 dark:bg-white/10" />
              <div className={clsx(
                "px-3 py-2 transition-colors",
                language === 'en' ? "bg-primary text-white" : "bg-slate-50 dark:bg-white/5 text-slate-400"
              )}>ENG</div>
            </div>

            <div className="h-8 w-[1px] bg-gray-200 dark:bg-white/10 hidden sm:block"></div>
            
            <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 dark:text-white group-hover:text-primary transition-colors">{user?.name || "Usuario"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || "Admin"}</p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-[#2d1f16] shadow-sm bg-primary text-white flex items-center justify-center font-bold text-sm sm:text-base">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
