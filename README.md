# Diabetes Risk Prediction System

![Project Banner](static/images/banner.png) <!-- Add your banner image if available -->

A web application that assesses diabetes risk using machine learning, provides personalized health recommendations, and maintains a history of all assessments.

## 🌟 Features

- **Risk Assessment**:
  - Input health metrics (glucose, BMI, blood pressure, etc.)
  - Real-time diabetes risk prediction
  - Visual risk gauge display

- **Personalized Reports**:
  - Detailed PDF reports with all input data
  - Personalized health suggestions
  - Risk level categorization (Low/Moderate/High)

- **History Tracking**:
  - Google Drive-like interface for past reports
  - Filter and view previous assessments
  - Download previous reports

- **User-Friendly Interface**:
  - Responsive design works on all devices
  - Dark/light mode toggle
  - Interactive charts and visualizations

## 🛠️ Tech Stack

**Frontend**:
- HTML5, CSS3, JavaScript
- Chart.js for data visualization
- jsPDF for PDF generation

**Backend**:
- Python Flask
- scikit-learn for machine learning
- Pandas for data processing

**Data**:
- PIMA Indians Diabetes Dataset
- Trained Random Forest Classifier

## 📂 Project Structure
diabetes-risk-app/
├── static/ # Static files
│ ├── css/ # Stylesheets
│ ├── js/ # JavaScript files
│ └── images/ # Image assets
├── templates/ # HTML templates
│ ├── dashboard.html # Main interface
│ ├── history.html # Report history
│ └── assessment.html # Assessment form
├── user_reports/ # Generated reports storage
├── models/ # ML models
│ └── diabetes_pipeline.pkl
├── app.py # Flask application
├── requirements.txt # Dependencies
└── README.md # This file


## 🚀 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/diabetes-risk-prediction.git
   cd diabetes-risk-prediction
Set up a virtual environment (recommended):

bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
Install dependencies:

bash
pip install -r requirements.txt
Run the application:

bash
python app.py
Access the application:
Open http://localhost:5000 in your browser

📊 Model Details
Algorithm: Random Forest Classifier

Accuracy: 78% (test set)

Features Used:

Pregnancies

Glucose

Blood Pressure

Skin Thickness

Insulin

BMI

Diabetes Pedigree Function

Age

🌍 API Endpoints
Endpoint	Method	Description
/	GET	Main dashboard
/history	GET	Report history page
/predict	POST	Risk prediction API
/report/<filename>	GET	Download specific report
📝 Usage Guide
Complete the Assessment Form:

Fill in all required health metrics

Click "Calculate Risk"

View Results:

See your diabetes risk percentage

Review personalized recommendations

View key risk factors

Save/Download Report:

Click "Download Report" to save PDF

Reports are automatically saved to your history

View History:

Access all previous reports

Filter by date or risk level

Re-download any report

🛡️ Disclaimer
This application is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the project

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some amazing feature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📜 License
Distributed under the MIT License. See LICENSE for more information.

✉️ Contact
Project Maintainer: [Atul Dubey]
Email: atuld1413@gmail.com
Project Link: https://github.com/atul-1603/diabetes-risk-prediction