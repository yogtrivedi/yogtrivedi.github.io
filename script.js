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
    initTypingAnimation();
    initShuffleText();
    initWeatherParticles();
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
    
    // Earth-like shader material
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;
            void main() {
                vUv = uv;
                vPosition = position;
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;
            
            // Earth colors
            vec3 oceanColor = vec3(0.0, 0.3, 0.6);
            vec3 landColor = vec3(0.2, 0.5, 0.2);
            vec3 desertColor = vec3(0.8, 0.7, 0.4);
            vec3 iceColor = vec3(0.9, 0.95, 1.0);
            vec3 cloudColor = vec3(1.0, 1.0, 1.0);
            
            // Simple noise function
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }
            
            float noise(vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
            
            void main() {
                // Create continent-like patterns
                float scale = 5.0;
                float landNoise = noise(vUv * scale + time * 0.01);
                float detailNoise = noise(vUv * scale * 3.0) * 0.3;
                float continents = landNoise + detailNoise;
                
                // Polar ice caps
                float latitude = abs(vUv.y - 0.5) * 2.0;
                float iceCap = smoothstep(0.85, 1.0, latitude);
                
                // Base color (ocean vs land)
                vec3 baseColor = mix(oceanColor, landColor, smoothstep(0.45, 0.55, continents));
                
                // Add desert regions
                float desertPattern = noise(vUv * scale * 2.0 + vec2(100.0, 50.0));
                baseColor = mix(baseColor, desertColor, smoothstep(0.6, 0.7, continents) * smoothstep(0.4, 0.6, desertPattern));
                
                // Add ice caps
                baseColor = mix(baseColor, iceColor, iceCap);
                
                // Clouds (animated)
                float cloudPattern = noise(vUv * scale * 2.5 + time * 0.05);
                cloudPattern *= noise(vUv * scale * 4.0 - time * 0.03);
                float clouds = smoothstep(0.6, 0.7, cloudPattern);
                baseColor = mix(baseColor, cloudColor, clouds * 0.3);
                
                // Atmospheric glow
                float fresnel = pow(1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
                vec3 atmosphereColor = vec3(0.3, 0.6, 1.0);
                vec3 finalColor = mix(baseColor, atmosphereColor, fresnel * 0.3);
                
                // Add slight brightness variation
                float brightness = 0.8 + sin(vPosition.y * 3.0 + time * 0.5) * 0.2;
                finalColor *= brightness;
                
                gl_FragColor = vec4(finalColor, 0.95);
            }
        `,
        transparent: true
    });

    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Add subtle wireframe for grid lines
    const wireframeGeometry = new THREE.SphereGeometry(1.005, 32, 32);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x88ccff,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframe);
    
    // Add electric glow around Earth
    const glowGeometry = new THREE.SphereGeometry(1.15, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            glowColor: { value: new THREE.Color(0x4c3a6e) }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 glowColor;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                // Electric glow effect
                float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                
                // Add animated electricity
                float electric = sin(vPosition.x * 10.0 + time * 3.0) * 
                                sin(vPosition.y * 10.0 + time * 2.0) * 
                                sin(vPosition.z * 10.0 + time * 4.0);
                electric = smoothstep(0.5, 0.8, electric);
                
                // Combine glow with electric arcs
                float finalIntensity = intensity + electric * 0.3;
                
                vec3 glow = glowColor * finalIntensity;
                
                gl_FragColor = vec4(glow, finalIntensity * 0.6);
            }
        `,
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
    });
    
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);
    
    // Store reference for animation
    globe.glowMesh = glowMesh;
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
        
        // Animate electric glow
        if (globe.glowMesh) {
            globe.glowMesh.rotation.y = globe.rotation.y;
            globe.glowMesh.rotation.x = globe.rotation.x;
            globe.glowMesh.material.uniforms.time.value = time;
        }
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

    // Resume data for chatbot - COMPLETE RESUME
    const resumeData = {
        personalInfo: {
            name: "Yog Trivedi",
            location: "Pittsburgh, PA 15241",
            phone: "412-518-8913",
            email: "trivediy@purdue.edu",
            website: "https://yogtrivedi.github.io"
        },
        experience: [
            {
                title: "Data Science Intern",
                company: "The Data Mine, Purdue University",
                location: "Indianapolis, IN",
                duration: "August 2025 - Present",
                description: "Collaborated with Corteva Agriscience on building a chatbot to train onboarding formula scientists. Trained to use R and Python in TDM 101 for machine learning used in training the chatbot."
            },
            {
                title: "Undergraduate Researcher",
                company: "Indiana University Luddy School of Informatics",
                location: "Indianapolis, IN",
                duration: "August 2025 - Present",
                description: "Undergraduate researcher under Professor Rakesh Shiradkar. Developing a Python based predictive model to identify and map potential disease occurrences within human prostate cells."
            },
            {
                title: "Food Runner",
                company: "Topgolf",
                location: "Pittsburgh, PA",
                duration: "June 2022 - August 2022",
                description: "Worked as a Food Runner at Topgolf, efficiently preparing and delivering food orders to guests, ensuring a high quality dining experience. Collaborated with kitchen and service teams to maintain fast, accurate, and clean service."
            }
        ],
        education: [
            {
                degree: "Bachelor of Science, Computer Science",
                school: "Purdue University, College of Science",
                location: "West Lafayette, IN",
                year: "Class of 2028"
            }
        ],
        skills: {
            programming: ["Java", "C", "Python", "R"],
            specializations: ["Machine Learning", "Predictive Modeling", "Data Analysis", "Chatbot Development", "Thread-Safe Database Integration", "Memory Management"],
            languages: ["English", "Gujarati (Fluent)"],
            frameworks: ["Next.js", "TensorFlow.js", "Framer Motion"]
        },
        projects: [
            {
                name: "Passionfruit",
                achievement: "3rd place at the first ever BDPA Indianapolis hackathon",
                description: "Built an AI-driven interview coaching platform with Next.js 15, Tailwind, Framer Motion, and Zustand, delivering responsive UI, dark/light theming, and animated hero experiences that increased session engagement. Implemented real-time face-tracking analytics (TensorFlow.js) to surface eye-contact, posture, and expression metrics, boosting interviewer-readiness insights by 35% during mock interviews. Engineered a Gemini-powered resume critique service with PDF/DOCX parsing (pdf-parse, mammoth), role-based evaluations, and actionable growth tips enriched with learning resources, reducing manual resume review time by 60%. Developed an AI coaching API layer that orchestrates OpenAI and Gemini responses, provides scripted interview feedback, and maintains provider fallbacks to ensure reliable user guidance. Enhanced accessibility and onboarding with camera-use notifications, animated UI cues, and voice synthesis using human-like speech selection, improving feature adoption across the interview workflow.",
                tech: ["Next.js 15", "TensorFlow.js", "Gemini AI", "OpenAI", "Tailwind", "Framer Motion", "Zustand"]
            },
            {
                name: "FriendFusion",
                description: "Developed a fully functioning social media app titled FriendFusion, leveraging Java for the backend and JFrame for the frontend. Implemented core features including account creation, login, user search, friend management (add/block), commenting, upvoting/downvoting comments, and post creation.",
                tech: ["Java", "JFrame", "Database Integration", "Thread-Safe Programming"]
            },
            {
                name: "Disease Prediction Model",
                description: "Python-based predictive model to identify and map potential disease occurrences within human prostate cells",
                tech: ["Python", "Machine Learning", "Predictive Modeling"]
            }
        ],
        leadership: [
            {
                title: "Assistant Instructor",
                organization: "C.S Kim Karate",
                location: "Pittsburgh, PA",
                duration: "2015 - Present",
                description: "Served as an Assistant Instructor for Master Kelly in Tang Soo Do under C.S. Kim Karate, supporting students' training and skill development while reinforcing techniques and discipline. Achieved First Degree Black Belt (Cho Dan) as a Certified Instructor with C.S. Kim Karate."
            },
            {
                title: "Team Director",
                organization: "Jubilee Soup Kitchen",
                location: "Pittsburgh",
                description: "Directed the Jubilee Soup Kitchen team in Pittsburgh, overseeing operations and providing instructions to new volunteers in cooking, cleaning, and serving food to the homeless."
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
        
        // Contact/Personal Info
        if (lowerQuestion.includes('contact') || lowerQuestion.includes('email') || lowerQuestion.includes('phone')) {
            return `You can reach Yog at ${data.personalInfo.email} or call ${data.personalInfo.phone}. He's based in ${data.personalInfo.location}. Visit his portfolio at ${data.personalInfo.website}`;
        }
        
        // Experience questions
        if (lowerQuestion.includes('experience') || lowerQuestion.includes('work') || lowerQuestion.includes('job')) {
            return `Yog has ${data.experience.length} professional experiences. Currently: (1) ${data.experience[0].title} at ${data.experience[0].company} - ${data.experience[0].description}. (2) ${data.experience[1].title} at ${data.experience[1].company} under Professor Rakesh Shiradkar - ${data.experience[1].description}. Previously worked at Topgolf as a Food Runner (June-Aug 2022).`;
        }
        
        // Education questions
        if (lowerQuestion.includes('education') || lowerQuestion.includes('degree') || lowerQuestion.includes('school') || lowerQuestion.includes('purdue')) {
            return `Yog is pursuing a ${data.education[0].degree} at ${data.education[0].school} in ${data.education[0].location}, ${data.education[0].year}.`;
        }
        
        // Skills questions
        if (lowerQuestion.includes('skill') || lowerQuestion.includes('technology') || lowerQuestion.includes('tech') || lowerQuestion.includes('language')) {
            return `Programming: ${data.skills.programming.join(', ')}. Specializations: ${data.skills.specializations.join(', ')}. Frameworks: ${data.skills.frameworks.join(', ')}. Languages: ${data.skills.languages.join(' and ')}.`;
        }
        
        // Passionfruit specific
        if (lowerQuestion.includes('passionfruit') || lowerQuestion.includes('hackathon') || lowerQuestion.includes('bdpa')) {
            return `Passionfruit won 3rd place at the first ever BDPA Indianapolis hackathon! It's an AI-driven interview coaching platform built with Next.js 15, TensorFlow.js for real-time face tracking (35% improvement in readiness insights), Gemini AI for resume critique (60% reduction in review time), and includes OpenAI integration for coaching feedback.`;
        }
        
        // FriendFusion specific
        if (lowerQuestion.includes('friendfusion') || lowerQuestion.includes('social media')) {
            return `FriendFusion is a fully functioning social media app built with Java backend and JFrame frontend. Features: account creation, login, user search, friend management (add/block), commenting, upvoting/downvoting, and post creation. Demonstrates strong proficiency in thread-safe database integration.`;
        }
        
        // Research/Disease Model
        if (lowerQuestion.includes('research') || lowerQuestion.includes('disease') || lowerQuestion.includes('prostate') || lowerQuestion.includes('iu')) {
            return `Yog is an Undergraduate Researcher at Indiana University Luddy School of Informatics under Professor Rakesh Shiradkar. He's developing a Python-based predictive model to identify and map potential disease occurrences within human prostate cells using machine learning.`;
        }
        
        // Data Mine/Corteva
        if (lowerQuestion.includes('data mine') || lowerQuestion.includes('corteva') || lowerQuestion.includes('chatbot')) {
            return `At The Data Mine (Purdue), Yog collaborated with Corteva Agriscience to build a chatbot for training onboarding formula scientists. He's trained in R and Python for machine learning applications used in the chatbot.`;
        }
        
        // Project questions (general)
        if (lowerQuestion.includes('project') || lowerQuestion.includes('portfolio')) {
            return `Yog's key projects: (1) Passionfruit - 3rd place BDPA hackathon winner, AI interview coach with TensorFlow face tracking; (2) FriendFusion - Full social media app in Java; (3) Disease Prediction Model - Python ML for prostate cell analysis.`;
        }
        
        // Leadership questions
        if (lowerQuestion.includes('leadership') || lowerQuestion.includes('karate') || lowerQuestion.includes('volunteer') || lowerQuestion.includes('soup kitchen')) {
            return `Leadership: (1) C.S. Kim Karate Assistant Instructor (2015-Present) - First Degree Black Belt (Cho Dan), teaches Tang Soo Do under Master Kelly. (2) Jubilee Soup Kitchen Team Director - Oversees operations and trains volunteers in cooking, cleaning, and serving food to the homeless in Pittsburgh.`;
        }
        
        // General questions
        if (lowerQuestion.includes('hello') || lowerQuestion.includes('hi')) {
            return "Hello! I'm Yog's resume assistant. Ask me about his hackathon wins, research at IU, Data Mine work, projects like Passionfruit or FriendFusion, skills, or leadership experience!";
        }
        
        if (lowerQuestion.includes('who')) {
            return `Yog Trivedi is a Computer Science student at Purdue University (Class of 2028) from Pittsburgh, PA. He's a researcher, hackathon winner, karate instructor, and passionate about AI/ML and software development.`;
        }
        
        // Default response
        return "I can help you learn about Yog's background! Try asking about: Passionfruit (hackathon winner), his research at IU, Data Mine internship, FriendFusion project, programming skills, or karate instructor experience.";
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
            icon: '🍑',
            title: 'Passionfruit 🥉',
            description: '3rd place at BDPA Indianapolis hackathon. AI-driven interview coaching with real-time face tracking analytics and Gemini-powered resume critique.',
            details: [
                { icon: 'fa-trophy', text: '3rd Place Winner' },
                { icon: 'fa-code', text: 'Next.js, TensorFlow.js' },
                { icon: 'fa-brain', text: 'Gemini AI, OpenAI' }
            ]
        },
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
            description: 'Developing a Python-based predictive model to identify and map potential disease occurrences within human prostate cells under Professor Rakesh Shiradkar.',
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
            icon: '🥋',
            title: 'Karate Instructor',
            description: 'Served as an Assistant Instructor for Master Kelly in Tang Soo Do, supporting students\' training and skill development.',
            details: [
                { icon: 'fa-trophy', text: 'C.S Kim Karate' },
                { icon: 'fa-calendar', text: '2015 - Present' },
                { icon: 'fa-black-belt', text: 'First Degree Black Belt' }
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
    const colorThemeToggle = document.getElementById('colorThemeToggle');
    const body = document.body;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
    
    // Check for saved color theme
    const savedColorTheme = localStorage.getItem('colorTheme');
    if (savedColorTheme === 'crimson') {
        body.classList.add('crimson-theme');
        updateGlobeGlow('crimson');
    }
    
    // Light/Dark toggle
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
    
    // Color theme toggle (Purple <-> Crimson)
    if (colorThemeToggle) {
        colorThemeToggle.addEventListener('click', () => {
            body.classList.toggle('crimson-theme');
            
            if (body.classList.contains('crimson-theme')) {
                localStorage.setItem('colorTheme', 'crimson');
                updateGlobeGlow('crimson');
            } else {
                localStorage.setItem('colorTheme', 'purple');
                updateGlobeGlow('purple');
            }
        });
    }
}

// Update Earth's electric glow color
function updateGlobeGlow(theme) {
    if (!globe || !globe.glowMesh) return;
    
    const color = theme === 'crimson' 
        ? new THREE.Color(0xDC143C) 
        : new THREE.Color(0x4c3a6e);
    
    globe.glowMesh.material.uniforms.glowColor.value = color;
}

// Apple-style Hero Sections Animation
function initHeroSections() {
    const heroSections = document.querySelectorAll('.hero-section');
    let activatedSections = new Set();
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -20% 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !activatedSections.has(entry.target)) {
                // Add active class immediately
                entry.target.classList.add('active');
                activatedSections.add(entry.target);
                
                // Unobserve this section once activated (one-time trigger)
                observer.unobserve(entry.target);
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

// Shuffle Text Animation for Name
function initShuffleText() {
    const titleLines = document.querySelectorAll('.title-line');
    if (!titleLines.length) return;
    
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const shuffleSpeed = 50; // ms per shuffle
    const shuffleCycles = 8; // number of times to shuffle each character
    
    const shuffleText = (element) => {
        const originalText = element.textContent;
        const chars = originalText.split('');
        let currentCycle = 0;
        
        const shuffle = () => {
            if (currentCycle >= shuffleCycles) {
                element.textContent = originalText;
                return;
            }
            
            const shuffled = chars.map((char, index) => {
                if (char === ' ') return ' ';
                if (currentCycle < shuffleCycles - 1) {
                    return charset[Math.floor(Math.random() * charset.length)];
                }
                return originalText[index];
            }).join('');
            
            element.textContent = shuffled;
            currentCycle++;
            
            setTimeout(shuffle, shuffleSpeed);
        };
        
        shuffle();
    };
    
    // Trigger shuffle on page load
    setTimeout(() => {
        titleLines.forEach((line, index) => {
            setTimeout(() => shuffleText(line), index * 200);
        });
    }, 500);
    
    // Trigger shuffle on hover
    titleLines.forEach(line => {
        line.addEventListener('mouseenter', () => {
            shuffleText(line);
        });
    });
}

// Typing Animation
function initTypingAnimation() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;
    
    const texts = [
        'Computer Science Student',
        'Full Stack Developer',
        'Machine Learning Enthusiast',
        'Problem Solver'
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;
    
    const typingSpeed = 80;
    const deletingSpeed = 50;
    const pauseDuration = 2000;
    const initialDelay = 1500;
    
    function type() {
        const currentText = texts[textIndex];
        
        if (isPaused) {
            setTimeout(type, pauseDuration);
            isPaused = false;
            return;
        }
        
        if (isDeleting) {
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            
            if (charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                setTimeout(type, 500);
                return;
            }
        } else {
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            
            if (charIndex === currentText.length) {
                isPaused = true;
                isDeleting = true;
                setTimeout(type, pauseDuration);
                return;
            }
        }
        
        setTimeout(type, isDeleting ? deletingSpeed : typingSpeed);
    }
    
    // Start typing after initial delay
    setTimeout(() => {
        type();
    }, initialDelay);
}

// Weather Particles System (Snow/Rain)
function initWeatherParticles() {
    const container = document.getElementById('particlesContainer');
    const toggleBtn = document.getElementById('weatherToggle');
    if (!container || !toggleBtn) return;
    
    let weatherMode = 'off'; // 'off', 'snow', 'rain'
    let particlesArray = [];
    
    const weatherModes = ['off', 'snow', 'rain'];
    const weatherIcons = {
        'off': 'fa-snowflake',
        'snow': 'fa-cloud-rain',
        'rain': 'fa-times'
    };
    
    function createParticles(mode) {
        // Clear existing particles
        container.innerHTML = '';
        particlesArray = [];
        
        if (mode === 'off') return;
        
        const particleCount = mode === 'snow' ? 100 : 150;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = `particle ${mode}`;
            
            // Random starting position
            particle.style.left = Math.random() * 100 + '%';
            
            // Random animation duration
            const duration = mode === 'snow' 
                ? 10 + Math.random() * 20 
                : 0.5 + Math.random() * 1;
            particle.style.animationDuration = duration + 's';
            
            // Random delay
            particle.style.animationDelay = Math.random() * 5 + 's';
            
            // Random size for snow
            if (mode === 'snow') {
                const size = 2 + Math.random() * 4;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
            }
            
            container.appendChild(particle);
            particlesArray.push(particle);
        }
    }
    
    toggleBtn.addEventListener('click', () => {
        const currentIndex = weatherModes.indexOf(weatherMode);
        const nextIndex = (currentIndex + 1) % weatherModes.length;
        weatherMode = weatherModes[nextIndex];
        
        // Update icon
        const icon = toggleBtn.querySelector('i');
        icon.className = `fas ${weatherIcons[weatherMode]}`;
        
        // Create particles
        createParticles(weatherMode);
        
        // Save preference
        localStorage.setItem('weatherMode', weatherMode);
    });
    
    // Load saved preference
    const savedWeather = localStorage.getItem('weatherMode');
    if (savedWeather && weatherModes.includes(savedWeather)) {
        weatherMode = savedWeather;
        const icon = toggleBtn.querySelector('i');
        icon.className = `fas ${weatherIcons[weatherMode]}`;
        createParticles(weatherMode);
    }
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
