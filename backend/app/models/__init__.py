# backend/app/models/__init__.py

# Import semua model dari file-file terpisah
from .user import User, Role, Permission, Department, user_roles, role_permissions

from .master import (
    MasterData, Regulation
)
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

from .competency_master import CompetencyUnit, CertificationScheme
from .competency import CompetencyTest

# Pastikan 'db' tersedia jika ada file lain yang mengimportnya dari sini (opsional tapi aman)
from app import db