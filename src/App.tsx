import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from './context/ConfigContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
const PublicLayout = lazy(() => import('./layouts/PublicLayout'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const RoleGuard = lazy(() => import('./components/auth/RoleGuard'));
const StudentDashboard = lazy(() => import('./pages/dashboard/StudentDashboard'));
const InstructorDashboard = lazy(() => import('./pages/dashboard/InstructorDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const AdminSettings = lazy(() => import('./pages/dashboard/AdminSettings'));
const AdminStaff = lazy(() => import('./pages/dashboard/AdminStaff'));
const AdminRevenue = lazy(() => import('./pages/dashboard/AdminRevenue'));
const SupportDashboard = lazy(() => import('./pages/dashboard/SupportDashboard'));
const CreateCoursePage = lazy(() => import('./pages/dashboard/CreateCoursePage'));
const LearnPage = lazy(() => import('./pages/LearnPage'));

// New Support & Instructor Pages
const StudentOrders = lazy(() => import('./pages/dashboard/student/StudentOrders'));
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage'));
const SupportOrders = lazy(() => import('./pages/dashboard/support/SupportOrders'));
const SupportEnrollments = lazy(() => import('./pages/dashboard/support/SupportEnrollments'));
const SupportChat = lazy(() => import('./pages/dashboard/support/SupportChat'));
const InstructorCourses = lazy(() => import('./pages/dashboard/instructor/InstructorCourses'));
const AdminCoupons = lazy(() => import('./pages/dashboard/AdminCoupons'));
const AdminEnrollments = lazy(() => import('./pages/dashboard/AdminEnrollments'));
const AdminStudentDetails = lazy(() => import('./pages/dashboard/AdminStudentDetails'));
const AdminServices = lazy(() => import('./pages/dashboard/AdminServices'));
const AdminCourses = lazy(() => import('./pages/dashboard/AdminCourses'));
const AdminEditCourse = lazy(() => import('./pages/dashboard/AdminEditCourse'));
const AdminShop = lazy(() => import('./pages/dashboard/AdminShop'));
const AdminOrdersPage = lazy(() => import('./pages/dashboard/AdminOrdersPage'));
const AdminTransactions = lazy(() => import('./pages/dashboard/AdminTransactions'));
const InstructorStudents = lazy(() => import('./pages/dashboard/instructor/InstructorStudents'));
const InstructorEarnings = lazy(() => import('./pages/dashboard/instructor/InstructorEarnings'));
const EditCourseContent = lazy(() => import('./pages/dashboard/instructor/EditCourseContent'));
const TicketListPage = lazy(() => import('./pages/dashboard/tickets/TicketListPage'));
const CreateTicketPage = lazy(() => import('./pages/dashboard/tickets/CreateTicketPage'));
const UserTicketChat = lazy(() => import('./pages/dashboard/tickets/UserTicketChat'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const SuccessPage = lazy(() => import('./pages/SuccessPage'));

import { AuthProvider } from './context/AuthContext';

import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

import { AppBootstrap } from './components/auth/AppBootstrap';
import ScrollToTop from './components/layout/ScrollToTop';
import { HelmetProvider } from 'react-helmet-async';

function App() {
  // Mobile Back Button Handling
  useEffect(() => {
    let mounted = true;

    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (!mounted) return;

      if (canGoBack) {
        window.history.back();
      } else {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      mounted = false;
      CapacitorApp.removeAllListeners();
    };
  }, []);

  return (
    <HelmetProvider>
      <AppBootstrap>
        <ConfigProvider>
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <Router>
                <ScrollToTop />
                <div className="bg-black min-h-screen text-white">
                  <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-black text-white">Loading App...</div>}>
                    <Routes>
                      <Route element={<PublicLayout />}>
                        <Route path="/" element={Capacitor.isNativePlatform() ? <Navigate to="/login" replace /> : <LandingPage />} />
                        <Route path="/success" element={<SuccessPage />} />
                        <Route path="/courses" element={<CoursesPage />} />
                        <Route path="/courses/:slug" element={<CourseDetailPage />} />

                        {/* Dynamic Services Route */}
                        <Route path="/services/:categorySlug" element={<ServicesPage />} />

                        {/* Legacy Routes (Mapped to new component in ServicesPage) */}
                        <Route path="/readings" element={<ServicesPage categorySlug="reading" />} />
                        <Route path="/healings" element={<ServicesPage categorySlug="healing" />} />

                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/shop/:slug" element={<ProductDetailPage />} />

                        <Route path="/services/:categorySlug" element={<ServicesPage />} />
                        <Route path="/services/book/:serviceId" element={<ServiceDetailPage />} />

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
                          <Route path="learn/:courseId" element={<LearnPage />} /> {/* Internal Course Player */}
                          <Route path="orders" element={<StudentOrders />} />

                          {/* Internal Shop & Services */}
                          <Route path="shop" element={<ShopPage />} />
                          <Route path="shop/:slug" element={<ProductDetailPage />} />
                          <Route path="services/:categorySlug" element={<ServicesPage />} />
                          <Route path="profile" element={<ProfilePage />} />
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
                          <Route path="students-list" element={<AdminStudentDetails />} />
                          <Route path="coupons" element={<AdminCoupons />} />
                          <Route path="courses" element={<AdminCourses />} />
                          <Route path="courses/:courseId/edit" element={<AdminEditCourse />} />
                          <Route path="create-course" element={<CreateCoursePage />} />
                          <Route path="transactions" element={<AdminTransactions />} />
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
                  </Suspense>
                </div>
              </Router>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ConfigProvider>
    </AppBootstrap >
    </HelmetProvider>
  );
}

export default App;
