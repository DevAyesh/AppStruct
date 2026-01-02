# AppStruct - AI-Powered Blueprint Generator 🚀

> Transform your app ideas into detailed architectural blueprints with the power of AI

![Modern UI](https://img.shields.io/badge/UI-Modern%20%26%20Clean-blueviolet)
![React](https://img.shields.io/badge/React-18.2-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38bdf8)
![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%202.5-4285F4)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

## ✨ Features

### 🎨 Modern Clean UI Design
- **Gradient Background** - Beautiful blue-to-purple-to-pink gradient backdrop
- **Centered Hero Layout** - Clean, focused design with large input area
- **Glassmorphism Effects** - Frosted glass aesthetics with backdrop blur
- **Pill-Shaped Controls** - Modern rounded buttons and selectors
- **Real-time Streaming** - Watch your blueprint generate in real-time
- **Toast Notifications** - Non-intrusive success/error messages
- **Smooth Animations** - Elegant transitions and hover effects

### 🎯 Core Functionality
- **AI-Powered Generation** - Create detailed app blueprints using Google Gemini 2.5 Flash
- **Detail Level Selection** - Choose between Quick (10-20s) or Detailed (30-60s) blueprints
- **Platform Selection** - Choose between Web, Mobile, or Both platforms
- **Quick Start Suggestions** - Pre-filled ideas to get started instantly
- **User Authentication** - Secure login/registration with JWT tokens
- **Blueprint Management** - Save, load, and manage your blueprints
- **Markdown Export** - Download blueprints in markdown format
- **One-Click Copy** - Copy blueprints to clipboard instantly

### 💎 Design Highlights
- **Color Palette**: Gradient from blue (#2563eb) to purple (#9333ea)
- **Layout**: Centered hero section with large input box
- **Typography**: System fonts for optimal performance
- **Animations**: Fade-in, slide-up, and smooth transitions
- **Responsive**: Fully responsive design for all screen sizes
- **Accessibility**: WCAG compliant with proper contrast ratios

## 🏗️ Project Structure

```
App Struct/
├── build/                      # Production build files
├── public/
│   ├── index.html             # Enhanced HTML with loading screen
│   └── manifest.json          # PWA manifest with modern theme
├── server/
│   ├── config/
│   │   └── config.js          # Server configuration
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── models/
│   │   ├── Blueprint.js       # Blueprint data model
│   │   └── User.js            # User data model
│   ├── routes/
│   │   └── auth.js            # Authentication routes
│   ├── services/
│   │   └── deepseek.js        # Google Gemini AI integration
│   └── server.js              # Express server entry point
├── src/
│   ├── App.jsx                # Main React component (Modern Gradient UI)
│   ├── index.css              # Custom styles & gradient animations
│   ├── index.js               # React entry point
│   └── config/
│       └── api.js             # API configuration
├── tailwind.config.js         # TailwindCSS configuration
├── Dockerfile                 # Docker container setup
└── package.json               # Dependencies
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas)
- **Google Gemini API Key** (Get it free from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd "App Struct"
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
```

4. **Set up environment variables**

Create a `.env` file in the `server` directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Create a `.env.production` file in the root directory (for frontend):
```env
REACT_APP_API_URL=your_backend_url
```

### Running the Application

#### Development Mode

**Terminal 1 - Backend Server:**
```bash
cd server
node server.js
```

**Terminal 2 - Frontend Development Server:**
```bash
npm start
```

The app will open at `http://localhost:3000`

#### Production Mode

1. **Build the frontend:**
```bash
npm run build
```

2. **Start the backend:**
```bash
cd server
node server.js
```

Access the app at `http://localhost:5000`

### Running with Docker

1. **Build the Docker image:**
```bash
docker build -t appstruct .
```

2. **Run the container:**
```bash
docker run -p 5000:5000 -e MONGODB_URI=your_uri -e GEMINI_API_KEY=your_key appstruct
```

3. **Access the application:**
```
http://localhost:5000
```

## 🎨 UI/UX Features

### Navigation Bar
- **Semi-Transparent Design** with backdrop blur
- **Gradient Logo** (blue to purple)
- **Pill-Shaped Buttons** with rounded edges
- **User Info Display** with saved blueprints counter
- **Gradient "Get Started" Button**

### Hero Section (Main View)
- **Centered Layout** with maximum focus
- **Large Bold Typography** with gradient text effect
- **Gradient Background** (blue → purple → pink)
- **Large Input Box** as the main focal point
- **Quick Start Suggestions** with pre-filled ideas

### Input Box
- **White Card Design** with rounded corners and shadow
- **Borderless Textarea** for clean look
- **Inline Controls** at the bottom:
  - Platform pills (Web, Mobile, Both)
  - Detail level pills (Quick, Detailed)
  - Large gradient Generate button
- **Smooth Transitions** on all interactions

### Blueprint Output View
- **Clean Header** with back button and actions
- **Centered Content** in white card
- **Copy & Download Buttons** with gradient styling
- **Enhanced Markdown Rendering** with gradient headings
- **Smooth Scroll** with custom styling

### Saved Blueprints Sidebar
- **Slide-in Panel** from the right
- **Semi-Transparent Background** with backdrop blur
- **Gradient Card Design** for each blueprint
- **Load & Download Actions** with smooth transitions
- **Platform Badges** with color coding

### Authentication Modal
- **Large Rounded Design** for modern look
- **Gradient Tab Switcher** (Login/Register)
- **Spacious Input Fields** with focus states
- **Gradient Submit Button** with shadow effects
- **Smooth Animations** on open/close

### Toast Notifications
- **Top-Right Positioning** for non-intrusive feedback
- **Auto-Dismiss** after 3 seconds
- **Color-Coded States** (success/error)
- **Smooth Slide Animation**

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI library
- **TailwindCSS 3.3** - Utility-first CSS framework
- **react-markdown** - Markdown rendering
- **react-icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Google Gemini 2.5 Flash** - AI blueprint generation with streaming support

### DevOps
- **Docker** - Containerization
- **Git** - Version control
- **Vercel** - Frontend deployment
- **Railway** - Backend deployment
- **MongoDB Atlas** - Database hosting

## 🎯 Color Scheme

```css
Primary Gradient:
- Blue: #2563eb (blue-600)
- Purple: #9333ea (purple-600)

Background Gradient:
- from-blue-50 via-purple-50 to-pink-50

Accent Colors:
- Purple-100: #f3e8ff (for highlights)
- Purple-200: #e9d5ff (for borders)
- Blue-100: #dbeafe (for badges)

Text Colors:
- Gray-900: #111827 (primary text)
- Gray-600: #4b5563 (secondary text)
- Gray-500: #6b7280 (tertiary text)
```

## 📱 Responsive Design

The UI is fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔐 Authentication Flow

1. User clicks "Get Started" button
2. Modal opens with Login/Register tabs
3. User enters email and password
4. JWT token is generated and stored
5. User is authenticated for all protected routes
6. Blueprints are associated with user account

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get user profile

### Blueprints
- `POST /api/generate-stream` - Generate blueprint with real-time streaming
- `POST /api/blueprints` - Save blueprint
- `GET /api/blueprints` - Get user's blueprints

## 🌐 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables:
   - `REACT_APP_API_URL` - Your backend URL
3. Deploy with automatic builds on push

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Set the root directory to `server`
3. Choose "Nixpacks" as the builder
4. Set environment variables:
   - `MONGODB_URI` - MongoDB Atlas connection string
   - `JWT_SECRET` - Secret key for JWT
   - `GEMINI_API_KEY` - Google Gemini API key
   - `FRONTEND_URL` - Your Vercel frontend URL
   - `PORT` - 5000 (or Railway default)
5. Deploy and get your production URL

### Database (MongoDB Atlas)
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Add your IP address to the whitelist (or allow all: 0.0.0.0/0)
3. Create a database user
4. Get the connection string
5. Add it to your backend environment variables

## 🎨 Custom Animations

- **fadeIn** - Smooth opacity transition
- **slideUp** - Slide from bottom
- **slideDown** - Slide from top
- **scaleIn** - Scale with bounce
- **shake** - Error shake effect
- **blob** - Floating background animation
- **bounce** - Loading dots animation

## 🚀 Performance Optimizations

- **Real-Time Streaming** - Blueprints generate and display progressively
- **Lazy Loading** - Components load on demand
- **Code Splitting** - Optimized bundle sizes
- **CSS Purging** - Unused styles removed in production
- **Minification** - JavaScript and CSS minified
- **Caching** - Browser caching enabled
- **Optimized API Calls** - Using Gemini 2.5 Flash for speed

## ⚡ Streaming Feature

The app uses **Server-Sent Events (SSE)** for real-time blueprint generation:

1. User submits their app idea
2. Backend streams chunks of the blueprint as they're generated
3. Frontend displays content progressively
4. Users see results immediately without waiting for completion
5. Provides better UX with visual feedback

**Benefits:**
- Faster perceived performance
- Real-time feedback
- Better user engagement
- Reduced wait times

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Google Gemini AI** - For powering the blueprint generation with real-time streaming
- **TailwindCSS** - For the amazing utility-first CSS framework
- **React** - For the powerful UI library
- **React Icons** - For the comprehensive icon set
- **MongoDB Atlas** - For reliable database hosting
- **Vercel & Railway** - For seamless deployment platforms

## 📞 Support

For support, open an issue in the repository or contact the development team.

---

**Made with ❤️ by the AppStruct Team**

⭐ Star us on GitHub if you find this project useful!