# Thumbmaker

A modern web application built with Next.js 15 and React 19 to generate YouTube thumbnails for your videos (with care and support)

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Thumbmaker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Prepare the backend

Please refer to backend repo to set up the backend correctly. The frontend client will not run properly without the backend server.

### Development Mode

Setup the environment variables. An example env file has been provided in the repo, please refer to the .env.example to setup the environment variables.

To run the application in development mode:

```bash
npm run dev
# or
yarn dev
```

This will start the development server on `http://localhost:3000`

### Production Mode

1. Build the application:
```bash
npm run build
# or
yarn build
```

2. Start the production server:
```bash
npm run start
# or
yarn start
```

## 🛠️ Tech Stack

### Core Technologies
- **Next.js** (v15.2.4) - React framework for production
- **React** (v19.0.0) - Frontend library
- **TypeScript** - Type-safe JavaScript

### UI Components and Styling
- **Radix UI** - A comprehensive collection of accessible UI components including:
  - Accordion, Alert Dialog, Avatar
  - Dialog, Dropdown Menu, Navigation Menu
  - Tabs, Toast, Tooltip, and many more
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **React Image Gallery** - Image gallery component
- **React Medium Image Zoom** - Image zoom functionality

### 3D and Visual Effects
- **Three.js** - 3D graphics library
- **@react-three/fiber** - React renderer for Three.js
- **@shadergradient/react** - Shader-based gradients
- **@react-spring/three** - Spring animations for Three.js

### Form Handling and Validation
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation resolvers

### Authentication and Storage
- **@clerk/nextjs** - Authentication and user management
- **@azure/storage-blob** - Azure Blob Storage integration

### Data Management and UI Utilities
- **@tanstack/react-query** - Data fetching and caching
- **date-fns** - Date utility library
- **next-themes** - Theme management
- **Stripe** - Payment processing

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code linting

## 🔐 Environment Variables

The following environment variables are required:

- Clerk Authentication keys
- Azure Storage credentials
- Stripe API keys
- Other service-specific environment variables

(Please contact the project maintainers for the actual values)

## 📝 Notes

- The project uses Next.js 15's latest features
- Includes built-in TypeScript support
- Features a modern UI component library with Radix UI
- Supports 3D graphics and animations
- Includes comprehensive form handling and validation
- Integrated with cloud storage and authentication
- Supports theme customization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

---

For more information or support, please contact the project maintainers.
