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
  useEffect(() => {
    getCourses().then(setCourses).catch(console.error);
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
        <div className={styles.hero_label}>
          <span>VZDĚLÁVACÍ PLATFORMA</span>
          <span className={styles.sep}>—</span>
          <span>TDA 2026</span>
        </div>

        <h1 className={styles.hero_h1}>
          <span>Naučte se</span>
          <span className={styles.hero_accent}>cokoliv.</span>
        </h1>

        <div className={styles.hero_rule} />

        <div className={styles.hero_bottom}>
          <div className={styles.hero_desc}>
            <p>Vzdělávání, které se přizpůsobí vám. Kurzy navržené tak, abyste skutečně pochopili problematiku — od základů po pokročilé koncepty.</p>
            <IndexButton text="Prohlédnout kurzy" link="/courses" />
          </div>

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
