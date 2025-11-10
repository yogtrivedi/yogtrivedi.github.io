// Global variables
let scene, camera, renderer, globe, stars, animationId;
let isGlobeVisible = true;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initGlobe();
    initNavigation();
    initResumeTabs();
    initChatbot();
    initScrollAnimations();
    initFormHandlers();
    initInteractiveStars();
    initCustomCursor();
    initInfiniteMenu();
    initThemeToggle();
    initHeroSections();
    initProfileCard();
});

// 3D Globe Implementation
function initGlobe() {
    const canvas = document.getElementById('globe-canvas');
    if (!canvas) return;

    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // Create globe
    createGlobe();
    createStars();
    createConstellation();

    // Camera position
    camera.position.z = 3;

    // Start animation
    animate();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function createGlobe() {
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Create gradient material
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color1: { value: new THREE.Color(0x667eea) },
            color2: { value: new THREE.Color(0x764ba2) }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vPosition;
            void main() {
                vUv = uv;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec2 vUv;
            varying vec3 vPosition;
            
            void main() {
                float noise = sin(vPosition.x * 10.0 + time) * 0.1 + 
                             sin(vPosition.y * 15.0 + time * 1.5) * 0.1 + 
                             sin(vPosition.z * 12.0 + time * 0.8) * 0.1;
                
                vec3 color = mix(color1, color2, vUv.y + noise);
                float alpha = 0.8 + sin(vPosition.y * 5.0 + time) * 0.2;
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true
    });

    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Add wireframe
    const wireframeGeometry = new THREE.SphereGeometry(1.01, 32, 32);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x667eea,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframe);
}

function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 200;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        
        // Random positions in a sphere
        const radius = 2 + Math.random() * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
        
        // Random colors
        const color = new THREE.Color();
        color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5 + Math.random() * 0.5);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

function createConstellation() {
    // Create constellation lines connecting stars
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];
    const lineColors = [];

    // Connect some stars to form constellation patterns
    const starPositions = stars.geometry.attributes.position.array;
    const connections = [
        [0, 5, 10, 15, 20],
        [1, 6, 11, 16, 21],
        [2, 7, 12, 17, 22],
        [3, 8, 13, 18, 23],
        [4, 9, 14, 19, 24]
    ];

    connections.forEach(connection => {
        for (let i = 0; i < connection.length - 1; i++) {
            const start = connection[i] * 3;
            const end = connection[i + 1] * 3;
            
            linePositions.push(
                starPositions[start], starPositions[start + 1], starPositions[start + 2],
                starPositions[end], starPositions[end + 1], starPositions[end + 2]
            );
            
            lineColors.push(0.4, 0.5, 0.9, 0.4, 0.5, 0.9);
        }
    });

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.3
    });

    const constellation = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(constellation);
}

function animate() {
    animationId = requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // Rotate globe
    if (globe) {
        globe.rotation.y += 0.005;
        globe.rotation.x += 0.002;
        globe.material.uniforms.time.value = time;
    }

    // Rotate stars
    if (stars) {
        stars.rotation.y += 0.001;
        stars.rotation.x += 0.0005;
    }

    // Camera movement
    camera.position.x = Math.sin(time * 0.1) * 0.5;
    camera.position.y = Math.cos(time * 0.15) * 0.3;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Navigation functionality
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    // Smooth scrolling
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Active link highlighting
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });

        // Hide globe when scrolling past home section
        const homeSection = document.getElementById('home');
        if (homeSection) {
            const homeBottom = homeSection.offsetTop + homeSection.offsetHeight;
            if (window.scrollY > homeBottom - 100) {
                if (isGlobeVisible) {
                    hideGlobe();
                }
            } else {
                if (!isGlobeVisible) {
                    showGlobe();
                }
            }
        }
    });

    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

function hideGlobe() {
    if (globe) {
        globe.visible = false;
        isGlobeVisible = false;
    }
}

function showGlobe() {
    if (globe) {
        globe.visible = true;
        isGlobeVisible = true;
    }
}

