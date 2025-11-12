import { PROJECT_DATA, BLOG_DATA, SEARCHABLE_CONTENT } from '../../config/constants.js';
import { getUsers, saveUsers, getCurrentUser, setCurrentUser } from '../../utils/storage.js';

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

const modals = document.querySelectorAll('.modal');
const modalTriggers = document.querySelectorAll('[data-modal]');
const modalCloses = document.querySelectorAll('.modal-close');

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeAllModals() {
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
}

modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.getAttribute('data-modal');
        openModal(modalId);
    });
});

modalCloses.forEach(close => {
    close.addEventListener('click', () => {
        const modal = close.closest('.modal');
        if (modal) {
            closeModal(modal.id);
        }
    });
});

modals.forEach(modal => {
    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', () => {
            closeModal(modal.id);
        });
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllModals();
    }
});

function showError(input, message) {
    input.classList.add('error');
    const errorSpan = input.parentElement.querySelector('.error-message');
    if (errorSpan) {
        errorSpan.textContent = message;
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const toastMessage = toast.querySelector('.toast-message');
    if (!toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function updateUserInterface() {
    const currentUser = getCurrentUser();
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    
    if (currentUser) {
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'block';
            const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            const initialsEl = document.getElementById('user-initials');
            const nameEl = document.getElementById('user-name');
            const emailEl = document.getElementById('user-email');
            if (initialsEl) initialsEl.textContent = initials;
            if (nameEl) nameEl.textContent = currentUser.name;
            if (emailEl) emailEl.textContent = currentUser.email;
        }
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        document.querySelectorAll('#login-form .error-message').forEach(error => {
            error.textContent = '';
        });
        document.querySelectorAll('#login-form .error').forEach(input => {
            input.classList.remove('error');
        });
        
        if (!user) {
            showError(document.getElementById('login-email'), 'Invalid email or password');
            document.getElementById('login-email').classList.add('error');
            document.getElementById('login-password').classList.add('error');
            return;
        }
        
        setCurrentUser(user);
        updateUserInterface();
        showToast('Welcome back, ' + user.name + '!');
        closeModal('login-modal');
        loginForm.reset();
    });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        
        document.querySelectorAll('#register-form .error-message').forEach(error => {
            error.textContent = '';
        });
        document.querySelectorAll('#register-form .error').forEach(input => {
            input.classList.remove('error');
        });
        
        let isValid = true;
        const users = getUsers();
        
        if (users.find(u => u.email === email)) {
            showError(document.getElementById('register-email'), 'Email already registered');
            isValid = false;
        }
        
        if (password.length < 6) {
            showError(document.getElementById('register-password'), 'Password must be at least 6 characters');
            isValid = false;
        }
        
        if (password !== confirm) {
            showError(document.getElementById('register-confirm'), 'Passwords do not match');
            isValid = false;
        }
        
        if (!isValid) return;
        
        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            phone: phone || '',
            password: password,
            createdAt: new Date().toISOString(),
            projects: [],
            settings: {
                emailNotifications: true,
                smsNotifications: false,
                marketing: true
            }
        };
        
        users.push(newUser);
        saveUsers(users);
        setCurrentUser(newUser);
        updateUserInterface();
        showToast('Account created successfully!');
        closeModal('register-modal');
        registerForm.reset();
    });
}

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        setCurrentUser(null);
        updateUserInterface();
        showToast('You have been logged out');
        if (window.location.pathname.includes('account.html')) {
            window.location.href = 'index.html';
        }
    });
}

const userAvatarBtn = document.getElementById('user-avatar-btn');
const userDropdown = document.getElementById('user-dropdown');
if (userAvatarBtn && userDropdown) {
    userAvatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
    });
    
    document.addEventListener('click', (e) => {
        if (!userAvatarBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
    });
}

document.querySelectorAll('.switch-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetModal = link.getAttribute('data-modal');
        closeAllModals();
        setTimeout(() => {
            openModal(targetModal);
        }, 300);
    });
});

const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.classList.contains('has-animated')) {
            entry.target.classList.add('has-animated');
            entry.target.classList.add('fade-in-up');
            entry.target.classList.remove('hidden');
            fadeInObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll(`
        .service-card,
        .testimonial-card,
        .project-card,
        .blog-card,
        .challenging-content,
        .section-title,
        .section-subtitle
    `);
    
    animateElements.forEach((el, index) => {
        if (el.getBoundingClientRect().top > window.innerHeight) {
            el.classList.add('hidden');
        } else {
            el.classList.add('has-animated');
        }
        el.style.animationDelay = `${index * 0.05}s`;
        fadeInObserver.observe(el);
    });
});

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            if (statNumber && !statNumber.classList.contains('animated')) {
                animateNumber(statNumber);
                statNumber.classList.add('animated');
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item').forEach(item => {
    statsObserver.observe(item);
});

