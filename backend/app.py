from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
from functools import wraps
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

jwt = JWTManager(app)

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'placemate',
    'user': 'postgres',
    'password': 'Ichigo_bankai24'
}

def get_db_connection():
    conn = psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
    return conn

# Role-based access decorator
def role_required(roles):
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            current_user_id = get_jwt_identity()
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT user_type FROM users WHERE id = %s", (current_user_id,))
            user = cur.fetchone()
            cur.close()
            conn.close()
            
            if user and user['user_type'] in roles:
                return fn(*args, **kwargs)
            return jsonify({'error': 'Unauthorized access'}), 403
        return wrapper
    return decorator

# ==================== AUTHENTICATION ROUTES ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('user_type')
    
    if not all([email, password, user_type]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if user_type not in ['student', 'recruiter', 'admin', 'placement_officer']:
        return jsonify({'error': 'Invalid user type'}), 400
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Check if email exists
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({'error': 'Email already registered'}), 400
        
        password_hash = generate_password_hash(password)
        cur.execute(
            "INSERT INTO users (email, password_hash, user_type) VALUES (%s, %s, %s) RETURNING id",
            (email, password_hash, user_type)
        )
        user_id = cur.fetchone()['id']
        
        # Create profile based on user type
        if user_type == 'student':
            cur.execute(
                "INSERT INTO students (user_id, first_name, last_name) VALUES (%s, %s, %s)",
                (user_id, data.get('first_name', ''), data.get('last_name', ''))
            )
        elif user_type == 'recruiter':
            cur.execute(
                "INSERT INTO companies (user_id, company_name) VALUES (%s, %s)",
                (user_id, data.get('company_name', ''))
            )
        elif user_type == 'placement_officer':
            cur.execute(
                "INSERT INTO placement_officers (user_id, first_name, last_name) VALUES (%s, %s, %s)",
                (user_id, data.get('first_name', ''), data.get('last_name', ''))
            )
        
        conn.commit()
        access_token = create_access_token(identity=user_id)
        
        return jsonify({
            'message': 'Registration successful',
            'access_token': access_token,
            'user_type': user_type
        }), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT id, password_hash, user_type, is_active FROM users WHERE email = %s", (email,))
    user = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not user['is_active']:
        return jsonify({'error': 'Account is deactivated'}), 403
    
    access_token = create_access_token(identity=user['id'])
    
    return jsonify({
        'access_token': access_token,
        'user_type': user['user_type']
    }), 200

# ==================== STUDENT ROUTES ====================

@app.route('/api/student/profile', methods=['GET'])
@role_required(['student'])
def get_student_profile():
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT s.*, u.email 
        FROM students s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.user_id = %s
    """, (user_id,))
    profile = cur.fetchone()
    
    # Get skills
    cur.execute("SELECT * FROM student_skills WHERE student_id = %s", (profile['id'],))
    skills = cur.fetchall()
    
    # Get education
    cur.execute("SELECT * FROM student_education WHERE student_id = %s ORDER BY start_date DESC", (profile['id'],))
    education = cur.fetchall()
    
    # Get experience
    cur.execute("SELECT * FROM student_experience WHERE student_id = %s ORDER BY start_date DESC", (profile['id'],))
    experience = cur.fetchall()
    
    # Get projects
    cur.execute("SELECT * FROM student_projects WHERE student_id = %s ORDER BY start_date DESC", (profile['id'],))
    projects = cur.fetchall()
    
    # Get certifications
    cur.execute("SELECT * FROM student_certifications WHERE student_id = %s ORDER BY issue_date DESC", (profile['id'],))
    certifications = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify({
        'profile': dict(profile),
        'skills': [dict(s) for s in skills],
        'education': [dict(e) for e in education],
        'experience': [dict(e) for e in experience],
        'projects': [dict(p) for p in projects],
        'certifications': [dict(c) for c in certifications]
    }), 200

@app.route('/api/student/profile', methods=['PUT'])
@role_required(['student'])
def update_student_profile():
    user_id = get_jwt_identity()
    data = request.json
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Get student id
        cur.execute("SELECT id FROM students WHERE user_id = %s", (user_id,))
        student = cur.fetchone()
        
        # Update profile
        update_fields = []
        values = []
        
        allowed_fields = ['first_name', 'last_name', 'phone', 'date_of_birth', 'gender', 
                         'roll_number', 'department', 'graduation_year', 'current_cgpa',
                         'tenth_percentage', 'twelfth_percentage', 'address', 'city', 'state',
                         'linkedin_url', 'github_url', 'portfolio_url', 'resume_url', 'about_me']
        
        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                values.append(data[field])
        
        if update_fields:
            values.append(student['id'])
            query = f"UPDATE students SET {', '.join(update_fields)} WHERE id = %s"
            cur.execute(query, values)
        
        conn.commit()
        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/student/skills', methods=['POST'])
@role_required(['student'])
def add_student_skill():
    user_id = get_jwt_identity()
    data = request.json
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id FROM students WHERE user_id = %s", (user_id,))
        student = cur.fetchone()
        
        cur.execute(
            "INSERT INTO student_skills (student_id, skill_name, proficiency_level) VALUES (%s, %s, %s) RETURNING id",
            (student['id'], data['skill_name'], data.get('proficiency_level', 'Intermediate'))
        )
        skill_id = cur.fetchone()['id']
        conn.commit()
        
        return jsonify({'message': 'Skill added', 'id': skill_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/student/skills/<int:skill_id>', methods=['DELETE'])
@role_required(['student'])
def delete_student_skill(skill_id):
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id FROM students WHERE user_id = %s", (user_id,))
        student = cur.fetchone()
        
        cur.execute("DELETE FROM student_skills WHERE id = %s AND student_id = %s", (skill_id, student['id']))
        conn.commit()
        
        return jsonify({'message': 'Skill deleted'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/jobs/search', methods=['GET'])
@jwt_required()
def search_jobs():
    search = request.args.get('search', '')
    job_type = request.args.get('job_type', '')
    location = request.args.get('location', '')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    offset = (page - 1) * limit
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    query = """
        SELECT j.*, c.company_name, c.company_logo 
        FROM jobs j 
        JOIN companies c ON j.company_id = c.id 
        WHERE j.status = 'active'
    """
    params = []
    
    if search:
        query += " AND (j.job_title ILIKE %s OR j.job_description ILIKE %s OR j.required_skills ILIKE %s)"
        search_pattern = f'%{search}%'
        params.extend([search_pattern, search_pattern, search_pattern])
    
    if job_type:
        query += " AND j.job_type = %s"
        params.append(job_type)
    
    if location:
        query += " AND j.location ILIKE %s"
        params.append(f'%{location}%')
    
    query += " ORDER BY j.created_at DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])
    
    cur.execute(query, params)
    jobs = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify({'jobs': [dict(j) for j in jobs]}), 200

@app.route('/api/jobs/<int:job_id>', methods=['GET'])
@jwt_required()
def get_job_detail(job_id):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT j.*, c.company_name, c.company_logo, c.website, c.description as company_description
        FROM jobs j 
        JOIN companies c ON j.company_id = c.id 
        WHERE j.id = %s
    """, (job_id,))
    job = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    return jsonify({'job': dict(job)}), 200

