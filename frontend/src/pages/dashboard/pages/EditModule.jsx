import styles from '../dashboard.module.scss';
import Sidenav from '../../../shared/layout/sidenav/Sidenav';
import DashboardNav from '../../../shared/layout/dashboard-nav/DashboardNav';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModuleForm from '../modules/module-form/ModuleForm';
import { getModuleByUuid, updateModule } from '../../../services/ModuleService';
import { getMaterials, createFileMaterial, createUrlMaterial, deleteMaterial } from '../../../services/MaterialService';
import { getCourseByUuid } from '../../../services/CourseService';

export default function EditModule({ user, setUser }) {
    const { uuid, moduleUuid } = useParams();
    const navigate = useNavigate();

    const [moduleData, setModuleData] = useState({ name: '', description: '' });
    const [initialFiles, setInitialFiles] = useState([]);
    const [initialUrls, setInitialUrls] = useState([]);
    const [currentFiles, setCurrentFiles] = useState([]);
    const [currentUrls, setCurrentUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [course, setCourse] = useState();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [moduleRes, materials] = await Promise.all([
                    getModuleByUuid(uuid, moduleUuid),
                    getMaterials(uuid, moduleUuid)
                ]);

                setModuleData({ name: moduleRes.name || '', description: moduleRes.description || '' });

                const files = materials.filter(m => m.type === 'file');
                const urls = materials.filter(m => m.type === 'url');

                setInitialFiles(files);
                setInitialUrls(urls);
                setCurrentFiles(files);
                setCurrentUrls(urls);

                const courseData = await getCourseByUuid(uuid);
                setCourse(courseData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [uuid, moduleUuid]);

    const handleModuleChange = (e) => {
        const { name, value } = e.target;
        setModuleData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await updateModule(uuid, moduleUuid, moduleData);
            const removedFiles = initialFiles.filter(
                orig => !currentFiles.some(f => f.uuid === orig.uuid)
            );
            for (const f of removedFiles) {
                await deleteMaterial(uuid, moduleUuid, f.uuid);
            }
            const newFiles = currentFiles.filter(f => !f.uuid);
            for (const f of newFiles) {
                await createFileMaterial(uuid, moduleUuid, f);
            }
            const removedUrls = initialUrls.filter(
                orig => !currentUrls.some(u => u.uuid === orig.uuid)
            );
            for (const u of removedUrls) {
                await deleteMaterial(uuid, moduleUuid, u.uuid);
            }
            const newUrls = currentUrls.filter(u => !u.uuid);
            for (const u of newUrls) {
                await createUrlMaterial(uuid, moduleUuid, u);
            }

            navigate(`/dashboard/${uuid}/modules/${moduleUuid}`);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div>Načítám modul...</div>;
    if (error) return <div>Chyba: {error}</div>;

    return (
        <div>
            <Sidenav
                user={user}
                setUser={setUser}
                showMore={true}
                current={`courseModule_${moduleUuid}`}
                uuid={uuid}
                modules={course?.modules}
            />
            <form className={styles.dashboard} onSubmit={handleSubmit}>
                <DashboardNav
                    link={`/dashboard/${uuid}/modules/${moduleUuid}`}
                    textLink={'Vrátit se zpět a zahodit změny'}
                    buttonText={'Uložit změny'}
                    buttonSubmit={true}
                    buttonIcon={
                        <svg width="1.75rem" viewBox="0 0 28 28" fill="none">
                            <path d="M25.1196 8.49406L11.1195 22.4941C11.0383 22.5754 10.9418 22.64 10.8356 22.684C10.7293 22.728 10.6155 22.7507 10.5005 22.7507C10.3855 22.7507 10.2716 22.728 10.1654 22.684C10.0592 22.64 9.96269 22.5754 9.88142 22.4941L3.75642 16.3691C3.59224 16.2049 3.5 15.9822 3.5 15.75C3.5 15.5178 3.59224 15.2951 3.75642 15.1309C3.92061 14.9667 4.14329 14.8745 4.37549 14.8745C4.60768 14.8745 4.83036 14.9667 4.99455 15.1309L10.5005 20.638L23.8814 7.25594C24.0456 7.09175 24.2683 6.99951 24.5005 6.99951C24.7327 6.99951 24.9554 7.09175 25.1196 7.25594C25.2837 7.42012 25.376 7.6428 25.376 7.875C25.376 8.10719 25.2837 8.32988 25.1196 8.49406Z" fill="#1A1A1A" />
                        </svg>
                    }
                    showButton={true}
                />
                <ModuleForm
                    moduleData={moduleData}
                    handleModuleDataChange={handleModuleChange}
                    initialFiles={initialFiles}
                    initialUrls={initialUrls}
                    onFilesChange={setCurrentFiles}
                    onUrlsChange={setCurrentUrls}
                />
            </form>
        </div>
    );
}