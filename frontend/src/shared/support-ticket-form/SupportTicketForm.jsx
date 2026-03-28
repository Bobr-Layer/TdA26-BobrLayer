import { useState, useRef } from 'react';
import styles from './support-ticket-form.module.scss';
import SectionHeading from '../ui/section-heading/SectionHeading';

const API_BASE = '/api';

function ScreenshotSlot({ index, file, previewUrl, onAdd, onRemove }) {
    const fileRef = useRef(null);

    const handleFile = e => {
        const f = e.target.files[0];
        if (f) onAdd(index, f);
    };

    if (previewUrl) {
        return (
            <div className={styles.slot_filled}>
                <img src={previewUrl} alt={`Screenshot ${index + 1}`} className={styles.slot_img} />
                <div className={styles.slot_overlay}>
                    <button type="button" className={styles.slot_remove} onClick={() => onRemove(index)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                    <span className={styles.slot_name}>{file?.name}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.slot_empty} onClick={() => fileRef.current?.click()}>
            <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className={styles.file_hidden}
                onChange={handleFile}
            />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>{index + 1}.</span>
        </div>
    );
}

export default function SupportTicketForm({ maxScreenshots = 3 }) {
    const [form, setForm] = useState({ title: '', branch: '', url: '', description: '' });
    const [screenshots, setScreenshots] = useState(() => Array(maxScreenshots).fill(null));
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleAdd = (index, file) => {
        const previewUrl = URL.createObjectURL(file);
        setScreenshots(prev => {
            const next = [...prev];
            if (next[index]?.previewUrl) URL.revokeObjectURL(next[index].previewUrl);
            next[index] = { file, previewUrl };
            return next;
        });
    };

    const handleRemove = index => {
        setScreenshots(prev => {
            const next = [...prev];
            if (next[index]?.previewUrl) URL.revokeObjectURL(next[index].previewUrl);
            next[index] = null;
            return next;
        });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        const data = new FormData();
        data.append('title', form.title);
        data.append('branch', form.branch);
        data.append('url', form.url);
        data.append('description', form.description);
        const keys = ['screenshot', 'screenshot2', 'screenshot3'];
        screenshots.forEach((s, i) => { if (s?.file) data.append(keys[i], s.file); });

        try {
            const res = await fetch(`${API_BASE}/tickets`, { method: 'POST', body: data });
            if (res.ok) {
                setStatus('success');
                setForm({ title: '', branch: '', url: '', description: '' });
                setScreenshots(prev => {
                    prev.forEach(s => { if (s?.previewUrl) URL.revokeObjectURL(s.previewUrl); });
                    return Array(maxScreenshots).fill(null);
                });
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.ticket_section}>
            <SectionHeading label="PODPORA" heading="Nahlásit problém" />
            <p className={styles.ticket_subtitle}>
                Narazili jste na chybu nebo technický problém? Vyplňte formulář a my se na to podíváme.
            </p>

            <form className={styles.ticket_form} onSubmit={handleSubmit} noValidate>
                <div className={styles.ticket_layout}>

                    {/* ── Left: text fields ── */}
                    <div className={styles.ticket_fields}>
                        <div className={styles.fields_row}>
                            <div className={styles.field}>
                                <label htmlFor="tk-title">Nadpis tiketu</label>
                                <input
                                    id="tk-title"
                                    name="title"
                                    type="text"
                                    placeholder="Stručně popište problém"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="tk-branch">Pobočka</label>
                                <input
                                    id="tk-branch"
                                    name="branch"
                                    type="text"
                                    placeholder="Název vaší pobočky"
                                    value={form.branch}
                                    onChange={handleChange}
                                    required
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="tk-url">URL stránky</label>
                            <input
                                id="tk-url"
                                name="url"
                                type="url"
                                placeholder="https://..."
                                value={form.url}
                                onChange={handleChange}
                                required
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="tk-desc">Popis problému</label>
                            <textarea
                                id="tk-desc"
                                name="description"
                                placeholder="Jak k problému došlo? Co jste dělali, než nastala chyba?"
                                value={form.description}
                                onChange={handleChange}
                                required
                                className={styles.textarea}
                            />
                        </div>

                        {status === 'success' && (
                            <p className={styles.msg_success}>Tiket byl úspěšně odeslán. Ozveme se vám co nejdříve.</p>
                        )}
                        {status === 'error' && (
                            <p className={styles.msg_error}>Nepodařilo se odeslat tiket. Zkuste to prosím znovu.</p>
                        )}

                        <button type="submit" className={styles.submit_btn} disabled={loading}>
                            {loading ? 'Odesílám…' : 'Odeslat tiket'}
                        </button>
                    </div>

                    {/* ── Right: screenshots ── */}
                    <div className={styles.ticket_screenshot}>
                        <span className={styles.screenshot_label}>Screenshoty (volitelné{maxScreenshots > 1 ? `, max ${maxScreenshots}` : ''})</span>
                        <div className={styles.slots_grid}>
                            {screenshots.map((s, i) => (
                                <ScreenshotSlot
                                    key={i}
                                    index={i}
                                    file={s?.file ?? null}
                                    previewUrl={s?.previewUrl ?? null}
                                    onAdd={handleAdd}
                                    onRemove={handleRemove}
                                />
                            ))}
                        </div>
                        <p className={styles.screenshot_hint}>PNG, JPG, GIF, WEBP · max 10 MB každý</p>
                    </div>
                </div>
            </form>
        </section>
    );
}
