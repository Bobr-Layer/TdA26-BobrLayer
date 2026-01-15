import { useState, useEffect } from 'react';
import styles from './material-input.module.scss';

export function UrlInput({ onDelete, onChange, initialData = {} }) {
    const [name, setName] = useState(initialData.name || '');
    const [description, setDescription] = useState(initialData.description || '');
    const [url, setUrl] = useState(initialData.url || '');
    const [uuid, setUuid] = useState(initialData.uuid || null);

    useEffect(() => {
        setName(initialData.name || '');
        setDescription(initialData.description || '');
        setUrl(initialData.url || '');
        setUuid(initialData.uuid || null);
    }, [initialData]);

    const handleChange = (updatedName, updatedDescription, updatedUrl) => {
        if (onChange) {
            onChange({
                name: updatedName,
                description: updatedDescription,
                url: updatedUrl,
                uuid: uuid
            });
        }
    };

    const isExistingUrl = !!uuid;

    return (
        <div className={styles.material_input}>
            <div className={styles.material_input_between}>
                {isExistingUrl ? (
                    <div className={styles.url_display}>
                        <span>{url || 'Odkaz'}</span>
                    </div>
                ) : (
                    <input
                        name='url'
                        placeholder='Odkaz'
                        value={url}
                        onChange={(e) => {
                            const newUrl = e.target.value;
                            setUrl(newUrl);
                            handleChange(name, description, newUrl);
                        }}
                    />
                )}
                <button type='button' onClick={onDelete}>
                    <svg width="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.875 3.75H13.75V3.125C13.75 2.62772 13.5525 2.15081 13.2008 1.79917C12.8492 1.44754 12.3723 1.25 11.875 1.25H8.125C7.62772 1.25 7.15081 1.44754 6.79917 1.79917C6.44754 2.15081 6.25 2.62772 6.25 3.125V3.75H3.125C2.95924 3.75 2.80027 3.81585 2.68306 3.93306C2.56585 4.05027 2.5 4.20924 2.5 4.375C2.5 4.54076 2.56585 4.69973 2.68306 4.81694C2.80027 4.93415 2.95924 5 3.125 5H3.75V16.25C3.75 16.5815 3.8817 16.8995 4.11612 17.1339C4.35054 17.3683 4.66848 17.5 5 17.5H15C15.3315 17.5 15.6495 17.3683 15.8839 17.1339C16.1183 16.8995 16.25 16.5815 16.25 16.25V5H16.875C17.0408 5 17.1997 4.93415 17.3169 4.81694C17.4342 4.69973 17.5 4.54076 17.5 4.375C17.5 4.20924 17.4342 4.05027 17.3169 3.93306C17.1997 3.81585 17.0408 3.75 16.875 3.75ZM7.5 3.125C7.5 2.95924 7.56585 2.80027 7.68306 2.68306C7.80027 2.56585 7.95924 2.5 8.125 2.5H11.875C12.0408 2.5 12.1997 2.56585 12.3169 2.68306C12.4342 2.80027 12.5 2.95924 12.5 3.125V3.75H7.5V3.125ZM15 16.25H5V5H15V16.25ZM8.75 8.125V13.125C8.75 13.2908 8.68415 13.4497 8.56694 13.5669C8.44973 13.6842 8.29076 13.75 8.125 13.75C7.95924 13.75 7.80027 13.6842 7.68306 13.5669C7.56585 13.4497 7.5 13.2908 7.5 13.125V8.125C7.5 7.95924 7.56585 7.80027 7.68306 7.68306C7.80027 7.56585 7.95924 7.5 8.125 7.5C8.29076 7.5 8.44973 7.56585 8.56694 7.68306C8.68415 7.80027 8.75 7.95924 8.75 8.125ZM12.5 8.125V13.125C12.5 13.2908 12.4342 13.4497 12.3169 13.5669C12.1997 13.6842 12.0408 13.75 11.875 13.75C11.7092 13.75 11.5503 13.6842 11.4331 13.5669C11.3158 13.4497 11.25 13.2908 11.25 13.125V8.125C11.25 7.95924 11.3158 7.80027 11.4331 7.68306C11.5503 7.56585 11.7092 7.5 11.875 7.5C12.0408 7.5 12.1997 7.56585 12.3169 7.68306C12.4342 7.80027 12.5 7.95924 12.5 8.125Z" fill="black" />
                    </svg>
                </button>
            </div>
            <div className={styles.material_input_row}>
                <input
                    name='name'
                    placeholder='Název'
                    value={name}
                    onChange={(e) => {
                        const newName = e.target.value;
                        setName(newName);
                        handleChange(newName, description, url);
                    }}
                />
                <input
                    name='description'
                    placeholder='Popisek'
                    value={description}
                    onChange={(e) => {
                        const newDescription = e.target.value;
                        setDescription(newDescription);
                        handleChange(name, newDescription, url);
                    }}
                />
            </div>
        </div>
    );
}