@app.route('/api/applications/apply', methods=['POST'])
@role_required(['student'])
def apply_for_job():
    user_id = get_jwt_identity()
    data = request.json
    job_id = data.get('job_id')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Get student id
        cur.execute("SELECT id, resume_url FROM students WHERE user_id = %s", (user_id,))
        student = cur.fetchone()
        
        # Check if already applied
        cur.execute("SELECT id FROM applications WHERE job_id = %s AND student_id = %s", (job_id, student['id']))
        if cur.fetchone():
            return jsonify({'error': 'Already applied to this job'}), 400
        
        cur.execute("""
            INSERT INTO applications (job_id, student_id, cover_letter, resume_url, status)
            VALUES (%s, %s, %s, %s, 'applied') RETURNING id
        """, (job_id, student['id'], data.get('cover_letter', ''), data.get('resume_url', student['resume_url'])))
        
        application_id = cur.fetchone()['id']
        conn.commit()
        
        # Create notification for recruiter
        cur.execute("SELECT company_id FROM jobs WHERE id = %s", (job_id,))
        job = cur.fetchone()
        
        cur.execute("SELECT user_id FROM companies WHERE id = %s", (job['company_id'],))
        company = cur.fetchone()
        
        cur.execute("""
            INSERT INTO notifications (user_id, title, message, notification_type)
            VALUES (%s, %s, %s, %s)
        """, (company['user_id'], 'New Application Received', 
              f'New application for your job posting', 'application'))
        
        conn.commit()
        
        return jsonify({'message': 'Application submitted successfully', 'application_id': application_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/applications/my-applications', methods=['GET'])
@role_required(['student'])
def get_my_applications():
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT id FROM students WHERE user_id = %s", (user_id,))
    student = cur.fetchone()
    
    cur.execute("""
        SELECT a.*, j.job_title, j.location, j.job_type, 
               c.company_name, c.company_logo
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        WHERE a.student_id = %s
        ORDER BY a.applied_at DESC
    """, (student['id'],))
    
    applications = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify({'applications': [dict(a) for a in applications]}), 200

# ==================== AI/ML ROUTES ====================

@app.route('/api/ai/resume-analysis', methods=['POST'])
@role_required(['student'])
def analyze_resume():
    user_id = get_jwt_identity()
    data = request.json
    resume_text = data.get('resume_text', '')
    job_description = data.get('job_description', '')
    job_id = data.get('job_id')
    
    if not resume_text or not job_description:
        return jsonify({'error': 'Resume text and job description required'}), 400
    
    # Simple ATS score calculation using TF-IDF
    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([resume_text, job_description])
    similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
    ats_score = round(similarity * 100, 2)
    
    # Extract keywords from job description
    jd_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', job_description.lower()))
    resume_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', resume_text.lower()))
    
    matched_skills = list(jd_words.intersection(resume_words))
    missing_skills = list(jd_words.difference(resume_words))
    
    suggestions = []
    if ats_score < 70:
        suggestions.append("Include more keywords from the job description")
    if len(missing_skills) > 10:
        suggestions.append(f"Add missing skills: {', '.join(missing_skills[:5])}")
    if len(resume_text) < 500:
        suggestions.append("Expand your resume with more details about your experience")
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id FROM students WHERE user_id = %s", (user_id,))
        student = cur.fetchone()
        
        cur.execute("""
            INSERT INTO resume_analysis 
            (student_id, job_id, ats_score, matched_skills, missing_skills, suggestions, keyword_match_percentage)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (student['id'], job_id, ats_score, 
              ', '.join(matched_skills[:20]), ', '.join(missing_skills[:20]),
              '\n'.join(suggestions), ats_score))
        
        conn.commit()
    except Exception as e:
        conn.rollback()
    finally:
        cur.close()
        conn.close()
    
    return jsonify({
        'ats_score': ats_score,
        'matched_skills': matched_skills[:20],
        'missing_skills': missing_skills[:20],
        'suggestions': suggestions,
        'keyword_match_percentage': ats_score
    }), 200

@app.route('/api/ai/job-recommendations', methods=['GET'])
@role_required(['student'])
def get_job_recommendations():
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Get student skills and profile
    cur.execute("SELECT id FROM students WHERE user_id = %s", (user_id,))
    student = cur.fetchone()
    
    cur.execute("SELECT skill_name FROM student_skills WHERE student_id = %s", (student['id'],))
    skills = [s['skill_name'].lower() for s in cur.fetchall()]
    
    # Get all active jobs
    cur.execute("""
        SELECT j.*, c.company_name, c.company_logo
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        WHERE j.status = 'active'
    """)
    jobs = cur.fetchall()
    
    # Simple recommendation: match skills with required skills
    recommendations = []
    for job in jobs:
        job_skills = job['required_skills'].lower() if job['required_skills'] else ''
        match_count = sum(1 for skill in skills if skill in job_skills)
        
        if match_count > 0:
            job_dict = dict(job)
            job_dict['match_score'] = match_count
            recommendations.append(job_dict)
    
    # Sort by match score
    recommendations.sort(key=lambda x: x['match_score'], reverse=True)
    
    cur.close()
    conn.close()
    
    return jsonify({'recommendations': recommendations[:10]}), 200

# ==================== RECRUITER ROUTES ====================

@app.route('/api/recruiter/profile', methods=['GET'])
@role_required(['recruiter'])
def get_recruiter_profile():
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT c.*, u.email 
        FROM companies c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.user_id = %s
    """, (user_id,))
    profile = cur.fetchone()
    
    cur.close()
    conn.close()
    
    return jsonify({'profile': dict(profile)}), 200

@app.route('/api/recruiter/profile', methods=['PUT'])
@role_required(['recruiter'])
def update_recruiter_profile():
    user_id = get_jwt_identity()
    data = request.json
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id FROM companies WHERE user_id = %s", (user_id,))
        company = cur.fetchone()
        
        update_fields = []
        values = []
        
        allowed_fields = ['company_name', 'company_logo', 'industry', 'company_size', 
                         'website', 'description', 'headquarters_location', 
                         'contact_person_name', 'contact_phone', 'linkedin_url']
        
        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                values.append(data[field])
        
        if update_fields:
            values.append(company['id'])
            query = f"UPDATE companies SET {', '.join(update_fields)} WHERE id = %s"
            cur.execute(query, values)
        
        conn.commit()
        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/recruiter/jobs', methods=['POST'])
@role_required(['recruiter'])
def create_job():
    user_id = get_jwt_identity()
    data = request.json
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id FROM companies WHERE user_id = %s", (user_id,))
        company = cur.fetchone()
        
        cur.execute("""
            INSERT INTO jobs (
                company_id, job_title, job_description, job_type, location, 
                is_remote, salary_min, salary_max, experience_required,
                required_skills, preferred_skills, qualifications, 
                responsibilities, benefits, application_deadline, vacancies, status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            company['id'], data['job_title'], data['job_description'],
            data.get('job_type', 'Full-time'), data.get('location', ''),
            data.get('is_remote', False), data.get('salary_min'), data.get('salary_max'),
            data.get('experience_required', ''), data.get('required_skills', ''),
            data.get('preferred_skills', ''), data.get('qualifications', ''),
            data.get('responsibilities', ''), data.get('benefits', ''),
            data.get('application_deadline'), data.get('vacancies', 1),
            data.get('status', 'active')
        ))
        
        job_id = cur.fetchone()['id']
        conn.commit()
        
        return jsonify({'message': 'Job posted successfully', 'job_id': job_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/recruiter/jobs', methods=['GET'])
@role_required(['recruiter'])
def get_recruiter_jobs():
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT id FROM companies WHERE user_id = %s", (user_id,))
    company = cur.fetchone()
    
    cur.execute("""
        SELECT j.*, COUNT(a.id) as application_count
        FROM jobs j
        LEFT JOIN applications a ON j.id = a.job_id
        WHERE j.company_id = %s
        GROUP BY j.id
        ORDER BY j.created_at DESC
    """, (company['id'],))
    
    jobs = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify({'jobs': [dict(j) for j in jobs]}), 200

@app.route('/api/recruiter/jobs/<int:job_id>/applications', methods=['GET'])
@role_required(['recruiter'])
def get_job_applications(job_id):
    user_id = get_jwt_identity()
    status_filter = request.args.get('status', '')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Verify job belongs to recruiter
    cur.execute("""
        SELECT j.id FROM jobs j
        JOIN companies c ON j.company_id = c.id
        WHERE j.id = %s AND c.user_id = %s
    """, (job_id, user_id))
    
    if not cur.fetchone():
        return jsonify({'error': 'Unauthorized'}), 403
    
    query = """
        SELECT a.*, s.first_name, s.last_name, s.email as student_email,
               s.phone, s.department, s.current_cgpa, s.graduation_year,
               s.resume_url, s.linkedin_url
        FROM applications a
        JOIN students s ON a.student_id = s.id
        WHERE a.job_id = %s
    """
    params = [job_id]
    
    if status_filter:
        query += " AND a.status = %s"
        params.append(status_filter)
    
    query += " ORDER BY a.applied_at DESC"
    
    cur.execute(query, params)
    applications = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify({'applications': [dict(a) for a in applications]}), 200

@app.route('/api/recruiter/applications/<int:application_id>/status', methods=['PUT'])
@role_required(['recruiter'])
def update_application_status(application_id):
    user_id = get_jwt_identity()
    data = request.json
    new_status = data.get('status')
    
    if new_status not in ['shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'rejected']:
        return jsonify({'error': 'Invalid status'}), 400
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Verify application belongs to recruiter's job
        cur.execute("""
            SELECT a.id, a.student_id FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN companies c ON j.company_id = c.id
            WHERE a.id = %s AND c.user_id = %s
        """, (application_id, user_id))
        
        application = cur.fetchone()
        if not application:
            return jsonify({'error': 'Unauthorized'}), 403
        
        cur.execute("UPDATE applications SET status = %s WHERE id = %s", (new_status, application_id))
        
        # Create notification for student
        cur.execute("SELECT user_id FROM students WHERE id = %s", (application['student_id'],))
        student = cur.fetchone()
        
        cur.execute("""
            INSERT INTO notifications (user_id, title, message, notification_type)
            VALUES (%s, %s, %s, %s)
        """, (student['user_id'], 'Application Status Updated',
              f'Your application status has been updated to: {new_status}', 'application_status'))
        
        conn.commit()
        return jsonify({'message': 'Status updated successfully'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

# ==================== ADMIN & PLACEMENT OFFICER ROUTES ====================

@app.route('/api/admin/dashboard-stats', methods=['GET'])
@role_required(['admin', 'placement_officer'])
def get_dashboard_stats():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Total counts
    cur.execute("SELECT COUNT(*) as count FROM students")
    total_students = cur.fetchone()['count']
    
    cur.execute("SELECT COUNT(*) as count FROM companies WHERE is_verified = true")
    total_companies = cur.fetchone()['count']
    
    cur.execute("SELECT COUNT(*) as count FROM jobs WHERE status = 'active'")
    active_jobs = cur.fetchone()['count']
    
    cur.execute("SELECT COUNT(*) as count FROM applications")
    total_applications = cur.fetchone()['count']
    
    cur.execute("SELECT COUNT(DISTINCT student_id) as count FROM applications WHERE status IN ('offered', 'accepted')")
    placed_students = cur.fetchone()['count']
    
    # Recent applications
    cur.execute("""
        SELECT a.*, j.job_title, c.company_name, s.first_name, s.last_name
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        JOIN students s ON a.student_id = s.id
        ORDER BY a.applied_at DESC
        LIMIT 10
    """)
    recent_applications = cur.fetchall()
    
    # Placement by department
    cur.execute("""
        SELECT s.department, COUNT(DISTINCT a.student_id) as placed_count
        FROM applications a
        JOIN students s ON a.student_id = s.id
        WHERE a.status IN ('offered', 'accepted')
        GROUP BY s.department
    """)
    placement_by_dept = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify({
        'total_students': total_students,
        'total_companies': total_companies,
        'active_jobs': active_jobs,
        'total_applications': total_applications,
        'placed_students': placed_students,
        'placement_percentage': round((placed_students / total_students * 100) if total_students > 0 else 0, 2),
        'recent_applications': [dict(a) for a in recent_applications],
        'placement_by_department': [dict(p) for p in placement_by_dept]
    }), 200

@app.route('/api/admin/students', methods=['GET'])
@role_required(['admin', 'placement_officer'])
def get_all_students():
    conn = get_db_connection()
    cur = conn.cursor()
    
    search = request.args.get('search', '')
    department = request.args.get('department', '')
    
    query = """
        SELECT s.*, u.email,
               COUNT(DISTINCT a.id) as total_applications,
               COUNT(DISTINCT CASE WHEN a.status IN ('offered', 'accepted') THEN a.id END) as offers_received
        FROM students s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN applications a ON s.id = a.student_id
        WHERE 1=1
    """
    params = []
    
    if search:
        query += " AND (s.first_name ILIKE %s OR s.last_name ILIKE %s OR s.roll_number ILIKE %s)"
        search_pattern = f'%{search}%'
        params.extend([search_pattern, search_pattern, search_pattern])
    
    if department:
        query += " AND s.department = %s"
        params.append(department)
    
    query += " GROUP BY s.id, u.email ORDER BY s.id DESC"
    
    cur.execute(query, params)
    students = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify({'students': [dict(s) for s in students]}), 200

@app.route('/api/admin/companies', methods=['GET'])
@role_required(['admin', 'placement_officer'])
def get_all_companies():
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT c.*, u.email,
               COUNT(DISTINCT j.id) as total_jobs,
               COUNT(DISTINCT a.id) as total_applications
        FROM companies c
        JOIN users u ON c.user_id = u.id
        LEFT JOIN jobs j ON c.id = j.company_id
        LEFT JOIN applications a ON j.id = a.job_id
        GROUP BY c.id, u.email
        ORDER BY c.created_at DESC
    """)
    
    companies = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify({'companies': [dict(c) for c in companies]}), 200

@app.route('/api/admin/companies/<int:company_id>/verify', methods=['PUT'])
@role_required(['admin'])
def verify_company(company_id):
    data = request.json
    is_verified = data.get('is_verified', True)
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("UPDATE companies SET is_verified = %s WHERE id = %s", (is_verified, company_id))
        conn.commit()
        
        return jsonify({'message': 'Company verification status updated'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/admin/reports/placement', methods=['GET'])
@role_required(['admin', 'placement_officer'])
def get_placement_report():
    year = request.args.get('year', datetime.now().year)
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Overall stats
    cur.execute("""
        SELECT 
            COUNT(DISTINCT s.id) as total_students,
            COUNT(DISTINCT CASE WHEN a.status IN ('offered', 'accepted') THEN s.id END) as placed_students,
            AVG(CASE WHEN a.status IN ('offered', 'accepted') AND j.salary_min IS NOT NULL 
                THEN (j.salary_min + COALESCE(j.salary_max, j.salary_min)) / 2 END) as avg_package,
            MAX(CASE WHEN a.status IN ('offered', 'accepted') THEN j.salary_max END) as highest_package,
            MIN(CASE WHEN a.status IN ('offered', 'accepted') THEN j.salary_min END) as lowest_package
        FROM students s
        LEFT JOIN applications a ON s.id = a.student_id
        LEFT JOIN jobs j ON a.job_id = j.id
        WHERE s.graduation_year = %s
    """, (year,))
    
    stats = cur.fetchone()
    
    # Department-wise placement
    cur.execute("""
        SELECT 
            s.department,
            COUNT(DISTINCT s.id) as total_students,
            COUNT(DISTINCT CASE WHEN a.status IN ('offered', 'accepted') THEN s.id END) as placed_students
        FROM students s
        LEFT JOIN applications a ON s.id = a.student_id
        WHERE s.graduation_year = %s
        GROUP BY s.department
    """, (year,))
    
    dept_stats = cur.fetchall()
    
    # Top recruiting companies
    cur.execute("""
        SELECT 
            c.company_name,
            COUNT(DISTINCT a.id) as total_offers
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        WHERE a.status IN ('offered', 'accepted')
        GROUP BY c.company_name
        ORDER BY total_offers DESC
        LIMIT 10
    """)
    
    top_companies = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify({
        'stats': dict(stats) if stats else {},
        'department_wise': [dict(d) for d in dept_stats],
        'top_companies': [dict(c) for c in top_companies]
    }), 200

# ==================== NOTIFICATIONS ROUTES ====================

@app.route('/api/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    limit = int(request.args.get('limit', 20))
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT * FROM notifications 
        WHERE user_id = %s 
        ORDER BY created_at DESC 
        LIMIT %s
    """, (user_id, limit))
    
    notifications = cur.fetchall()
    
    cur.execute("SELECT COUNT(*) as count FROM notifications WHERE user_id = %s AND is_read = false", (user_id,))
    unread_count = cur.fetchone()['count']
    
    cur.close()
    conn.close()
    
    return jsonify({
        'notifications': [dict(n) for n in notifications],
        'unread_count': unread_count
    }), 200

@app.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    user_id = get_jwt_identity()
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("UPDATE notifications SET is_read = true WHERE id = %s AND user_id = %s", 
                   (notification_id, user_id))
        conn.commit()
        
        return jsonify({'message': 'Notification marked as read'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/notifications/mark-all-read', methods=['PUT'])
@jwt_required()
def mark_all_notifications_read():
    user_id = get_jwt_identity()
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("UPDATE notifications SET is_read = true WHERE user_id = %s", (user_id,))
        conn.commit()
        
        return jsonify({'message': 'All notifications marked as read'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

# ==================== SAVED JOBS ====================

@app.route('/api/jobs/<int:job_id>/save', methods=['POST'])
@role_required(['student'])
def save_job(job_id):
    user_id = get_jwt_identity()
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id FROM students WHERE user_id = %s", (user_id,))
        student = cur.fetchone()
        
        cur.execute("INSERT INTO saved_jobs (student_id, job_id) VALUES (%s, %s)", 
                   (student['id'], job_id))
        conn.commit()
        
        return jsonify({'message': 'Job saved successfully'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': 'Job already saved or error occurred'}), 400
    finally:
        cur.close()
        conn.close()

@app.route('/api/jobs/saved', methods=['GET'])
@role_required(['student'])
def get_saved_jobs():
    user_id = get_jwt_identity()
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT id FROM students WHERE user_id = %s", (user_id,))
    student = cur.fetchone()
    
    cur.execute("""
        SELECT j.*, c.company_name, c.company_logo, sj.saved_at
        FROM saved_jobs sj
        JOIN jobs j ON sj.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        WHERE sj.student_id = %s
        ORDER BY sj.saved_at DESC
    """, (student['id'],))
    
    saved_jobs = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify({'saved_jobs': [dict(j) for j in saved_jobs]}), 200

@app.route('/api/jobs/<int:job_id>/unsave', methods=['DELETE'])
@role_required(['student'])
def unsave_job(job_id):
    user_id = get_jwt_identity()
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT id FROM students WHERE user_id = %s", (user_id,))
        student = cur.fetchone()
        
        cur.execute("DELETE FROM saved_jobs WHERE student_id = %s AND job_id = %s", 
                   (student['id'], job_id))
        conn.commit()
        
        return jsonify({'message': 'Job removed from saved'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)