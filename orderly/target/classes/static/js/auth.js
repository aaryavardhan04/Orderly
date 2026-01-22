document.addEventListener('DOMContentLoaded', () => {

    const loginFormContainer = document.getElementById('login-form-container');
    const registerFormContainer = document.getElementById('register-form-container');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    // --- Toggle between Login and Registration Forms ---
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.style.display = 'none';
        registerFormContainer.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerFormContainer.style.display = 'none';
        loginFormContainer.style.display = 'block';
    });

    // --- Handle Registration Form Submission ---
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerError.style.display = 'none';

        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const role = document.getElementById('register-role').value; // <-- GET THE ROLE FROM THE NEW DROPDOWN

        const userData = {
            username: username,
            password: password,
            role: role // <-- USE THE SELECTED ROLE
        };

        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.status === 201) {
                alert('Registration successful! Please log in.');
                showLoginLink.click();
                registerForm.reset();
            } else if (response.status === 409) {
                showError(registerError, 'Username already exists.');
            } else {
                showError(registerError, 'An unexpected error occurred.');
            }
        } catch (error) {
            showError(registerError, 'Could not connect to the server.');
        }
    });

    // --- Handle Login Form Submission ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.style.display = 'none';

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const loginData = { username, password };

        try {
            const response = await fetch('/api/authenticate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            if (response.ok) {
                const data = await response.json();

                localStorage.setItem('token', data.jwt);
                localStorage.setItem('username', data.username);
                localStorage.setItem('role', data.role);
                localStorage.setItem('userId', data.userId);

                // --- THIS IS THE CORRECTED REDIRECTION LOGIC ---
                if (data.role === 'STAFF') {
                    window.location.href = '/staff-dashboard.html';
                } else {
                    window.location.href = '/customer-dashboard.html';
                }
            } else {
                showError(loginError, 'Incorrect username or password.');
            }
        } catch (error) {
            showError(loginError, 'An error occurred during login.');
        }
    });

    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }
});