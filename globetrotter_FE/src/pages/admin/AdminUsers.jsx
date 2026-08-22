import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  Shield,
  Trash2,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  ArrowUpDown,
} from 'lucide-react';

export const AdminUsers = () => {
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger',
  });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({
        search: search || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      if (res.data?.users) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleRole = (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setConfirmModal({
      isOpen: true,
      title: 'Change User Role?',
      message: `Are you sure you want to change ${user.name}'s role to ${newRole}?`,
      confirmText: 'Change Role',
      type: 'warning',
      onConfirm: async () => {
        try {
          await adminAPI.updateRole(user.id, newRole);
          setUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
          );
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          showSuccess(`User role updated to ${newRole}`);
        } catch (err) {
          showError(err.message || 'Failed to update role');
        }
      },
    });
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setConfirmModal({
      isOpen: true,
      title: 'Change User Status?',
      message: `Are you sure you want to set ${user.name}'s account status to ${newStatus}?`,
      confirmText: `${newStatus} Account`,
      type: 'warning',
      onConfirm: async () => {
        try {
          await adminAPI.updateStatus(user.id, newStatus);
          setUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
          );
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          showSuccess(`User status updated to ${newStatus}`);
        } catch (err) {
          showError(err.message || 'Failed to update status');
        }
      },
    });
  };

  const handleDeleteUser = (user) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete User Account?',
      message: `Are you sure you want to permanently delete account for "${user.name}"? This action removes all their trips.`,
      confirmText: 'Delete Account',
      type: 'danger',
      onConfirm: async () => {
        try {
          await adminAPI.deleteUser(user.id);
          setUsers((prev) => prev.filter((u) => u.id !== user.id));
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          showSuccess('User account deleted');
        } catch (err) {
          showError(err.message || 'Failed to delete user');
        }
      },
    });
  };

  return (
    <div className="space-y-8">
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
      />
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
          User Directory & Roles
        </span>
        <h1 className="text-3xl font-bold font-serif text-stone-900 mt-0.5">
          Traveler & Administrator Accounts
        </h1>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-amber-600"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-semibold">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-900"
            >
              <option value="ALL">All Roles</option>
              <option value="USER">Traveler (User)</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-900"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching platform accounts..." />
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-stone-500 text-sm">
            No users found matching query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Trips Created</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50 transition">
                    <td className="py-4 px-6 flex items-center gap-3">
                      {u.photoUrl ? (
                        <img
                          src={u.photoUrl}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-stone-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-xs">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-stone-900 text-sm font-serif">{u.name}</p>
                        <p className="text-[11px] text-stone-500">{u.email}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {u.role === 'ADMIN' && <Shield className="w-3 h-3 text-amber-600" />}
                        {u.role}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-semibold text-stone-700">
                      {u._count?.trips || 0} journeys
                    </td>

                    <td className="py-4 px-4 text-stone-500 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleToggleRole(u)}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[11px] transition"
                        title={u.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                      >
                        {u.role === 'ADMIN' ? 'Demote' : 'Promote Admin'}
                      </button>

                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition ${
                          u.status === 'ACTIVE'
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
      />
    </div>
  );
};
