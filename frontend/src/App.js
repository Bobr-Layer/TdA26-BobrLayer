import { Routes, Route } from "react-router-dom";
import Index from "./pages/index/Index";
import Courses from "./pages/courses/Courses";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Profile from "./pages/profile/Profile";
import MyCourses from "./pages/my-courses/MyCourses";
import Dashboard from "./pages/dashboard/Dashboard";
import { useState, useEffect } from "react";
import Course from "./pages/dashboard/pages/Course";
import NewCourse from "./pages/dashboard/pages/NewCourse";
import EditCourse from "./pages/dashboard/pages/EditCourse";
import Quiz from "./pages/courses/quiz/Quiz";
import Quizz from './pages/dashboard/pages/Quizz';
import NewQuizz from "./pages/dashboard/pages/NewQuizz";
import EditQuiz from "./pages/dashboard/pages/EditQuiz";
import DashboardFeed from "./pages/dashboard/pages/DashboardFeed";
import { getCurrentUser } from "./services/AuthService";
import Detail from "./pages/courses/detail/Detail";
import About from "./pages/info/About";
import Contact from "./pages/info/Contact";
import GDPR from "./pages/info/GDPR";
import Terms from './pages/info/Terms';
import Module from "./pages/courses/module/Module";
import DashboardModule from "./pages/dashboard/pages/DashboardModule";
import NewModule from "./pages/dashboard/pages/NewModule";
import EditModule from "./pages/dashboard/pages/EditModule";
import AdminUsers from "./pages/admin/AdminUsers";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((user) => setUser(user))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  const isLektor = user && (user.role === 'LEKTOR' || user.role === 'ADMIN');
  const isStudent = user && user.role === 'STUDENT';
  const isAdmin = user && user.role === 'ADMIN';

  return (
    <Routes>
      <Route path="/" element={<Index user={user} setUser={setUser} />} />
      <Route path="/about" element={<About user={user} setUser={setUser} />} />
      <Route path="/contact" element={<Contact user={user} setUser={setUser} />} />
      <Route path="/gdpr" element={<GDPR user={user} setUser={setUser} />} />
      <Route path="/terms" element={<Terms user={user} setUser={setUser} />} />
      <Route path="/courses" element={<Courses user={user} setUser={setUser} />} />
      <Route path="/courses/:uuid" element={<Detail user={user} setUser={setUser} />} />
      <Route path="/courses/:uuid/modules/:moduleUuid" element={<Module user={user} setUser={setUser} />} />
      <Route path="/courses/:uuid/modules/:moduleUuid/quizzes/:quizzUuid" element={<Quiz user={user} setUser={setUser} />} />

      {/* Veřejné stránky */}
      <Route path="/register" element={
        user ? (isStudent ? <MyCourses user={user} setUser={setUser} /> : <Dashboard user={user} setUser={setUser} />)
          : <Register setUser={setUser} />
      } />

      {user ? (
        <>
          {/* Sdílené stránky (student + lecturer) */}
          <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
          <Route path="/login" element={
            isStudent ? <MyCourses user={user} setUser={setUser} /> : <Dashboard user={user} setUser={setUser} />
          } />

          {/* Student stránky */}
          {isStudent && (
            <Route path="/my-courses" element={<MyCourses user={user} setUser={setUser} />} />
          )}

          {/* Lecturer/Admin stránky */}
          {isLektor && (
            <>
              <Route path="/dashboard" element={<Dashboard user={user} setUser={setUser} />} />

              {isAdmin && (
                <Route path="/dashboard/users" element={<AdminUsers user={user} setUser={setUser} />} />
              )}

              <Route path="/dashboard/new" element={<NewCourse user={user} setUser={setUser} />} />
              <Route path="/dashboard/:uuid" element={<Course user={user} setUser={setUser} />} />
              <Route path="/dashboard/:uuid/edit" element={<EditCourse user={user} setUser={setUser} />} />

              <Route path="/dashboard/:uuid/feed" element={<DashboardFeed user={user} setUser={setUser} />} />

              <Route path="/dashboard/:uuid/modules/:moduleUuid" element={<DashboardModule user={user} setUser={setUser} />} />
              <Route path="/dashboard/:uuid/modules/:moduleUuid/edit" element={<EditModule user={user} setUser={setUser} />} />
              <Route path="/dashboard/:uuid/modules/new" element={<NewModule user={user} setUser={setUser} />} />

              <Route path="/dashboard/:uuid/modules/:moduleUuid/quizzes/:quizzUuid" element={<Quizz user={user} setUser={setUser} />} />
              <Route path="/dashboard/:uuid/modules/:moduleUuid/quizzes/new" element={<NewQuizz user={user} setUser={setUser} />} />
              <Route path="/dashboard/:uuid/modules/:moduleUuid/quizzes/:quizzUuid/edit" element={<EditQuiz user={user} setUser={setUser} />} />
            </>
          )}
        </>
      ) : (
        <>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/profile" element={<Login setUser={setUser} />} />
          <Route path="/my-courses" element={<Login setUser={setUser} />} />
          <Route path="/dashboard" element={<Login setUser={setUser} />} />

          <Route path="/dashboard/new" element={<Login setUser={setUser} />} />
          <Route path="/dashboard/:uuid" element={<Login setUser={setUser} />} />
          <Route path="/dashboard/:uuid/edit" element={<Login setUser={setUser} />} />

          <Route path="/dashboard/:uuid/quizzes/:quizzUuid" element={<Login setUser={setUser} />} />
          <Route path="/dashboard/:uuid/quizzes/new" element={<Login setUser={setUser} />} />
          <Route path="/dashboard/:uuid/quizzes/:quizzUuid/edit" element={<Login setUser={setUser} />} />

          <Route path="/dashboard/:uuid/feed" element={<Login setUser={setUser} />} />
        </>
      )}
    </Routes>
  );
}

export default App;
