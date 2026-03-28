import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './profile.module.scss';
import Header from '../../shared/layout/header/Header';
import Footer from '../../shared/layout/footer/Footer';
import Input from '../../shared/form/input/Input';
import SubmitButton from '../../shared/button/submit/SubmitButton';
import { updateProfile, getCurrentUser } from '../../services/AuthService';
import { usePageTitle } from '../../hooks/usePageTitle';

const ROLE_LABELS = {
    STUDENT: 'Student',
    LEKTOR: 'Lektor',
    ADMIN: 'Admin',
};

function Profile({ user, setUser }) {
    usePageTitle(`Profil – ${user?.username}`);
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const revealRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add(styles.revealed)),
            { threshold: 0.12 }
        );
        revealRefs.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const r = (delay = 0) => ({
        ref: el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); },
        className: styles.reveal,
        style: { '--delay': `${delay}s` },
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (password && password !== passwordConfirm) {
            setError('Hesla se neshodují');
            return;
        }

        const data = {};
        if (username && username !== user.username) data.username = username;
        if (password) data.password = password;

        if (Object.keys(data).length === 0) {
            setError('Žádné změny k uložení');
            return;
        }

        setLoading(true);
        try {
            await updateProfile(data);
            const updatedUser = await getCurrentUser();
            setUser(updatedUser);
            setPassword('');
            setPasswordConfirm('');
            setSuccess('Profil byl úspěšně upraven');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <Header user={user} setUser={setUser} />

            {/* ── Hero ── */}
            <section className={styles.hero}>
                <div className={styles.hero_content}>
                    <div className={styles.hero_avatar}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div className={styles.hero_meta}>
                        <span className={styles.hero_role}>{ROLE_LABELS[user?.role] ?? user?.role}</span>
                        <h1>{user?.username}</h1>
                    </div>
                </div>
                <div className={styles.hero_ball} />
            </section>

            <hr className={styles.rule} />

            {/* ── Edit section ── */}
            <section className={styles.section}>
                <div {...r(0)}>
                    <span className={styles.label}>Upravit profil</span>
                </div>
                <h2 {...r(0.05)}>Nastavení účtu</h2>

                <div {...r(0.1)} className={`${styles.reveal} ${styles.form_card}`} style={{ '--delay': '0.1s' }} ref={el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.form_fields}>
                            <label>
                                <span>Uživatelské jméno</span>
                                <Input
                                    name="username"
                                    placeholder="Uživatelské jméno"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </label>
                            <label>
                                <span>Nové heslo</span>
                                <Input
                                    name="password"
                                    placeholder="Nové heslo (nepovinné)"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </label>
                            <label>
                                <span>Potvrdit heslo</span>
                                <Input
                                    name="passwordConfirm"
                                    placeholder="Potvrdit nové heslo"
                                    type="password"
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                />
                            </label>
                        </div>
                        <div className={styles.form_footer} style={{ marginTop: '2rem' }}>
                            <SubmitButton text={loading ? 'Ukládání...' : 'Uložit změny'} type="submit" />
                            {error && <p className={styles.err}>{error}</p>}
                            {success && <p className={styles.success}>{success}</p>}
                        </div>
                    </form>
                </div>
            </section>

            <Footer user={user} setUser={setUser} />
        </div>
    );
}

export default Profile;
