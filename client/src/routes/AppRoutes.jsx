import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProtectedRoute from './ProtectedRoute';
import AppShell from '../components/layout/AppShell';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AdminDashboard from '../pages/AdminDashboard';
import ParentDashboard from '../pages/ParentDashboard';
import StaffDashboard from '../pages/StaffDashboard';
import StaffScanner from '../pages/StaffScanner';
import PlaceholderPage from '../pages/PlaceholderPage';
import StudentsList from '../pages/admin/Students/StudentsList';
import StudentForm from '../pages/admin/Students/StudentForm';
import StudentDetails from '../pages/admin/Students/StudentDetails';
import FaceRegistration from '../pages/admin/Students/FaceRegistration';
import ParentsList from '../pages/admin/Parents/ParentsList';
import ParentForm from '../pages/admin/Parents/ParentForm';
import ParentDetails from '../pages/admin/Parents/ParentDetails';
import StaffList from '../pages/admin/Staff/StaffList';
import StaffForm from '../pages/admin/Staff/StaffForm';
import StaffDetails from '../pages/admin/Staff/StaffDetails';
import BusList from '../pages/admin/Buses/BusList';
import BusForm from '../pages/admin/Buses/BusForm';
import BusDetails from '../pages/admin/Buses/BusDetails';
import RouteList from '../pages/admin/Routes/RouteList';
import RouteForm from '../pages/admin/Routes/RouteForm';
import RouteDetails from '../pages/admin/Routes/RouteDetails';
import AttendanceList from '../pages/admin/Attendance/AttendanceList';
import ComplaintList from '../pages/admin/Complaints/ComplaintList';
import ComplaintDetails from '../pages/admin/Complaints/ComplaintDetails';
import NotificationList from '../pages/admin/Notifications/NotificationList';
import Reports from '../pages/admin/Reports/Reports';
import Settings from '../pages/admin/Settings/Settings';
const AppRoutes = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to={`/${user?.role}/dashboard`} replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to={`/${user?.role}/dashboard`} replace /> : <Register />} 
      />

      {/* Protected Layout wrapped routes */}
      <Route element={<AppShell />}>
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<StudentsList />} />
          <Route path="/admin/students/create" element={<StudentForm />} />
          <Route path="/admin/students/:id" element={<StudentDetails />} />
          <Route path="/admin/students/:id/edit" element={<StudentForm />} />
          <Route path="/admin/students/:id/face-registration" element={<FaceRegistration />} />
          <Route path="/admin/parents" element={<ParentsList />} />
          <Route path="/admin/parents/create" element={<ParentForm />} />
          <Route path="/admin/parents/:id" element={<ParentDetails />} />
          <Route path="/admin/parents/:id/edit" element={<ParentForm />} />
          <Route path="/admin/staff" element={<StaffList />} />
          <Route path="/admin/staff/create" element={<StaffForm />} />
          <Route path="/admin/staff/:id" element={<StaffDetails />} />
          <Route path="/admin/staff/:id/edit" element={<StaffForm />} />
          <Route path="/admin/buses" element={<BusList />} />
          <Route path="/admin/buses/create" element={<BusForm />} />
          <Route path="/admin/buses/:id" element={<BusDetails />} />
          <Route path="/admin/buses/:id/edit" element={<BusForm />} />
          <Route path="/admin/routes" element={<RouteList />} />
          <Route path="/admin/routes/create" element={<RouteForm />} />
          <Route path="/admin/routes/:id" element={<RouteDetails />} />
          <Route path="/admin/routes/:id/edit" element={<RouteForm />} />
          <Route path="/admin/attendance" element={<AttendanceList />} />
          <Route path="/admin/complaints" element={<ComplaintList />} />
          <Route path="/admin/complaints/:id" element={<ComplaintDetails />} />
          <Route path="/admin/notifications" element={<NotificationList />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>

        {/* Parent Routes */}
        <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
        </Route>

        {/* Staff Routes */}
        <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/scanner" element={<StaffScanner />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route 
        path="*" 
        element={<Navigate to={isAuthenticated ? `/${user?.role}/dashboard` : "/login"} replace />} 
      />
    </Routes>
  );
};

export default AppRoutes;
