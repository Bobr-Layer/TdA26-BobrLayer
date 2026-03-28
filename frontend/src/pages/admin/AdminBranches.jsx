import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidenav from '../../shared/layout/sidenav/Sidenav';
import Header from '../../shared/layout/header/Header';
import styles from './adminbranches.module.scss';
import { getBranches, createBranch } from '../../services/BranchService';
import { usePageTitle } from '../../hooks/usePageTitle';
import NewButton from '../../shared/button/new/NewButton';
import DashboardButton from '../../shared/button/dashboard/DashboardButton';

const STATUS_LABEL = {
  ACTIVE: 'Aktivní',
  ONBOARDING: 'Onboarding',
  WAITING: 'Čekající',
};

const TYPE_LABEL = {
  HQ: 'HQ',
  BRANCH: 'Pobočka',
};

const REGION_LABEL = {
  WESTERN_EUROPE: 'Záp. Evropa',
  CENTRAL_EUROPE: 'Stř. Evropa',
  EASTERN_EUROPE: 'Vých. Evropa',
  NORTHERN_EUROPE: 'Sev. Evropa',
  SOUTHERN_EUROPE: 'Již. Evropa',
  SOUTHEASTERN_EUROPE: 'JV Evropa',
};

const EMPTY_BRANCH = {
  name: '', country: '', city: '', address: '', postalCode: '',
  region: 'CENTRAL_EUROPE', type: 'BRANCH', status: 'ACTIVE',
};

function AdminBranches({ user, setUser }) {
  usePageTitle('Pobočky');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newBranch, setNewBranch] = useState(EMPTY_BRANCH);
  const [creating, setCreating] = useState(false);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    getBranches()
      .then(setBranches)
      .catch(() => setError('Nepodařilo se načíst pobočky'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!newBranch.name || !newBranch.country || !newBranch.city || !newBranch.address || !newBranch.postalCode) {
      alert('Vyplňte všechna povinná pole');
      return;
    }
    setCreating(true);
    try {
      const created = await createBranch(newBranch);
      setBranches(prev => [created, ...prev]);
      setShowCreate(false);
      setNewBranch(EMPTY_BRANCH);
    } catch {
      alert('Nepodařilo se vytvořit pobočku');
    } finally {
      setCreating(false);
    }
  }

  const filtered = branches.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Header user={user} setUser={setUser} onlyMobile={true} />
      <Sidenav user={user} setUser={setUser} current={'branches'} />
      <section className={styles.admin}>
        <article className={styles.admin_header}>
          <div>
            <h1>Pobočky</h1>
            <p>{filtered.length} / {branches.length} poboček</p>
          </div>
          {isSuperAdmin && (
            <NewButton onClick={() => setShowCreate(v => !v)} />
          )}
        </article>

        {isSuperAdmin && showCreate && (
          <article className={styles.create_section}>
            <h2>Nová pobočka</h2>
            <div className={styles.form_grid}>
              <label className={styles.field}>
                <span>Název *</span>
                <input value={newBranch.name} onChange={e => setNewBranch(f => ({ ...f, name: e.target.value }))} placeholder="Např. Praha HQ" />
              </label>
              <label className={styles.field}>
                <span>Stát *</span>
                <input value={newBranch.country} onChange={e => setNewBranch(f => ({ ...f, country: e.target.value }))} placeholder="Česká republika" />
              </label>
              <label className={styles.field}>
                <span>Město *</span>
                <input value={newBranch.city} onChange={e => setNewBranch(f => ({ ...f, city: e.target.value }))} placeholder="Praha" />
              </label>
              <label className={styles.field}>
                <span>Adresa *</span>
                <input value={newBranch.address} onChange={e => setNewBranch(f => ({ ...f, address: e.target.value }))} placeholder="Václavské náměstí 1" />
              </label>
              <label className={styles.field}>
                <span>PSČ *</span>
                <input value={newBranch.postalCode} onChange={e => setNewBranch(f => ({ ...f, postalCode: e.target.value }))} placeholder="110 00" />
              </label>
              <label className={styles.field}>
                <span>Region</span>
                <select value={newBranch.region} onChange={e => setNewBranch(f => ({ ...f, region: e.target.value }))}>
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
                <select value={newBranch.type} onChange={e => setNewBranch(f => ({ ...f, type: e.target.value }))}>
                  <option value="BRANCH">Pobočka</option>
                  <option value="HQ">HQ</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Stav</span>
                <select value={newBranch.status} onChange={e => setNewBranch(f => ({ ...f, status: e.target.value }))}>
                  <option value="ACTIVE">Aktivní</option>
                  <option value="ONBOARDING">Onboarding</option>
                  <option value="WAITING">Čekající</option>
                </select>
              </label>
            </div>
            <div className={styles.form_actions}>
              <DashboardButton text={creating ? 'Ukládání...' : 'Vytvořit pobočku'} onClick={handleCreate} />
              <button className={styles.btn_ghost} onClick={() => { setShowCreate(false); setNewBranch(EMPTY_BRANCH); }} disabled={creating}>
                Zrušit
              </button>
            </div>
          </article>
        )}

        <input
          className={styles.filter_input}
          type="text"
          placeholder="Hledat podle názvu nebo města..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {loading ? (
          <p className={styles.state_msg}>Načítání...</p>
        ) : error ? (
          <p className={styles.state_msg_err}>{error}</p>
        ) : filtered.length === 0 ? (
          <p className={styles.state_msg}>Žádné pobočky nenalezeny.</p>
        ) : (
          <ul className={styles.branch_list}>
            {filtered.map(b => (
              <li key={b.uuid}>
              <Link to={`/dashboard/branches/${b.uuid}`} className={styles.branch_card}>
                <div className={styles.branch_card_top}>
                  <div className={styles.branch_badges}>
                    <span className={`${styles.badge} ${b.type === 'HQ' ? styles.badge_hq : styles.badge_branch}`}>
                      {TYPE_LABEL[b.type] ?? b.type}
                    </span>
                    <span className={`${styles.badge} ${styles['badge_status_' + b.status?.toLowerCase()]}`}>
                      {STATUS_LABEL[b.status] ?? b.status}
                    </span>
                  </div>
                  <h2 className={styles.branch_name}>{b.name}</h2>
                  <p className={styles.branch_location}>
                    {b.city}, {b.country}
                    {b.region && <span className={styles.branch_region}> · {REGION_LABEL[b.region] ?? b.region}</span>}
                  </p>
                  <p className={styles.branch_address}>{b.address}, {b.postalCode}</p>
                </div>
                <div className={styles.branch_card_footer}>
                  <span className={styles.stat}>
                    <svg width="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                    </svg>
                    {b.lectorsCount} {b.lectorsCount === 1 ? 'lektor' : b.lectorsCount < 5 ? 'lektoři' : 'lektorů'}
                  </span>
                  <span className={styles.stat}>
                    <svg width="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/>
                    </svg>
                    {b.managersCount} {b.managersCount === 1 ? 'správce' : b.managersCount < 5 ? 'správci' : 'správců'}
                  </span>
                </div>
              </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default AdminBranches;
