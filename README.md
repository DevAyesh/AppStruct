# AppStruct
<<<<<<< HEAD
<<<<<<< HEAD

AppStruct is a web application that helps users transform their app ideas into structured, developer-ready markdown blueprints.

## Features

- Simple, intuitive interface for describing app ideas
- Platform selection (web, mobile, or both)
- Markdown blueprint generation
- Basic user authentication
- Blueprint storage with MongoDB Atlas
- Blueprint download functionality

## Tech Stack

- React 18
- Tailwind CSS
- MongoDB Atlas (database)
- React Markdown

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with your MongoDB credentials:
```
REACT_APP_MONGODB_URI=your_mongodb_atlas_connection_string
```

3. Start the development server:
```bash
npm start
```

## Database Schema

### Blueprint Collection
- `userId`: String (required) - User's username
- `ideaInput`: String (required) - Original app idea description
- `platform`: String (required) - Selected platform (web/mobile/both)
- `generatedMarkdown`: String (required) - Generated blueprint content
- `createdAt`: Date - Timestamp of creation

## Design Choices

- **Color Scheme**: Blue-based primary colors for trust and professionalism
- **Typography**: Inter for general text, JetBrains Mono for code blocks
- **Layout**: Split-screen design for input and output
- **UI Components**: Minimalist, modern components with subtle shadows and rounded corners

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
=======
Transform vague app ideas into structured, developer-ready blueprints
>>>>>>> 785fd031e674a0b8881d123928b38fbd3928deba
=======
Transform vague app ideas into structured, developer-ready blueprints
>>>>>>> 13f3df322915f30a7115ce81d8ab239df5be00e9
