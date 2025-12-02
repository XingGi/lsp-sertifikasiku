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
import AssessmentStudio from "./features/risk-ai/AssessmentStudio";
import AssessmentListPage from "./features/risk-ai/AssessmentListPage";
import AssessmentDetailPage from "./features/risk-ai/AssessmentDetailPage";
import RiskRegisterPage from "./features/risk-ai/RiskRegisterPage";
import RSCAPage from "./features/addons/rsca/RSCAPage";
import RscaQuestionnaireForm from "./features/addons/rsca/RscaQuestionnaireForm";
import BPRPage from "./features/addons/bpr/BPRPage";
import BPRDesignerPage from "./features/addons/bpr/BPRDesignerPage";
import BIAPage from "./features/bia/BIAPage";
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
import RscaAdminPage from "./features/admin/RscaAdminPage";
import DepartmentAdminPage from "./features/admin/DepartmentAdminPage";
import RscaResultPage from "./features/admin/RscaResultPage";
import ActionPlanMonitorPage from "./features/admin/ActionPlanMonitorPage";
import HorizonScannerPage from "./features/addons/horizon/HorizonScannerPage";
import UnderConstructionPage from "./components/common/UnderConstructionPage";
import QrcAssessmentListPage from "./features/qrc/QrcAssessmentListPage";
import QrcWizardPage from "./features/qrc/QrcWizardPage";
import QrcEssayWizardPage from "./features/qrc/QrcEssayWizardPage";
import QrcConsultantDashboard from "./features/qrc/QrcConsultantDashboard";
import QrcReviewWorkspace from "./features/qrc/QrcReviewWorkspace";
import QrcTemplatePage from "./features/qrc/QrcTemplatePage";
import ApiKeySettingPage from "./features/account/ApiKeySettingPage";
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
        {/* Rute Terlindungi */}
        <Route element={<ProtectedRoute />}>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route element={<Layout />}>
            {/* Dashboard: Hanya perlu login */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/account-setting" element={<AccountSettingPage />} />
            <Route path="/password-setting" element={<PasswordSettingPage />} />
            <Route element={<ProtectedRoute requiredPermission="create_risk_assessment_ai" />}>
              <Route path="/risk-ai/assessment-studio" element={<AssessmentStudio />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="view_risk_assessment_ai" />}>
              <Route path="/risk-ai/assessments" element={<AssessmentListPage />} />
              <Route path="/risk-ai/assessments/:assessmentId" element={<AssessmentDetailPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="view_risk_register_main" />}>
              <Route path="/risk-ai/risk-register" element={<RiskRegisterPage />} />
            </Route>
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

            <Route element={<ProtectedRoute requiredPermission="view_rsca" />}>
              <Route path="/addons/rsca" element={<RSCAPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="submit_rsca" />}>
              <Route path="/addons/rsca/cycle/:cycleId" element={<RscaQuestionnaireForm />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="view_bpr" />}>
              <Route path="/addons/bpr" element={<BPRPage />} />
              <Route path="/addons/bpr/:docId" element={<BPRDesignerPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="view_bia" />}>
              <Route
                path="/addons/bia"
                element={<UnderConstructionPage title="Business Impact Analysis" description="Analisis dampak bisnis mendalam untuk mengidentifikasi proses kritis dan waktu pemulihan (RTO/RPO)." icon={FiActivity} />}
              />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="view_horizon_scanner" />}>
              <Route path="/addons/horizon-scanner" element={<HorizonScannerPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="view_cba_calculator" />}>
              <Route path="/addons/cba" element={<UnderConstructionPage title="CBA Calculator" description="Kalkulator Cost-Benefit Analysis untuk menghitung ROI dari setiap mitigasi risiko yang Anda ajukan." icon={FiPieChart} />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="view_monte_carlo" />}>
              <Route path="/addons/monte-carlo" element={<UnderConstructionPage title="Monte Carlo Simulator" description="Simulasi probabilistik tingkat lanjut untuk memprediksi berbagai skenario risiko di masa depan." icon={FiCpu} />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="submit_qrc_assessment" />}>
              <Route path="/qrc/assessments" element={<QrcAssessmentListPage />} />
              <Route path="/qrc/assessment/new" element={<QrcWizardPage />} />
              <Route path="/qrc/assessment/new-essay" element={<QrcEssayWizardPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="review_qrc_assessment" />}>
              <Route path="/qrc/consultant" element={<QrcConsultantDashboard />} />
              <Route path="/qrc/consultant/review/:id" element={<QrcReviewWorkspace />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="manage_qrc_templates" />}>
              <Route path="/qrc/templates" element={<QrcTemplatePage />} />
            </Route>

            {/* Admin (semua route di dalamnya butuh role admin atau permission spesifik) */}
            <Route element={<ProtectedRoute requiredPermission="view_admin_area" />}>
              <Route path="/admin/master-data" element={<MasterDataPage />} />
              <Route path="/admin/regulations" element={<RegulationPage />} />
              <Route path="/admin/roles" element={<RolePermissionPage />} />
              <Route path="/admin/members" element={<MemberPage />} />
              <Route path="/admin/departments" element={<DepartmentAdminPage />} />
              <Route path="/admin/rsca" element={<RscaAdminPage />} />
              <Route path="/admin/rsca/results/:cycleId" element={<RscaResultPage />} />
              <Route path="/admin/mitigation-monitor" element={<ActionPlanMonitorPage />} />
              <Route path="/account/api-key" element={<ApiKeySettingPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
