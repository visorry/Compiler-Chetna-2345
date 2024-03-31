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
