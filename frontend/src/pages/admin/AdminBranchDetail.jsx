import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidenav from '../../shared/layout/sidenav/Sidenav';
import Header from '../../shared/layout/header/Header';
import styles from './adminbranchdetail.module.scss';
import { getBranch, updateBranch, getBranchUsers, createBranchUser } from '../../services/BranchService';
import { updateUserRole, deleteUser } from '../../services/UserService';
import { usePageTitle } from '../../hooks/usePageTitle';
import { User } from 'lucide-react';
import DashboardButton from '../../shared/button/dashboard/DashboardButton';
import NewButton from '../../shared/button/new/NewButton';
import BackToButton from '../../shared/button/back-to/BackToButton';

const STATUS_LABEL = { ACTIVE: 'Aktivní', ONBOARDING: 'Onboarding', WAITING: 'Čekající' };
const TYPE_LABEL = { HQ: 'HQ', BRANCH: 'Pobočka' };

const roleLabel = (role) => {
  if (role === 'STUDENT') return 'Student';
  if (role === 'LEKTOR') return 'Lektor';
  if (role === 'ADMIN') return 'Admin';
  if (role === 'SUPER_ADMIN') return 'Super Admin';
  return role;
};

function AdminBranchDetail({ user, setUser }) {
  const { uuid } = useParams();
  usePageTitle('Detail pobočky');

  const [branch, setBranch] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'LEKTOR' });
  const [creating, setCreating] = useState(false);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    Promise.all([getBranch(uuid), getBranchUsers(uuid)])
      .then(([b, u]) => {
        setBranch(b);
        setForm({ name: b.name, country: b.country, city: b.city, address: b.address, postalCode: b.postalCode, region: b.region, type: b.type, status: b.status });
        setUsers(u);
      })
      .catch(() => setError('Nepodařilo se načíst pobočku'))
      .finally(() => setLoading(false));
  }, [uuid]);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateBranch(uuid, form);
      setBranch(updated);
      setEditing(false);
    } catch {
      alert('Nepodařilo se uložit změny');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setForm({ name: branch.name, country: branch.country, city: branch.city, address: branch.address, postalCode: branch.postalCode, region: branch.region, type: branch.type, status: branch.status });
    setEditing(false);
  }

  async function handleRoleChange(targetUser, newRole) {
    try {
      const updated = await updateUserRole(targetUser.uuid, newRole);
      setUsers(prev => prev.map(u => u.uuid === targetUser.uuid ? updated : u));
    } catch {
      alert('Nepodařilo se změnit roli');
    }
  }

  async function handleDelete(targetUser) {
    if (!window.confirm(`Opravdu chcete smazat uživatele "${targetUser.username}"?`)) return;
    try {
      await deleteUser(targetUser.uuid);
      setUsers(prev => prev.filter(u => u.uuid !== targetUser.uuid));
    } catch {
      alert('Nepodařilo se smazat uživatele');
    }
  }

  async function handleCreateUser() {
    if (!newUser.username || !newUser.password) { alert('Vyplňte uživatelské jméno a heslo'); return; }
    setCreating(true);
    try {
      const created = await createBranchUser(uuid, newUser);
      setUsers(prev => [...prev, created]);
      setShowCreateUser(false);
      setNewUser({ username: '', password: '', role: 'LEKTOR' });
    } catch {
      alert('Nepodařilo se vytvořit uživatele');
    } finally {
      setCreating(false);
    }
  }

  if (loading) return (
    <div>
      <Header user={user} setUser={setUser} onlyMobile={true} />
      <Sidenav user={user} setUser={setUser} current={'branches'} />
      <section className={styles.admin}><p className={styles.state_msg}>Načítání...</p></section>
    </div>
  );

  if (error || !branch) return (
    <div>
      <Header user={user} setUser={setUser} onlyMobile={true} />
      <Sidenav user={user} setUser={setUser} current={'branches'} />
      <section className={styles.admin}><p className={styles.state_msg_err}>{error || 'Pobočka nenalezena'}</p></section>
    </div>
  );

  return (
    <div>
      <Header user={user} setUser={setUser} onlyMobile={true} />
      <Sidenav user={user} setUser={setUser} current={'branches'} />
      <section className={styles.admin}>

        {/* Back + Header */}
        <article className={styles.admin_header}>
          <div className={styles.header_left}>
            <BackToButton text="← Pobočky" link="/dashboard/branches" />
            <div className={styles.title_row}>
              <div className={styles.badges}>
                <span className={`${styles.badge} ${branch.type === 'HQ' ? styles.badge_hq : styles.badge_branch}`}>
                  {TYPE_LABEL[branch.type] ?? branch.type}
                </span>
                <span className={`${styles.badge} ${styles['badge_status_' + branch.status?.toLowerCase()]}`}>
                  {STATUS_LABEL[branch.status] ?? branch.status}
                </span>
              </div>
              <h1>{branch.name}</h1>
              <p className={styles.location}>{branch.city}, {branch.country}</p>
            </div>
          </div>
          {!editing && (
            <DashboardButton text="Upravit pobočku" onClick={() => setEditing(true)} />
          )}
        </article>

        {/* Edit form */}
        {editing && (
          <article className={styles.edit_section}>
            <h2>Upravit informace o pobočce</h2>
            <div className={styles.form_grid}>
              <label className={styles.field}>
                <span>Název</span>
                <input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </label>
              <label className={styles.field}>
                <span>Stát</span>
                <input value={form.country || ''} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
              </label>
              <label className={styles.field}>
                <span>Město</span>
                <input value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              </label>
              <label className={styles.field}>
                <span>Adresa</span>
                <input value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </label>
              <label className={styles.field}>
                <span>PSČ</span>
                <input value={form.postalCode || ''} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} />
              </label>
              <label className={styles.field}>
                <span>Region</span>
                <select value={form.region || ''} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}>
                  <option value="WESTERN_EUROPE">Záp. Evropa</option>
                  <option value="CENTRAL_EUROPE">Stř. Evropa</option>
                  <option value="EASTERN_EUROPE">Vých. Evropa</option>
                  <option value="NORTHERN_EUROPE">Sev. Evropa</option>
                  <option value="SOUTHERN_EUROPE">Již. Evropa</option>
                  <option value="SOUTHEASTERN_EUROPE">JV Evropa</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Typ</span>
                <select value={form.type || ''} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="BRANCH">Pobočka</option>
                  <option value="HQ">HQ</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Stav</span>
                <select value={form.status || ''} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="ACTIVE">Aktivní</option>
                  <option value="ONBOARDING">Onboarding</option>
                  <option value="WAITING">Čekající</option>
                </select>
              </label>
            </div>
            <div className={styles.form_actions}>
              <DashboardButton text={saving ? 'Ukládání...' : 'Uložit změny'} onClick={handleSave} />
              <button className={styles.btn_ghost} onClick={handleCancelEdit} disabled={saving}>Zrušit</button>
            </div>
          </article>
        )}

        {/* Users section */}
        <article className={styles.users_section}>
          <div className={styles.users_header}>
            <div className={styles.users_title}>
              <h2>Uživatelé pobočky</h2>
              <span className={styles.users_count}>{users.length}</span>
            </div>
            <NewButton onClick={() => setShowCreateUser(v => !v)} />
          </div>

          {/* Create user form */}
          {showCreateUser && (
            <div className={styles.create_user_section}>
              <h3>Nový uživatel</h3>
              <div className={styles.form_row}>
                <label className={styles.field}>
                  <span>Uživatelské jméno *</span>
                  <input value={newUser.username} onChange={e => setNewUser(u => ({ ...u, username: e.target.value }))} placeholder="jmeno.prijmeni" />
                </label>
                <label className={styles.field}>
                  <span>Heslo *</span>
                  <input type="password" value={newUser.password} onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))} placeholder="Minimálně 6 znaků" />
                </label>
                <label className={styles.field}>
                  <span>Role</span>
                  <select value={newUser.role} onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}>
                    <option value="LEKTOR">Lektor</option>
                    {isSuperAdmin && <option value="ADMIN">Admin</option>}
                  </select>
                </label>
              </div>
              <div className={styles.form_actions}>
                <DashboardButton text={creating ? 'Vytváření...' : 'Vytvořit uživatele'} onClick={handleCreateUser} />
                <button className={styles.btn_ghost} onClick={() => { setShowCreateUser(false); setNewUser({ username: '', password: '', role: 'LEKTOR' }); }} disabled={creating}>Zrušit</button>
              </div>
            </div>
          )}

          {users.length === 0 ? (
            <p className={styles.state_msg}>Žádní uživatelé nenalezeni.</p>
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
                    {u.uuid !== user.uuid && isSuperAdmin && u.role !== 'ADMIN' && u.role !== 'SUPER_ADMIN' && (
                      <DashboardButton text="Nastavit Admina" onClick={() => handleRoleChange(u, 'ADMIN')} />
                    )}
                    {u.uuid !== user.uuid && u.role !== 'LEKTOR' && u.role !== 'SUPER_ADMIN' && (
                      <DashboardButton text="Nastavit Lektora" onClick={() => handleRoleChange(u, 'LEKTOR')} />
                    )}
                    {u.uuid !== user.uuid && (u.role === 'LEKTOR' || isSuperAdmin) && (
                      <button className={styles.btn_delete} onClick={() => handleDelete(u)}>
                        <svg width="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.25 6H16.5V4.5C16.5 3.90326 16.2629 3.33097 15.841 2.90901C15.419 2.48705 14.8467 2.25 14.25 2.25H9.75C9.15326 2.25 8.58097 2.48705 8.15901 2.90901C7.73705 3.33097 7.5 3.90326 7.5 4.5V6H3.75C3.55109 6 3.36032 6.07902 3.21967 6.21967C3.07902 6.36032 3 6.55109 3 6.75C3 6.94891 3.07902 7.13968 3.21967 7.28033C3.36032 7.42098 3.55109 7.5 3.75 7.5H4.5V19.5C4.5 19.8978 4.65804 20.2794 4.93934 20.5607C5.22064 20.842 5.60218 21 6 21H18C18.3978 21 18.7794 20.842 19.0607 20.5607C19.342 20.2794 19.5 19.8978 19.5 19.5V7.5H20.25C20.4489 7.5 20.6397 7.42098 20.7803 7.28033C20.921 7.13968 21 6.94891 21 6.75C21 6.55109 20.921 6.36032 20.7803 6.21967C20.6397 6.07902 20.4489 6 20.25 6ZM9.75 4.5H14.25V6H9.75V4.5ZM18 19.5H6V7.5H18V19.5Z" fill="currentColor"/>
                        </svg>
                        Smazat
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

      </section>
    </div>
  );
}

export default AdminBranchDetail;
