import { useState, useEffect } from 'react';
import Sidenav from '../../shared/layout/sidenav/Sidenav';
import Header from '../../shared/layout/header/Header';
import styles from './adminusers.module.scss';
import { getUsers, updateUserRole, deleteUser } from '../../services/UserService';
import { User } from 'lucide-react';

function AdminUsers({ user, setUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    return 'Admin';
  };

  return (
    <div>
      <Header user={user} setUser={setUser} onlyMobile={true} />
      <Sidenav user={user} setUser={setUser} current={'users'} />
      <section className={styles.admin}>
        <article className={styles.admin_header}>
          <div>
            <h1>Správa uživatelů</h1>
            <p>{users.length} uživatelů</p>
          </div>
        </article>

        {loading ? (
          <p className={styles.state_msg}>Načítání...</p>
        ) : error ? (
          <p className={styles.state_msg_err}>{error}</p>
        ) : users.length === 0 ? (
          <p className={styles.state_msg}>Žádní uživatelé nebyli nalezeni.</p>
        ) : (
          <ul className={styles.user_list}>
            {users.map(u => (
              <li key={u.uuid} className={styles.user_card}>
                <div className={styles.user_card_info}>
                  <div className={styles.user_avatar}>
                    <User size={24} color="white" />
                  </div>
                  <div className={styles.user_details}>
                    <span className={styles.user_name}>{u.username}</span>
                    <span className={`${styles.user_role} ${styles['role_' + u.role.toLowerCase()]}`}>
                      {roleLabel(u.role)}
                    </span>
                  </div>
                </div>
                <div className={styles.user_card_actions}>
                  {u.role !== 'ADMIN' && (
                    <button
                      className={styles.btn_role}
                      onClick={() => handleRoleToggle(u)}
                    >
                      {u.role === 'STUDENT' ? 'Změnit na Lektora' : 'Změnit na Studenta'}
                    </button>
                  )}
                  {u.uuid !== user.uuid && (
                    <button
                      className={styles.btn_delete}
                      onClick={() => handleDelete(u)}
                    >
                      <svg width="1.25rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.25 6H16.5V4.5C16.5 3.90326 16.2629 3.33097 15.841 2.90901C15.419 2.48705 14.8467 2.25 14.25 2.25H9.75C9.15326 2.25 8.58097 2.48705 8.15901 2.90901C7.73705 3.33097 7.5 3.90326 7.5 4.5V6H3.75C3.55109 6 3.36032 6.07902 3.21967 6.21967C3.07902 6.36032 3 6.55109 3 6.75C3 6.94891 3.07902 7.13968 3.21967 7.28033C3.36032 7.42098 3.55109 7.5 3.75 7.5H4.5V19.5C4.5 19.8978 4.65804 20.2794 4.93934 20.5607C5.22064 20.842 5.60218 21 6 21H18C18.3978 21 18.7794 20.842 19.0607 20.5607C19.342 20.2794 19.5 19.8978 19.5 19.5V7.5H20.25C20.4489 7.5 20.6397 7.42098 20.7803 7.28033C20.921 7.13968 21 6.94891 21 6.75C21 6.55109 20.921 6.36032 20.7803 6.21967C20.6397 6.07902 20.4489 6 20.25 6ZM9.75 4.5H14.25V6H9.75V4.5ZM18 19.5H6V7.5H18V19.5ZM10.5 10.5V16.5C10.5 16.6989 10.421 16.8897 10.2803 17.0303C10.1397 17.171 9.94891 17.25 9.75 17.25C9.55109 17.25 9.36032 17.171 9.21967 17.0303C9.07902 16.8897 9 16.6989 9 16.5V10.5C9 10.3011 9.07902 10.1103 9.21967 9.96967C9.36032 9.82902 9.55109 9.75 9.75 9.75C9.94891 9.75 10.1397 9.82902 10.2803 9.96967C10.421 10.1103 10.5 10.3011 10.5 10.5ZM15 10.5V16.5C15 16.6989 14.921 16.8897 14.7803 17.0303C14.6397 17.171 14.4489 17.25 14.25 17.25C14.0511 17.25 13.8603 17.171 13.7197 17.0303C13.579 16.8897 13.5 16.6989 13.5 16.5V10.5C13.5 10.3011 13.579 10.1103 13.7197 9.96967C13.8603 9.82902 14.0511 9.75 14.25 9.75C14.4489 9.75 14.6397 9.82902 14.7803 9.96967C14.921 10.1103 15 10.3011 15 10.5Z" fill="white" />
                      </svg>
                      Smazat
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
