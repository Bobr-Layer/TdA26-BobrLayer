import CourseDashboardList from "../../shared/courses/course-dashboard-list/CourseDashboardList";
import Sidenav from "../../shared/layout/sidenav/Sidenav"
import styles from './dashboard.module.scss';
import { useState, useEffect, useRef } from "react";
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { getCourses, getCourseByUuid, importCourses } from '../../services/CourseService';
import DashboardButton from "../../shared/button/dashboard/DashboardButton";
import SearchInput from "../../shared/form/search-input/SearchInput";
import CourseSelect from "../../shared/form/course-select/CourseSelect";
import Header from "../../shared/layout/header/Header";
import { usePageTitle } from "../../hooks/usePageTitle";

function Dashboard({ user, setUser }) {
  usePageTitle('Dashboard');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (location.state?.toast) {
      showToast(location.state.toast);
      window.history.replaceState({}, '');
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const data = await getCourses();
      setCourses(data);
      setCoursesData(data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleSelect(uuid) {
    setSelectedCourses(prev => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });
  }

  async function handleExport() {
    try {
      const fetched = await Promise.all(
        [...selectedCourses].map(uuid => getCourseByUuid(uuid))
      );

      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        courses: fetched.map(course => ({
          name: course.name,
          description: course.description,
          modules: (course.modules || []).map(mod => ({
            name: mod.name,
            description: mod.description,
            index: mod.index,
            materials: (mod.materials || [])
              .filter(m => m.type === 'url' || m.url)
              .map(m => ({
                name: m.name,
                description: m.description,
                url: m.url,
                faviconUrl: m.faviconUrl ?? null,
              })),
            quizzes: (mod.quizzes || []).map(q => ({
              title: q.title,
              questions: (q.questions || []).map(qu => {
                const base = {
                  type: qu.type,
                  question: qu.question,
                  options: qu.options,
                };
                if (qu.type === 'singleChoice') return { ...base, correctIndex: qu.correctIndex };
                if (qu.type === 'multipleChoice') return { ...base, correctIndices: qu.correctIndices };
                return base;
              }),
            })),
          })),
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kurzy-export.json';
      a.click();
      URL.revokeObjectURL(url);
      setSelectedCourses(new Set());
    } catch (err) {
      showToast('Export se nezdařil');
      console.error(err);
    }
  }

  async function handleImport(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const coursesToImport = json.courses ?? (Array.isArray(json) ? json : [json]);
      await importCourses(coursesToImport);
      await loadCourses();
      showToast(`Importováno ${coursesToImport.length} ${coursesToImport.length === 1 ? 'kurz' : coursesToImport.length < 5 ? 'kurzy' : 'kurzů'}`);
    } catch (err) {
      showToast('Import se nezdařil — zkontrolujte formát souboru');
      console.error(err);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImport(file);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) handleImport(file);
    e.target.value = '';
  }

  if (user?.role === 'ADMIN') return <Navigate to="/dashboard/users" replace />;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Header user={user} setUser={setUser} onlyMobile={true}/>
      <Sidenav user={user} setUser={setUser} current={'courses'}/>
      {isDragOver && <div className={styles.drag_overlay}><p>Přetáhněte JSON soubor pro import</p></div>}
      <section className={styles.dashboard}>
        <article className={styles.dashboard_header}>
          <div className={styles.dashboard_header_text}>
            <h1>Vaše kurzy</h1>
            <p>{courses.length} {courses.length === 1 ? 'kurz' : courses.length < 5 ? 'kurzy' : 'kurzů'}</p>
          </div>
          <div className={styles.dashboard_header_actions}>
            {selectedCourses.size > 0 && (
              <DashboardButton
                onClick={handleExport}
                text={`Exportovat (${selectedCourses.size})`}
                icon={<svg width="1.25rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16L7 11L8.4 9.55L11 12.15V4H13V12.15L15.6 9.55L17 11L12 16ZM6 20C5.45 20 4.97933 19.8043 4.588 19.413C4.19667 19.0217 4.00067 18.5507 4 18V15H6V18H18V15H20V18C20 18.55 19.8043 19.021 19.413 19.413C19.0217 19.805 18.5507 20.0007 18 20H6Z" fill="#1A1A1A"/>
                </svg>}
              />
            )}
            <DashboardButton
              onClick={() => fileInputRef.current?.click()}
              text={'Import kurzu'}
              icon={<svg width="1.25rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8L17 13L15.6 14.45L13 11.85V20H11V11.85L8.4 14.45L7 13L12 8ZM6 4C5.45 4 4.97933 4.19567 4.588 4.587C4.19667 4.97833 4.00067 5.44933 4 6V9H6V6H18V9H20V6C20 5.45 19.8043 4.97933 19.413 4.588C19.0217 4.19667 18.5507 4.00067 18 4H6Z" fill="#1A1A1A"/>
              </svg>}
            />
            <DashboardButton link={'/dashboard/new'} text={'Nový kurz'} icon={<svg width="1.25rem" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2.625C11.7502 2.625 9.551 3.29213 7.68039 4.54203C5.80978 5.79193 4.35182 7.56847 3.49088 9.64698C2.62993 11.7255 2.40467 14.0126 2.84357 16.2192C3.28248 18.4257 4.36584 20.4525 5.95667 22.0433C7.54749 23.6342 9.57432 24.7175 11.7809 25.1564C13.9874 25.5953 16.2745 25.3701 18.353 24.5091C20.4315 23.6482 22.2081 22.1902 23.458 20.3196C24.7079 18.449 25.375 16.2498 25.375 14C25.3718 10.9841 24.1724 8.09271 22.0398 5.96018C19.9073 3.82764 17.0159 2.62818 14 2.625ZM14 23.625C12.0964 23.625 10.2355 23.0605 8.65264 22.0029C7.06982 20.9453 5.83616 19.4421 5.10766 17.6833C4.37917 15.9246 4.18856 13.9893 4.55995 12.1223C4.93133 10.2552 5.84802 8.54018 7.1941 7.1941C8.54018 5.84802 10.2552 4.93132 12.1223 4.55994C13.9893 4.18856 15.9246 4.37917 17.6833 5.10766C19.4421 5.83615 20.9453 7.06981 22.0029 8.65264C23.0605 10.2355 23.625 12.0964 23.625 14C23.6221 16.5518 22.6071 18.9983 20.8027 20.8027C18.9983 22.6071 16.5518 23.6221 14 23.625ZM19.25 14C19.25 14.2321 19.1578 14.4546 18.9937 14.6187C18.8296 14.7828 18.6071 14.875 18.375 14.875H14.875V18.375C14.875 18.6071 14.7828 18.8296 14.6187 18.9937C14.4546 19.1578 14.2321 19.25 14 19.25C13.7679 19.25 13.5454 19.1578 13.3813 18.9937C13.2172 18.8296 13.125 18.6071 13.125 18.375V14.875H9.625C9.39294 14.875 9.17038 14.7828 9.00629 14.6187C8.84219 14.4546 8.75 14.2321 8.75 14C8.75 13.7679 8.84219 13.5454 9.00629 13.3813C9.17038 13.2172 9.39294 13.125 9.625 13.125H13.125V9.625C13.125 9.39294 13.2172 9.17038 13.3813 9.00628C13.5454 8.84219 13.7679 8.75 14 8.75C14.2321 8.75 14.4546 8.84219 14.6187 9.00628C14.7828 9.17038 14.875 9.39294 14.875 9.625V13.125H18.375C18.6071 13.125 18.8296 13.2172 18.9937 13.3813C19.1578 13.5454 19.25 13.7679 19.25 14Z" fill="#1A1A1A" />
            </svg>} />
          </div>
        </article>
        <article className={styles.dashboard_filter}>
          <SearchInput data={coursesData} setData={setCoursesData} text={'Hledejte kvíz'}/>
          <CourseSelect setCourseData={setCoursesData} admin={true} courseData={courses}/>
        </article>
        <CourseDashboardList courses={coursesData} selectedCourses={selectedCourses} onSelect={handleSelect} />
      </section>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  )
}

export default Dashboard
