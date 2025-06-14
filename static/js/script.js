
document.addEventListener('DOMContentLoaded', function() {
    // Intersection Observer setup
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // For regular scroll-triggered elements
                if (entry.target.hasAttribute('data-scroll')) {
                    entry.target.classList.add('is-visible');
                }
                
                // For staggered animations
                if (entry.target.hasAttribute('data-scroll-stagger')) {
                    entry.target.classList.add('is-visible');
                }
                
                // Unobserve after animation triggers to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with data-scroll attribute
    document.querySelectorAll('[data-scroll]').forEach(el => {
        observer.observe(el);
    });

    // Observe all elements with data-scroll-stagger attribute
    document.querySelectorAll('[data-scroll-stagger]').forEach(el => {
        observer.observe(el);
    });

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Mobile Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Start Assessment Button
    const startAssessmentBtn = document.getElementById('startAssessment');
    if (startAssessmentBtn) {
        startAssessmentBtn.addEventListener('click', () => {
            document.querySelector('#assessment').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
    
    // Diabetes Risk Prediction Form
    const diabetesForm = document.getElementById('diabetesForm');
    const resultsSection = document.getElementById('results');
    const riskPercentage = document.getElementById('riskPercentage');
    const riskCategory = document.getElementById('riskCategory');
    const riskMessage = document.getElementById('riskMessage');
    const riskRecommendation = document.getElementById('riskRecommendation');
    const riskFactors = document.getElementById('riskFactors');
    const downloadReport = document.getElementById('downloadReport');
    
    // Initialize risk gauge chart
    let riskGaugeChart = null;
    
  if (diabetesForm) {
    diabetesForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values and convert to numbers
        const formData = new FormData(this);
        const data = {
            pregnancies: parseFloat(formData.get('pregnancies')) || 0,
            glucose: parseFloat(formData.get('glucose')),
            bloodPressure: parseFloat(formData.get('bloodPressure')),
            skinThickness: parseFloat(formData.get('skinThickness')) || 0,
            insulin: parseFloat(formData.get('insulin')) || 0,
            bmi: parseFloat(formData.get('bmi')),
            pedigree: parseFloat(formData.get('pedigree')) || 0,
            age: parseFloat(formData.get('age'))
        };
        
        // Validate required fields
        if (isNaN(data.glucose) || isNaN(data.bloodPressure) || 
            isNaN(data.bmi) || isNaN(data.age)) {
            alert('Please fill in all required fields with valid numbers');
            return;
        }
        
        try {
            // Send data to Flask backend
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log("Raw response:", response);
            
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Prediction failed');
            }
            
            const result = await response.json();
            console.log("Parsed result:", result);
            console.log("Type of risk_percentage:", typeof result.risk_percentage);
            console.log("Value of risk_percentage:", result.risk_percentage);
            
            // Display results
            showResults(result.risk_percentage, data, result.prediction, result.risk_level);
            
            // Scroll to results
            resultsSection.scrollIntoView({
                behavior: 'smooth'
            });
            
        } catch (error) {
            console.error('Prediction error:', error);
            alert(`Error: ${error.message}`);
        }
    });
}
    
 function showResults(riskPercentageValue, data, prediction, riskLevel) {
    // 1. Get all DOM elements with null checks
    const resultsSection = document.getElementById('results');
    const riskPercentageElement = document.getElementById('riskPercentage');
    const riskCategoryElement = document.getElementById('riskCategory');
    const riskMessageElement = document.getElementById('riskMessage');
    const riskRecommendationElement = document.getElementById('riskRecommendation');
    const riskFactorsElement = document.getElementById('riskFactors');

    // 2. Validate elements exist
    if (!riskPercentageElement) {
        console.error('Risk percentage element not found!');
        return;
    }

    // 3. Convert and validate the risk value
    let riskValue;
    try {
        riskValue = typeof riskPercentageValue === 'number' 
            ? riskPercentageValue 
            : parseFloat(riskPercentageValue);
        
        if (isNaN(riskValue)) {
            console.error('Invalid risk percentage value:', riskPercentageValue);
            riskValue = 0;
        }
    } catch (e) {
        console.error('Error parsing risk percentage:', e);
        riskValue = 0;
    }

    // 4. Debug output
    console.log('Displaying risk value:', {
        rawValue: riskPercentageValue,
        processedValue: riskValue,
        element: riskPercentageElement
    });

    // 5. Update the percentage display (multiple methods for reliability)
    riskPercentageElement.textContent = `${riskValue.toFixed(1)}%`;
    riskPercentageElement.innerText = `${riskValue.toFixed(1)}%`;
    
    // 6. Update other elements
    resultsSection.style.display = 'block';
    riskCategoryElement.textContent = `${riskLevel} Risk`;
    riskCategoryElement.className = `risk-category ${riskLevel.toLowerCase()}`;
    
    // 7. Set appropriate messages
    if (prediction === 1) {
        riskMessageElement.textContent = `Diabetes Risk Assessment: ${riskLevel} Risk`;
        riskRecommendationElement.innerHTML = riskLevel === 'High'
            ? `<i class="fas fa-exclamation-triangle"></i> We strongly recommend consulting a healthcare provider immediately.`
            : `<i class="fas fa-info-circle"></i> Consider lifestyle changes and consult your doctor for advice.`;
    } else {
        riskMessageElement.textContent = `Diabetes Risk Assessment: ${riskLevel} Risk`;
        riskRecommendationElement.innerHTML = `<i class="fas fa-check-circle"></i> Maintain your healthy lifestyle! Regular check-ups are still recommended.`;
    }
    
    // 8. Update risk factors
    riskFactorsElement.innerHTML = identifyRiskFactors(data)
        .map(factor => `<li><i class="fas fa-arrow-right risk-factor-icon"></i>${factor}</li>`)
        .join('') || '<li>No significant risk factors identified</li>';
    
    // 9. Update gauge with error handling
    try {
        animateGauge(riskValue);
    } catch (e) {
        console.error('Error updating gauge:', e);
    }
    
    // 10. Force UI update
    setTimeout(() => {
        riskPercentageElement.style.display = 'none';
        riskPercentageElement.offsetHeight; // Trigger reflow
        riskPercentageElement.style.display = '';
    }, 0);
}

// New function for smooth gauge animation
function animateGauge(targetValue) {
    let currentValue = 0;
    const duration = 1000; // animation duration in ms
    const stepTime = 20; // update every 20ms
    const steps = duration / stepTime;
    const increment = targetValue / steps;
    
    const interval = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(interval);
        }
        updateRiskGauge(currentValue);
    }, stepTime);
}

