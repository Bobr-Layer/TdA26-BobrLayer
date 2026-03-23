import styles from './module-form.module.scss';
import { useState, useEffect } from 'react';
import Input from '../../../../shared/form/input/Input';
import Textarea from '../../../../shared/form/textarea/Textarea';
import SmallMessage from '../../../../shared/message/small-message/SmallMessage';
import MaterialDashboardCard from '../../../../shared/courses/material-dashboard-card/MaterialDashboardCard';
import { FileInput, UrlInput } from '../../../../shared/form/material-input/MaterialInput';

export default function ModuleForm({ moduleData, handleModuleDataChange, initialFiles, initialUrls, onFilesChange, onUrlsChange, showMessages, filesFirst = false }) {
    const [fileData, setFileData] = useState(initialFiles || []);
    const [urlData, setUrlData] = useState(initialUrls || []);

    useEffect(() => {
        if (initialUrls) setUrlData(initialUrls);
    }, [initialUrls]);

    useEffect(() => {
        if (initialFiles) setFileData(initialFiles);
    }, [initialFiles]);

    const removeFile = (index) => {
        const newData = fileData.filter((_, i) => i !== index);
        setFileData(newData);
        if (onFilesChange) onFilesChange(newData);
    };

    const removeUrl = (index) => {
        const newData = urlData.filter((_, i) => i !== index);
        setUrlData(newData);
        if (onUrlsChange) onUrlsChange(newData);
    };

    const nameDescFields = (
        <>
            <Input
                name="name"
                placeholder="Zadejte název modulu"
                value={moduleData.name}
                onChange={handleModuleDataChange}
                title={true}
            />
            <Textarea
                name="description"
                placeholder="Krátký popis modulu"
                value={moduleData.description}
                onChange={handleModuleDataChange}
                bigger={true}
            />
        </>
    );

    const filesSection = (
        <div className={styles.module_form_content}>
            <h3>Soubory</h3>
            <div className={styles.module_form_content_list}>
                {fileData.map((data, index) => (
                    <MaterialDashboardCard
                        file={true}
                        material={data}
                        key={data.uuid || data.tempId}
                        onDelete={() => removeFile(index)}
                    />
                ))}
                <FileInput
                    onChange={(data) => {
                        if (!data?.file) return;
                        const newItem = {
                            ...data,
                            name: data.name || data.fileName || data.file?.name || '',
                            tempId: crypto.randomUUID()
                        };
                        const newData = [...fileData, newItem];
                        setFileData(newData);
                        if (onFilesChange) onFilesChange(newData);
                    }}
                />
            </div>
        </div>
    );

    const urlsSection = (
        <div className={styles.module_form_content}>
            <h3>Odkazy</h3>
            <div className={styles.module_form_content_list}>
                {urlData.map((data, index) => (
                    <MaterialDashboardCard
                        material={data}
                        key={data.uuid || data.tempId}
                        onDelete={() => removeUrl(index)}
                    />
                ))}
                <UrlInput
                    onChange={(data) => {
                        if (!data?.url) return;
                        const newData = [...urlData, data];
                        setUrlData(newData);
                        if (onUrlsChange) onUrlsChange(newData);
                    }}
                />
            </div>
        </div>
    );

    return (
        <div className={styles.module_form}>
            {filesFirst ? (
                <>
                    {filesSection}
                    {nameDescFields}
                    {urlsSection}
                </>
            ) : (
                <>
                    {nameDescFields}
                    {filesSection}
                    {urlsSection}
                </>
            )}
            {showMessages && (
                <div className={styles.course_form_messages}>
                    <SmallMessage text={<>Nový modul bude vytvořen jako <span>draft</span> - pro zveřejnění změňte jeho viditelnost po vytvoření.</>} />
                </div>
            )}
        </div>
    );
}
