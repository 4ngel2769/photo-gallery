# Photo Gallery

A beautifully simplistic photo gallery website.

## Features

- 📸 Upload and manage photos
- 🌓 Dark/Light mode support
- 👤 User authentication (Email, Google, GitHub)
- 💬 Comments and likes
- 🔒 Admin panel for content moderation
- 📱 Responsive design
- 🎨 Beautiful UI with Shadcn/UI and Tailwind CSS
- 🚀 Fast and optimized

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/4ngel2769/photo-gallery.git
cd photo-gallery

# Copy environment file
cp .env.example .env # Edit .env file to configure (optional)

# Start with Docker
npm run docker:dev

# Access the app
# Frontend: http://localhost:3001
# Backend: http://localhost:5000
```

<!-- See [DOCKER.md](./DOCKER.md) for detailed Docker documentation. -->

### Manual Setup

```bash
# Install dependencies
npm run install:all

# Start backend
npm run dev:backend

# Start frontend (in another terminal)
npm run dev:frontend
```

<!-- See [ENV_SETUP.md](./ENV_SETUP.md) for environment configuration. -->

<!-- ## Documentation -->
<!--  -->
<!-- - [DOCKER.md](./DOCKER.md) - Docker setup and deployment -->
<!-- - [ENV_SETUP.md](./ENV_SETUP.md) - Environment variables configuration -->
<!-- - [OAUTH_SETUP.md](./OAUTH_SETUP.md) - OAuth (Google/GitHub) setup -->
<!-- - [ENV_VARIABLES.md](./ENV_VARIABLES.md) - Detailed variable documentation -->

## Tech Stack

### Frontend
- Next.js 16
- TypeScript
- Tailwind CSS
- Framer Motion
- Shadcn/ui Components

### Backend
- Express
- MongoDB
- Passport.js for OAuth
- JWT authentication
- Multer for file uploads

### DevOps
- Docker & Docker Compose
- MongoDB in container
- Multi-stage builds
- Health checks

<!-- ## Project Structure

```
photo-gallery/
├── backend/              # Express API server
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── uploads/         # Uploaded photos
│   ├── Dockerfile       # Backend Docker config
│   └── server.js        # Entry point
├── frontend/            # Next.js application
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── lib/            # Utility functions
│   ├── Dockerfile      # Frontend Docker config
│   └── next.config.ts  # Next.js config
├── .env                # Environment variables
├── .env.example        # Example environment file
├── docker-compose.yml  # Production compose
└── docker-compose.dev.yml # Development compose
``` -->

## Available Scripts

### Development

```bash
npm run dev:backend      # Start backend with nodemon
npm run dev:frontend     # Start frontend with Next.js dev server
```

### Docker

```bash
npm run docker:dev           # Start development containers
npm run docker:dev:build     # Rebuild and start dev containers
npm run docker:dev:down      # Stop dev containers
npm run docker:prod          # Start production containers
npm run docker:prod:build    # Build and start prod containers
npm run docker:prod:down     # Stop prod containers
npm run docker:clean         # Remove all containers and volumes
```

### Other

```bash
npm run install:all      # Install all dependencies
npm run build:frontend   # Build frontend for production
```

<!-- ## OAuth Setup

The app supports OAuth login with Google and GitHub:

1. Follow [OAUTH_SETUP.md](./OAUTH_SETUP.md) to get credentials
2. Add credentials to `.env` file
3. Restart the services -->

## Environment Variables

All configuration is in the root `.env` file:

```env
# Ports
BACKEND_PORT=5000
FRONTEND_PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/photo-gallery

# Secrets
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

<!-- See [ENV_SETUP.md](./ENV_SETUP.md) for complete documentation. -->

## 🔐 Admin Access

The app automatically creates an admin user on first startup with a **secure randomly-generated password** (using `crypto.randomBytes(64)`).

Configure the admin email in `.env`:

```env
ROOT_ADMIN_EMAIL=admin@photogallery.local
```

On first startup:
1. A secure 64-character password is auto-generated
2. Password is printed to console
3. Password is saved to `.pswd` file

**Access admin panel**: `http://localhost:3001/sudo`

⚠️ **Important**: 
- Copy the password from console or `.pswd` file immediately
- Change the password on first login
- Delete the `.pswd` file after securing your password

See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for detailed documentation.

## Docker Deployment

### Development

```bash
sudo docker compose -f docker-compose.dev.yml up
```

### Production

```bash
sudo docker compose up -d
```

Features:
- Optimized builds
- Smaller images
- Health checks
- Persistent volumes

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.

