import { Routes, Route } from "react-router-dom";
import Index from "./pages/index/Index";
import Courses from "./pages/courses/Courses";
import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import { useState, useEffect } from "react";
import Course from "./pages/dashboard/pages/Course";
import NewCourse from "./pages/dashboard/pages/NewCourse";
import EditCourse from "./pages/dashboard/pages/EditCourse";
import Feed from "./pages/courses/feed/Feed";
import Quiz from "./pages/courses/quiz/Quiz";
import Quizz from './pages/dashboard/pages/Quizz';
import NewQuizz from "./pages/dashboard/pages/NewQuizz";
import EditQuiz from "./pages/dashboard/pages/EditQuiz";
import DashboardFeed from "./pages/dashboard/pages/DashboardFeed";
import { getCurrentUser } from "./services/AuthService";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((user) => setUser(user))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:uuid" element={<Courses />} />
      <Route path="/courses/:uuid/feed" element={<Feed />} />
      <Route path="/courses/:uuid/quizz/:quizzUuid" element={<Quiz />} />

      {user ? (
        <>
          <Route path="/login" element={<Dashboard user={user} setUser={setUser} />} />
          <Route path="/dashboard" element={<Dashboard user={user} setUser={setUser} />} />

          <Route path="/dashboard/new" element={<NewCourse user={user} setUser={setUser} />} />
          <Route path="/dashboard/:uuid" element={<Course user={user} setUser={setUser} />} />
          <Route path="/dashboard/:uuid/edit" element={<EditCourse user={user} setUser={setUser} />} />

          <Route path="/dashboard/:uuid/quizzes/:quizzUuid" element={<Quizz user={user} setUser={setUser} />} />
          <Route path="/dashboard/:uuid/quizzes/new" element={<NewQuizz user={user} setUser={setUser} />} />
          <Route path="/dashboard/:uuid/quizzes/:quizzUuid/edit" element={<EditQuiz user={user} setUser={setUser} />} />

          <Route path="/dashboard/:uuid/feed" element={<DashboardFeed user={user} setUser={setUser} />} />
        </>
      ) : (
        <>
          <Route path="/login" element={<Login setUser={setUser} />} />
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
