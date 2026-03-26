import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './login.module.scss';
import Input from '../../shared/form/input/Input';
import SubmitButton from '../../shared/button/submit/SubmitButton';
import { login as loginUser } from '../../services/AuthService';
import { usePageTitle } from '../../hooks/usePageTitle';

function Login({ setUser }) {
  usePageTitle('Přihlášení');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const card = document.querySelector(`.${styles.card}`);
    if (!card) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          card.classList.add(styles.revealed);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await loginUser(username, password);
      setUser(user);
      if (user.role === 'STUDENT') {
        navigate('/my-courses');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.login}>

      <div className={styles.card}>
        <Link to="/" className={styles.logo_link}>
          <img src="/img/logo_erb_white.svg" alt="Think different Academy" />
        </Link>

        <div className={styles.heading}>
          <span className={styles.eyebrow}>Přihlášení</span>
          <h1>Vítejte zpět</h1>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
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
            autoComplete="current-password"
          />
          <SubmitButton text={loading ? 'Probíhá přihlášení...' : 'Pokračovat'} type="submit" />
          {error && <p className={styles.err}>{error}</p>}
          <p className={styles.link}>
            Nemáte účet? <Link to="/register">Zaregistrujte se</Link>
          </p>
        </form>
      </div>

      <div className={styles.login_ball} />
      <div className={styles.login_ball_2} />
    </section>
  );
}

export default Login;
