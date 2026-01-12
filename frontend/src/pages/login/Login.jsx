import styles from './login.module.scss';
import Input from '../../shared/form/input/Input';
import SubmitButton from '../../shared/button/submit/SubmitButton';

function Login({ setUser }) {
  const userBasic = {
    name: 'Petr', mail: 'petrmachovecjr@gmail.com', img: 'src'
  }

  return (
    <section className={styles.login}>
      <article className={styles.login_img}>
        <img src="/img/w.png" alt="Bile logo Think different academy" />
      </article>
      <article className={styles.login_form}>
        <h1>Přihlásit se</h1>
        <form action="">
          <Input name={'username'} placeholder={'Uživatelské jméno'} />
          <Input name={'password'} placeholder={'Heslo'} type='password' />
          <SubmitButton text={'Pokračovat'} onSubmit={() => setUser(userBasic)} />
        </form>
      </article>
    </section>
  )
}

export default Login
