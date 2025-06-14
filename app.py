from flask import Flask, send_from_directory, request, jsonify, render_template
import pickle
import numpy as np
import pandas as pd
import os
from datetime import datetime
import json
from reportlab.pdfgen import canvas

app = Flask(__name__, static_folder='static')
app.config['UPLOAD_FOLDER'] = 'user_reports'

# Create reports directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load the pipeline with verification (keep your existing code)
try:
    with open('./models/diabetes_pipeline.pkl', 'rb') as f:
        pipeline = pickle.load(f)
        print(f"Pipeline loaded successfully. Steps: {pipeline.named_steps.keys()}")
        if not hasattr(pipeline, 'predict'):
            raise ValueError("Loaded object is not a valid scikit-learn pipeline")
except Exception as e:
    print(f"Error loading pipeline: {str(e)}")
    pipeline = None

def prepare_features(user_data):
    """Convert user inputs into DataFrame with expected feature names"""
    return pd.DataFrame({
        'Pregnancies': [float(user_data.get('pregnancies', 0))],
        'Glucose': [float(user_data['glucose'])],
        'BloodPressure': [float(user_data['bloodPressure'])],
        'SkinThickness': [float(user_data.get('skinThickness', 0))],
        'Insulin': [float(user_data.get('insulin', 0))],
        'BMI': [float(user_data['bmi'])],
        'DiabetesPedigreeFunction': [float(user_data.get('pedigree', 0))],
        'Age': [float(user_data['age'])]
    })

@app.route('/')
def dashboard():
    return render_template('dashboard.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/assessment')
def assessment():
    return render_template('assessment.html')

@app.template_filter('datetimeformat')
def datetimeformat(value, format='%Y-%m-%d %H:%M'):
    return value.strftime(format)

@app.route('/history')
def history():
    try:
        # Get all report files
        reports = []
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            if filename.endswith('.json'):
                with open(os.path.join(app.config['UPLOAD_FOLDER'], filename), 'r') as f:
                    report_data = json.load(f)
                    date_str = report_data.get('timestamp')
                    date_obj = datetime.fromisoformat(date_str) if date_str else None
                    reports.append({
                        'filename': filename,
                        'date': date_obj,  # Now a datetime object
                        'risk_level': report_data.get('risk_level'),
                        'risk_percentage': report_data.get('risk_percentage')
                    })
        # Sort by date (newest first)
        reports.sort(key=lambda x: x['date'], reverse=True)
        return render_template('report_history.html', reports=reports)
    except Exception as e:
        return str(e), 500
    
@app.route('/delete_report/<path:filename>', methods=['DELETE'])
def delete_report(filename):
    try:
        # Security checks
        if not filename or '..' in filename or filename.startswith('/'):
            return jsonify({'error': 'Invalid filename'}), 400
        
        # Get absolute path to reports directory
        reports_dir = os.path.abspath(app.config['UPLOAD_FOLDER'])
        
        # Normalize and join paths
        safe_filename = os.path.normpath(filename)
        json_path = os.path.join(reports_dir, safe_filename)
        pdf_path = os.path.join(reports_dir, safe_filename.replace('.json', '.pdf'))
        
        # Verify the path is within the intended directory
        if not (os.path.abspath(json_path).startswith(reports_dir) and 
                os.path.abspath(pdf_path).startswith(reports_dir)):
            return jsonify({'error': 'Invalid file path'}), 400
        
        # Debug logging
        app.logger.info(f"Attempting to delete: {json_path} and {pdf_path}")
        
        # Delete files
        deleted = []
        for path in [json_path, pdf_path]:
            if os.path.exists(path):
                try:
                    os.remove(path)
                    deleted.append(path)
                except Exception as e:
                    app.logger.error(f"Error deleting {path}: {str(e)}")
                    continue
        
        if not deleted:
            return jsonify({'error': 'No files found to delete'}), 404
            
        return jsonify({
            'success': True,
            'deleted': deleted
        })
        
    except Exception as e:
        app.logger.error(f"Error in delete_report: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    
@app.route('/report/<filename>')
def serve_report(filename):
    # Security check
    if '..' in filename or filename.startswith('/'):
        return "Invalid filename", 400

    # Serve either JSON or PDF based on request
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    if not os.path.exists(file_path):
        return "Report not found", 404
        
    if filename.endswith('.json'):
        if request.args.get('download') == 'true':
            # Generate and serve PDF for download
            pdf_file = filename.replace('.json', '.pdf')
            pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], pdf_file)
            
            if not os.path.exists(pdf_path):
                with open(file_path) as f:
                    report_data = json.load(f)
                save_pdf_report(report_data, filename)
                
            return send_from_directory(app.config['UPLOAD_FOLDER'], pdf_file, as_attachment=True)
        else:
            # Serve JSON data for viewing
            return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
            
    return "Invalid report format", 400

