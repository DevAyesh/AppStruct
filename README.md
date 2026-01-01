# AppStruct - AI-Powered Blueprint Generator 🚀

> Transform your app ideas into detailed architectural blueprints with the power of AI

![Modern UI](https://img.shields.io/badge/UI-Modern%20%26%20Creative-blueviolet)
![React](https://img.shields.io/badge/React-18.2-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38bdf8)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

## ✨ Features

### 🎨 Modern & Creative UI Design
- **Glassmorphism Effects** - Beautiful frosted glass aesthetics with backdrop blur
- **Gradient Animations** - Smooth, eye-catching gradient backgrounds and buttons
- **Animated Blobs** - Dynamic floating background elements
- **Micro-interactions** - Delightful hover effects and smooth transitions
- **Custom Scrollbars** - Styled scrollbars matching the color scheme
- **Toast Notifications** - Non-intrusive success/error messages
- **Loading States** - Elegant skeleton screens and loading animations

### 🎯 Core Functionality
- **AI-Powered Generation** - Create detailed app blueprints using DeepSeek AI
- **Platform Selection** - Choose between Web, Mobile, or Both platforms
- **User Authentication** - Secure login/registration with JWT tokens
- **Blueprint Management** - Save, load, and manage your blueprints
- **Markdown Export** - Download blueprints in markdown format
- **One-Click Copy** - Copy blueprints to clipboard instantly

### 💎 Design Highlights
- **Color Palette**: Vibrant indigo, purple, and pink gradients
- **Typography**: Inter font for clarity, JetBrains Mono for code
- **Animations**: Fade-in, slide-up, scale, shake, and blob animations
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
│   │   └── deepseek.js        # DeepSeek AI integration
│   └── server.js              # Express server entry point
├── src/
│   ├── App.jsx                # Main React component (Modern UI)
│   ├── index.css              # Custom styles & animations
│   ├── index.js               # React entry point
│   └── config/
│       └── db.js              # Database configuration
├── tailwind.config.js         # TailwindCSS configuration
├── Dockerfile                 # Docker container setup
└── package.json               # Dependencies
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas)
- **DeepSeek API Key**

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
DEEPSEEK_API_KEY=your_deepseek_api_key
PORT=5000
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
docker run -p 5000:5000 -e MONGODB_URI=your_uri -e DEEPSEEK_API_KEY=your_key appstruct
```

3. **Access the application:**
```
http://localhost:5000
```

## 🎨 UI/UX Features

### Navigation Bar
- **Glassmorphism Design** with backdrop blur
- **Animated Logo** with gradient background
- **User Profile Card** showing username and avatar
- **Gradient Buttons** with hover effects

### Hero Section
- **Large Bold Typography** with gradient text
- **Animated Background Blobs** creating depth
- **Compelling Copy** explaining the value proposition

### Input Section
- **Card-Based Layout** with shadow and hover effects
- **Emoji Icons** for visual appeal
- **Platform Selector** with gradient backgrounds on selection
- **Character Counter** for textarea
- **Gradient Generate Button** with shimmer effect

### Output Section
- **Enhanced Markdown Rendering** with custom styling
- **Loading Animation** with spinning icon and bouncing dots
- **Download Button** with icon animation
- **Custom Scrollbar** matching the theme
- **Empty State Graphics** for better UX

### Saved Blueprints
- **Compact Card Design** with hover effects
- **Action Buttons** (Load, Download, Copy) with tooltips
- **Platform Badges** with gradient backgrounds
- **Timestamp Display** with proper formatting

### Authentication Modal
- **Tab Switcher** for Login/Register
- **Icon-Enhanced Inputs** for better UX
- **Gradient Submit Button**
- **Smooth Animations** on open/close
- **Error Handling** with visual feedback

### Toast Notifications
- **Non-Intrusive Design** at top-right
- **Auto-Dismiss** after 3 seconds
- **Success/Error States** with different colors
- **Smooth Slide-Down Animation**

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI library
- **TailwindCSS 3.3** - Utility-first CSS framework
- **@tailwindcss/forms** - Form styling
- **react-markdown** - Markdown rendering

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **DeepSeek API** - AI blueprint generation

### DevOps
- **Docker** - Containerization
- **Git** - Version control

## 🎯 Color Scheme

```css
Primary Colors:
- Indigo: #6366f1
- Purple: #a855f7
- Pink: #ec4899

Gradient Combinations:
- from-indigo-600 via-purple-600 to-pink-600
- from-indigo-50 via-purple-50 to-pink-50
- from-green-500 to-emerald-600
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
- `POST /api/generate` - Generate new blueprint
- `POST /api/blueprints` - Save blueprint
- `GET /api/blueprints` - Get user's blueprints

## 🎨 Custom Animations

- **fadeIn** - Smooth opacity transition
- **slideUp** - Slide from bottom
- **slideDown** - Slide from top
- **scaleIn** - Scale with bounce
- **shake** - Error shake effect
- **blob** - Floating background animation
- **bounce** - Loading dots animation

## 🚀 Performance Optimizations

- **Lazy Loading** - Components load on demand
- **Code Splitting** - Optimized bundle sizes
- **Image Optimization** - Compressed assets
- **CSS Purging** - Unused styles removed in production
- **Minification** - JavaScript and CSS minified
- **Caching** - Browser caching enabled

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

- **DeepSeek AI** - For powering the blueprint generation
- **TailwindCSS** - For the amazing utility-first CSS framework
- **React** - For the powerful UI library
- **Inter Font** - For beautiful typography
- **Heroicons** - For the icon set

## 📞 Support

For support, email support@appstruct.com or open an issue in the repository.

---

**Made with ❤️ by the AppStruct Team**

⭐ Star us on GitHub if you find this project useful!