function animateNumber(element) {
    const text = element.textContent;
    const number = parseInt(text.replace(/[^0-9]/g, ''));
    const suffix = text.replace(/[0-9]/g, '');
    if (isNaN(number)) return;
    let current = 0;
    const increment = number / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
            element.textContent = number + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, 20);
}

let ticking = false;
function updateParallax() {
    const scrolled = window.pageYOffset;
    const heroImage = document.querySelector('.hero-bg-img');
    if (heroImage && scrolled < window.innerHeight) {
        heroImage.style.transform = `translateY(${scrolled * 0.3}px) scale(1.05)`;
    }
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
}, { passive: true });

const projectButtons = document.querySelectorAll('.project-btn');
projectButtons.forEach(button => {
    button.addEventListener('click', () => {
        const projectIndex = parseInt(button.getAttribute('data-project'));
        const project = PROJECT_DATA[projectIndex];
        if (project) {
            document.getElementById('project-modal-img').src = project.image;
            document.getElementById('project-modal-title').textContent = project.title;
            document.getElementById('project-modal-category').textContent = project.category;
            document.getElementById('project-modal-description').textContent = project.description;
            openModal('project-modal');
            
            const currentUser = getCurrentUser();
            const modalInfo = document.querySelector('.modal-project-info');
            if (currentUser && modalInfo) {
                const existingBtn = modalInfo.querySelector('.save-project-btn');
                if (existingBtn) existingBtn.remove();
                
                const users = getUsers();
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                const projectExists = userIndex !== -1 && users[userIndex].projects && users[userIndex].projects.find(p => p.title === project.title);
                
                const saveBtn = document.createElement('button');
                saveBtn.className = 'btn btn-secondary save-project-btn';
                saveBtn.style.marginTop = '20px';
                saveBtn.innerHTML = projectExists ? 'Saved' : 'Save to My Projects';
                saveBtn.disabled = projectExists;
                
                if (!projectExists) {
                    saveBtn.addEventListener('click', () => {
                        if (userIndex !== -1) {
                            if (!users[userIndex].projects) {
                                users[userIndex].projects = [];
                            }
                            users[userIndex].projects.push({
                                ...project,
                                savedAt: new Date().toISOString()
                            });
                            saveUsers(users);
                            setCurrentUser(users[userIndex]);
                            showToast('Project saved to your account!');
                            saveBtn.textContent = 'Saved';
                            saveBtn.disabled = true;
                        }
                    });
                }
                modalInfo.appendChild(saveBtn);
            }
        }
    });
});

const blogButtons = document.querySelectorAll('.blog-btn');
blogButtons.forEach(button => {
    button.addEventListener('click', () => {
        const blogIndex = parseInt(button.getAttribute('data-blog'));
        const blog = BLOG_DATA[blogIndex];
        if (blog) {
            document.getElementById('blog-modal-img').src = blog.image;
            document.getElementById('blog-modal-title').textContent = blog.title;
            document.getElementById('blog-modal-tag').textContent = blog.tag;
            document.getElementById('blog-modal-date').textContent = blog.date;
            document.getElementById('blog-modal-text').textContent = blog.text;
            openModal('blog-modal');
        }
    });
});

const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            service: formData.get('service'),
            message: formData.get('message')
        };
        let isValid = true;
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        document.querySelectorAll('.error-message').forEach(error => {
            error.textContent = '';
        });
        document.querySelectorAll('.error').forEach(input => {
            input.classList.remove('error');
        });
        if (!data.name || data.name.trim().length < 2) {
            showError(nameInput, 'Please enter your full name');
            isValid = false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }
        if (!data.message || data.message.trim().length < 10) {
            showError(messageInput, 'Please enter a message (at least 10 characters)');
            isValid = false;
        }
        if (isValid) {
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = 'Sending...';
            submitButton.disabled = true;
            setTimeout(() => {
                showToast('Thank you! Your message has been sent successfully.');
                contactForm.reset();
                closeModal('contact-modal');
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }, 1500);
        }
    });
}

const allSections = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.nav-link');

