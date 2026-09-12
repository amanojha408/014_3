"""
Outcome 5: Prescriptive Safety Interventions Engine
Decision-support layer suggesting high-ROI engineering and infrastructure interventions.
Explicitly mapped to MoRTH Specifications and Indian Roads Congress (IRC) Codes.
"""

from typing import List, Dict, Any
from backend.app.schemas.api_models import PrescriptiveResponse, PrescriptiveIntervention
from backend.app.services.corridor_data import get_corridor_by_id
from backend.app.models.risk_engine import risk_engine

class PrescriptiveEngine:
    """
    Prescribes MoRTH and IRC-standardized interventions based on localized hazard factors.
    """
    def generate_recommendations(self, segment_id: str) -> PrescriptiveResponse:
        corridor = get_corridor_by_id(segment_id)
        current_eval = risk_engine.predict_risk(corridor)
        current_score = current_eval.normalized_risk_score

        interventions: List[PrescriptiveIntervention] = []

        # 1. Lighting deficiency intervention
        if float(corridor.get("lighting_index", 50)) < 45.0:
            interventions.append(PrescriptiveIntervention(
                intervention_id=f"INT-{segment_id}-01",
                title="Smart Solar LED High-Mast Illumination Grid",
                category="Illumination & Visibility",
                morth_irc_code="MoRTH Cl 808 & IS:1944 (Code of Practice for Lighting of Public Thoroughfare)",
                description="Install 30m high-mast smart LED luminaires with dusk-to-dawn automated dimming at junction approach.",
                estimated_capex_lakhs=18.5,
                projected_risk_reduction_pct=18.4,
                payback_months=8.2,
                priority="Critical"
            ))

        # 2. Road surface / pothole intervention
        if float(corridor.get("surface_quality_index", 60)) < 55.0:
            interventions.append(PrescriptiveIntervention(
                intervention_id=f"INT-{segment_id}-02",
                title="Stone Matrix Asphalt (SMA) High-Friction Resurfacing",
                category="Pavement Engineering",
                morth_irc_code="MoRTH Section 500 & IRC:SP:79 (Specification for Stone Matrix Asphalt)",
                description="Milling and overlaying with 40mm SMA to eliminate pothole cratering, improve texture depth, and restore skid resistance (BPN > 55).",
                estimated_capex_lakhs=38.0,
                projected_risk_reduction_pct=31.5,
                payback_months=11.5,
                priority="Critical"
            ))

        # 3. Curvature / Mountain Ghat intervention
        if float(corridor.get("curvature_index", 30)) > 60.0:
            interventions.append(PrescriptiveIntervention(
                intervention_id=f"INT-{segment_id}-03",
                title="W-Beam Metal Crash Barrier & Chevron Delineation",
                category="Roadside Safety Barrier",
                morth_irc_code="MoRTH Cl 811 & IRC:SP:84 (Design and Installation of Metal Beam Crash Barrier)",
                description="Erect continuous galvanised steel W-beam containment barrier (Containment Level H1) and fluorescent yellow-green chevron boards.",
                estimated_capex_lakhs=24.0,
                projected_risk_reduction_pct=26.8,
                payback_months=6.4,
                priority="Critical"
            ))

        # 4. Signage & Marking deficiency
        if float(corridor.get("signage_visibility", 60)) < 60.0:
            interventions.append(PrescriptiveIntervention(
                intervention_id=f"INT-{segment_id}-04",
                title="Type XI Microprismatic Retroreflective Gantry Signage",
                category="Traffic Signs & Markings",
                morth_irc_code="IRC:67-2022 (Code of Practice for Road Signs) & IRC:35-2015 (Road Markings)",
                description="Install cantilever overhead advance direction gantries using Class C retroreflective sheeting and hot-applied thermoplastic edge delineation with glass beads.",
                estimated_capex_lakhs=8.5,
                projected_risk_reduction_pct=14.2,
                payback_months=4.1,
                priority="High"
            ))

        # 5. Speed calming & Rumble Strips
        if float(corridor.get("speed_limit_kmh", 80)) >= 70:
            interventions.append(PrescriptiveIntervention(
                intervention_id=f"INT-{segment_id}-05",
                title="Transverse Thermoplastic Rumble Strips & Radar Speed Display",
                category="Speed Management",
                morth_irc_code="IRC:SP:88-2019 (Road Safety Audit) & IRC:99 (Traffic Calming in Urban and Rural Stretches)",
                description="Install a sequence of 6 sets of 15mm high thermoplastic rumble bars with solar radar driver feedback signage 150m upstream of hazard.",
                estimated_capex_lakhs=6.2,
                projected_risk_reduction_pct=11.0,
                payback_months=3.2,
                priority="Moderate"
            ))

        total_budget = round(sum(i.estimated_capex_lakhs for i in interventions), 1)
        # Diminishing marginal returns formula for composite risk reduction
        comp_reduction = 0.0
        remaining_risk = 1.0
        for i in interventions:
            remaining_risk *= (1.0 - (i.projected_risk_reduction_pct / 100.0))
        aggregate_reduction = round((1.0 - remaining_risk) * 100.0, 1)

        return PrescriptiveResponse(
            segment_id=segment_id,
            location_name=corridor.get("location_name", "Corridor"),
            current_risk_score=current_score,
            interventions=interventions,
            total_budget_lakhs=total_budget,
            aggregate_risk_reduction_pct=aggregate_reduction
        )

# Global Singleton Instance
prescriptive_engine = PrescriptiveEngine()