@app.route('/predict', methods=['POST'])
def predict():
    if pipeline is None:
        return jsonify({'error': 'Model not loaded'}), 500
        
    try:
        data = request.get_json()
        print("Received data:", data)  # Debug input
        
        # Validate required fields
        required = ['glucose', 'bloodPressure', 'bmi', 'age']
        if not all(field in data for field in required):
            return jsonify({'error': f'Missing required fields: {required}'}), 400
        
        # Prepare features
        features = prepare_features(data)
        print("Prepared features:", features.to_dict(orient='records')[0])  # Debug
        
        # Make prediction
        prediction = pipeline.predict(features)[0]
        proba = pipeline.predict_proba(features)[0][1]
        
        # Generate report data
        report_data = {
            'timestamp': datetime.now().isoformat(),
            'user_input': data,
            'prediction': int(prediction),
            'risk_percentage': float(proba * 100),
            'risk_level': 'Low' if proba < 0.3 else 'Moderate' if proba < 0.7 else 'High',
            'personalized_suggestions': generate_suggestions(data)
        }
        
        # Save report
        filename = f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(os.path.join(app.config['UPLOAD_FOLDER'], filename), 'w') as f:
            json.dump(report_data, f)

        save_pdf_report(report_data, filename)
        
        return jsonify(report_data)
        
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500
    

def generate_suggestions(user_data):
    """Generate personalized health suggestions based on user input"""
    suggestions = []
    
    # Glucose suggestions
    glucose = float(user_data.get('glucose', 0))
    if glucose > 126:
        suggestions.append("Your glucose levels are elevated. Consider reducing sugar intake and increasing physical activity.")
    elif glucose < 70:
        suggestions.append("Your glucose levels are lower than normal. Ensure regular meals and monitor for hypoglycemia symptoms.")
    else:
        suggestions.append("Your glucose levels are within normal range. Maintain your healthy habits.")
    
    # BMI suggestions
    bmi = float(user_data.get('bmi', 0))
    if bmi > 25:
        suggestions.append(f"Your BMI of {bmi:.1f} indicates overweight. Consider a balanced diet and regular exercise.")
    elif bmi < 18.5:
        suggestions.append(f"Your BMI of {bmi:.1f} indicates underweight. Ensure adequate nutrition.")
    else:
        suggestions.append(f"Your BMI of {bmi:.1f} is within healthy range. Keep up the good work!")
    
    # Blood pressure suggestions
    bp = float(user_data.get('bloodPressure', 0))
    if bp > 130:
        suggestions.append("Your blood pressure is elevated. Reduce sodium intake and exercise regularly.")
    else:
        suggestions.append("Your blood pressure is within normal range. Continue healthy lifestyle choices.")
    
    # Age factor
    age = float(user_data.get('age', 0))
    if age > 45:
        suggestions.append(f"At {int(age)} years, regular health checkups are recommended for diabetes screening.")
    
    # Pregnancy suggestions for females
    if user_data.get('gender') == 'female' and float(user_data.get('pregnancies', 0)) > 0:
        suggestions.append(f"With {user_data['pregnancies']} pregnancies, monitor for gestational diabetes risk in future pregnancies.")
    
    return suggestions

def save_pdf_report(data, filename):
    pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], filename.replace('.json', '.pdf'))
    c = canvas.Canvas(pdf_path)
    c.setFont("Helvetica", 12)
    y = 800
    c.drawString(50, y, "Diabetes Risk Assessment Report")
    y -= 30
    for key, value in data.items():
        if isinstance(value, dict):
            for sub_key, sub_value in value.items():
                c.drawString(50, y, f"{sub_key}: {sub_value}")
                y -= 20
        elif isinstance(value, list):
            c.drawString(50, y, f"{key}:")
            y -= 20
            for item in value:
                c.drawString(70, y, f"- {item}")
                y -= 20
        else:
            c.drawString(50, y, f"{key}: {value}")
            y -= 20
    c.save()

if __name__ == '__main__':
    app.run(debug=True)