let scrollTicking = false;
function updateActiveNavLink() {
    const scrollY = window.pageYOffset;
    allSections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            allNavLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
    scrollTicking = false;
}

window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        requestAnimationFrame(updateActiveNavLink);
        scrollTicking = true;
    }
}, { passive: true });

const images = document.querySelectorAll('img');
images.forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.6s ease';
    if (img.complete && img.naturalHeight !== 0) {
        requestAnimationFrame(() => {
            img.style.opacity = '1';
        });
    } else {
        img.addEventListener('load', function() {
            requestAnimationFrame(() => {
                this.style.opacity = '1';
            });
        }, { once: true });
    }
});

const searchToggle = document.getElementById('search-toggle');
const searchModal = document.getElementById('search-modal');
const searchClose = document.getElementById('search-close');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

if (searchToggle && searchModal) {
    searchToggle.addEventListener('click', () => {
        searchModal.classList.add('active');
        setTimeout(() => searchInput.focus(), 100);
    });
}

if (searchClose) {
    searchClose.addEventListener('click', () => {
        searchModal.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
    });
}

if (searchModal) {
    const searchOverlay = searchModal.querySelector('.search-overlay');
    if (searchOverlay) {
        searchOverlay.addEventListener('click', () => {
            searchModal.classList.remove('active');
            searchInput.value = '';
            searchResults.innerHTML = '';
        });
    }
}

if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }
        searchTimeout = setTimeout(() => {
            const results = SEARCHABLE_CONTENT.filter(item => 
                item.title.toLowerCase().includes(query) || 
                item.category.toLowerCase().includes(query)
            );
            displaySearchResults(results);
        }, 300);
    });
}

function displaySearchResults(results) {
    if (!searchResults) return;
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
        return;
    }
    searchResults.innerHTML = results.map(item => `
        <div class="search-result-item" data-link="${item.link}">
            <strong>${item.title}</strong>
            <span style="display: block; color: var(--color-text-light); font-size: 14px; margin-top: 5px;">${item.category}</span>
        </div>
    `).join('');
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const link = item.getAttribute('data-link');
            if (link) {
                searchModal.classList.remove('active');
                searchInput.value = '';
                searchResults.innerHTML = '';
                document.querySelector(link)?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

const scrollTop = document.getElementById('scroll-top');
if (scrollTop) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTop.classList.add('visible');
        } else {
            scrollTop.classList.remove('visible');
        }
    });
    scrollTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

document.querySelectorAll('.btn, .project-btn, .blog-btn').forEach(button => {
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    function animate() {
        currentX += (targetX - currentX) * 0.1;
        currentY += (targetY - currentY) * 0.1;
        button.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
            requestAnimationFrame(animate);
        }
    }
    button.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        targetX = x * 0.15;
        targetY = y * 0.15;
        if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
            requestAnimationFrame(animate);
        }
    }, { passive: true });
    button.addEventListener('mouseleave', function() {
        targetX = 0;
        targetY = 0;
        requestAnimationFrame(animate);
    });
});

