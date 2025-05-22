// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDpREcaH_xox61qCweAl3eBkQ2GWPF0MuM",
    authDomain: "diabetes-risk-prediction.firebaseapp.com",
    projectId: "diabetes-risk-prediction",
    storageBucket: "diabetes-risk-prediction.appspot.com",
    messagingSenderId: "717762640272",
    appId: "1:717762640272:web:8292d47da5e8827b97db15",
    measurementId: "G-6MTC12YVHN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', function () {
    const toast = document.getElementById('toast');

    // Show toast notification
    function showToast(message, type) {
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        toast.innerHTML = `
                    <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
                    ${message}
                `;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Check auth state when page loads
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            console.log('Already logged in as:', user.email);
            // You might want to redirect them immediately
            // window.location.href = '/assessment';
        } else {
            // User is signed out
            console.log('No user logged in');
        }
    });

    // Google Login
    document.querySelector('.google-btn').addEventListener('click', function () {
        const provider = new firebase.auth.GoogleAuthProvider();

        auth.signInWithPopup(provider)
            .then((result) => {
                showToast('Google login successful!', 'success');
                setTimeout(() => window.location.href = '/assessment', 1500);
            })
            .catch(handleAuthError);
    });

    // Facebook Login
    document.querySelector('.facebook-btn').addEventListener('click', function () {
        const provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('email');
        provider.addScope('public_profile');

        auth.signInWithPopup(provider)
            .then((result) => {
                showToast('Facebook login successful!', 'success');
                setTimeout(() => window.location.href = '/assessment', 1500);
            })
            .catch(handleAuthError);
    });

    // Twitter Login
    document.querySelector('.twitter-btn').addEventListener('click', function () {
        const provider = new firebase.auth.TwitterAuthProvider();

        auth.signInWithPopup(provider)
            .then((result) => {
                showToast('Twitter login successful!', 'success');
                setTimeout(() => window.location.href = '/assessment', 1500);
            })
            .catch(handleAuthError);
    });

    // GitHub Login
    document.querySelector('.github-btn').addEventListener('click', function () {
        const provider = new firebase.auth.GithubAuthProvider();
        provider.addScope('user:email');

        auth.signInWithPopup(provider)
            .then((result) => {
                showToast('GitHub login successful!', 'success');
                setTimeout(() => window.location.href = '/assessment', 1500);
            })
            .catch(handleAuthError);
    });

    // Error handler
    function handleAuthError(error) {
        let message = 'Login failed';
        switch (error.code) {
            case 'auth/account-exists-with-different-credential':
                message = 'Account exists with different login method';
                break;
            case 'auth/popup-closed-by-user':
                message = 'Login popup was closed';
                break;
            case 'auth/cancelled-popup-request':
                message = 'Login popup cancelled';
                break;
            case 'auth/popup-blocked':
                message = 'Popup blocked by browser. Please allow popups for this site';
                break;
            default:
                message = error.message;
        }
        showToast(message, 'error');
        console.error('Authentication error:', error);
    }

    // Phone authentication setup
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const otpContainer = document.getElementById('otpContainer');
    const phoneInput = document.getElementById('phone');
    const resendOtp = document.getElementById('resendOtp');
    const otpDigits = document.querySelectorAll('.otp-digit');

    let confirmationResult;
    let recaptchaVerifier;

    // Initialize reCAPTCHA
    function setUpRecaptcha() {
        recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sendOtpBtn', {
            'size': 'invisible',
            'callback': (response) => {
                sendOTP();
            },
            'expired-callback': () => {
                showToast('Verification expired. Please try again.', 'error');
                sendOtpBtn.disabled = false;
                sendOtpBtn.textContent = 'Send OTP';
            }
        });
    }

    // Send OTP function
    function sendOTP() {
        const phone = "+91" + phoneInput.value.trim();

        sendOtpBtn.disabled = true;
        sendOtpBtn.textContent = 'Sending...';

        auth.signInWithPhoneNumber(phone, recaptchaVerifier)
            .then((result) => {
                confirmationResult = result;
                showToast('OTP sent successfully!', 'success');
                sendOtpBtn.textContent = 'OTP Sent';
                otpContainer.style.display = 'block';
                otpDigits[0].focus();
            })
            .catch((error) => {
                console.error("Error sending OTP:", error);
                showToast('Failed to send OTP. Please try again.', 'error');
                sendOtpBtn.disabled = false;
                sendOtpBtn.textContent = 'Send OTP';
            });
    }

    // Verify OTP function
    function verifyOTP() {
        let otp = '';
        otpDigits.forEach(digit => {
            otp += digit.value;
        });

        verifyOtpBtn.disabled = true;
        verifyOtpBtn.textContent = 'Verifying...';

        confirmationResult.confirm(otp)
            .then((result) => {
                showToast('Phone verification successful!', 'success');
                setTimeout(() => window.location.href = '/assessment', 1500);
            })
            .catch((error) => {
                console.error("Error verifying OTP:", error);
                showToast('Invalid OTP. Please try again.', 'error');
                verifyOtpBtn.disabled = false;
                verifyOtpBtn.textContent = 'Verify OTP';
            });
    }

    // Event listeners for phone authentication
    sendOtpBtn.addEventListener('click', function () {
        const phone = phoneInput.value.trim();

        if (!phone || !/^\d{10}$/.test(phone)) {
            showToast('Please enter a valid 10-digit phone number', 'error');
            return;
        }

        if (!recaptchaVerifier) {
            setUpRecaptcha();
        } else {
            recaptchaVerifier.verify();
        }
    });

    verifyOtpBtn.addEventListener('click', verifyOTP);

    // OTP input navigation
    otpDigits.forEach((digit, index) => {
        digit.addEventListener('input', (e) => {
            if (e.target.value.length === 1) {
                if (index < otpDigits.length - 1) {
                    otpDigits[index + 1].focus();
                } else {
                    otpDigits[index].blur();
                }
            }
        });

        digit.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value.length === 0 && index > 0) {
                otpDigits[index - 1].focus();
            }
        });
    });

    // Resend OTP
    resendOtp.addEventListener('click', function (e) {
        e.preventDefault();
        sendOTP();
        showToast('New OTP sent!', 'success');
        otpDigits.forEach(digit => digit.value = '');
        otpDigits[0].focus();
    });
});