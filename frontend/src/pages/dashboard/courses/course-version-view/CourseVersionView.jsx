import styles from './course-version-view.module.scss';

export default function CourseVersionView({ versionContent }) {
    if (!versionContent) return null;

    return (
        <div className={styles.version_view}>
            <div className={styles.version_banner}>
                <span className={styles.version_id}>{versionContent.shortId}</span>
                <span className={styles.version_date}>
                    {new Date(versionContent.createdAt).toLocaleString('cs-CZ', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </span>
                <span className={styles.version_readonly}>Pouze pro čtení</span>
            </div>

            <div className={styles.version_course_info}>
                <h2>{versionContent.name}</h2>
                {versionContent.description && <p>{versionContent.description}</p>}
            </div>

            <div className={styles.version_modules}>
                {(!versionContent.modules || versionContent.modules.length === 0) ? (
                    <p className={styles.version_empty}>Žádné moduly v této verzi.</p>
                ) : (
                    versionContent.modules
                        .slice()
                        .sort((a, b) => a.index - b.index)
                        .map((module) => (
                            <div key={module.uuid} className={styles.version_module}>
                                <div className={styles.version_module_header}>
                                    <span className={styles.version_module_index}>
                                        #{module.index + 1}
                                    </span>
                                    <h3>{module.name}</h3>
                                    {module.activated && (
                                        <span className={styles.version_module_active}>Aktivní</span>
                                    )}
                                </div>
                                {module.description && (
                                    <p className={styles.version_module_desc}>{module.description}</p>
                                )}

                                {module.materials && module.materials.length > 0 && (
                                    <div className={styles.version_section}>
                                        <p className={styles.version_section_label}>Materiály</p>
                                        <ul>
                                            {module.materials.map((mat) => (
                                                <li key={mat.uuid} className={styles.version_item}>
                                                    <span className={styles.version_item_type}>
                                                        {mat.type === 'file' ? 'Soubor' : 'URL'}
                                                    </span>
                                                    <span>{mat.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {module.quizzes && module.quizzes.length > 0 && (
                                    <div className={styles.version_section}>
                                        <p className={styles.version_section_label}>Kvízy</p>
                                        <ul>
                                            {module.quizzes.map((quiz) => (
                                                <li key={quiz.uuid} className={styles.version_item}>
                                                    <span className={styles.version_item_type}>Kvíz</span>
                                                    <span>{quiz.title}</span>
                                                    <span className={styles.version_item_sub}>
                                                        {quiz.questions?.length ?? 0} otázek
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))
                )}
            </div>
        </div>
    );
}
