import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './profile.module.scss';
import Header from '../../shared/layout/header/Header';
import Footer from '../../shared/layout/footer/Footer';
import Input from '../../shared/form/input/Input';
import SubmitButton from '../../shared/button/submit/SubmitButton';
import { updateProfile, getCurrentUser, getMyQuizAttempts } from '../../services/AuthService';
import { getQuizByUuid } from '../../services/QuizzService';
import QuizQuestion from '../courses/quiz/quiz-question/QuizQuestion';
import { usePageTitle } from '../../hooks/usePageTitle';

const ROLE_LABELS = {
    STUDENT: 'Student',
    LEKTOR: 'Lektor',
    ADMIN: 'Admin',
};

const XP_LEVELS = [
    { level: 1, name: 'Začátečník', min: 0 },
    { level: 2, name: 'Pokročilý',  min: 25 },
    { level: 3, name: 'Zkušený',    min: 75 },
    { level: 4, name: 'Expert',     min: 175 },
    { level: 5, name: 'Mistr',      min: 350 },
];

function getLevelInfo(xp) {
    let current = XP_LEVELS[0];
    for (const l of XP_LEVELS) {
        if (xp >= l.min) current = l;
    }
    const next = XP_LEVELS.find(l => l.level === current.level + 1) || null;
    const progress = next
        ? Math.min(100, Math.round(((xp - current.min) / (next.min - current.min)) * 100))
        : 100;
    return { current, next, progress };
}

