# Dyad Web Server

Backend API server for the Dyad web application.

## Quick Start

```bash
npm install
npm start
```

The server will start on http://localhost:3001

## Demo

Visit http://localhost:3001/demo to see an interactive demo of the working endpoints.

## Implemented Endpoints

### Health Check
- **GET** `/health`
- Returns server status, platform info, and active connection count

### IPC-Style API Endpoints
All endpoints follow the pattern: **POST** `/api/invoke/:channel`

#### Working Endpoints:
- `get-app-version` - Returns the application version
- `get-user-settings` - Get user settings (session-based)
- `set-user-settings` - Update user settings (session-based)
- `list-apps` - List user applications (session-based)
- `get-system-platform` - Returns "web"
- `window:minimize`, `window:maximize`, `window:close` - No-op for web

#### Unimplemented Endpoints:
All other IPC channels will return a descriptive message indicating they are not yet implemented.

## Architecture

### Session Management
- Uses express-session with in-memory storage
- Each session has isolated settings and apps
- Cookie-based authentication (secure in production)

### Storage
Currently uses in-memory storage for demo purposes. For production:
- Replace with PostgreSQL or similar database
- Add proper user authentication
- Implement data persistence

## Example Usage

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:3001/api/invoke/get-app-version', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({ args: [] })
});

const result = await response.json();
console.log(result); // { version: "0.7.5" }
```

### cURL
```bash
# Get app version
curl -X POST http://localhost:3001/api/invoke/get-app-version \
  -H "Content-Type: application/json" \
  -d '{"args":[]}'

# Get user settings
curl -X POST http://localhost:3001/api/invoke/get-user-settings \
  -H "Content-Type: application/json" \
  -d '{"args":[]}' \
  --cookie-jar cookies.txt

# Set user settings
curl -X POST http://localhost:3001/api/invoke/set-user-settings \
  -H "Content-Type: application/json" \
  -d '{"args":[{"telemetryConsent":"accepted"}]}' \
  --cookie cookies.txt
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)
- `SESSION_SECRET` - Session encryption secret (required in production)
- `NODE_ENV` - Environment (development/production)

## Development

```bash
# Install dependencies
npm install

# Start with auto-reload (requires node 20+)
npm run dev
```

## Production Deployment

1. Set environment variables:
   ```bash
   export NODE_ENV=production
   export SESSION_SECRET=your-secure-random-secret
   export FRONTEND_URL=https://your-frontend-domain.com
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Consider using a process manager like PM2:
   ```bash
   pm2 start index.js --name dyad-web-server
   ```

## Adding New Endpoints

To add a new IPC handler:

1. Add a case to the switch statement in `index.js`:
   ```javascript
   case "your-new-handler":
     const params = args[0];
     result = await yourHandlerLogic(params, sessionData);
     break;
   ```

2. Test using the demo page or API calls

## Security Considerations

### Current Implementation (Development Only)
- ⚠️ In-memory storage (data lost on restart)
- ⚠️ No authentication required
- ⚠️ No rate limiting
- ⚠️ Session secret should be changed

### For Production
- ✅ Use secure session secret
- ✅ Enable HTTPS only
- ✅ Add authentication (OAuth, JWT, etc.)
- ✅ Implement rate limiting
- ✅ Add input validation
- ✅ Use persistent database
- ✅ Add logging and monitoring
- ✅ Implement CSRF protection

## Migrating IPC Handlers

To migrate an Electron IPC handler to web:

1. **Locate the handler** in `src/ipc/handlers/`
2. **Extract the logic** (remove Electron-specific code)
3. **Adapt file system operations** (use proper paths, security checks)
4. **Add to web server** as a new case in the switch statement
5. **Test thoroughly** with proper error handling

### Example Migration

**Electron Handler:**
```typescript
// src/ipc/handlers/app_handlers.ts
ipcMain.handle("delete-app", async (_, { appId }) => {
  const app = await db.query.apps.findFirst({
    where: eq(apps.id, appId),
  });
  // ... implementation
});
```

**Web Handler:**
```javascript
// web-server/index.js
case "delete-app":
  const { appId } = args[0];
  // Add authentication check
  if (!req.session.userId) {
    throw new Error("Unauthorized");
  }
  // Add authorization check (user owns app)
  const app = await getApp(appId, req.session.userId);
  if (!app) {
    throw new Error("App not found or access denied");
  }
  // ... implementation
  result = { success: true };
  break;
```

## Status

**Current State:** Working demo with basic endpoints

**Production Ready:** No - requires authentication, persistence, and full handler implementation

**Next Steps:** 
1. Add authentication system
2. Implement persistent database
3. Migrate remaining IPC handlers
4. Add security hardening
5. Implement file upload/download
6. Add WebSocket support for streaming

## License

Same as parent project (Apache 2.0)
