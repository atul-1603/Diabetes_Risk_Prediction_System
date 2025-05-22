document.addEventListener('DOMContentLoaded', function () {
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', function () {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);

        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');

        localStorage.setItem('theme', newTheme);
    });

    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    const icon = themeToggle.querySelector('i');
    icon.classList.add(savedTheme === 'dark' ? 'fa-sun' : 'fa-moon');
    icon.classList.remove(savedTheme === 'dark' ? 'fa-moon' : 'fa-sun');

    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });


    // Initialize charts
    const initializeCharts = () => {
        // Feature Importance Chart
        new Chart(document.getElementById('featureImportanceChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Glucose', 'BMI', 'Age', 'Pedigree', 'Pregnancies', 'BloodPressure', 'Insulin', 'SkinThickness'],
                datasets: [{
                    data: [0.25, 0.18, 0.15, 0.12, 0.10, 0.08, 0.07, 0.05],
                    backgroundColor: 'rgba(0, 151, 167, 0.7)'
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });

        // ROC Curve Chart
        new Chart(document.getElementById('rocCurveChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: ['0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1'],
                datasets: [{
                    label: 'ROC Curve (AUC = 0.85)',
                    data: [0, 0.2, 0.4, 0.55, 0.65, 0.72, 0.78, 0.83, 0.87, 0.92, 1],
                    borderColor: '#0097a7',
                    fill: true
                }]
            }
        });

        // Model Architecture Chart
        new Chart(document.getElementById('modelArchitectureChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Input', 'Features', 'Trees', 'Output'],
                datasets: [{
                    data: [10, 25, 100, 1],
                    backgroundColor: 'rgba(33, 150, 243, 0.7)'
                }]
            },
            options: { indexAxis: 'y' }
        });

        // Precision-Recall Curve
        new Chart(document.getElementById('prCurveChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: ['0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1'],
                datasets: [{
                    label: 'PR Curve (AUC = 0.82)',
                    data: [0.9, 0.85, 0.82, 0.8, 0.78, 0.76, 0.74, 0.72, 0.7, 0.68, 0.65],
                    borderColor: '#9c27b0',
                    fill: true
                }]
            }
        });


    };

    initializeCharts();

    // Form submission handler
    const diabetesForm = document.getElementById('diabetesForm');
    const resultsSection = document.getElementById('results');
    const riskPercentage = document.getElementById('riskPercentage');
    const riskCategory = document.getElementById('riskCategory');
    const riskMessage = document.getElementById('riskMessage');
    const riskRecommendation = document.getElementById('riskRecommendation');
    const riskFactors = document.getElementById('riskFactors');
    const downloadReport = document.getElementById('downloadReport');
    let riskGaugeChart = null;

    if (diabetesForm) {
        diabetesForm.addEventListener('submit', async function (e) {
            e.preventDefault(); // Prevent default form submission

            // Show loading state
            const submitBtn = this.querySelector('.submit-button');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';

            try {
                // Get form values
                const formData = {
                    pregnancies: document.getElementById('pregnancies').value,
                    glucose: document.getElementById('glucose').value,
                    bloodPressure: document.getElementById('bloodPressure').value,
                    bmi: document.getElementById('bmi').value,
                    insulin: document.getElementById('insulin').value || 0,
                    skinThickness: document.getElementById('skinThickness').value || 0,
                    pedigree: document.getElementById('pedigree').value || 0,
                    age: document.getElementById('age').value,
                    gender: document.querySelector('input[name="gender"]:checked').value
                };

                // Validate required fields
                const required = ['glucose', 'bloodPressure', 'bmi', 'age'];
                const missingFields = required.filter(field => !formData[field]);
                if (missingFields.length > 0) {
                    throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
                }

                // Send data to Flask backend
                const response = await fetch('/predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.error) {
                    throw new Error(result.error);
                }

                // Update UI with results
                const riskScore = result.risk_percentage;
                riskPercentage.textContent = `${riskScore.toFixed(1)}%`;

                // Determine risk category
                let category, categoryClass, message, recommendation;
                if (riskScore < 30) {
                    category = 'Low';
                    categoryClass = 'low';
                    message = 'You are at Low Risk of diabetes';
                    recommendation = 'Maintain your healthy lifestyle!';
                } else if (riskScore < 70) {
                    category = 'Moderate';
                    categoryClass = 'moderate';
                    message = 'You are at Moderate Risk of diabetes';
                    recommendation = 'Consider lifestyle changes and regular check-ups.';
                } else {
                    category = 'High';
                    categoryClass = 'high';
                    message = 'You are at High Risk of diabetes';
                    recommendation = 'Please consult with a healthcare professional as soon as possible.';
                }

                // Update risk category
                riskCategory.className = 'risk-category ' + categoryClass;
                riskCategory.innerHTML = `<span class="risk-label">${category} Risk</span>`;

                // Update messages
                riskMessage.textContent = message;
                riskRecommendation.textContent = recommendation;

                // Update risk factors
                riskFactors.innerHTML = '';

                // Add factors based on input values
                if (formData.glucose > 126) {
                    riskFactors.innerHTML += `<li><i class="fas fa-exclamation-triangle"></i> Elevated glucose levels (${formData.glucose} mg/dL)</li>`;
                } else {
                    riskFactors.innerHTML += `<li><i class="fas fa-check-circle"></i> Normal glucose levels (${formData.glucose} mg/dL)</li>`;
                }

                if (formData.bmi > 25) {
                    riskFactors.innerHTML += `<li><i class="fas fa-exclamation-triangle"></i> Elevated BMI (${formData.bmi})</li>`;
                } else {
                    riskFactors.innerHTML += `<li><i class="fas fa-check-circle"></i> Healthy BMI (${formData.bmi})</li>`;
                }

                if (formData.bloodPressure > 130) {
                    riskFactors.innerHTML += `<li><i class="fas fa-exclamation-triangle"></i> Elevated blood pressure (${formData.bloodPressure} mmHg)</li>`;
                } else {
                    riskFactors.innerHTML += `<li><i class="fas fa-check-circle"></i> Normal blood pressure (${formData.bloodPressure} mmHg)</li>`;
                }

                if (formData.age > 45) {
                    riskFactors.innerHTML += `<li><i class="fas fa-info-circle"></i> Age (${formData.age}) increases risk</li>`;
                }

                if (formData.gender === 'female' && formData.pregnancies > 0) {
                    riskFactors.innerHTML += `<li><i class="fas fa-info-circle"></i> Pregnancy history (${formData.pregnancies})</li>`;
                }

                // Update gauge chart
                updateRiskGauge(riskScore);

                // Show results section
                resultsSection.style.display = 'block';

                // Scroll to results
                resultsSection.scrollIntoView({ behavior: 'smooth' });

            } catch (error) {
                console.error('Error:', error);
                alert(`Error: ${error.message}`);
            } finally {
                // Reset submit button
                const submitBtn = document.querySelector('.submit-button');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Calculate Risk';
                }
            }
        });
    }

    function updateRiskGauge(score) {
        const ctx = document.getElementById('riskGauge').getContext('2d');

        // Destroy previous chart if exists
        if (riskGaugeChart) {
            riskGaugeChart.destroy();
        }

        riskGaugeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [score, 100 - score],
                    backgroundColor: [getRiskColor(score), '#f0f0f0'],
                    borderWidth: 0
                }]
            },
            options: {
                circumference: 270,
                rotation: 225,
                cutout: '80%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }

    function getRiskColor(score) {
        if (score < 30) return '#4CAF50';  // Green
        if (score < 70) return '#FF9800';  // Orange
        return '#F44336';  // Red
    }

    // PDF Report functionality
    if (downloadReport) {
        downloadReport.addEventListener('click', async function () {
            try {
                // Check if jsPDF is available
                if (typeof window.jspdf === 'undefined') {
                    throw new Error('PDF library not loaded');
                }

                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();

                // Get form values
                const formData = {
                    pregnancies: document.getElementById('pregnancies').value,
                    glucose: document.getElementById('glucose').value,
                    bloodPressure: document.getElementById('bloodPressure').value,
                    bmi: document.getElementById('bmi').value,
                    insulin: document.getElementById('insulin').value || 0,
                    skinThickness: document.getElementById('skinThickness').value || 0,
                    pedigree: document.getElementById('pedigree').value || 0,
                    age: document.getElementById('age').value,
                    gender: document.querySelector('input[name="gender"]:checked').value
                };

                // Add title
                doc.setFontSize(20);
                doc.setTextColor(0, 119, 182);
                doc.text('Diabetes Risk Assessment Report', doc.internal.pageSize.width / 2, 20, { align: 'center' });

                // Add date
                doc.setFontSize(12);
                doc.setTextColor(100);
                doc.text(`Generated on: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width / 2, 30, { align: 'center' });

                // Add user information
                doc.setFontSize(14);
                doc.setTextColor(0);
                doc.text('Personal Information', 20, 50);

                doc.setFontSize(12);
                let yPos = 60;
                doc.text(`• Age: ${formData.age} years`, 20, yPos);
                yPos += 7;
                doc.text(`• Gender: ${formData.gender === 'male' ? 'Male' : 'Female'}`, 20, yPos);
                yPos += 7;
                if (formData.gender === 'female') {
                    doc.text(`• Pregnancies: ${formData.pregnancies}`, 20, yPos);
                    yPos += 7;
                }

                // Add health metrics
                doc.setFontSize(14);
                doc.text('Health Metrics', 20, yPos + 5);
                yPos += 15;

                doc.setFontSize(12);
                doc.text(`• Glucose: ${formData.glucose} mg/dL`, 20, yPos);
                yPos += 7;
                doc.text(`• Blood Pressure: ${formData.bloodPressure} mmHg`, 20, yPos);
                yPos += 7;
                doc.text(`• BMI: ${formData.bmi}`, 20, yPos);
                yPos += 7;
                if (formData.insulin > 0) {
                    doc.text(`• Insulin: ${formData.insulin} μU/mL`, 20, yPos);
                    yPos += 7;
                }
                if (formData.skinThickness > 0) {
                    doc.text(`• Skin Thickness: ${formData.skinThickness} mm`, 20, yPos);
                    yPos += 7;
                }
                if (formData.pedigree > 0) {
                    doc.text(`• Diabetes Pedigree: ${formData.pedigree}`, 20, yPos);
                    yPos += 7;
                }

                // Add risk summary
                doc.setFontSize(14);
                doc.text('Risk Assessment', 20, yPos + 5);
                yPos += 15;

                doc.setFontSize(12);
                doc.text(`• Risk Percentage: ${riskPercentage.textContent}`, 20, yPos);
                yPos += 7;
                doc.text(`• Risk Category: ${riskCategory.textContent.replace('Risk', '').trim()}`, 20, yPos);
                yPos += 7;
                doc.text(`• Recommendation: ${riskRecommendation.textContent}`, 20, yPos);
                yPos += 10;

                // Add personalized suggestions
                doc.setFontSize(14);
                doc.text('Personalized Suggestions', 20, yPos + 5);
                yPos += 15;

                doc.setFontSize(12);
                const factors = riskFactors.querySelectorAll('li');
                factors.forEach(factor => {
                    const text = factor.textContent.trim();
                    if (text.length > 80) {
                        const lines = doc.splitTextToSize(`• ${text}`, 170);
                        doc.text(lines, 20, yPos);
                        yPos += 7 * lines.length;
                    } else {
                        doc.text(`• ${text}`, 20, yPos);
                        yPos += 7;
                    }
                });
                yPos += 5;

                // Add risk gauge image if available
                const gaugeCanvas = document.getElementById('riskGauge');
                if (gaugeCanvas) {
                    const gaugeImage = gaugeCanvas.toDataURL('image/png');
                    doc.addImage(gaugeImage, 'PNG', 140, 50, 50, 30);
                }

                // Add disclaimer
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text('Disclaimer: This report is for informational purposes only and not medical advice.', 20, yPos + 20, { maxWidth: 170 });

                // Generate filename with timestamp
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `Diabetes_Report_${timestamp}.pdf`;

                // Save the PDF
                doc.save(filename);

                // Show success message
                alert('Report downloaded successfully! You can view all your reports in the History section.');

            } catch (error) {
                console.error('PDF generation error:', error);
                alert('Failed to generate PDF. Please try again later.');
            }
        });
    }
});