// Resume tabs functionality
function initResumeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all buttons and panels
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Chatbot functionality
function initChatbot() {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotMessages = document.getElementById('chatbotMessages');

    // Resume data for chatbot
    const resumeData = {
        experience: [
            {
                title: "Undergraduate Researcher",
                company: "Indiana University Luddy School of Informatics",
                duration: "August 2025 - Present",
                description: "Developing a Python-based predictive model to identify and map potential disease occurrences within human cells under Professor Rakesh Shiradkar."
            },
            {
                title: "Data Science Intern",
                company: "The Data Mine, Purdue University",
                duration: "August 2025 - Present",
                description: "Collaborated with Corteva Agriscience to build a chatbot for training new formula scientists. Trained in R and Python for machine learning applications."
            },
            {
                title: "Food Runner",
                company: "Topgolf Pittsburgh, PA",
                duration: "June 2022 - August 2022",
                description: "Efficiently prepared and delivered food orders, ensuring high-quality dining. Collaborated with kitchen and service teams for fast, accurate, and clean service."
            }
        ],
        education: [
            {
                degree: "Bachelor of Science in Computer Science",
                school: "Purdue University, College of Science",
                year: "Expected Graduation: Class of 2028",
                location: "West Lafayette, IN"
            }
        ],
        skills: {
            programming: ["Java", "C", "Python", "R"],
            dataScience: ["Machine Learning", "Predictive Modeling", "Data Analysis", "Chatbot Development"],
            languages: ["English", "Gujarati (Fluent)"]
        },
        projects: [
            {
                name: "FriendFusion",
                description: "Fully functional social media app with account creation, friend management, commenting, and post creation features",
                tech: ["Java", "JFrame", "Database Integration"]
            },
            {
                name: "Disease Prediction Model",
                description: "Python-based predictive model to identify and map potential disease occurrences within human cells",
                tech: ["Python", "Machine Learning", "Data Science"]
            },
            {
                name: "Corteva Chatbot",
                description: "AI chatbot for training new formula scientists at Corteva Agriscience",
                tech: ["Python", "R", "Machine Learning"]
            }
        ],
        leadership: [
            {
                title: "Assistant Instructor",
                organization: "C.S Kim Karate",
                duration: "2015 - Present",
                description: "Served as an Assistant Instructor for Master Kelly in Tang Soo Do, supporting students' training and skill development. Achieved First Degree Black Belt (Cho Dan) and is a Certified Instructor."
            },
            {
                title: "Team Director",
                organization: "Jubilee Soup Kitchen",
                description: "Directed the Jubilee Soup Kitchen team in Pittsburgh, overseeing operations and instructing new volunteers in cooking, cleaning, and serving food to the homeless."
            }
        ]
    };

    // Toggle chatbot
    chatbotToggle.addEventListener('click', () => {
        chatbotWindow.classList.toggle('active');
    });

    chatbotClose.addEventListener('click', () => {
        chatbotWindow.classList.remove('active');
    });

    // Send message
    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, 'user');
        chatbotInput.value = '';

        // Generate bot response
        setTimeout(() => {
            const response = generateResponse(message, resumeData);
            addMessage(response, 'bot');
        }, 1000);
    }

    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function generateResponse(question, data) {
        const lowerQuestion = question.toLowerCase();
        
        // Experience questions
        if (lowerQuestion.includes('experience') || lowerQuestion.includes('work') || lowerQuestion.includes('job')) {
            return `I have ${data.experience.length} professional experiences. My current roles include: ${data.experience[0].title} at ${data.experience[0].company} (${data.experience[0].duration}) - ${data.experience[0].description}. I also work as a ${data.experience[1].title} at ${data.experience[1].company} (${data.experience[1].duration}) - ${data.experience[1].description}.`;
        }
        
        // Education questions
        if (lowerQuestion.includes('education') || lowerQuestion.includes('degree') || lowerQuestion.includes('school')) {
            return `I'm currently pursuing a ${data.education[0].degree} from ${data.education[0].school} (${data.education[0].year}) in ${data.education[0].location}.`;
        }
        
        // Skills questions
        if (lowerQuestion.includes('skill') || lowerQuestion.includes('technology') || lowerQuestion.includes('tech')) {
            return `I have expertise in programming languages (${data.skills.programming.join(', ')}), data science and machine learning (${data.skills.dataScience.join(', ')}), and I'm fluent in ${data.skills.languages.join(' and ')}.`;
        }
        
        // Project questions
        if (lowerQuestion.includes('project') || lowerQuestion.includes('portfolio')) {
            return `I've worked on several projects including: ${data.projects[0].name} (${data.projects[0].description}), ${data.projects[1].name} (${data.projects[1].description}), and ${data.projects[2].name} (${data.projects[2].description}).`;
        }
        
        // Leadership questions
        if (lowerQuestion.includes('leadership') || lowerQuestion.includes('karate') || lowerQuestion.includes('volunteer')) {
            return `I have leadership experience as a ${data.leadership[0].title} at ${data.leadership[0].organization} (${data.leadership[0].duration}) - ${data.leadership[0].description}. I also served as a ${data.leadership[1].title} at ${data.leadership[1].organization} - ${data.leadership[1].description}.`;
        }
        
        // General questions
        if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi')) {
            return "Hello! I'm Yog's resume assistant. You can ask me about his experience, education, skills, or projects. What would you like to know?";
        }
        
        if (lowerQuestion.includes('who') || lowerQuestion.includes('what')) {
            return "I'm an AI assistant for Yog Trivedi's portfolio. I can help you learn about his professional background, skills, and projects. Feel free to ask me anything!";
        }
        
        // Default response
        return "I can help you learn about Yog's professional background. Try asking about his experience, education, skills, or projects. For example, you could ask 'What is his work experience?' or 'What technologies does he know?'";
    }
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.section-title, .about-content, .project-card, .timeline-item, .education-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Form handlers
function initFormHandlers() {
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = contactForm.querySelector('input[type="text"]').value;
            const email = contactForm.querySelector('input[type="email"]').value;
            const message = contactForm.querySelector('textarea').value;
            
            // Simple validation
            if (!name || !email || !message) {
                alert('Please fill in all fields.');
                return;
            }
            
            // Simulate form submission
            const submitBtn = contactForm.querySelector('.btn-primary');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                alert('Thank you for your message! I\'ll get back to you soon.');
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add smooth scrolling to all anchor links
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

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Interactive Stars functionality
function initInteractiveStars() {
    const starItems = document.querySelectorAll('.star-item');
    
    starItems.forEach(star => {
        star.addEventListener('click', () => {
            const experience = star.getAttribute('data-experience');
            navigateToExperience(experience);
        });
    });
}

function navigateToExperience(experience) {
    switch(experience) {
        case 'data-mine':
            // Scroll to experience section and highlight Data Mine
            document.getElementById('resume').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                // Highlight the Data Mine experience
                const experienceTab = document.querySelector('[data-tab="experience"]');
                if (experienceTab) {
                    experienceTab.click();
                }
            }, 500);
            break;
            
        case 'research':
            // Scroll to projects section
            document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
            break;
            
        case 'projects':
            // Scroll to projects section
            document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
            break;
            
        case 'leadership':
            // Scroll to about section and show leadership info
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
            break;
            
        case 'skills':
            // Scroll to resume section and show skills
            document.getElementById('resume').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                const skillsTab = document.querySelector('[data-tab="skills"]');
                if (skillsTab) {
                    skillsTab.click();
                }
            }, 500);
            break;
    }
}

