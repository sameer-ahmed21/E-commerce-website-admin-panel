import React, { useEffect, useState } from 'react';
import { MoreVertical, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react';
import { apiRequest } from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal.jsx';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

  const [roleTarget, setRoleTarget] = useState(null); // { user, newRole }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [working, setWorking] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    apiRequest('/api/users')
      .then(setUsers)
      .catch((err) => console.error('Failed to load users:', err))
      .finally(() => setLoading(false));
  };

  useEffect(fetchUsers, []);

  const handleRoleChange = async () => {
    setWorking(true);
    setError('');
    try {
      await apiRequest(`/api/users/${roleTarget.user.id}/role`, {
        method: 'PATCH',
        body: { role: roleTarget.newRole },
      });
      setRoleTarget(null);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  };

  const handleDelete = async () => {
    setWorking(true);
    setError('');
    try {
      await apiRequest(`/api/users/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 font-bold text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase tracking-tight">Users</h1>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl px-4 py-3">{error}</div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-100">
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Joined</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === currentUser?.id;
              return (
                <tr key={u.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-bold">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        u.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {u.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      type="button"
                      disabled={isSelf}
                      title={isSelf ? "You can't modify your own account" : undefined}
                      onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                      className="p-2 hover:bg-slate-100 rounded-full transition disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenuId === u.id && !isSelf && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-6 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-lg p-1.5 z-50 text-left">
                          {u.role === 'admin' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setRoleTarget({ user: u, newRole: 'user' });
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-100 transition"
                            >
                              <ShieldOff className="w-3.5 h-3.5" /> Remove Admin
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setRoleTarget({ user: u, newRole: 'admin' });
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-100 transition"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> Make Admin
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTarget(u);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-red-50 text-red-500 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!roleTarget}
        onClose={() => setRoleTarget(null)}
        title={roleTarget?.newRole === 'admin' ? 'Make Admin' : 'Remove Admin'}
        footer={
          <>
            <button
              type="button"
              onClick={() => setRoleTarget(null)}
              className="px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRoleChange}
              disabled={working}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {working ? 'Saving...' : 'Confirm'}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          {roleTarget?.newRole === 'admin'
            ? `Make ${roleTarget?.user.name} an admin?`
            : `Remove admin access from ${roleTarget?.user.name}?`}
        </p>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={working}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
            >
              {working ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Delete <span className="font-bold">{deleteTarget?.name}</span>? This can't be undone.
        </p>
      </Modal>
    </div>
  );
}
