import IndexButton from "../../shared/button/index/IndexButton";
import Header from "../../shared/layout/header/Header"
import styles from './index.module.scss';
import CourseList from '../../shared/courses/course-list/CourseList'
import { useState, useEffect, useRef } from "react";
import { getCourses } from "../../services/CourseService";
import Footer from "../../shared/layout/footer/Footer";
import { usePageTitle } from "../../hooks/usePageTitle";
import SectionHeading from "../../shared/ui/section-heading/SectionHeading";

const PILLARS = [
  {
    num: '01',
    icon: '/img/pilir1.png',
    title: 'Intuitivnost',
    text: 'Žádné zbytečné komplikace. Kurzy jsou strukturované tak, aby vás provedly od základů po pokročilá témata.',
  },
  {
    num: '02',
    icon: '/img/pilir2.png',
    title: 'Hravost',
    text: 'Kromě dostupných materiálů naleznete v každém kurzu několik kvízů. Ověříte si znalosti a zjistíte, kde máte mezery.',
  },
  {
    num: '03',
    icon: '/img/pilir3.png',
    title: 'Deep-think',
    text: 'Učíme tak, abyste problematice skutečně porozuměli a dokázali znalosti aplikovat v praxi.',
  },
];

function Index({ user, setUser }) {
  usePageTitle('Domů');
  const [courses, setCourses] = useState([]);
  const pillarsRef = useRef(null);
  const [hideScrollBtn, setHideScrollBtn] = useState(false);

  useEffect(() => {
    getCourses().then(setCourses).catch(console.error);
  }, []);

  useEffect(() => {
    const onScroll = () => setHideScrollBtn(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(`.${styles.reveal}`);
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add(styles.revealed);
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.1 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.wrapper}>
      <Header user={user} setUser={setUser} />

      {/* ── HERO ──────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.hero_main}>
          <div className={styles.hero_label}>
            <span>VZDĚLÁVACÍ PLATFORMA</span>
            <span className={styles.sep}>—</span>
            <span>TDA 2026</span>
          </div>
          <h1 className={styles.hero_h1}>
            <span>Naučte se</span>
            <span className={styles.hero_accent}>cokoliv.</span>
          </h1>
          <div className={styles.hero_foot}>
            <p>Vzdělávání, které se přizpůsobí vám. Kurzy navržené tak, abyste skutečně pochopili problematiku — od základů po pokročilé koncepty.</p>
            <IndexButton text="Prohlédnout kurzy" link="/courses" />
          </div>
        </div>

        <div className={styles.hero_aside}>
          <div className={styles.hero_aside_line} />
          <div className={styles.hero_stats}>
            {[
              { val: '∞', label: 'možností' },
              { val: '2026', label: 'rok vzniku' },
              { val: '3', label: 'pilíře' },
            ].map(s => (
              <div key={s.label} className={styles.hero_stat}>
                <span>{s.val}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          className={`${styles.scroll_btn} ${hideScrollBtn ? styles.hidden : ''}`}
          onClick={() => pillarsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          aria-label="Scrollovat dolů"
        >
          <svg width="3rem" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40.0612 19.0612L25.0612 34.0612C24.9219 34.2007 24.7565 34.3113 24.5744 34.3868C24.3923 34.4623 24.1971 34.5012 24 34.5012C23.8029 34.5012 23.6077 34.4623 23.4256 34.3868C23.2435 34.3113 23.078 34.2007 22.9387 34.0612L7.93873 19.0612C7.65727 18.7798 7.49915 18.398 7.49915 18C7.49915 17.6019 7.65727 17.2202 7.93873 16.9387C8.22019 16.6573 8.60193 16.4991 8.99998 16.4991C9.39803 16.4991 9.77977 16.6573 10.0612 16.9387L24 30.8794L37.9387 16.9387C38.0781 16.7994 38.2435 16.6888 38.4256 16.6134C38.6077 16.538 38.8029 16.4991 39 16.4991C39.1971 16.4991 39.3922 16.538 39.5743 16.6134C39.7564 16.6888 39.9219 16.7994 40.0612 16.9387C40.2006 17.0781 40.3111 17.2435 40.3866 17.4256C40.462 17.6077 40.5008 17.8029 40.5008 18C40.5008 18.1971 40.462 18.3922 40.3866 18.5743C40.3111 18.7564 40.2006 18.9219 40.0612 19.0612Z" fill="white" />
          </svg>
        </button>

        <div className={styles.hero_ball} />
      </section>

      {/* ── STATEMENT ─────────────────────────────────── */}
      <section className={styles.statement}>
        <div className={`${styles.statement_inner} ${styles.reveal}`}>
          <div className={styles.rule} />
          <p>
            Chceme lidem přinést efektivní vzdělávání.{' '}
            <span>Intuitivně, jednoduše a hlavně zdarma.</span>
          </p>
          <div className={styles.rule} />
        </div>
      </section>

      {/* ── PILLARS ───────────────────────────────────── */}
      <section className={styles.pillars} ref={pillarsRef}>
        <div className={`${styles.pillars_header} ${styles.reveal}`}>
          <SectionHeading label="NAŠE PILÍŘE" heading="Co děláme jinak" />
        </div>
        <div className={styles.pillars_grid}>
          {PILLARS.map((p, i) => (
            <div
              key={p.num}
              className={`${styles.pillar} ${styles.reveal}`}
              style={{ '--delay': `${i * 0.13}s` }}
            >
              <span className={styles.pillar_ghost}>{p.num}</span>
              <div className={styles.pillar_body}>
                <img src={p.icon} alt={p.title} className={styles.pillar_icon} />
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COURSES ───────────────────────────────────── */}
      <section className={styles.courses}>
        <div className={`${styles.courses_header} ${styles.reveal}`}>
          <SectionHeading label="KURZY" heading="Začněte hned" />
        </div>
        <CourseList courses={courses.slice(0, 2)} />
        <div className={styles.courses_more}>
          <IndexButton text="Zobrazit všechny kurzy" link="/courses" />
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className={`${styles.cta} ${styles.reveal}`}>
        <div className={styles.rule} />
        <div className={styles.cta_inner}>
          <p className={styles.cta_text}>Připraveni začít?</p>
          <IndexButton text="Vytvořit účet" link="/register" />
        </div>
        <div className={styles.rule} />
      </section>

      <Footer user={user} setUser={setUser} />
      <div className={styles.bg_ball} />
    </div>
  );
}

export default Index;