function Profile({ user, setUser }) {
    usePageTitle(`Profil – ${user?.username}`);
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [quizAttempts, setQuizAttempts] = useState([]);
    const [review, setReview] = useState(null); // { attempt, quiz, step }
    const [loadingAttempt, setLoadingAttempt] = useState(null);
    const revealRefs = useRef([]);

    const xp = quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
    const { current: lvl, next: nextLvl, progress } = getLevelInfo(xp);

    useEffect(() => {
        if (user?.role === 'STUDENT') {
            getMyQuizAttempts().then(setQuizAttempts).catch(() => {});
        }
    }, [user]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add(styles.revealed)),
            { threshold: 0.12 }
        );
        revealRefs.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const r = (delay = 0) => ({
        ref: el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); },
        className: styles.reveal,
        style: { '--delay': `${delay}s` },
    });

    const handleAttemptClick = async (attempt) => {
        setLoadingAttempt(attempt.attemptUuid);
        try {
            const quiz = await getQuizByUuid(attempt.courseUuid, attempt.moduleUuid, attempt.quizUuid);
            setReview({ attempt, quiz, step: 0 });
        } catch {
            // ignore
        } finally {
            setLoadingAttempt(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (password && password !== passwordConfirm) {
            setError('Hesla se neshodují');
            return;
        }

        const data = {};
        if (username && username !== user.username) data.username = username;
        if (password) data.password = password;

        if (Object.keys(data).length === 0) {
            setError('Žádné změny k uložení');
            return;
        }

        setLoading(true);
        try {
            await updateProfile(data);
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
            <Header user={user} setUser={setUser} />

            {/* ── Hero ── */}
            <section className={styles.hero}>
                <div className={styles.hero_content}>
                    <div className={styles.hero_avatar}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div className={styles.hero_meta}>
                        <span className={styles.hero_role}>{ROLE_LABELS[user?.role] ?? user?.role}</span>
                        <h1>{user?.username}</h1>
                    </div>
                </div>
                <div className={styles.hero_ball} />
            </section>

            <hr className={styles.rule} />

            {/* ── XP section (students only, before settings) ── */}
            {user?.role === 'STUDENT' && (
                <>
                    <section className={styles.section}>
                        <div {...r(0)}>
                            <span className={styles.label}>Postup</span>
                        </div>
                        <h2 {...r(0.05)}>Herní profil</h2>
                        <div {...r(0.1)} className={styles.xp_display}>
                            <div className={styles.xp_top}>
                                <div className={styles.xp_level_block}>
                                    <span className={styles.xp_label_text}>Úroveň</span>
                                    <span className={styles.xp_level_num}>{lvl.level}</span>
                                </div>
                                <div className={styles.xp_right}>
                                    <span className={styles.xp_level_name}>{lvl.name}</span>
                                    <span className={styles.xp_count}>{Math.round(xp)} XP</span>
                                </div>
                            </div>
                            <div className={styles.xp_bar_track}>
                                <div className={styles.xp_bar_fill} style={{ width: `${progress}%` }} />
                            </div>
                            {nextLvl ? (
                                <span className={styles.xp_next_label}>{Math.round(xp)} / {nextLvl.min} XP do úrovně {nextLvl.level} — {nextLvl.name}</span>
                            ) : (
                                <span className={styles.xp_next_label}>Maximální úroveň dosažena</span>
                            )}
                        </div>
                    </section>

                    <hr className={styles.rule} />
                </>
            )}

            {/* ── Settings section ── */}
            <section className={styles.section}>
                <div {...r(0)}>
                    <span className={styles.label}>Upravit profil</span>
                </div>
                <h2 {...r(0.05)}>Nastavení účtu</h2>

                <div {...r(0.1)} className={`${styles.reveal} ${styles.form_card}`} style={{ '--delay': '0.1s' }} ref={el => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el); }}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.form_fields}>
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
                        <div className={styles.form_footer} style={{ marginTop: '2rem' }}>
                            <SubmitButton text={loading ? 'Ukládání...' : 'Uložit změny'} type="submit" />
                            {error && <p className={styles.err}>{error}</p>}
                            {success && <p className={styles.success}>{success}</p>}
                        </div>
                    </form>
                </div>
            </section>

            {/* ── Quiz history (students only) ── */}
            {user?.role === 'STUDENT' && (
                <>
                    <hr className={styles.rule} />
                    <section className={styles.section}>
                        <div {...r(0)}>
                            <span className={styles.label}>Historie</span>
                        </div>
                        <h2 {...r(0.05)}>Výsledky kvízů</h2>
                        {quizAttempts.length === 0 ? (
                            <p {...r(0.1)} className={styles.empty_attempts}>Zatím žádné vyhodnocené výsledky</p>
                        ) : (
                            <div {...r(0.1)} className={styles.attempts_grid}>
                                {quizAttempts.map(a => {
                                    const correct = (a.correctPerQuestion || []).filter(Boolean).length;
                                    const total = (a.correctPerQuestion || []).filter(x => x !== null).length;
                                    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
                                    const loading = loadingAttempt === a.attemptUuid;
                                    return (
                                        <div
                                            key={a.attemptUuid}
                                            className={`${styles.attempt_card} ${styles.attempt_card_clickable}`}
                                            onClick={() => !loadingAttempt && handleAttemptClick(a)}
                                        >
                                            <div className={styles.attempt_card_top}>
                                                <span className={styles.attempt_course}>{a.courseName}</span>
                                                <span className={styles.attempt_date}>{new Date(a.submittedAt).toLocaleDateString('cs-CZ')}</span>
                                            </div>
                                            <p className={styles.attempt_quiz}>{a.quizTitle}</p>
                                            <div className={styles.attempt_score_row}>
                                                <span className={styles.attempt_score}>{loading ? '…' : `${correct}/${total}`}</span>
                                                <span className={styles.attempt_pct}>{loading ? '' : `${pct} %`}</span>
                                            </div>
                                            <div className={styles.attempt_dots}>
                                                {(a.correctPerQuestion || []).map((v, i) => (
                                                    <span key={i} className={`${styles.dot} ${v === null ? styles.dot_open : v ? styles.dot_correct : styles.dot_wrong}`} />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </>
            )}

            <Footer user={user} setUser={setUser} />

            {review && (
                <div className={styles.review_overlay} onClick={() => setReview(null)}>
                    <div className={styles.review_modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.review_modal_header}>
                            <div className={styles.review_modal_title}>
                                <span className={styles.review_modal_course}>{review.attempt.courseName}</span>
                                <span className={styles.review_modal_quiz}>{review.attempt.quizTitle}</span>
                            </div>
                            <button className={styles.review_close} onClick={() => setReview(null)} aria-label="Zavřít">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                            </button>
                        </div>
                        <div className={styles.review_modal_body}>
                            <QuizQuestion
                                quiz={review.quiz}
                                currentStep={review.step}
                                setCurrentStep={step => setReview(r => ({ ...r, step }))}
                                length={review.quiz.questions.length}
                                currentAnswer={
                                    review.quiz.questions[review.step]?.type === 'openQuestion'
                                        ? (review.attempt.textAnswers?.[review.quiz.questions[review.step]?.uuid] || '')
                                        : null
                                }
                                onAnswerChange={() => {}}
                                onSubmit={() => {}}
                                currentQuestion={review.quiz.questions[review.step]}
                                info={true}
                                quizResult={{ correctPerQuestion: review.attempt.correctPerQuestion }}
                                evaluations={review.attempt.evaluations}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
