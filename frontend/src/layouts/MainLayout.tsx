import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguage } from '../contexts/LanguageContext';
import clsx from 'clsx';
import { Globe } from 'lucide-react';

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-on-surface antialiased font-display">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-secondary dark:bg-[#1a120c] text-white flex-shrink-0 transition-all duration-300 relative">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-xl">menu_book</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">HolanSoft</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4 flex flex-col mb-16">
          <div>
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menú Principal</p>
            
            <NavLink to="/dashboard" className={({isActive}) => clsx("flex items-center gap-3 px-4 py-3 rounded-xl transition-all group", isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-300 hover:bg-white/10 hover:text-white")}> 
              <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">dashboard</span>
              <span className="font-medium text-sm">{t('common.dashboard')}</span>
            </NavLink>

            <NavLink to="/inventory" className={({isActive}) => clsx("flex items-center gap-3 px-4 py-3 rounded-xl transition-all group", isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-300 hover:bg-white/10 hover:text-white")}> 
              <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">inventory_2</span>
              <span className="font-medium text-sm">{t('common.inventory')}</span>
            </NavLink>

            <NavLink to="/sales" className={({isActive}) => clsx("flex items-center gap-3 px-4 py-3 rounded-xl transition-all group", isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-300 hover:bg-white/10 hover:text-white")}> 
              <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">point_of_sale</span>
              <span className="font-medium text-sm">{t('common.sales')}</span>
            </NavLink>

            <NavLink to="/purchases" className={({isActive}) => clsx("flex items-center gap-3 px-4 py-3 rounded-xl transition-all group", isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-300 hover:bg-white/10 hover:text-white")}> 
              <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">shopping_cart</span>
              <span className="font-medium text-sm">{t('common.purchases')}</span>
            </NavLink>

            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">Analítica y Admin</p>
            
            <NavLink to="/reports" className={({isActive}) => clsx("flex items-center gap-3 px-4 py-3 rounded-xl transition-all group", isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-300 hover:bg-white/10 hover:text-white")}> 
              <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">bar_chart</span>
              <span className="font-medium text-sm">{t('common.reports')}</span>
            </NavLink>

            <NavLink to="/users" className={({isActive}) => clsx("flex items-center gap-3 px-4 py-3 rounded-xl transition-all group", isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-300 hover:bg-white/10 hover:text-white")}> 
              <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">group</span>
              <span className="font-medium text-sm">{t('common.users')}</span>
            </NavLink>

            <NavLink to="/settings" className={({isActive}) => clsx("flex items-center gap-3 px-4 py-3 rounded-xl transition-all group", isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-300 hover:bg-white/10 hover:text-white")}> 
              <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">settings</span>
              <span className="font-medium text-sm">{t('common.settings')}</span>
            </NavLink>
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark">
        {/* Header */}
        <header className="bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-6 lg:px-8 z-10 sticky top-0">
          <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="hidden md:flex items-center gap-4">
            {/* Context Title will go into Outlet or context, but leaving empty for flexibility */}
          </div>
          <div className="flex items-center gap-4 ml-auto">
            {/* Language Switcher */}
            <div 
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-all group shadow-sm active:scale-95"
            >
              <Globe size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
              <span className="text-xs font-black uppercase text-gray-500 dark:text-gray-300 tracking-widest">{language === 'es' ? 'Español' : 'English'}</span>
            </div>

            <div className="h-8 w-[1px] bg-gray-200 dark:bg-white/10 hidden sm:block"></div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 dark:text-white group-hover:text-primary transition-colors">{user?.name || "Usuario"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || "Admin"}</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#2d1f16] shadow-sm bg-primary text-white flex items-center justify-center font-bold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
