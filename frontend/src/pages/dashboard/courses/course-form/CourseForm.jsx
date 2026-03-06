import styles from './course-form.module.scss';
import Input from '../../../../shared/form/input/Input';
import Textarea from '../../../../shared/form/textarea/Textarea';
import SmallMessage from '../../../../shared/message/small-message/SmallMessage';

export default function CourseForm({
    courseData,
    handleCourseChange,
    showMessages
}) {
    return (
        <article className={styles.course_form}>
            <div className={styles.course_form_inputs}>
                <Input
                    name="name"
                    placeholder="Zadejte název kurzu"
                    value={courseData.name}
                    onChange={handleCourseChange}
                    title={true}
                />
                <Textarea
                    name="description"
                    placeholder="Krátký popis kurzu"
                    value={courseData.description}
                    onChange={handleCourseChange}
                    bigger={true}
                />
            </div>

            {/* 
            <div className={styles.course_form_materials}>
                <div className={styles.course_form_content}>
                    <div className={styles.course_form_content_header}>
                        <h3>Soubory</h3>
                        <p>{fileData.length} {fileData.length === 1 ? 'soubor' : fileData.length < 5 ? 'soubory' : 'souborů'}</p>
                    </div>
                    <div className={styles.course_form_content_material}>
                        {fileData.map((data, index) => (
                            <FileInput
                                key={index}
                                initialData={data}
                                onChange={(d) => handleFileChange(index, d)}
                                onDelete={() => removeFile(index)}
                            />
                        ))}
                        <NewButton onClick={addFile} />
                    </div>
                </div>

                <div className={styles.course_form_content}>
                    <div className={styles.course_form_content_header}>
                        <h3>Odkazy</h3>
                        <p>{urlData.length} {urlData.length === 1 ? 'odkaz' : urlData.length < 5 ? 'odkazy' : 'odkazů'}</p>
                    </div>
                    <div className={styles.course_form_content_material}>
                        {urlData.map((data, index) => (
                            <UrlInput
                                key={index}
                                initialData={data}
                                onChange={(d) => handleUrlChange(index, d)}
                                onDelete={() => removeUrl(index)}
                            />
                        ))}
                        <NewButton onClick={addUrl} />
                    </div>
                </div>
            </div> 
            */}

            {showMessages && (
                <div className={styles.course_form_messages}>
                    <SmallMessage text={<>Nový kurz bude vytvořen jako <span>draft</span> - pro zveřejnění změňte jeho viditelnost po vytvoření.</>} />
                    <SmallMessage text={<>Vytvořit moduly pro tento kurz budete moct po vytvoření kurzu.</>} />
                </div>
            )}
        </article>
    );
}