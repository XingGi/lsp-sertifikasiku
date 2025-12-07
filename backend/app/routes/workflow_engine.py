# backend/app/routes/workflow_engine.py
from flask import request, jsonify, Blueprint
from app.models import db, CompetencyTest, WorkflowTask, UjiKompProgress, WorkflowStage, WorkflowTemplate
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

workflow_engine_bp = Blueprint('workflow_engine_bp', __name__)

# ============================================================================
# 1. GET CONTEXT: "Saya lagi di mana? Apa yang harus saya kerjakan?"
# ============================================================================
@workflow_engine_bp.route('/competency-tests/<int:test_id>/context', methods=['GET'])
@jwt_required()
def get_test_context(test_id):
    test = CompetencyTest.query.get_or_404(test_id)
    
    # Validasi: Test harus punya template workflow
    if not test.workflow_template_id:
        return jsonify({"msg": "Workflow belum diset untuk ujian ini. Hubungi Admin."}), 400

    # --- LOGIC 1: INITIALIZE TASK ---
    # Kalau ini pertama kali buka (current_task masih NULL), set ke Task Pertama
    if not test.current_task:
        first_stage = WorkflowStage.query.filter_by(
            template_id=test.workflow_template_id
        ).order_by(WorkflowStage.order_index.asc()).first()
        
        if first_stage:
            first_task = WorkflowTask.query.filter_by(
                stage_id=first_stage.id
            ).order_by(WorkflowTask.order_index.asc()).first()
            
            if first_task:
                test.current_task_id = first_task.id
                db.session.commit()
                # Refresh object test
                db.session.refresh(test)

    current_task = test.current_task
    
    # Jika masih null juga (artinya template kosong), return error
    if not current_task:
        return jsonify({"msg": "Template workflow kosong/rusak"}), 500

    # --- LOGIC 2: FETCH EXISTING ANSWER ---
    # Cek apakah user udah pernah ngisi/draft di task ini?
    progress = UjiKompProgress.query.filter_by(
        test_id=test.id, 
        task_id=current_task.id
    ).first()

    # --- LOGIC 3: BUILD STEPPER DATA ---
    # Kita butuh list stage buat bikin "Progress Bar" di frontend
    stages = WorkflowStage.query.filter_by(
        template_id=test.workflow_template_id
    ).order_by(WorkflowStage.order_index.asc()).all()
    
    stage_list = []
    for s in stages:
        # Tentukan status visual stage
        is_active = (s.id == current_task.stage_id)
        is_completed = (s.order_index < current_task.stage.order_index)
        tasks = WorkflowTask.query.filter_by(stage_id=s.id).order_by(WorkflowTask.order_index.asc()).all()
        task_list = [{'id': t.id, 'title': t.title} for t in tasks]
        
        stage_list.append({
            "id": s.id,
            "title": s.title,
            "order": s.order_index,
            "is_active": is_active,
            "is_completed": is_completed,
            "tasks": task_list
        })

    return jsonify({
        "test_title": test.title,
        "scheme_name": test.scheme.title if test.scheme else "-",
        "status": test.status, # DRAFT, ONGOING, COMPLETED
        
        "current_task": {
            "id": current_task.id,
            "title": current_task.title,
            "type": current_task.task_type,     # FORM, UPLOAD, INFO
            "config": current_task.content_config, # JSON Schema RJSF / HTML
            "stage_title": current_task.stage.title
        },
        
        "user_response": progress.user_response if progress else None,
        "response_status": progress.status if progress else "NEW",
        
        "stages": stage_list
    }), 200


# ============================================================================
# 2. SUBMIT TASK: "Simpan jawaban & Lanjut ke task berikutnya"
# ============================================================================
@workflow_engine_bp.route('/competency-tests/<int:test_id>/submit-task', methods=['POST'])
@jwt_required()
def submit_task(test_id):
    test = CompetencyTest.query.get_or_404(test_id)
    data = request.get_json()
    
    current_task = test.current_task
    if not current_task:
        return jsonify({"msg": "Error: Task tidak ditemukan"}), 400

    # --- LOGIC 1: SAVE PROGRESS ---
    # Cek record lama atau bikin baru
    progress = UjiKompProgress.query.filter_by(
        test_id=test.id, 
        task_id=current_task.id
    ).first()
    
    if not progress:
        progress = UjiKompProgress(
            test_id=test.id, 
            task_id=current_task.id
        )
    
    # Update data
    progress.user_response = data.get('response') # Raw JSON dari RJSF
    progress.status = 'SUBMITTED'
    progress.submitted_at = datetime.utcnow()
    
    db.session.add(progress)
    
    # --- LOGIC 2: AUTO ADVANCE (Mencari Next Task) ---
    next_task = None
    
    # A. Cari task berikutnya di STAGE YANG SAMA
    next_task_in_stage = WorkflowTask.query.filter(
        WorkflowTask.stage_id == current_task.stage_id, 
        WorkflowTask.order_index > current_task.order_index
    ).order_by(WorkflowTask.order_index.asc()).first()
    
    if next_task_in_stage:
        next_task = next_task_in_stage
    else:
        # B. Kalau habis, cari STAGE BERIKUTNYA
        next_stage = WorkflowStage.query.filter(
            WorkflowStage.template_id == test.workflow_template_id,
            WorkflowStage.order_index > current_task.stage.order_index
        ).order_by(WorkflowStage.order_index.asc()).first()
        
        if next_stage:
            # Ambil task pertama di stage baru tersebut
            next_task = WorkflowTask.query.filter_by(
                stage_id=next_stage.id
            ).order_by(WorkflowTask.order_index.asc()).first()
    
    # --- LOGIC 3: UPDATE POINTER USER ---
    msg = ""
    if next_task:
        test.current_task_id = next_task.id
        test.status = 'ONGOING'
        msg = "Jawaban tersimpan. Melanjutkan ke tahap berikutnya."
    else:
        # C. Finish Line (Gak ada task lagi)
        test.status = 'COMPLETED'
        # Optional: Set current_task_id ke null atau biarkan di task terakhir
        msg = "Seluruh tahapan asesmen selesai!"

    db.session.commit()
    
    return jsonify({
        "msg": msg, 
        "next_task_id": next_task.id if next_task else None,
        "is_completed": test.status == 'COMPLETED'
    }), 200