// Custom Cursor functionality
function initCustomCursor() {
    const cursor = document.getElementById('customCursor');
    const cursorTrail = document.getElementById('cursorTrail');
    
    if (!cursor || !cursorTrail) return;
    
    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;
    
    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });
    
    // Smooth trail animation
    function animateTrail() {
        trailX += (mouseX - trailX) * 0.15;
        trailY += (mouseY - trailY) * 0.15;
        
        cursorTrail.style.left = trailX + 'px';
        cursorTrail.style.top = trailY + 'px';
        
        requestAnimationFrame(animateTrail);
    }
    animateTrail();
    
    // Add hover effects for interactive elements
    const hoverElements = document.querySelectorAll('a, button, .star-item, .project-card, .skill-item, .contact-item, .nav-link, .tab-btn');
    
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hovering');
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovering');
        });
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        cursorTrail.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        cursorTrail.style.opacity = '1';
    });
}

// Infinite Menu functionality
function initInfiniteMenu() {
    const track = document.getElementById('infiniteMenuTrack');
    if (!track) return;
    
    // Menu items data
    const menuItems = [
        {
            icon: '💼',
            title: 'Data Mine Intern',
            description: 'Collaborated with Corteva Agriscience to build a chatbot for training new formula scientists. Trained in R and Python for machine learning applications.',
            details: [
                { icon: 'fa-building', text: 'The Data Mine, Purdue' },
                { icon: 'fa-calendar', text: 'August 2025 - Present' },
                { icon: 'fa-code', text: 'Python, R, ML' }
            ]
        },
        {
            icon: '🔬',
            title: 'Undergraduate Researcher',
            description: 'Developing a Python-based predictive model to identify and map potential disease occurrences within human cells under Professor Rakesh Shiradkar.',
            details: [
                { icon: 'fa-university', text: 'Indiana University' },
                { icon: 'fa-calendar', text: 'August 2025 - Present' },
                { icon: 'fa-flask', text: 'Python, Data Science' }
            ]
        },
        {
            icon: '📱',
            title: 'FriendFusion',
            description: 'Fully functional social media app with account creation, friend management, commenting, and post creation features.',
            details: [
                { icon: 'fa-laptop-code', text: 'Personal Project' },
                { icon: 'fa-code', text: 'Java, JFrame' },
                { icon: 'fa-database', text: 'Database Integration' }
            ]
        },
        {
            icon: '🧬',
            title: 'Disease Prediction Model',
            description: 'Python-based predictive model to identify and map potential disease occurrences within human cells.',
            details: [
                { icon: 'fa-brain', text: 'Research Project' },
                { icon: 'fa-code', text: 'Python, ML' },
                { icon: 'fa-chart-line', text: 'Predictive Modeling' }
            ]
        },
        {
            icon: '🥋',
            title: 'Karate Instructor',
            description: 'Served as an Assistant Instructor for Master Kelly in Tang Soo Do, supporting students\' training and skill development.',
            details: [
                { icon: 'fa-trophy', text: 'C.S Kim Karate' },
                { icon: 'fa-calendar', text: '2015 - Present' },
                { icon: 'fa-black-belt', text: 'First Degree Black Belt' }
            ]
        },
        {
            icon: '🤖',
            title: 'Corteva Chatbot',
            description: 'AI chatbot for training new formula scientists at Corteva Agriscience using machine learning.',
            details: [
                { icon: 'fa-robot', text: 'AI Project' },
                { icon: 'fa-code', text: 'Python, R' },
                { icon: 'fa-graduation-cap', text: 'Training System' }
            ]
        }
    ];
    
    // Generate menu items (duplicate for infinite effect)
    const itemsHTML = menuItems.map(item => `
        <div class="menu-item-card">
            <div class="menu-item-image">${item.icon}</div>
            <div class="menu-item-content">
                <h3 class="menu-item-title">${item.title}</h3>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-details">
                    ${item.details.map(detail => `
                        <div class="menu-item-detail">
                            <i class="fas ${detail.icon}"></i>
                            <span>${detail.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
    
    // Duplicate items for seamless infinite scroll
    track.innerHTML = itemsHTML + itemsHTML;
    
    // Navigation arrows
    const prevBtn = document.getElementById('menuPrev');
    const nextBtn = document.getElementById('menuNext');
    let currentOffset = 0;
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const cardWidth = 350 + 32; // card width + gap
            currentOffset += cardWidth;
            track.style.animation = 'none';
            track.style.transform = `translateX(${currentOffset}px)`;
            
            setTimeout(() => {
                track.style.animation = '';
            }, 100);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const cardWidth = 350 + 32; // card width + gap
            currentOffset -= cardWidth;
            track.style.animation = 'none';
            track.style.transform = `translateX(${currentOffset}px)`;
            
            setTimeout(() => {
                track.style.animation = '';
            }, 100);
        });
    }
    
    // Click on card to expand
    track.addEventListener('click', (e) => {
        const card = e.target.closest('.menu-item-card');
        if (card) {
            // Pause animation and scale card
            track.style.animationPlayState = 'paused';
            card.style.transform = 'translateY(-10px) scale(1.1)';
            
            setTimeout(() => {
                track.style.animationPlayState = 'running';
                card.style.transform = '';
            }, 2000);
        }
    });
}

