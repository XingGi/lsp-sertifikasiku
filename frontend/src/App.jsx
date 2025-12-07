// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --- PERUBAHAN: Mengimpor komponen dari lokasi baru ---
import Layout from "./components/common/Layout";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/common/ProtectedRoute";
import UnauthorizedPage from "./components/common/UnauthorizedPage";

// --- PERUBAHAN: Mengimpor semua halaman dari folder /features ---
import LandingPage from "./features/landing/LandingPage";
import Dashboard from "./features/dashboard/Dashboard";
import BasicAssessmentListPage from "./features/risk-management/basic/BasicAssessmentListPage";
import BasicAssessmentFormPage from "./features/risk-management/basic/BasicAssessmentFormPage";
import TemplateListPage from "./features/risk-management/templates/TemplateListPage";
import TemplateEditorPage from "./features/risk-management/templates/TemplateEditorPage";
import MasterDataPage from "./features/admin/MasterDataPage";
import RegulationPage from "./features/admin/RegulationPage";
import MadyaAssessmentListPage from "./features/risk-management/madya/MadyaAssessmentListPage";
import MadyaAssessmentFormPage from "./features/risk-management/madya/MadyaAssessmentFormPage";
import RolePermissionPage from "./features/admin/RolePermissionPage";
import MemberPage from "./features/admin/MemberPage";
import AccountSettingPage from "./features/account/AccountSettingPage";
import PasswordSettingPage from "./features/account/PasswordSettingPage";
import DepartmentAdminPage from "./features/admin/DepartmentAdminPage";
import UnderConstructionPage from "./components/common/UnderConstructionPage";
import UjiKompetensiListPage from "./features/uji-kompetensi/UjiKompetensiListPage";
import UjiKompetensiStudioPage from "./features/uji-kompetensi/UjiKompetensiStudioPage";
import MasterUnitPage from "./features/admin/competency/MasterUnitPage";
import MasterSchemePage from "./features/admin/competency/MasterSchemePage";
import ApiKeySettingPage from "./features/account/ApiKeySettingPage";
import AssessmentMonitoringPage from "./features/admin/monitoring/AssessmentMonitoringPage";
import MasterSchemeFormPage from "./features/admin/competency/MasterSchemeFormPage";
import { FiActivity, FiCpu, FiPieChart } from "react-icons/fi";
import { Title, Text } from "@tremor/react";
const PlaceholderComponent = ({ title }) => (
  <div className="p-10">
    <Title>{title}</Title>
    <Text>Halaman ini sedang dalam pengembangan.</Text>
  </div>
);

function App() {
  return (
    <Router>
      <Toaster position="bottom-right" richColors />
      <Routes>
        {/* Rute Publik */}
        <Route path="/" element={<LandingPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route element={<Layout />}>
            {/* Dashboard: Hanya perlu login */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/account-setting" element={<AccountSettingPage />} />
            <Route path="/password-setting" element={<PasswordSettingPage />} />
            <Route element={<ProtectedRoute requiredPermission="view_risk_dasar" />}>
              <Route path="/risk-management/dasar" element={<BasicAssessmentListPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="manage_risk_dasar" />}>
              <Route path="/risk-management/dasar/new" element={<BasicAssessmentFormPage />} />
              <Route path="/risk-management/dasar/edit/:assessmentId" element={<BasicAssessmentFormPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="view_risk_madya" />}>
              <Route path="/risk-management/madya" element={<MadyaAssessmentListPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="manage_risk_madya" />}>
              <Route path="/risk-management/madya/form/:assessmentId" element={<MadyaAssessmentFormPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="view_risk_templates" />}>
              <Route path="/risk-management/templates" element={<TemplateListPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="manage_risk_templates" />}>
              <Route path="/risk-management/templates/new" element={<TemplateEditorPage />} />
              <Route path="/risk-management/templates/edit/:templateId" element={<TemplateEditorPage />} />
            </Route>
            {/* Route UjiKompetensi */}
            <Route path="/uji-kompetensi" element={<UjiKompetensiListPage />} />
            <Route path="/uji-kompetensi/studio/:id" element={<UjiKompetensiStudioPage />} />

            {/* Admin (semua route di dalamnya butuh role admin atau permission spesifik) */}
            <Route element={<ProtectedRoute requiredPermission="view_admin_area" />}>
              <Route path="/admin/master-data" element={<MasterDataPage />} />
              <Route path="/admin/regulations" element={<RegulationPage />} />
              <Route path="/admin/roles" element={<RolePermissionPage />} />
              <Route path="/admin/members" element={<MemberPage />} />
              <Route path="/admin/departments" element={<DepartmentAdminPage />} />
              <Route path="/account/api-key" element={<ApiKeySettingPage />} />
              <Route path="/admin/master-units" element={<MasterUnitPage />} />
              <Route path="/admin/master-schemes" element={<MasterSchemePage />} />
              <Route path="/admin/monitoring" element={<AssessmentMonitoringPage />} />
              <Route path="/admin/master-schemes/new" element={<MasterSchemeFormPage />} />
              <Route path="/admin/master-schemes/edit/:id" element={<MasterSchemeFormPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
