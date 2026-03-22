import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './profile.module.scss';
import Header from '../../shared/layout/header/Header';
import Footer from '../../shared/layout/footer/Footer';
import Input from '../../shared/form/input/Input';
import SubmitButton from '../../shared/button/submit/SubmitButton';
import { updateProfile, getCurrentUser } from '../../services/AuthService';
import { User } from 'lucide-react';

function Profile({ user, setUser }) {
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (password && password !== passwordConfirm) {
            setError('Hesla se neshodují');
            return;
        }

        const data = {};
        if (username && username !== user.username) {
            data.username = username;
        }
        if (password) {
            data.password = password;
        }

        if (Object.keys(data).length === 0) {
            setError('Žádné změny k uložení');
            return;
        }

        setLoading(true);

        try {
            await updateProfile(data);
            // Refresh user
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
            <div>
                <Header user={user} setUser={setUser} />
                <section className={styles.profile}>
                    <h1>Můj profil</h1>
                    <article className={styles.profile_card}>
                        <div className={styles.profile_card_avatar}>
                            <div className={styles.img_container} style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <User size={40} color="white" />
                            </div>
                            <div>
                                <h2>{user?.username}</h2>
                                <p>{user?.role === 'STUDENT' ? 'Student' : user?.role === 'LEKTOR' ? 'lecturer' : 'Admin'}</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.profile_card_fields}>
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
                            <SubmitButton text={loading ? 'Ukládání...' : 'Uložit změny'} type="submit" />
                            {error && <p className={styles.err}>{error}</p>}
                            {success && <p className={styles.success}>{success}</p>}
                        </form>
                    </article>
                </section>
            </div>

            <Footer user={user} setUser={setUser} />

            <div className={styles.profile_ball}></div>
        </div>
    );
}

export default Profile;