export function FileInput({ onDelete, onChange, initialData = {} }) {
    const [name, setName] = useState(initialData.name || '');
    const [description, setDescription] = useState(initialData.description || '');
    const [file, setFile] = useState(initialData.file || null);
    const [fileName, setFileName] = useState(initialData.fileName || '');
    const [uuid, setUuid] = useState(initialData.uuid || null);

    const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.mp4', '.mp3'];
    const MAX_FILE_SIZE = 30 * 1024 * 1024;

    useEffect(() => {
        if (initialData.name !== undefined && initialData.name !== name) {
            setName(initialData.name);
        }
        if (initialData.description !== undefined && initialData.description !== description) {
            setDescription(initialData.description);
        }
        if (initialData.uuid !== undefined && initialData.uuid !== uuid) {
            setUuid(initialData.uuid);
        }

        if (initialData.file && initialData.file !== file) {
            setFile(initialData.file);
            if (initialData.file.name) {
                setFileName(initialData.file.name);
            }
        }

        if (!file && initialData.fileName && initialData.fileName !== fileName) {
            setFileName(initialData.fileName);
        }
    }, [initialData]);

    const validateFile = (selectedFile) => {
        const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();

        if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
            alert(`Nepodporovaný formát souboru: ${fileExtension}\n\nPovolené formáty:\n• Dokumenty: PDF, DOCX, TXT\n• Obrázky: PNG, JPG, JPEG, GIF\n• Video: MP4\n• Audio: MP3`);
            return false;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            alert('Soubor je příliš velký.\n\nMaximální povolená velikost je 30 MB.');
            return false;
        }

        return true;
    };

    const isExistingFile = !!uuid;

    return (
        <div className={styles.material_input}>
            <div className={styles.material_input_between}>
                {isExistingFile ? (
                    <div className={styles.file_name_display}>
                        <span>{fileName || 'Soubor'}</span>
                    </div>
                ) : (
                    <label>
                        <input
                            type="file"
                            hidden
                            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.gif,.mp4,.mp3"
                            onChange={(e) => {
                                const selectedFile = e.target.files[0];
                                if (!selectedFile) return;

                                if (!validateFile(selectedFile)) {
                                    e.target.value = '';
                                    return;
                                }

                                console.log('File selected:', selectedFile);

                                setFile(selectedFile);
                                setFileName(selectedFile.name);

                                if (onChange) {
                                    onChange({
                                        name: name,
                                        description: description,
                                        file: selectedFile,
                                        fileName: selectedFile.name,
                                        uuid: uuid
                                    });
                                }
                            }}
                        />
                        <span>
                            {fileName || 'Vybrat soubor'}
                        </span>
                    </label>
                )}

                <button type="button" onClick={onDelete}>
                    <svg width="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.875 3.75H13.75V3.125C13.75 2.62772 13.5525 2.15081 13.2008 1.79917C12.8492 1.44754 12.3723 1.25 11.875 1.25H8.125C7.62772 1.25 7.15081 1.44754 6.79917 1.79917C6.44754 2.15081 6.25 2.62772 6.25 3.125V3.75H3.125C2.95924 3.75 2.80027 3.81585 2.68306 3.93306C2.56585 4.05027 2.5 4.20924 2.5 4.375C2.5 4.54076 2.56585 4.69973 2.68306 4.81694C2.80027 4.93415 2.95924 5 3.125 5H3.75V16.25C3.75 16.5815 3.8817 16.8995 4.11612 17.1339C4.35054 17.3683 4.66848 17.5 5 17.5H15C15.3315 17.5 15.6495 17.3683 15.8839 17.1339C16.1183 16.8995 16.25 16.5815 16.25 16.25V5H16.875C17.0408 5 17.1997 4.93415 17.3169 4.81694C17.4342 4.69973 17.5 4.54076 17.5 4.375C17.5 4.20924 17.4342 4.05027 17.3169 3.93306C17.1997 3.81585 17.0408 3.75 16.875 3.75ZM7.5 3.125C7.5 2.95924 7.56585 2.80027 7.68306 2.68306C7.80027 2.56585 7.95924 2.5 8.125 2.5H11.875C12.0408 2.5 12.1997 2.56585 12.3169 2.68306C12.4342 2.80027 12.5 2.95924 12.5 3.125V3.75H7.5V3.125ZM15 16.25H5V5H15V16.25ZM8.75 8.125V13.125C8.75 13.2908 8.68415 13.4497 8.56694 13.5669C8.44973 13.6842 8.29076 13.75 8.125 13.75C7.95924 13.75 7.80027 13.6842 7.68306 13.5669C7.56585 13.4497 7.5 13.2908 7.5 13.125V8.125C7.5 7.95924 7.56585 7.80027 7.68306 7.68306C7.80027 7.56585 7.95924 7.5 8.125 7.5C8.29076 7.5 8.44973 7.56585 8.56694 7.68306C8.68415 7.80027 8.75 7.95924 8.75 8.125ZM12.5 8.125V13.125C12.5 13.2908 12.4342 13.4497 12.3169 13.5669C12.1997 13.6842 12.0408 13.75 11.875 13.75C11.7092 13.75 11.5503 13.6842 11.4331 13.5669C11.3158 13.4497 11.25 13.2908 11.25 13.125V8.125C11.25 7.95924 11.3158 7.80027 11.4331 7.68306C11.5503 7.56585 11.7092 7.5 11.875 7.5C12.0408 7.5 12.1997 7.56585 12.3169 7.68306C12.4342 7.80027 12.5 7.95924 12.5 8.125Z" fill="black" />
                    </svg>
                </button>
            </div>

            <div className={styles.material_input_row}>
                <input
                    name="name"
                    placeholder="Název"
                    value={name}
                    onChange={(e) => {
                        const newName = e.target.value;
                        setName(newName);
                        if (onChange) {
                            onChange({
                                name: newName,
                                description: description,
                                file: file,
                                fileName: fileName,
                                uuid: uuid
                            });
                        }
                    }}
                />
                <input
                    name="description"
                    placeholder="Popisek"
                    value={description}
                    onChange={(e) => {
                        const newDescription = e.target.value;
                        setDescription(newDescription);
                        if (onChange) {
                            onChange({
                                name: name,
                                description: newDescription,
                                file: file,
                                fileName: fileName,
                                uuid: uuid
                            });
                        }
                    }}
                />
            </div>
        </div>
    );
}