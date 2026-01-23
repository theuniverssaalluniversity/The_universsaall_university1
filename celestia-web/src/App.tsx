import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from './context/ConfigContext';
import PublicLayout from './layouts/PublicLayout';
import LandingPage from './pages/LandingPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardLayout from './layouts/DashboardLayout';
import RoleGuard from './components/auth/RoleGuard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import InstructorDashboard from './pages/dashboard/InstructorDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AdminSettings from './pages/dashboard/AdminSettings';
import AdminStaff from './pages/dashboard/AdminStaff';
import AdminRevenue from './pages/dashboard/AdminRevenue';
import SupportDashboard from './pages/dashboard/SupportDashboard';
import CreateCoursePage from './pages/dashboard/CreateCoursePage';
import LearnPage from './pages/LearnPage';

// New Support & Instructor Pages
import SupportOrders from './pages/dashboard/support/SupportOrders';
import SupportEnrollments from './pages/dashboard/support/SupportEnrollments';
import SupportChat from './pages/dashboard/support/SupportChat';
import InstructorCourses from './pages/dashboard/instructor/InstructorCourses';
import AdminCoupons from './pages/dashboard/AdminCoupons';
import InstructorStudents from './pages/dashboard/instructor/InstructorStudents';
import InstructorEarnings from './pages/dashboard/instructor/InstructorEarnings';
import EditCourseContent from './pages/dashboard/instructor/EditCourseContent';

function App() {
  return (
    <ConfigProvider>
      <Router>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            {/* Placeholder routes for now */}
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:slug" element={<CourseDetailPage />} />
            <Route path="/readings" element={<div className="p-20 text-center text-zinc-500">Bookings (Coming Soon)</div>} />
            <Route path="/shop" element={<div className="p-20 text-center text-zinc-500">Shop (Coming Soon)</div>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/cart" element={<div className="p-20 text-center text-zinc-500">Cart (Coming Soon)</div>} />
          </Route>

          {/* Protected Dashboards */}

          {/* Student */}
          <Route element={<RoleGuard allowedRoles={['student']} />}>
            <Route path="/student" element={<DashboardLayout role="student" />}>
              <Route index element={<StudentDashboard />} />
              <Route path="courses" element={<StudentDashboard />} /> {/* Alias for now */}
              <Route path="orders" element={<div className="p-10">My Orders (Coming Soon)</div>} />
            </Route>
            <Route path="/learn/:courseId" element={<LearnPage />} />
          </Route>

          {/* Instructor */}
          <Route element={<RoleGuard allowedRoles={['instructor']} />}>
            <Route path="/instructor" element={<DashboardLayout role="instructor" />}>
              <Route index element={<InstructorDashboard />} />
              <Route path="create-course" element={<CreateCoursePage />} />
              <Route path="courses/:courseId/edit" element={<EditCourseContent />} />
              <Route path="courses" element={<InstructorCourses />} />
              <Route path="students" element={<InstructorStudents />} />
              <Route path="earnings" element={<InstructorEarnings />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<RoleGuard allowedRoles={['admin']} />}>
            <Route path="/admin" element={<DashboardLayout role="admin" />}>
              <Route index element={<AdminDashboard />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="staff" element={<AdminStaff />} />
              <Route path="revenue" element={<AdminRevenue />} />
              <Route path="coupons" element={<AdminCoupons />} />
            </Route>

          </Route>

          {/* Support */}
          <Route element={<RoleGuard allowedRoles={['support', 'admin']} />}>
            <Route path="/support" element={<DashboardLayout role="support" />}>
              <Route index element={<SupportDashboard />} />
              <Route path="orders" element={<SupportOrders />} />
              <Route path="enrollments" element={<SupportEnrollments />} />
              <Route path="chat" element={<SupportChat />} />
            </Route>
          </Route>

        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
