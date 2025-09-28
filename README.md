# App Struct

## Project Structure

```
App Struct/
├── build/
│   ├── asset-manifest.json
│   ├── index.html
│   ├── manifest.json
│   └── static/
│       ├── css/
│       │   ├── main.21759ff9.css
│       │   └── main.21759ff9.css.map
│       └── js/
│           ├── main.6477bac7.js
│           ├── main.6477bac7.js.LICENSE.txt
│           └── main.6477bac7.js.map
├── Dockerfile
├── package-lock.json
├── package.json
├── public/
│   ├── index.html
│   └── manifest.json
├── README.md
├── server/
│   ├── config/
│   │   └── config.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Blueprint.js
│   │   └── User.js
│   ├── package-lock.json
│   ├── package.json
│   ├── routes/
│   │   └── auth.js
│   ├── server.js
│   ├── services/
│   │   └── deepseek.js
│   ├── test.js
│   └── verify-key.js
├── src/
│   ├── App.jsx
│   ├── config/
│   │   └── db.js
│   ├── index.css
│   ├── index.js
│   └── models/
│       └── Blueprint.js
└── tailwind.config.js
```

## How to Run the App

### Prerequisites

- Ensure you have Docker installed on your machine.
- Make sure you have Node.js and npm installed if you plan to run the app without Docker.

### Running with Docker

1. **Build the Docker Image**:
   ```bash
   docker build -t app-struct .
   ```

2. **Run the Docker Container**:
   ```bash
   docker run -p 5000:5000 app-struct
   ```

3. **Access the Application**:
   - Open your browser and go to `http://localhost:5000`.

### Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   cd server && npm install
   ```

2. **Set Up Environment Variables**:
   - Create a `.env` file in the `server` directory with the necessary environment variables.

3. **Start the Server**:
   ```bash
   cd server
   node server.js
   ```

4. **Start the Frontend**:
   ```bash
   npm start
   ```

5. **Access the Application**:
   - Open your browser and go to `http://localhost:3000`.

