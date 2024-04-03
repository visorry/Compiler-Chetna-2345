document.querySelectorAll('.form input, .form textarea').forEach(function(element) {
    element.addEventListener('keyup', function(e) {
        var label = this.previousElementSibling;
        if (e.type === 'keyup') {
            if (this.value === '') {
                label.classList.remove('active', 'highlight');
            } else {
                label.classList.add('active', 'highlight');
            }
        }
    });
    
    element.addEventListener('blur', function(e) {
        var label = this.previousElementSibling;
        if (this.value === '') {
            label.classList.remove('active', 'highlight');
        } else {
            label.classList.remove('highlight');
        }
    });
    
    element.addEventListener('focus', function(e) {
        var label = this.previousElementSibling;
        if (this.value === '') {
            label.classList.remove('highlight');
        } else {
            label.classList.add('highlight');
        }
    });
});

document.querySelectorAll('.tab a').forEach(function(element) {
    element.addEventListener('click', function(e) {
        e.preventDefault();
        var tabs = this.parentElement.parentElement.children;
        Array.from(tabs).forEach(function(tab) {
            tab.classList.remove('active');
        });
        this.parentElement.classList.add('active');
        
        var target = this.getAttribute('href');
        var tabContents = document.querySelectorAll('.tab-content > div');
        tabContents.forEach(function(content) {
            if (content.id === target.substring(1)) {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
    });
});

// Register Form Submission
document.getElementById('register-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email-register').value;
    const password = document.getElementById('password-register').value;

    try {
        const response = await fetch('https://compiler-chetna-2345-production.up.railway.app/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            console.log('User registered successfully');
            document.getElementById('register-success').innerText = 'User registered successfully';
            document.getElementById('register-success').style.color = 'green';
        } else {
            const data = await response.json();
            console.error(data.error || 'Registration failed');
            document.getElementById('register-success').innerText = data.error || 'Registration failed';
            document.getElementById('register-success').style.color = 'red';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

// Login Form Submission
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email-login').value;
    const password = document.getElementById('password-login').value;

    try {
        const response = await fetch('https://compiler-chetna-2345-production.up.railway.app/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Login successful');
            document.getElementById('login-success').innerText = 'Login successful';
            document.getElementById('login-success').style.color = 'green';
            localStorage.setItem('token', data.token);
            const trimmedEmail = email.split('@')[0];
            localStorage.setItem("username", trimmedEmail);
            // Redirect to lobby.html after 1 second
            setTimeout(function() {

                window.location.href = '../room/room.html';
            }, 1000);
        } else {
            const data = await response.json();
            console.error(data.error || 'Login failed');
            document.getElementById('login-error').innerText = data.error || 'Login failed';
            document.getElementById('login-error').style.color = 'red';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});
