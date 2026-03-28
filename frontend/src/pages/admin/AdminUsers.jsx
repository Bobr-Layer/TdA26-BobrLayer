import { useState, useEffect } from 'react';
import Sidenav from '../../shared/layout/sidenav/Sidenav';
import Header from '../../shared/layout/header/Header';
import dashStyles from '../dashboard/dashboard.module.scss';
import styles from './adminusers.module.scss';
import { getUsers, updateUserRole, deleteUser } from '../../services/UserService';
import { usePageTitle } from '../../hooks/usePageTitle';
import DashboardButton from '../../shared/button/dashboard/DashboardButton';

function AdminUsers({ user, setUser }) {
  usePageTitle('Správa uživatelů');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError('Nepodařilo se načíst uživatele');
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleToggle(targetUser) {
    const newRole = targetUser.role === 'STUDENT' ? 'LEKTOR' : 'STUDENT';
    try {
      const updated = await updateUserRole(targetUser.uuid, newRole);
      setUsers(prev => prev.map(u => u.uuid === targetUser.uuid ? updated : u));
    } catch (err) {
      alert('Nepodařilo se změnit roli uživatele');
    }
  }

  async function handleDelete(targetUser) {
    if (!window.confirm(`Opravdu chcete smazat uživatele "${targetUser.username}"?`)) return;
    try {
      await deleteUser(targetUser.uuid);
      setUsers(prev => prev.filter(u => u.uuid !== targetUser.uuid));
    } catch (err) {
      alert('Nepodařilo se smazat uživatele');
    }
  }

  const roleLabel = (role) => {
    if (role === 'STUDENT') return 'Student';
    if (role === 'LEKTOR') return 'Lektor';
    if (role === 'ADMIN') return 'Admin';
    if (role === 'SUPER_ADMIN') return 'Super Admin';
    return role;
  };

  const filteredUsers = users.filter(u => {
    const matchName = u.username.toLowerCase().includes(searchName.toLowerCase());
    const matchRole = filterRole === 'ALL' || u.role === filterRole;
    return matchName && matchRole;
  });

  return (
    <div>
      <Header user={user} setUser={setUser} onlyMobile={true} />
      <Sidenav user={user} setUser={setUser} current={'users'} />
      <section className={dashStyles.dashboard}>
        <article className={dashStyles.dashboard_header}>
          <div className={dashStyles.dashboard_header_text}>
            <h1>Správa uživatelů</h1>
            <p>{filteredUsers.length} / {users.length} uživatelů</p>
          </div>
        </article>

        <div className={styles.filters}>
          <input
            className={styles.filter_input}
            type="text"
            placeholder="Hledat podle jména..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
          />
          <div className={styles.role_filters}>
            {['ALL', 'STUDENT', 'LEKTOR', 'ADMIN', 'SUPER_ADMIN'].map(role => (
              <button
                key={role}
                className={`${styles.role_filter_btn} ${filterRole === role ? styles.active : ''}`}
                onClick={() => setFilterRole(role)}
              >
                {role === 'ALL' ? 'Všichni' : roleLabel(role)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className={styles.state_msg}>Načítání...</p>
        ) : error ? (
          <p className={styles.state_msg_err}>{error}</p>
        ) : filteredUsers.length === 0 ? (
          <p className={styles.state_msg}>Žádní uživatelé nenalezeni.</p>
        ) : (
          <ul className={styles.user_list}>
            {filteredUsers.map(u => (
              <li key={u.uuid} className={styles.user_card}>
                <div className={styles.user_card_info}>
                  <div className={styles.user_avatar}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div className={styles.user_details}>
                    <span className={styles.user_name}>{u.username}</span>
                    <span className={`${styles.user_role} ${styles['role_' + u.role.toLowerCase()]}`}>
                      {roleLabel(u.role)}
                    </span>
                  </div>
                </div>
                <div className={styles.user_card_actions}>
                  {user.role === 'SUPER_ADMIN' && u.role !== 'ADMIN' && u.role !== 'SUPER_ADMIN' && (
                    <DashboardButton
                      text={u.role === 'STUDENT' ? 'Změnit na Lektora' : 'Změnit na Studenta'}
                      onClick={() => handleRoleToggle(u)}
                    />
                  )}
                  {u.uuid !== user.uuid && (
                    <button
                      className={`${dashStyles.course_button} ${dashStyles.course_button_icon} ${dashStyles.course_button_delete}`}
                      onClick={() => handleDelete(u)}
                      title="Smazat uživatele"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default AdminUsers;
