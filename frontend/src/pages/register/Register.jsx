import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './register.module.scss';
import Input from '../../shared/form/input/Input';
import SubmitButton from '../../shared/button/submit/SubmitButton';
import { register as registerUser, login as loginUser } from '../../services/AuthService';
import { usePageTitle } from '../../hooks/usePageTitle';

function Register({ setUser }) {
    usePageTitle('Registrace');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== passwordConfirm) {
            setError('Hesla se neshodují');
            return;
        }

        setLoading(true);

        try {
            await registerUser(username, password);
            // Auto-login po registraci
            const user = await loginUser(username, password);
            setUser(user);
            navigate('/my-courses');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.register}>
            <Link to="/"><img src="/img/w.png" alt="Bílé logo Think Different Academy" /></Link>
            <article className={styles.register_form}>
                <h1>Registrace</h1>
                <form onSubmit={handleSubmit}>
                    <Input
                        name="username"
                        placeholder="Uživatelské jméno"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                    />
                    <Input
                        name="password"
                        placeholder="Heslo"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                    />
                    <Input
                        name="passwordConfirm"
                        placeholder="Heslo znovu"
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        autoComplete="new-password"
                    />
                    <SubmitButton text={loading ? 'Registrace...' : 'Zaregistrovat se'} type="submit" />
                    {error && <p className={styles.err}>{error}</p>}
                    <p className={styles.link}>
                        Již máte účet? <Link to="/login">Přihlásit se</Link>
                    </p>
                </form>
            </article>

            <div className={styles.register_ball}></div>
            <div className={styles.register_ball_2}></div>
        </section>
    );
}

export default Register;
