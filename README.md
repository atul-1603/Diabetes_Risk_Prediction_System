# Diabetes Risk Prediction System

![Home_page](/static/images/image-2.png)

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

### 🎨 Frontend
<p align="left">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white"/>
</p>

### 🧠 Backend
<p align="left">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white"/>
  <img src="https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white"/>
  <img src="https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white"/>
</p>


**Data**:
- PIMA Indians Diabetes Dataset
- Trained Random Forest Classifier

![dataset_image](/static/images/image.png)

## 📂 Project Structure
![project_structure_img](/static/images/image-1.png)


## 🚀 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/diabetes-risk-prediction.git
   cd diabetes-risk-prediction

2. Set up a virtual environment (recommended):

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`

3. Install dependencies:

   ```bash
   pip install -r requirements.txt

4. Run the application:

   ```bash
   python app.py

📊 Model Details
Algorithm: Random Forest Classifier

Accuracy: 83% (test set)

Features Used:

Pregnancies

Glucose

Blood Pressure

Skin Thickness

Insulin

BMI

Diabetes Pedigree Function

Age

## 📝 Usage Guide

### 🧾 1. Complete the Assessment Form  
🖋️ Fill in all required health metrics (Glucose, BMI, Age, etc.)  
🔘 Click **"Calculate Risk"** to submit your data  

---

### 📊 2. View Results  
📈 See your **Diabetes Risk Percentage** displayed clearly  
🧠 Review **personalized recommendations** tailored to your inputs  
⚠️ Understand your **key risk factors** (top contributing metrics)

---

### 💾 3. Save or Download Report  
📄 Click **"Download Report"** to save a **PDF** copy  
🗂️ Reports are also **automatically saved** in your history section

---

### 🕒 4. View History  
📚 Access all your **previous assessments** in a structured view  
🔍 Filter by **date** or **risk level**  
⬇️ Re-download any previous report for review

<br>
🛡️ Disclaimer!!

This application is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

🤝 Contributing
Contributions are welcome! Please follow these steps:

1. Fork the project

2. Create your feature branch:

   ```bash
   git checkout -b feature/AmazingFeature

3. Commit your changes:

   ```bash
   git commit -m 'Add some amazing feature'

4. Push to the branch:
   ```bash
   git push origin feature/AmazingFeature

5. Open a Pull Request

📜 License

Distributed under the MIT License. See LICENSE for more information.

✉️ Contact
Project Maintainer: [Atul Dubey]  

Email: atuld1413@gmail.com

Project Link: https://github.com/atul-1603/diabetes-risk-prediction