// Updated risk factor identification
function identifyRiskFactors(data) {
    const factors = [];
    const thresholds = {
        glucose: 100,
        bloodPressure: 120,
        bmi: 25,
        age: 45
    };

    if (data.glucose >= thresholds.glucose) {
        factors.push(`Elevated Glucose (${data.glucose} mg/dL > ${thresholds.glucose} mg/dL)`);
    }
    
    if (data.bloodPressure >= thresholds.bloodPressure) {
        factors.push(`Elevated Blood Pressure (${data.bloodPressure} mmHg > ${thresholds.bloodPressure} mmHg)`);
    }
    
    if (data.bmi >= thresholds.bmi) {
        factors.push(`Elevated BMI (${data.bmi.toFixed(1)} > ${thresholds.bmi})`);
    }
    
    if (data.age >= thresholds.age) {
        factors.push(`Age (${data.age} years)`);
    }
    
    // Add pregnancy factor if applicable
    if (data.pregnancies > 0) {
        factors.push(`History of ${data.pregnancies} pregnancy(ies)`);
    }
    
    return factors;
}
    
    function updateRiskGauge(score) {
        const ctx = document.getElementById('riskGauge').getContext('2d');
        
        // Configure gauge data
        const gaugeData = {
            datasets: [{
                data: [score, 100 - score],
                backgroundColor: [
                    getRiskColor(score),
                    '#f0f0f0'
                ],
                borderWidth: 0,
                circumference: 270,
                rotation: 225,
                cutout: '80%'
            }]
        };
        
        // Configure gauge options
        const gaugeOptions = {
            responsive: true,
            maintainAspectRatio: false,
            circumference: 270,
            rotation: 225,
            cutout: '80%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            }
        };
        
        // Create or update the chart
        if (riskGaugeChart) {
            riskGaugeChart.data.datasets[0].data = [score, 100 - score];
            riskGaugeChart.data.datasets[0].backgroundColor = [
                getRiskColor(score),
                '#f0f0f0'
            ];
            riskGaugeChart.update();
        } else {
            riskGaugeChart = new Chart(ctx, {
                type: 'doughnut',
                data: gaugeData,
                options: gaugeOptions
            });
        }
    }
    
    function getRiskColor(score) {
        if (score < 30) return '#4CAF50';  // Green
        if (score < 70) return '#FF9800';  // Orange
        return '#F44336';  // Red
    }
    
    // Download Report functionality
    if (downloadReport) {
        downloadReport.addEventListener('click', () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(20);
            doc.setTextColor('#0097a7');
            doc.text('Diabetes Risk Assessment Report', 105, 20, { align: 'center' });
            
            // Add risk score
            doc.setFontSize(16);
            doc.setTextColor('#333');
            doc.text('Your Diabetes Risk Score:', 105, 40, { align: 'center' });
            
            doc.setFontSize(36);
            doc.setTextColor(getRiskColor(parseInt(riskPercentage.textContent)));
            doc.text(riskPercentage.textContent, 105, 55, { align: 'center' });
            
            // Add risk category
            doc.setFontSize(14);
            doc.setTextColor('#333');
            doc.text(`Risk Category: ${riskCategory.textContent}`, 105, 70, { align: 'center' });
            
            // Add recommendation
            doc.setFontSize(12);
            doc.text(riskRecommendation.textContent, 105, 85, { align: 'center', maxWidth: 180 });
            
            // Add key factors
            doc.setFontSize(14);
            doc.text('Key Risk Factors:', 20, 100);
            
            const factors = Array.from(riskFactors.querySelectorAll('li')).map(li => li.textContent);
            factors.forEach((factor, index) => {
                doc.setFontSize(12);
                doc.text(`• ${factor}`, 20, 110 + (index * 7));
            });
            
            // Add disclaimer
            doc.setFontSize(10);
            doc.setTextColor('#666');
            doc.text('Disclaimer: This report is for informational purposes only and not a substitute for professional medical advice.', 105, 280, { align: 'center', maxWidth: 180 });
            
            // Save the PDF
            doc.save('Diabetes_Risk_Assessment.pdf');
        });
    }
});