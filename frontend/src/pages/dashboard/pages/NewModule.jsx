import styles from '../dashboard.module.scss';
import Sidenav from '../../../shared/layout/sidenav/Sidenav';
import DashboardNav from '../../../shared/layout/dashboard-nav/DashboardNav';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModuleForm from '../modules/module-form/ModuleForm';
import { createModule, getModules } from '../../../services/ModuleService';
import { createFileMaterial, createUrlMaterial } from '../../../services/MaterialService';
import Header from '../../../shared/layout/header/Header';

export default function NewModule({ user, setUser }) {
    const navigate = useNavigate();
    const { uuid } = useParams();

    const [modules, setModules] = useState();

    const [moduleData, setModuleData] = useState({
        name: '',
        description: '',
    });
    const [nextIndex, setNextIndex] = useState(0);

    useEffect(() => {
        const loadIndex = async () => {
            try {
                const modulesData = await getModules(uuid);
                const max = modulesData.reduce((acc, m) => Math.max(acc, m.index), -1);

                setModules(modulesData);
                setNextIndex(max + 1);
            } catch (err) {
                console.error(err);
            }
        };

        loadIndex();
    }, [uuid]);

    const handleModuleChange = (e) => {
        const { name, value } = e.target;
        setModuleData(prev => ({ ...prev, [name]: value }));
    };

    const [urlMaterials, setUrlMaterials] = useState([]);
    const [fileMaterials, setFileMaterials] = useState([]);

    const handleUrlsChange = (urls) => setUrlMaterials(urls);
    const handleFilesChange = (files) => setFileMaterials(files);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const createdModule = await createModule(uuid, { ...moduleData, index: nextIndex });

            for (const f of fileMaterials) {
                await createFileMaterial(uuid, createdModule.uuid, f);
            }

            for (const u of urlMaterials) {
                await createUrlMaterial(uuid, createdModule.uuid, u);
            }

            navigate(`/dashboard/${uuid}`);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    return (
        <div>
            <Header user={user} setUser={setUser} onlyMobile={true}/>
            <Sidenav user={user} setUser={setUser} showMore={true} current={'courseDetail'} modules={modules}/>
            <form className={styles.dashboard} onSubmit={handleSubmit}>
                <DashboardNav
                    link={'/dashboard/' + uuid}
                    textLink={'Vrátit se zpět a zahodit změny'}
                    buttonText={'Uložit změny'}
                    buttonIcon={<svg width="1.75rem" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25.1196 8.49406L11.1195 22.4941C11.0383 22.5754 10.9418 22.64 10.8356 22.684C10.7293 22.728 10.6155 22.7507 10.5005 22.7507C10.3855 22.7507 10.2716 22.728 10.1654 22.684C10.0592 22.64 9.96269 22.5754 9.88142 22.4941L3.75642 16.3691C3.59224 16.2049 3.5 15.9822 3.5 15.75C3.5 15.5178 3.59224 15.2951 3.75642 15.1309C3.92061 14.9667 4.14329 14.8745 4.37549 14.8745C4.60768 14.8745 4.83036 14.9667 4.99455 15.1309L10.5005 20.638L23.8814 7.25594C24.0456 7.09175 24.2683 6.99951 24.5005 6.99951C24.7327 6.99951 24.9554 7.09175 25.1196 7.25594C25.2837 7.42012 25.376 7.6428 25.376 7.875C25.376 8.10719 25.2837 8.32988 25.1196 8.49406Z" fill="#1A1A1A" />
                    </svg>}
                    buttonSubmit={true}
                    showButton={true}
                />
                <ModuleForm
                    moduleData={moduleData}
                    handleModuleDataChange={handleModuleChange}
                    showMessages={true}
                    onFilesChange={handleFilesChange}
                    onUrlsChange={handleUrlsChange}
                />
            </form>
        </div>
    );
}