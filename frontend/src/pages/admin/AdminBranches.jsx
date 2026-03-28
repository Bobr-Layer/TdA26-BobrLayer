import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidenav from '../../shared/layout/sidenav/Sidenav';
import Header from '../../shared/layout/header/Header';
import styles from './adminbranches.module.scss';
import dashStyles from '../dashboard/dashboard.module.scss';
import searchStyles from '../../shared/form/search-input/search-input.module.scss';
import { getBranches, createBranch } from '../../services/BranchService';
import { usePageTitle } from '../../hooks/usePageTitle';
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
      <section className={dashStyles.dashboard}>
        <article className={dashStyles.dashboard_header}>
          <div className={dashStyles.dashboard_header_text}>
            <h1>Pobočky</h1>
            <p>{filtered.length} / {branches.length} poboček</p>
          </div>
          {isSuperAdmin && (
            <div className={dashStyles.dashboard_header_actions}>
              <DashboardButton
                text={showCreate ? 'Zrušit' : 'Nová pobočka'}
                onClick={() => setShowCreate(v => !v)}
                icon={!showCreate && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>}
              />
            </div>
          )}
        </article>

        {isSuperAdmin && showCreate && (
          <article className={styles.create_section}>
            <h2 className={styles.section_title}>Nová pobočka</h2>
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

        <div className={`${searchStyles.search_input} ${search ? searchStyles.active : ''}`}>
          <input
            type="text"
            placeholder="Hledat podle názvu nebo města..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button>
            <svg width="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.9422 17.0578L14.0305 13.1469C15.1643 11.7857 15.7297 10.0398 15.609 8.27244C15.4883 6.50506 14.6909 4.85223 13.3827 3.65779C12.0744 2.46334 10.356 1.81926 8.58498 1.85951C6.81394 1.89976 5.12659 2.62125 3.87395 3.87389C2.62131 5.12653 1.89982 6.81388 1.85957 8.58492C1.81932 10.356 2.46341 12.0744 3.65785 13.3826C4.85229 14.6909 6.50512 15.4883 8.27251 15.6089C10.0399 15.7296 11.7858 15.1642 13.1469 14.0305L17.0579 17.9422C17.1159 18.0003 17.1849 18.0463 17.2607 18.0777C17.3366 18.1092 17.4179 18.1253 17.5001 18.1253C17.5822 18.1253 17.6635 18.1092 17.7394 18.0777C17.8152 18.0463 17.8842 18.0003 17.9422 17.9422C18.0003 17.8841 18.0464 17.8152 18.0778 17.7393C18.1092 17.6634 18.1254 17.5821 18.1254 17.5C18.1254 17.4179 18.1092 17.3366 18.0778 17.2607C18.0464 17.1848 18.0003 17.1159 17.9422 17.0578ZM3.12506 8.75C3.12506 7.63748 3.45496 6.54994 4.07304 5.62491C4.69112 4.69989 5.56963 3.97892 6.59746 3.55317C7.6253 3.12743 8.7563 3.01604 9.84744 3.23308C10.9386 3.45012 11.9409 3.98585 12.7275 4.77252C13.5142 5.55919 14.0499 6.56147 14.267 7.65261C14.484 8.74376 14.3726 9.87476 13.9469 10.9026C13.5211 11.9304 12.8002 12.8089 11.8751 13.427C10.9501 14.0451 9.86258 14.375 8.75006 14.375C7.25872 14.3733 5.82894 13.7802 4.77441 12.7256C3.71987 11.6711 3.12671 10.2413 3.12506 8.75Z" fill="rgba(255, 255, 255, 1)" /></svg>
          </button>
        </div>

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
