import IndexButton from "../../shared/button/index/IndexButton";
import Header from "../../shared/layout/header/Header"
import styles from './index.module.scss';

function Index() {
  return (
    <div>
      <Header transparent={true} />
      <section className={styles.index}>
        <article className={styles.index_text}>
          <h1>Naučte se cokoliv</h1>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <div className={styles.index_text_buttons}>
            <IndexButton text={'Prohlédnout si kurzy'} link={'/courses'} />
            <IndexButton text={'Button 2'} link={'/courses'} darker={true}/>
          </div>
        </article>
        <div className={styles.index_line}></div>
        <img src="/img/w.png" alt="" />
      </section>
    </div>
  )
}

export default Index
