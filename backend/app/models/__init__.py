# backend/app/models/__init__.py

# Import semua model dari file-file terpisah
from .user import User, Role, Permission, Department, user_roles, role_permissions
from .master import (
    MasterData, Regulation, HorizonScanEntry, KRI, 
    CriticalAsset, Dependency, ImpactScenario, HorizonScanResult
)
from .rsca import (
    RscaCycle, RscaQuestionnaire, RscaAnswer, SubmittedRisk, ActionPlan,
    rsca_cycle_departments
)
from .risk_assessment import RiskAssessment, RiskRegister, MainRiskRegister
from .basic import (
    BasicAssessment, BasicRiskIdentification, BasicRiskAnalysis, 
    OrganizationalContext, basic_assessment_contexts
)
from .madya import (
    RiskMapTemplate, RiskMapLikelihoodLabel, RiskMapImpactLabel, 
    RiskMapLevelDefinition, RiskMapScore, MadyaAssessment, 
    MadyaCriteriaProbability, MadyaCriteriaImpact, 
    OrganizationalStructureEntry, SasaranOrganisasiKPI, RiskInputMadya
)

from .bpr import BprDocument, BprNode, BprEdge, BprRisk

from .qrc import QrcAssessment, QrcQuestion

# Pastikan 'db' tersedia jika ada file lain yang mengimportnya dari sini (opsional tapi aman)
from app import db