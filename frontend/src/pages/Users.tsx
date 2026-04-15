import { useEffect, useState } from 'react';
import api from '../lib/api';
import { format } from 'date-fns';
import { UserPlus, Edit3, Trash2, Search, Shield, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import AddUserModal from '../components/users/AddUserModal';
import EditUserModal from '../components/users/EditUserModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { toast } from 'sonner';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setConfirmDelete({ open: true, id });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete.id) return;
    try {
      await api.delete(`/users/${confirmDelete.id}`);
      toast.success(t('users.messages.successDelete'));
      fetchUsers();
    } catch (err) {
      toast.error(t('users.messages.errorDelete'));
    } finally {
      setConfirmDelete({ open: false, id: null });
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-secondary dark:text-white tracking-tight">{t('users.title')}</h2>
          <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest">{t('users.subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-4 rounded-[1.5rem] font-black shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <UserPlus size={20} />
          {t('users.newUser')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Search Bar */}
        <div className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder={t('common.search')}
              className="w-full bg-[#F8FAFC] dark:bg-black/20 border-none rounded-2xl py-4 pl-12 pr-6 font-bold text-secondary dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Users Table / Grid */}
        <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[560px]">
              <thead className="bg-[#F8FAFC] dark:bg-black/20 text-slate-400 font-black uppercase tracking-[0.15em] border-b border-gray-100 dark:border-white/5">
                <tr>
                  <th className="px-8 py-5 text-[10px]">{t('users.table.username')}</th>
                  <th className="px-8 py-5 text-[10px]">{t('users.table.name')}</th>
                  <th className="px-8 py-5 text-[10px]">{t('users.table.role')}</th>
                  <th className="px-8 py-5 text-[10px]">{t('users.table.createdAt')}</th>
                  <th className="px-8 py-5 text-[10px] text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-slate-400">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
                        <span className="font-black uppercase tracking-widest">{t('common.loading')}</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                       <div className="flex flex-col items-center gap-4 text-slate-300">
                         <UserIcon size={64} strokeWidth={1} />
                         <span className="font-black uppercase tracking-widest">{t('common.noData')}</span>
                       </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                            {user.username[0].toUpperCase()}
                          </div>
                          <span className="font-black text-secondary dark:text-white">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-slate-600 dark:text-slate-300 font-bold">{user.name}</td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase rounded-lg ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                          <Shield size={12} />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-slate-400 font-bold">{format(new Date(user.createdAt), 'dd MMM, yyyy')}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(user)}
                            className="p-3 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                            title={t('common.edit')}
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            title={t('common.delete')}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddUserModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchUsers} 
      />
      <EditUserModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSuccess={fetchUsers} 
        user={selectedUser}
      />
      <ConfirmDialog
        isOpen={confirmDelete.open}
        title={t('users.title') + ' - Eliminar'}
        message={t('users.confirm.delete')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </div>
  );
}