// Theme Toggle functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            
            // Update icon
            if (body.classList.contains('light-mode')) {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                localStorage.setItem('theme', 'light');
            } else {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                localStorage.setItem('theme', 'dark');
            }
        });
    }
}

// Apple-style Hero Sections Animation
function initHeroSections() {
    const heroSections = document.querySelectorAll('.hero-section');
    
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);
    
    heroSections.forEach(section => {
        observer.observe(section);
    });
}

// 3D Tilt Profile Card
function initProfileCard() {
    const wrapper = document.getElementById('profileCard');
    if (!wrapper) return;
    
    const shell = wrapper.querySelector('.pc-card-shell');
    if (!shell) return;
    
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let rafId = null;
    
    const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
    const round = (v, precision = 3) => parseFloat(v.toFixed(precision));
    
    const setVarsFromXY = (x, y) => {
        const width = shell.clientWidth || 1;
        const height = shell.clientHeight || 1;
        const percentX = clamp((100 / width) * x);
        const percentY = clamp((100 / height) * y);
        const centerX = percentX - 50;
        const centerY = percentY - 50;
        
        wrapper.style.setProperty('--pointer-x', `${percentX}%`);
        wrapper.style.setProperty('--pointer-y', `${percentY}%`);
        wrapper.style.setProperty('--pointer-from-center', clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1));
        wrapper.style.setProperty('--rotate-x', `${round(-(centerY / 4))}deg`);
        wrapper.style.setProperty('--rotate-y', `${round(centerX / 5)}deg`);
    };
    
    const animate = () => {
        const k = 0.14;
        currentX += (targetX - currentX) * k;
        currentY += (targetY - currentY) * k;
        setVarsFromXY(currentX, currentY);
        
        if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
            rafId = requestAnimationFrame(animate);
        } else {
            rafId = null;
        }
    };
    
    const handlePointerMove = (e) => {
        const rect = shell.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;
        if (!rafId) {
            rafId = requestAnimationFrame(animate);
        }
    };
    
    const handlePointerEnter = (e) => {
        shell.classList.add('active');
        const rect = shell.getBoundingClientRect();
        currentX = e.clientX - rect.left;
        currentY = e.clientY - rect.top;
        targetX = currentX;
        targetY = currentY;
        setVarsFromXY(currentX, currentY);
    };
    
    const handlePointerLeave = () => {
        targetX = shell.clientWidth / 2;
        targetY = shell.clientHeight / 2;
        if (!rafId) {
            rafId = requestAnimationFrame(animate);
        }
        setTimeout(() => {
            shell.classList.remove('active');
        }, 300);
    };
    
    shell.addEventListener('pointerenter', handlePointerEnter);
    shell.addEventListener('pointermove', handlePointerMove);
    shell.addEventListener('pointerleave', handlePointerLeave);
    
    // Initialize at center
    const centerX = shell.clientWidth / 2;
    const centerY = shell.clientHeight / 2;
    currentX = centerX;
    currentY = centerY;
    targetX = centerX;
    targetY = centerY;
    setVarsFromXY(centerX, centerY);
}

// Add parallax effect to background
window.addEventListener('scroll', debounce(() => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.watercolor-bg');
    if (parallax) {
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
    }
}, 10));
