import { useState } from 'react';
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
      <Link to="/"><img src="/img/w.png" alt="Bílé logo Think Different Academy" /></Link>
      <article className={styles.login_form}>
        <h1>Přihlásit se</h1>
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
            autoComplete="current-password"
          />
          <SubmitButton text={loading ? 'Probíhá přihlášení...' : 'Pokračovat'} type="submit" />
          {error && <p className={styles.err}>{error}</p>}
          <p className={styles.link}>
            Nemáte účet? <Link to="/register">Zaregistrujte se</Link>
          </p>
        </form>
      </article>

      <div className={styles.login_ball}></div>
      <div className={styles.login_ball_2}></div>
    </section>
  );
}

export default Login;