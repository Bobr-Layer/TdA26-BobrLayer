import { useState, useEffect } from 'react';
import styles from './course-form.module.scss';
import Input from '../../../../shared/form/input/Input';
import Textarea from '../../../../shared/form/textarea/Textarea';
import NewButton from '../../../../shared/button/new/NewButton';
import { UrlInput, FileInput } from '../../../../shared/form/material-input/MaterialInput';

export default function CourseForm({
    courseData,
    handleCourseChange,
    onSubmit,
    onUrlsChange,
    onFilesChange,
    initialUrls,
    initialFiles
}) {
    const [fileData, setFileData] = useState(initialFiles || []);
    const [urlData, setUrlData] = useState(initialUrls || []);

    useEffect(() => {
        if (initialUrls) {
            setUrlData(initialUrls);
        }
    }, [initialUrls]);

    useEffect(() => {
        if (initialFiles) {
            setFileData(initialFiles);
        }
    }, [initialFiles]);

    const handleFileChange = (index, data) => {
        console.log('handleFileChange called:', index, data);
        const newData = [...fileData];
        newData[index] = data;
        console.log('New fileData:', newData);
        setFileData(newData);
        if (onFilesChange) {
            onFilesChange(newData);
        }
    };

    const addFile = () => {
        const newData = [...fileData, {}];
        setFileData(newData);
        if (onFilesChange) {
            onFilesChange(newData);
        }
    };

    const removeFile = (index) => {
        const newData = fileData.filter((_, i) => i !== index);
        setFileData(newData);
        if (onFilesChange) {
            onFilesChange(newData);
        }
    };

    const handleUrlChange = (index, data) => {
        const newData = [...urlData];
        newData[index] = data;
        setUrlData(newData);
        if (onUrlsChange) {
            onUrlsChange(newData);
        }
    };

    const addUrl = () => {
        const newData = [...urlData, {}];
        setUrlData(newData);
        if (onUrlsChange) {
            onUrlsChange(newData);
        }
    };

    const removeUrl = (index) => {
        const newData = urlData.filter((_, i) => i !== index);
        setUrlData(newData);
        if (onUrlsChange) {
            onUrlsChange(newData);
        }
    };

    return (
        <article className={styles.course_form}>
            <form className={styles.course_form_inputs} onSubmit={onSubmit}>
                <Input
                    name="name"
                    placeholder="Název kurzu"
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
            </form>

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
        </article>
    );
}