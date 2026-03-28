import { useState, useRef } from 'react';
import styles from './support-ticket-form.module.scss';
import SectionHeading from '../ui/section-heading/SectionHeading';

const API_BASE = '/api';

export default function SupportTicketForm() {
    const [form, setForm] = useState({ title: '', branch: '', url: '', description: '' });
    const [screenshot, setScreenshot] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileRef = useRef(null);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleFile = e => {
        const file = e.target.files[0];
        if (!file) return;
        setScreenshot(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleRemoveFile = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setScreenshot(null);
        setPreviewUrl(null);
        if (fileRef.current) fileRef.current.value = '';
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
        if (screenshot) data.append('screenshot', screenshot);

        try {
            const res = await fetch(`${API_BASE}/tickets`, { method: 'POST', body: data });
            if (res.ok) {
                setStatus('success');
                setForm({ title: '', branch: '', url: '', description: '' });
                handleRemoveFile();
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

                        <div className={`${styles.field} ${styles.grow}`}>
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

                    {/* ── Right: screenshot ── */}
                    <div className={styles.ticket_screenshot}>
                        <label className={styles.screenshot_label}>Screenshot (volitelné)</label>

                        <div
                            className={`${styles.dropzone} ${previewUrl ? styles.has_file : ''}`}
                            onClick={() => fileRef.current?.click()}
                        >
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/png,image/jpeg,image/gif,image/webp"
                                className={styles.file_hidden}
                                onChange={handleFile}
                            />
                            {previewUrl ? (
                                <img src={previewUrl} alt="Screenshot preview" className={styles.preview_img} />
                            ) : (
                                <div className={styles.dropzone_inner}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                                        <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>Klikněte pro nahrání</span>
                                    <span className={styles.dropzone_formats}>PNG, JPG, GIF, WEBP · max 10 MB</span>
                                </div>
                            )}
                        </div>

                        {previewUrl && (
                            <div className={styles.file_info}>
                                <span className={styles.file_name}>{screenshot?.name}</span>
                                <button type="button" className={styles.remove_file} onClick={handleRemoveFile}>
                                    Odstranit
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </section>
    );
}
