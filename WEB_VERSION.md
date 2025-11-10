# Dyad Web Version

This directory contains the web version of Dyad, which provides the same functionality as the desktop Electron app but runs in a web browser.

## Architecture

The web version consists of two main components:

1. **Frontend (React/Vite)**: The same UI components as the Electron app, but adapted to work in a browser environment
2. **Backend (Express/Node.js)**: A server that provides the same functionality as the Electron main process

## Running the Web Version

### Prerequisites

- Node.js 20 or higher
- npm

### Development Mode

1. Start the backend server:

```bash
npm run web:server:dev
```

2. In a separate terminal, start the frontend development server:

```bash
npm run web:dev
```

3. Open your browser to `http://localhost:5173`

The backend API server runs on port 3001 by default, and the frontend dev server runs on port 5173.

### Production Build

1. Build the frontend:

```bash
npm run web:build
```

2. The built files will be in the `dist-web` directory

3. Start the backend server:

```bash
npm run web:server
```

4. Serve the static files from `dist-web` using the backend server or a CDN

## Key Differences from Electron Version

### IPC Communication

- **Electron**: Uses Electron's IPC (Inter-Process Communication)
- **Web**: Uses HTTP API calls to the backend server

### File System Access

- **Electron**: Direct file system access via Node.js APIs
- **Web**: File system operations handled by the backend server

### Database

- **Electron**: SQLite database stored locally
- **Web**: Database managed by the backend server (shared across sessions)

### Authentication

- **Electron**: No authentication needed (local app)
- **Web**: Session-based authentication (cookies)

## Environment Variables

### Frontend (`.env`)

- `VITE_API_URL`: Backend API URL (default: `http://localhost:3001/api`)

### Backend (`web-server/.env`)

- `PORT`: Server port (default: 3001)
- `FRONTEND_URL`: Frontend URL for CORS (default: `http://localhost:5173`)
- `SESSION_SECRET`: Secret for session encryption
- `NODE_ENV`: Environment (development/production)

## Development Notes

The web version reuses most of the existing codebase by:

1. Platform detection in `src/lib/platform.ts` to determine if running in Electron or Web
2. Platform-agnostic IPC interface in `src/lib/ipc.ts` that automatically uses the right implementation
3. Web API client in `src/lib/web-ipc-client.ts` that mimics Electron IPC using HTTP calls

This minimal approach ensures the same UI components and business logic work in both environments.

## Limitations

The current implementation provides the basic infrastructure for a web version. Full feature parity with the Electron app requires:

1. Implementing all IPC handler endpoints in the backend server
2. Adding authentication and user management
3. Handling multi-user scenarios (the Electron app is single-user)
4. Implementing file upload/download for app files
5. Setting up WebSocket or Server-Sent Events for real-time updates

## Future Enhancements

- User authentication (OAuth, email/password)
- Multi-user support
- Cloud storage integration
- Real-time collaboration features
- Mobile-responsive design improvements
