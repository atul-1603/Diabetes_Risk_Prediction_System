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
});