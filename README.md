# Personal Portfolio Website

A stunning, modern personal portfolio website featuring a 3D rotating globe/constellation homepage, dark watercolor background, and an AI-powered chatbot for resume questions.

## Features

### 🎨 Design & Aesthetics
- **Dark Watercolor Background**: Animated gradient background with flowing watercolor effects
- **3D Globe Homepage**: Interactive rotating globe with constellation patterns using Three.js
- **Smooth Animations**: CSS transitions and JavaScript animations throughout
- **Modern UI**: Clean, minimalist design with glassmorphism effects

### 🌟 Interactive Elements
- **3D Constellation**: Stars that form constellation patterns around the globe
- **Responsive Navigation**: Smooth scrolling navigation with active section highlighting
- **Interactive Resume**: Tabbed interface for experience, education, and skills
- **Project Showcase**: Animated project cards with hover effects

### 🤖 AI Chatbot
- **Resume Assistant**: Ask questions about experience, education, skills, and projects
- **Smart Responses**: Context-aware responses based on resume data
- **Interactive Interface**: Modern chat interface with smooth animations

### 📱 Responsive Design
- **Mobile-First**: Optimized for all device sizes
- **Touch-Friendly**: Mobile navigation and interactions
- **Performance**: Optimized animations and smooth scrolling

## File Structure

```
Personal Project/
├── index.html          # Main HTML structure
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript functionality and 3D globe
└── README.md           # This file
```

## Technologies Used

- **HTML5**: Semantic structure
- **CSS3**: Advanced styling with gradients, animations, and glassmorphism
- **JavaScript (ES6+)**: Modern JavaScript with classes and modules
- **Three.js**: 3D graphics and WebGL rendering
- **Font Awesome**: Icons
- **Google Fonts**: Inter font family

## Key Features Breakdown

### 3D Globe Implementation
- **Three.js Scene**: 3D scene with camera, renderer, and lighting
- **Animated Globe**: Rotating sphere with gradient shader material
- **Constellation Stars**: 200+ animated stars with connecting lines
- **Interactive Camera**: Smooth camera movements and rotations

### Watercolor Background
- **CSS Gradients**: Multiple radial gradients for watercolor effect
- **Keyframe Animations**: Flowing color transitions
- **Parallax Effect**: Background moves with scroll for depth

### Resume Chatbot
- **Natural Language Processing**: Simple keyword matching for questions
- **Resume Data Structure**: Organized data for experience, education, skills
- **Context-Aware Responses**: Different responses based on question type
- **Smooth UI**: Animated chat interface with typing effects

### Responsive Design
- **Mobile Navigation**: Hamburger menu for mobile devices
- **Flexible Grid**: CSS Grid and Flexbox for responsive layouts
- **Touch Interactions**: Optimized for touch devices
- **Performance**: Debounced scroll events and optimized animations

## Customization

### Adding Your Resume Data
Edit the `resumeData` object in `script.js` to include your information:

```javascript
const resumeData = {
    experience: [
        {
            title: "Your Job Title",
            company: "Company Name",
            duration: "2020 - Present",
            description: "Your job description..."
        }
    ],
    education: [...],
    skills: {...},
    projects: [...]
};
```

### Styling Customization
- **Colors**: Modify CSS custom properties for brand colors
- **Fonts**: Change Google Fonts import in HTML
- **Animations**: Adjust timing and easing in CSS
- **3D Effects**: Modify Three.js parameters in `script.js`

### Adding Projects
Update the projects section in HTML and add corresponding data to the chatbot:

```html
<div class="project-card">
    <div class="project-image">
        <div class="project-overlay">
            <i class="fas fa-external-link-alt"></i>
        </div>
    </div>
    <div class="project-content">
        <h3>Your Project Name</h3>
        <p>Project description</p>
        <div class="project-tech">
            <span>Technology 1</span>
            <span>Technology 2</span>
        </div>
    </div>
</div>
```

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **WebGL Support**: Required for 3D globe functionality
- **ES6+ Features**: Modern JavaScript features used throughout

## Performance Optimizations

- **Debounced Events**: Scroll and resize events are debounced
- **RequestAnimationFrame**: Smooth 3D animations
- **CSS Transforms**: Hardware-accelerated animations
- **Lazy Loading**: Images and heavy content loaded on demand

## Getting Started

1. **Open the Website**: Simply open `index.html` in a modern web browser
2. **Local Server** (Recommended): Use a local server for best performance:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```
3. **Customize**: Edit the content in HTML, styles in CSS, and functionality in JavaScript

## Future Enhancements

- **Contact Form Backend**: Add server-side form processing
- **Analytics**: Google Analytics integration
- **SEO Optimization**: Meta tags and structured data
- **PWA Features**: Service worker for offline functionality
- **Advanced 3D**: More complex 3D scenes and interactions
- **AI Integration**: Real AI chatbot with API integration

## License

This project is open source and available under the MIT License.

---

**Created with ❤️ for a stunning personal portfolio experience**
