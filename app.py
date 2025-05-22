from flask import Flask, send_from_directory, request, jsonify
import pickle
import numpy as np
import pandas as pd

app = Flask(__name__, static_folder='.')

# Load the pipeline with verification
try:
    with open('diabetes_pipeline.pkl', 'rb') as f:
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
def serve_index():
    return send_from_directory('.', 'dashboard.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

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
        
        # Debug pipeline steps
        if hasattr(pipeline, 'named_steps'):
            print("Pipeline steps:", pipeline.named_steps.keys())
            
            # Check preprocessor output
            if 'preprocessor' in pipeline.named_steps:
                try:
                    transformed = pipeline.named_steps['preprocessor'].transform(features)
                    print("Transformed features:", transformed)
                except Exception as e:
                    print("Preprocessor error:", str(e))
        
        # Make prediction
        prediction = pipeline.predict(features)[0]
        proba = pipeline.predict_proba(features)[0][1]
        print("Raw prediction:", prediction, "Probability:", proba)  # Debug
        
        return jsonify({
            'prediction': int(prediction),
            'risk_percentage': proba * 100,  # Don't round here
            'risk_level': 'Low' if proba < 0.3 else 'Moderate' if proba < 0.7 else 'High',
            'proba_raw': float(proba)  # For debugging
        })
        
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

    