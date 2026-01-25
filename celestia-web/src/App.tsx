import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from './context/ConfigContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
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
import StudentOrders from './pages/dashboard/student/StudentOrders';
import SupportOrders from './pages/dashboard/support/SupportOrders';
import SupportEnrollments from './pages/dashboard/support/SupportEnrollments';
import SupportChat from './pages/dashboard/support/SupportChat';
import InstructorCourses from './pages/dashboard/instructor/InstructorCourses';
import AdminCoupons from './pages/dashboard/AdminCoupons';
import AdminEnrollments from './pages/dashboard/AdminEnrollments';
import AdminServices from './pages/dashboard/AdminServices';
import AdminCourses from './pages/dashboard/AdminCourses';
import AdminEditCourse from './pages/dashboard/AdminEditCourse';
import AdminShop from './pages/dashboard/AdminShop';
import AdminOrdersPage from './pages/dashboard/AdminOrdersPage';
import InstructorStudents from './pages/dashboard/instructor/InstructorStudents';
import InstructorEarnings from './pages/dashboard/instructor/InstructorEarnings';
import EditCourseContent from './pages/dashboard/instructor/EditCourseContent';
import TicketListPage from './pages/dashboard/tickets/TicketListPage';
import CreateTicketPage from './pages/dashboard/tickets/CreateTicketPage';
import UserTicketChat from './pages/dashboard/tickets/UserTicketChat';
import ServicesPage from './pages/ServicesPage';
import ShopPage from './pages/ShopPage';
import CheckoutPage from './pages/CheckoutPage';

function App() {
  return (
    <ConfigProvider>
      <CurrencyProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/courses/:slug" element={<CourseDetailPage />} />

                {/* Dynamic Services Route */}
                <Route path="/services/:categorySlug" element={<ServicesPage />} />

                {/* Legacy Routes (Mapped to new component in ServicesPage) */}
                <Route path="/readings" element={<ServicesPage categorySlug="reading" />} />
                <Route path="/healings" element={<ServicesPage categorySlug="healing" />} />

                <Route path="/shop" element={<ShopPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/cart" element={<div className="p-20 text-center text-zinc-500">Cart (Coming Soon)</div>} />
                <Route path="/checkout" element={<CheckoutPage />} />
              </Route>

              {/* Protected Dashboards */}

              {/* Student */}
              <Route element={<RoleGuard allowedRoles={['student']} />}>
                <Route path="/student" element={<DashboardLayout role="student" />}>
                  <Route index element={<StudentDashboard />} />
                  <Route path="courses" element={<StudentDashboard />} /> {/* Alias for now */}
                  <Route path="orders" element={<StudentOrders />} />
                  <Route path="support" element={<TicketListPage />} />
                  <Route path="support/new" element={<CreateTicketPage />} />
                  <Route path="support/:ticketId" element={<UserTicketChat />} />
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
                  <Route path="support" element={<TicketListPage />} />
                  <Route path="support/new" element={<CreateTicketPage />} />
                  <Route path="support/:ticketId" element={<UserTicketChat />} />
                </Route>
              </Route>

              {/* Admin */}
              <Route element={<RoleGuard allowedRoles={['admin']} />}>
                <Route path="/admin" element={<DashboardLayout role="admin" />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="staff" element={<AdminStaff />} />
                  <Route path="revenue" element={<AdminRevenue />} />
                  <Route path="enrollments" element={<AdminEnrollments />} />
                  <Route path="services" element={<AdminServices />} />
                  <Route path="shop" element={<AdminShop />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="courses" element={<AdminCourses />} />
                  <Route path="courses/:courseId/edit" element={<AdminEditCourse />} />
                  <Route path="create-course" element={<CreateCoursePage />} />
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
        </CartProvider>
      </CurrencyProvider>
    </ConfigProvider>
  );
}

export default App;
