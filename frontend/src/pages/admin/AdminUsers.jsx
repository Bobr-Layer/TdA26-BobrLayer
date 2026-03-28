import { useState, useEffect } from 'react';
import Sidenav from '../../shared/layout/sidenav/Sidenav';
import Header from '../../shared/layout/header/Header';
import dashStyles from '../dashboard/dashboard.module.scss';
import styles from './adminusers.module.scss';
import selectStyles from '../../shared/form/course-select/course-select.module.scss';
import { getUsers, updateUserRole, deleteUser } from '../../services/UserService';
import { usePageTitle } from '../../hooks/usePageTitle';
import DashboardButton from '../../shared/button/dashboard/DashboardButton';
import searchStyles from '../../shared/form/search-input/search-input.module.scss';

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

        <div className={dashStyles.dashboard_filter}>
          <div className={`${searchStyles.search_input} ${searchName ? searchStyles.active : ''}`}>
            <input
              type="text"
              placeholder="Hledat podle jména..."
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
            />
            <button>
              <svg width="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.9422 17.0578L14.0305 13.1469C15.1643 11.7857 15.7297 10.0398 15.609 8.27244C15.4883 6.50506 14.6909 4.85223 13.3827 3.65779C12.0744 2.46334 10.356 1.81926 8.58498 1.85951C6.81394 1.89976 5.12659 2.62125 3.87395 3.87389C2.62131 5.12653 1.89982 6.81388 1.85957 8.58492C1.81932 10.356 2.46341 12.0744 3.65785 13.3826C4.85229 14.6909 6.50512 15.4883 8.27251 15.6089C10.0399 15.7296 11.7858 15.1642 13.1469 14.0305L17.0579 17.9422C17.1159 18.0003 17.1849 18.0463 17.2607 18.0777C17.3366 18.1092 17.4179 18.1253 17.5001 18.1253C17.5822 18.1253 17.6635 18.1092 17.7394 18.0777C17.8152 18.0463 17.8842 18.0003 17.9422 17.9422C18.0003 17.8841 18.0464 17.8152 18.0778 17.7393C18.1092 17.6634 18.1254 17.5821 18.1254 17.5C18.1254 17.4179 18.1092 17.3366 18.0778 17.2607C18.0464 17.1848 18.0003 17.1159 17.9422 17.0578ZM3.12506 8.75C3.12506 7.63748 3.45496 6.54994 4.07304 5.62491C4.69112 4.69989 5.56963 3.97892 6.59746 3.55317C7.6253 3.12743 8.7563 3.01604 9.84744 3.23308C10.9386 3.45012 11.9409 3.98585 12.7275 4.77252C13.5142 5.55919 14.0499 6.56147 14.267 7.65261C14.484 8.74376 14.3726 9.87476 13.9469 10.9026C13.5211 11.9304 12.8002 12.8089 11.8751 13.427C10.9501 14.0451 9.86258 14.375 8.75006 14.375C7.25872 14.3733 5.82894 13.7802 4.77441 12.7256C3.71987 11.6711 3.12671 10.2413 3.12506 8.75Z" fill="rgba(255, 255, 255, 1)" /></svg>
            </button>
          </div>
          <div className={`${selectStyles.wrapper} ${filterRole !== 'ALL' ? selectStyles.active : ''}`}>
            <select
              className={selectStyles.course_select}
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
            >
              <option value="ALL">Filtrovat podle role</option>
              <option value="STUDENT">Student</option>
              <option value="LEKTOR">Lektor</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <svg width="1.25rem" viewBox="0 0 20 20" fill="none"><path d="M16.6923 7.94217L10.4423 14.1922C10.3842 14.2503 10.3153 14.2964 10.2394 14.3278C10.1636 14.3593 10.0822 14.3755 10.0001 14.3755C9.91797 14.3755 9.83664 14.3593 9.76077 14.3278C9.68489 14.2964 9.61596 14.2503 9.55792 14.1922L3.30792 7.94217C3.19064 7.82489 3.12476 7.66583 3.12476 7.49998C3.12476 7.33413 3.19064 7.17507 3.30792 7.05779C3.42519 6.94052 3.58425 6.87463 3.7501 6.87463C3.91596 6.87463 4.07502 6.94052 4.19229 7.05779L10.0001 12.8664L15.8079 7.05779C15.866 6.99972 15.9349 6.95366 16.0108 6.92224C16.0867 6.89081 16.168 6.87463 16.2501 6.87463C16.3322 6.87463 16.4135 6.89081 16.4894 6.92224C16.5653 6.95366 16.6342 6.99972 16.6923 7.05779C16.7504 7.11586 16.7964 7.1848 16.8278 7.26067C16.8593 7.33654 16.8755 7.41786 16.8755 7.49998C16.8755 7.5821 16.8593 7.66342 16.8278 7.73929C16.7964 7.81516 16.7504 7.8841 16.6923 7.94217Z" fill="white" /></svg>
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
