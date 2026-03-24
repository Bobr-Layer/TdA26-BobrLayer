import IndexButton from "../../shared/button/index/IndexButton";
import Header from "../../shared/layout/header/Header"
import styles from './index.module.scss';
import CourseList from '../../shared/courses/course-list/CourseList'
import { useState, useEffect, useRef } from "react";
import { getCourses } from "../../services/CourseService";
import Footer from "../../shared/layout/footer/Footer";
import { usePageTitle } from "../../hooks/usePageTitle";

function Index({user, setUser}) {
  usePageTitle('Domů');
  const [courses, setCourses] = useState([]);
  const aboutRef = useRef(null);
  const [hideScrollBtn, setHideScrollBtn] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadCourses();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setHideScrollBtn(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <Header user={user} setUser={setUser}/>
      <section className={styles.index}>
        <article className={styles.index_text}>
          <div>
            <h1>Naučte se cokoliv</h1>
            <p>Vzdělávání, které se přizpůsobí vám. Objevte kurzy navržené tak, abyste skutečně pochopili problematiku – od základů až po pokročilé koncepty. Učte se svým tempem, s přehledem a s podporou, kterou potřebujete.</p>
          </div>
          <IndexButton text={'Prohlédnout si kurzy'} link={'/courses'} />
        </article>
        <div className={styles.index_image_wrapper}>
          <img src="/img/w.png" alt="" />
        </div>

        <button
          className={`${styles.index_scroll} ${hideScrollBtn ? styles.hidden : ""
            }`}
          onClick={() => {
            aboutRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}
        >
          <svg width="3rem" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40.0612 19.0612L25.0612 34.0612C24.9219 34.2007 24.7565 34.3113 24.5744 34.3868C24.3923 34.4623 24.1971 34.5012 24 34.5012C23.8029 34.5012 23.6077 34.4623 23.4256 34.3868C23.2435 34.3113 23.078 34.2007 22.9387 34.0612L7.93873 19.0612C7.65727 18.7798 7.49915 18.398 7.49915 18C7.49915 17.6019 7.65727 17.2202 7.93873 16.9387C8.22019 16.6573 8.60193 16.4991 8.99998 16.4991C9.39803 16.4991 9.77977 16.6573 10.0612 16.9387L24 30.8794L37.9387 16.9387C38.0781 16.7994 38.2435 16.6888 38.4256 16.6134C38.6077 16.538 38.8029 16.4991 39 16.4991C39.1971 16.4991 39.3922 16.538 39.5743 16.6134C39.7564 16.6888 39.9219 16.7994 40.0612 16.9387C40.2006 17.0781 40.3111 17.2435 40.3866 17.4256C40.462 17.6077 40.5008 17.8029 40.5008 18C40.5008 18.1971 40.462 18.3922 40.3866 18.5743C40.3111 18.7564 40.2006 18.9219 40.0612 19.0612Z" fill="white" />
          </svg>
        </button>
      </section>
      <section className={styles.about} ref={aboutRef}>
        <p className={styles.about_main_text}>
          Chceme lidem přinést efektivní vzdělávání.<br />
          <span>Intuitivně, jednoduše a hlavě zdarma.</span>
        </p>
        <article>
          <h2>Naše tři pilíře</h2>
          <div className={styles.about_list}>
            <div>
              <img src="/img/pilir1.png" alt="Intuitivnost" />
              <h3>Intuitivnost</h3>
              <p>Žádné zbytečné komplikace. Kurzy jsou strukturované tak, aby vás provedly od základů po pokročilé témata.</p>
            </div>
            <div>
              <img src="/img/pilir2.png" alt="Hravost" />
              <h3>Hravost</h3>
              <p>Kromě dostupných materiálů, naleznete v každém kurzu několik kvízů. Ověříte si tak znalosti a zjistíte, kde máte mezery.</p>
            </div>
            <div>
              <img src="/img/pilir3.png" alt="Deep-think" />
              <h3>Deep-think</h3>
              <p>Učíme tak, abyste problematice skutečně porozuměli a dokázali znalosti aplikovat v praxi.</p>
            </div>
          </div>

          <div className={styles.about_ball_1}></div>
          <div className={styles.about_ball_2}></div>
        </article>
      </section>
      <section className={styles.courses}>
        <h2>Neváhejte a vyzkoušejte si nějaký kurz!</h2>
        <CourseList courses={courses.slice(0, 2)} />
      </section>
      <Footer user={user} setUser={setUser}/>

      <div className={styles.index_ball}></div>
    </div>
  )
}

export default Index