document.querySelectorAll('.service-card, .testimonial-card, .project-card, .blog-card').forEach(card => {
    let currentRotateX = 0;
    let currentRotateY = 0;
    let targetRotateX = 0;
    let targetRotateY = 0;
    function animateTilt() {
        currentRotateX += (targetRotateX - currentRotateX) * 0.15;
        currentRotateY += (targetRotateY - currentRotateY) * 0.15;
        card.style.transform = `perspective(1000px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        if (Math.abs(targetRotateX - currentRotateX) > 0.1 || Math.abs(targetRotateY - currentRotateY) > 0.1) {
            requestAnimationFrame(animateTilt);
        }
    }
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        targetRotateX = (y - centerY) / 15;
        targetRotateY = (centerX - x) / 15;
        if (Math.abs(targetRotateX - currentRotateX) > 0.1 || Math.abs(targetRotateY - currentRotateY) > 0.1) {
            requestAnimationFrame(animateTilt);
        }
    }, { passive: true });
    card.addEventListener('mouseleave', function() {
        targetRotateX = 0;
        targetRotateY = 0;
        requestAnimationFrame(animateTilt);
    });
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
    });
    link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

document.querySelectorAll('.logo').forEach(logo => {
    logo.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        this.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
    }, { passive: true });
    logo.addEventListener('mouseleave', function() {
        this.style.transform = 'translate(0, 0) scale(1)';
    });
});

const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    const text = heroTitle.textContent;
    heroTitle.innerHTML = text.split('').map((char, i) => 
        char === ' ' ? ' ' : `<span style="display: inline-block; animation: fadeInUp 0.6s ease-out ${i * 0.03}s both">${char}</span>`
    ).join('');
}

document.querySelectorAll('section').forEach((section, index) => {
    if (index > 0) {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        sectionObserver.observe(section);
    }
});

const ctaButton = document.querySelector('.btn-cta');
if (ctaButton) {
    ctaButton.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05) translateY(-2px)';
    });
    ctaButton.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) translateY(0)';
    });
}

document.querySelectorAll('.partner-logo').forEach((logo, index) => {
    logo.style.opacity = '0';
    logo.style.transform = 'translateY(20px)';
    setTimeout(() => {
        logo.style.transition = 'all 0.6s ease';
        logo.style.opacity = '0.6';
        logo.style.transform = 'translateY(0)';
    }, index * 100);
});

const challengingImg = document.querySelector('.challenging-img');
if (challengingImg) {
    let scrollParallax = 0;
    window.addEventListener('scroll', () => {
        const rect = challengingImg.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            scrollParallax = (window.innerHeight - rect.top) * 0.1;
            challengingImg.style.transform = `translateY(${scrollParallax}px) scale(1.05)`;
        }
    }, { passive: true });
}

document.querySelectorAll('.project-image, .blog-image').forEach(imageContainer => {
    const img = imageContainer.querySelector('img');
    if (img) {
        imageContainer.addEventListener('mouseenter', function() {
            img.style.transform = 'scale(1.15) rotate(2deg)';
        });
        imageContainer.addEventListener('mouseleave', function() {
            img.style.transform = 'scale(1) rotate(0deg)';
        });
    }
});

const serviceLinks = document.querySelectorAll('.service-link');
serviceLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const serviceTitle = this.closest('.service-card').querySelector('.service-title').textContent;
        showToast(`Exploring ${serviceTitle}...`);
    });
});

const socialLinks = document.querySelectorAll('.social-link');
socialLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const platform = this.getAttribute('aria-label');
        showToast(`Opening ${platform}...`);
    });
});

window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });
});

const statsItems = document.querySelectorAll('.stat-item');
statsItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px) scale(0.9)';
    item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
});

const statsSection = document.querySelector('.statistics');
if (statsSection) {
    const statsSectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statsItems.forEach(item => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0) scale(1)';
                });
                statsSectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    statsSectionObserver.observe(statsSection);
}

document.addEventListener('keydown', (e) => {
    if (e.key === '/' && searchModal && !searchModal.classList.contains('active')) {
        e.preventDefault();
        searchModal.classList.add('active');
        setTimeout(() => searchInput.focus(), 100);
    }
    if (e.key === 'Escape' && searchModal && searchModal.classList.contains('active')) {
        searchModal.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
    }
});

const testimonialCards = document.querySelectorAll('.testimonial-card');
testimonialCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px) rotateX(10deg)';
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) rotateX(0deg)';
                }, index * 100);
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    cardObserver.observe(card);
});

const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    const image = card.querySelector('.project-image img');
    if (image) {
        card.addEventListener('mouseenter', function() {
            image.style.filter = 'brightness(1.1) contrast(1.1)';
        });
        card.addEventListener('mouseleave', function() {
            image.style.filter = 'brightness(1) contrast(1)';
        });
    }
});

const blogCards = document.querySelectorAll('.blog-card');
blogCards.forEach(card => {
    const image = card.querySelector('.blog-image img');
    if (image) {
        card.addEventListener('mouseenter', function() {
            image.style.filter = 'brightness(1.1) saturate(1.2)';
        });
        card.addEventListener('mouseleave', function() {
            image.style.filter = 'brightness(1) saturate(1)';
        });
    }
});

const ctaContent = document.querySelector('.cta-content');
if (ctaContent) {
    const ctaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transition = 'transform 0.4s ease';
            }
        });
    }, { threshold: 0.5 });
    ctaObserver.observe(ctaContent);
}

let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop && scrollTop > 200) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    lastScrollTop = scrollTop;
}, { passive: true });

const heroContent = document.querySelector('.hero-content');
if (heroContent) {
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'float3d 6s ease-in-out infinite';
            }
        });
    }, { threshold: 0.5 });
    heroObserver.observe(heroContent);
}

document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

updateUserInterface();

export { openModal, closeModal, closeAllModals, showToast, showError };

