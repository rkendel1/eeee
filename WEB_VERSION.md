# Dyad Web Version

This directory contains the web version of Dyad, which provides the same functionality as the desktop Electron app but runs in a web browser.

## Quick Start

### Running Locally

1. **Start the backend server:**

   ```bash
   npm run web:server:dev
   ```

   The server will start on http://localhost:3001

2. **In a separate terminal, start the frontend:**

   ```bash
   npm run web:dev
   ```

   The frontend will start on http://localhost:5173

3. **Open your browser to http://localhost:5173**

### Building for Production

1. **Build the frontend:**

   ```bash
   npm run web:build
   ```

   Built files will be in the `dist-web` directory

2. **Start the production server:**
   ```bash
   npm run web:server
   ```

## Architecture

The web version consists of two main components:

1. **Frontend (React/Vite)**: The same UI components as the Electron app, but adapted to work in a browser environment
2. **Backend (Express/Node.js)**: A server that provides the same functionality as the Electron main process

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

```bash
VITE_API_URL=http://localhost:3001/api
```

### Backend (`web-server/.env`)

```bash
PORT=3001
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your-secret-key-here
NODE_ENV=development
```

## Development Notes

The web version reuses most of the existing codebase by:

1. **Platform detection** (`src/lib/platform.ts`) - Determines if running in Electron or Web
2. **Platform-agnostic IPC** (`src/lib/ipc.ts`) - Automatically uses the right implementation
3. **Web API client** (`src/lib/web-ipc-client.ts`) - Mimics Electron IPC using HTTP calls
4. **Updated IpcClient** - Uses the platform-agnostic interface

This minimal approach ensures the same UI components and business logic work in both environments.

## Current Implementation Status

✅ **Infrastructure Complete:**

- Platform detection and abstraction layer
- Web API client mimicking Electron IPC
- Express backend server with API endpoints
- Separate build configuration for web
- Development and build scripts

⚠️ **Backend Implementation Needed:**
The current backend (`web-server/index.js`) provides the framework but individual IPC handler endpoints need to be implemented to provide full functionality. Each endpoint should:

1. Accept the same parameters as the Electron IPC handler
2. Execute the same logic (adapted for server environment)
3. Return the same response format

## Limitations & Future Work

The current implementation provides the basic infrastructure for a web version. Full feature parity requires:

1. **Backend Implementation**: Implement all IPC handler endpoints in the backend server
2. **Authentication**: Add user authentication (OAuth, email/password)
3. **Multi-user Support**: Handle multiple users and their data isolation
4. **File Operations**: Implement secure file upload/download for app files
5. **Real-time Updates**: Use WebSocket or Server-Sent Events for streaming responses
6. **Database Migration**: Adapt SQLite usage for web (consider PostgreSQL or per-user SQLite files)
7. **Mobile Responsive**: Optimize UI for mobile devices

## Testing

To test that the infrastructure is working:

1. Start both backend and frontend
2. Open browser developer tools
3. Check that the platform detection works (should show "web")
4. Verify API calls are being made to the backend (check Network tab)
5. Backend should log incoming requests

## Example API Flow

When a UI component makes an IPC call:

```typescript
// In the UI code (same for Electron and Web):
import { ipc } from "@/lib/ipc";
const apps = await ipc.invoke("list-apps");
```

**In Electron:** This calls the Electron main process via IPC

**In Web:**

1. `ipc.invoke()` calls the Web API client
2. Web API client makes HTTP POST to `/api/invoke/list-apps`
3. Backend server receives the request
4. Backend executes the handler logic
5. Backend returns JSON response
6. Web API client returns the data to the UI

This abstraction allows the same code to work in both environments!

## Contributing

When adding new features that need to work in both Electron and Web:

1. Use the platform-agnostic `ipc` from `src/lib/ipc.ts`
2. Add the corresponding backend endpoint in `web-server/index.js`
3. Test in both Electron and Web modes
4. Document any web-specific limitations
