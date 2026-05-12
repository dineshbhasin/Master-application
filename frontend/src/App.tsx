import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Shared pages
import Login from './shared/pages/Login';
import Register from './shared/pages/Register';
import Dashboard from './shared/pages/Dashboard';

// Citizen module
import { VehicleIntel, FASTag } from './modules/citizen';

// SME module
import { Compliance, EXIM, Identity } from './modules/sme';

// Enterprise module
import { MultiModalTracking, RoutePlanner } from './modules/enterprise';

// Official module
import { ActivityLog } from './modules/official';

// Super Admin module
import {
  Overview, Analytics, NodeHealth, Organizations, UserManagement,
  AuditTrail, DPDPRequests, ApiKeys, TwoFactorSetup, SuperAdminLayout,
} from './modules/superadmin';

// Admin module (official + super_admin)
import { AdminUsers, AdminActivity } from './modules/admin';

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={['super_admin']}>
      <SuperAdminLayout>{children}</SuperAdminLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/"         element={<Navigate to="/dashboard" replace />} />

          {/* Protected — all roles */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout><Dashboard /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Citizen module — all roles */}
          <Route path="/dashboard/vehicle" element={
            <ProtectedRoute>
              <DashboardLayout><VehicleIntel /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/fastag" element={
            <ProtectedRoute>
              <DashboardLayout><FASTag /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* SME module — sme, enterprise, official */}
          <Route path="/dashboard/compliance" element={
            <ProtectedRoute roles={['sme', 'enterprise', 'official']}>
              <DashboardLayout><Compliance /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/exim" element={
            <ProtectedRoute roles={['sme', 'enterprise', 'official']}>
              <DashboardLayout><EXIM /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/identity" element={
            <ProtectedRoute roles={['sme', 'enterprise', 'official']}>
              <DashboardLayout><Identity /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Enterprise module — enterprise, official */}
          <Route path="/dashboard/tracking" element={
            <ProtectedRoute roles={['enterprise', 'official']}>
              <DashboardLayout><MultiModalTracking /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard/routes" element={
            <ProtectedRoute roles={['enterprise', 'official']}>
              <DashboardLayout><RoutePlanner /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Official module — official only */}
          <Route path="/dashboard/activity" element={
            <ProtectedRoute roles={['official']}>
              <DashboardLayout><ActivityLog /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Admin section — official and super_admin */}
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['official', 'super_admin']}>
              <DashboardLayout><AdminUsers /></DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/activity" element={
            <ProtectedRoute roles={['official', 'super_admin']}>
              <DashboardLayout><AdminActivity /></DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Super Admin — 2FA setup gate, then full console */}
          <Route path="/super-admin/2fa" element={
            <ProtectedRoute roles={['super_admin']}>
              <TwoFactorSetup />
            </ProtectedRoute>
          } />
          <Route path="/super-admin/overview"      element={<SuperAdminRoute><Overview /></SuperAdminRoute>} />
          <Route path="/super-admin/analytics"     element={<SuperAdminRoute><Analytics /></SuperAdminRoute>} />
          <Route path="/super-admin/node-health"   element={<SuperAdminRoute><NodeHealth /></SuperAdminRoute>} />
          <Route path="/super-admin/organizations" element={<SuperAdminRoute><Organizations /></SuperAdminRoute>} />
          <Route path="/super-admin/users"         element={<SuperAdminRoute><UserManagement /></SuperAdminRoute>} />
          <Route path="/super-admin/audit-trail"   element={<SuperAdminRoute><AuditTrail /></SuperAdminRoute>} />
          <Route path="/super-admin/dpdp"          element={<SuperAdminRoute><DPDPRequests /></SuperAdminRoute>} />
          <Route path="/super-admin/api-keys"      element={<SuperAdminRoute><ApiKeys /></SuperAdminRoute>} />
          <Route path="/super-admin"               element={<Navigate to="/super-admin/overview" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
