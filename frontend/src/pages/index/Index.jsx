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
          <p>Nahrávejte materiály, testujte znalosti pomocí kvízů a zůstaňte v kontaktu s členy přes živý feed.
            Vytvořte prostředí, které podporuje spolupráci, zábavu i růst – ať už jde o školní kroužky, zájmové aktivity nebo online vzdělávání.</p>
          <div className={styles.index_text_buttons}>
            <IndexButton text={'Prohlédnout si kurzy'} link={'/courses'} />
            <IndexButton text={'Přihlásit se'} link={'/login'} darker={true} />
          </div>
        </article>
        <div className={styles.index_line}></div>
        <img src="/img/w.png" alt="" />
      </section>
    </div>
  )
}

export default Index
