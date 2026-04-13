import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function SettingsPage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/settings/profile');
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 space-y-6 max-w-2xl">
        {loading ? (
          <p className="text-sm text-gray-500">{t('common.loading')}</p>
        ) : (
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.form.name')}</label>
              <input 
                type="text" 
                defaultValue={profile?.name}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none text-sm dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.form.phone')}</label>
              <input 
                type="text" 
                defaultValue={profile?.phone}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none text-sm dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.form.address')}</label>
              <input 
                type="text" 
                defaultValue={profile?.address}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none text-sm dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('settings.form.email')}</label>
              <input 
                type="email" 
                defaultValue={profile?.email}
                className="w-full px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none text-sm dark:text-white"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="button"
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl font-medium shadow-sm shadow-primary/20 transition-colors"
              >
                {t('common.saveChanges')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
