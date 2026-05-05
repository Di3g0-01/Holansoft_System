import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Save, Loader2, Building2, Phone, MapPin, Mail } from 'lucide-react';

interface StoreProfile {
  name: string;
  phone: string;
  address: string;
  email: string;
}

export default function SettingsPage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<StoreProfile>({
    name: '',
    phone: '',
    address: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/settings/profile');
      if (res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error(t('common.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings/profile', profile);
      toast.success(t('common.saveSuccess') || 'Cambios guardados correctamente');
    } catch (err) {
      console.error(err);
      toast.error(t('common.errorSavingData') || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t('settings.title')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('settings.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Building2 size={120} />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                <Building2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {profile.name || 'Empresa'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Esta información aparecerá en los reportes, facturas y recibos generados por el sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-white/5">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Building2 size={16} className="text-primary" />
                    {t('settings.form.name')}
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-3 border border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-black/20 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                    placeholder="Nombre de la empresa"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Phone size={16} className="text-primary" />
                    {t('settings.form.phone')}
                  </label>
                  <input 
                    type="text" 
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="w-full px-5 py-3 border border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-black/20 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                    placeholder="+502 0000 0000"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    {t('settings.form.address')}
                  </label>
                  <input 
                    type="text" 
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    className="w-full px-5 py-3 border border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-black/20 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                    placeholder="Dirección completa"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Mail size={16} className="text-primary" />
                    {t('settings.form.email')}
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="w-full px-5 py-3 border border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-black/20 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                    placeholder="admin@empresa.com"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-primary hover:bg-primary-hover disabled:opacity-70 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all flex items-center gap-2 active:scale-[0.98]"
                >
                  {saving ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {t('common.saving') || 'Guardando...'}
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {t('common.saveChanges')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
