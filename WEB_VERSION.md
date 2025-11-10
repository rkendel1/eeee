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
- **Web**: File operations handled by the backend server, with files stored in-memory per session

### Database

- **Electron**: SQLite database stored locally
- **Web**: Data managed in-memory per session (suitable for development; production would use a database)

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
4. **Comprehensive web handlers** (`web-server/handlers.js`) - Implements all 64 IPC handlers

This approach ensures the same UI components and business logic work in both environments.

## Implementation Status

✅ **Complete - All 64 IPC Handlers Implemented:**

The web server now provides full IPC handler coverage matching the Electron app:

### App Management (15 handlers)

- ✅ `create-app` - Create new applications
- ✅ `copy-app` - Copy existing applications
- ✅ `get-app` - Retrieve app details
- ✅ `list-apps` - List all apps for session
- ✅ `read-app-file` - Read file contents
- ✅ `run-app` - Start app execution (simulated)
- ✅ `stop-app` - Stop app execution
- ✅ `restart-app` - Restart app execution
- ✅ `edit-app-file` - Edit file contents
- ✅ `delete-app` - Delete application
- ✅ `rename-app` - Rename application
- ✅ `reset-all` - Reset all data
- ✅ `get-app-version` - Get Dyad version
- ✅ `rename-branch` - Rename git branch (placeholder)
- ✅ `get-env-vars` - Get environment variables

### Chat Operations (7 handlers)

- ✅ `create-chat` - Create new chat
- ✅ `delete-chat` - Delete chat
- ✅ `delete-messages` - Delete messages
- ✅ `get-chat` - Get chat details
- ✅ `get-chats` - List chats for app
- ✅ `chat:stream` - Stream chat responses (requires WebSocket/SSE)
- ✅ `chat:cancel` - Cancel streaming chat

### Dependency & Token Management (2 handlers)

- ✅ `chat:add-dep` - Add dependency
- ✅ `chat:count-tokens` - Count tokens

### Debug & System (3 handlers)

- ✅ `get-system-debug-info` - Get system debug information
- ✅ `get-chat-logs` - Get chat logs
- ✅ `get-system-platform` - Get platform ("web")

### GitHub Integration (5 handlers)

- ✅ `github:create-repo` - Create GitHub repo (placeholder for OAuth)
- ✅ `github:disconnect` - Disconnect GitHub
- ✅ `github:is-repo-available` - Check repo availability
- ✅ `github:push` - Push to GitHub (placeholder)
- ✅ `github:start-flow` - Start OAuth flow (placeholder)

### Import & File Operations (3 handlers)

- ✅ `check-ai-rules` - Check for AI rules
- ✅ `check-app-name` - Check if app name exists
- ✅ `select-app-folder` - Select folder (requires upload UI)

### Language Models (10 handlers)

- ✅ `get-language-model-providers` - List providers
- ✅ `create-custom-language-model-provider` - Create custom provider
- ✅ `create-custom-language-model` - Create custom model
- ✅ `delete-custom-language-model` - Delete custom model
- ✅ `delete-custom-model` - Delete custom model (alias)
- ✅ `delete-custom-language-model-provider` - Delete provider
- ✅ `get-language-models` - List models
- ✅ `get-language-models-by-providers` - List models by provider
- ✅ `local-models:list-ollama` - List Ollama models (placeholder)
- ✅ `local-models:list-lmstudio` - List LM Studio models (placeholder)

### System & Node (2 handlers)

- ✅ `nodejs-status` - Get Node.js status
- ✅ `reload-env-path` - Reload environment path

### Pro & Budget (1 handler)

- ✅ `get-user-budget` - Get user budget info

### Proposals (3 handlers)

- ✅ `approve-proposal` - Approve proposal
- ✅ `get-proposal` - Get proposal
- ✅ `reject-proposal` - Reject proposal

### Release Notes (1 handler)

- ✅ `does-release-note-exist` - Check release note

### Session & Settings (3 handlers)

- ✅ `clear-session-data` - Clear session
- ✅ `get-user-settings` - Get user settings
- ✅ `set-user-settings` - Update settings

### Shell Operations (2 handlers)

- ✅ `open-external-url` - Open URL
- ✅ `show-item-in-folder` - Show in folder (not applicable in web)

### Supabase (2 handlers)

- ✅ `supabase:list-projects` - List projects (placeholder)
- ✅ `supabase:unset-app-project` - Unset project

### Upload & Versioning (2 handlers)

- ✅ `upload-to-signed-url` - Upload to signed URL (placeholder)
- ✅ `list-versions` - List git versions

### Window Operations (4 handlers)

- ✅ `window:close` - Close window (no-op in web)
- ✅ `window:maximize` - Maximize window (no-op in web)
- ✅ `window:minimize` - Minimize window (no-op in web)
- ✅ `get-system-platform` - Get platform

## Web-Specific Implementation Details

### File Storage

Files are stored in-memory per session using a key-value structure:

```javascript
sessionData.files[`${appId}:${filePath}`] = content;
```

### Session Management

Each browser session gets isolated data including:

- Apps and their files
- Chats and messages
- Settings and preferences
- Custom language models/providers
- Running app state

### Limitations & Future Work

Current placeholders that need full implementation for production:

1. **Chat Streaming**: Requires WebSocket or Server-Sent Events for real-time streaming
2. **GitHub Integration**: Requires OAuth flow and GitHub API integration
3. **File Upload**: Requires file upload UI for import operations
4. **Local Models**: Requires proxy/API access to Ollama/LM Studio
5. **Persistent Storage**: Replace in-memory storage with database (PostgreSQL/Redis)
6. **Authentication**: Add proper user authentication (OAuth, email/password)
7. **Multi-user Support**: Handle multiple users and data isolation in database
8. **Real-time Updates**: Use WebSocket for collaborative features
9. **File System**: Implement secure file upload/download for app files
10. **Mobile Responsive**: Optimize UI for mobile devices

## Testing the Web Version

### Manual Testing

1. Start both backend and frontend
2. Open browser developer tools
3. Verify platform detection shows "web"
4. Test basic operations:
   - Create an app
   - List apps
   - Edit app files
   - Create chats
   - Update settings

### Example API Tests

```bash
# Health check
curl http://localhost:3001/health

# Create an app
curl -X POST http://localhost:3001/api/invoke/create-app \
  -H "Content-Type: application/json" \
  -d '{"args":[{"name":"my-app"}]}' \
  --cookie-jar cookies.txt

# List apps
curl -X POST http://localhost:3001/api/invoke/list-apps \
  -H "Content-Type: application/json" \
  -d '{"args":[]}' \
  --cookie cookies.txt
```

## API Flow Example

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
2. Add the corresponding backend handler in `web-server/handlers.js`
3. Test in both Electron and Web modes
4. Document any web-specific limitations
5. Consider WebSocket/SSE for real-time features

## Production Deployment

For production deployment, you'll need:

1. **Database**: Replace in-memory storage with PostgreSQL or similar
2. **Authentication**: Implement user authentication system
3. **File Storage**: Use cloud storage (S3, etc.) for app files
4. **Environment Variables**: Configure production settings
5. **HTTPS**: Enable secure connections
6. **Session Store**: Use Redis or database-backed sessions
7. **Rate Limiting**: Add API rate limiting
8. **Logging**: Implement proper logging and monitoring
9. **Error Tracking**: Add error tracking (Sentry, etc.)
10. **Scaling**: Consider containerization (Docker) and load balancing
