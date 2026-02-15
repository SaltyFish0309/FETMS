# Operations Runbook

## Deployment Procedures

### Pre-Deployment Checklist

- [ ] All tests passing (backend + frontend)
- [ ] Production build succeeds: `npm run build --prefix frontend && npm run build --prefix backend`
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Database migrations tested (if applicable)
- [ ] Environment variables configured for production
- [ ] API endpoints tested
- [ ] Critical user flows verified

### Production Build

#### Frontend Build

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

**Build artifacts:**
- Static assets in `dist/assets/`
- index.html in `dist/`
- Gzipped bundle size: ~435KB (expected)

**Verification:**
```bash
npm run preview
# Opens production preview at http://localhost:4173
```

#### Backend Build

```bash
cd backend
npm run build
# Output: backend/dist/ (TypeScript compiled to JavaScript)
```

### Deployment Steps

#### 1. Backend Deployment

1. Build backend:
   ```bash
   npm run build --prefix backend
   ```

2. Set production environment variables:
   ```bash
   MONGO_URI=<production-mongodb-uri>
   PORT=5000
   NODE_ENV=production
   ```

3. Start production server:
   ```bash
   cd backend
   node dist/index.js
   ```

4. Verify health:
   ```bash
   curl http://localhost:5000/api/health
   ```

#### 2. Frontend Deployment

1. Build frontend:
   ```bash
   npm run build --prefix frontend
   ```

2. Deploy `frontend/dist/` to static hosting (Netlify, Vercel, S3, etc.)

3. Configure environment:
   - Update API base URL in `frontend/src/services/api.ts` before build
   - Set proper CORS origins in backend

4. Verify deployment:
   - Check loading time
   - Test critical paths (login, teachers list, dashboard)
   - Verify API connectivity

### Database Migrations

#### Running Migrations

```bash
# Project migration example
npm run migrate:projects --prefix backend
```

**Migration workflow:**
1. Backup database before migration
2. Run migration script on staging first
3. Verify data integrity
4. Run on production
5. Monitor for errors

#### Creating New Migrations

1. Create script in `backend/src/scripts/`
2. Add npm script to `backend/package.json`
3. Test thoroughly on development database
4. Document migration in RUNBOOK.md

### Rollback Procedures

#### Frontend Rollback

1. Identify last working deployment
2. Redeploy previous `dist/` artifact
3. Verify functionality
4. Update DNS/CDN if needed

#### Backend Rollback

1. Stop current backend process
2. Switch to previous Git tag/commit:
   ```bash
   git checkout <previous-version-tag>
   ```
3. Rebuild:
   ```bash
   npm run build --prefix backend
   ```
4. Restart server
5. Verify API endpoints

#### Database Rollback

1. Stop backend server
2. Restore database from backup:
   ```bash
   mongorestore --uri="mongodb://127.0.0.1:27017/fetms" <backup-path>
   ```
3. Restart backend
4. Verify data integrity

## Monitoring and Alerts

### Health Checks

#### Backend Health

```bash
# Check server status
curl http://localhost:5000/api/health

# Check MongoDB connection
mongosh mongodb://127.0.0.1:27017/fetms --eval "db.adminCommand('ping')"
```

#### Key Metrics to Monitor

1. **API Response Time**
   - Target: < 200ms for GET requests
   - Target: < 500ms for POST/PUT requests

2. **Database Query Performance**
   - Monitor slow queries (> 100ms)
   - Check index usage
   - Watch connection pool

3. **Error Rates**
   - 4xx errors: Monitor authentication/validation failures
   - 5xx errors: Alert on any occurrence
   - MongoDB errors: Alert immediately

4. **Resource Usage**
   - CPU: Alert if > 80% sustained
   - Memory: Alert if > 85% usage
   - Disk: Alert if > 90% usage

### Logging

#### Backend Logs

Current implementation: Console logging (development)

**Production recommendations:**
- Implement structured logging (Winston, Pino)
- Log to file or centralized service
- Include request IDs for tracing
- Log levels: ERROR, WARN, INFO, DEBUG

**What to log:**
- API requests/responses (sanitize sensitive data)
- Database operations (performance)
- Authentication events
- Error stack traces
- Migration executions

#### Frontend Logs

Browser console errors should be captured in production:
- Use error boundary components
- Send critical errors to logging service (Sentry, LogRocket)
- Track user interactions for debugging

### Alerts Configuration

**Critical Alerts (immediate response):**
- Backend server down
- Database connection failure
- 5xx error rate > 1%
- Disk space > 90%

**Warning Alerts (respond within 1 hour):**
- API response time > 1s
- 4xx error rate > 10%
- Memory usage > 85%
- Slow database queries

**Info Alerts (daily review):**
- Unusual traffic patterns
- Failed login attempts
- Deprecated API usage

## Common Issues and Fixes

### Issue: MongoDB Connection Refused

**Symptoms:**
- Backend fails to start
- Error: `MongooseServerSelectionError: connect ECONNREFUSED`

**Diagnosis:**
```bash
# Check if MongoDB is running
mongosh

# Check MongoDB service status
systemctl status mongod  # Linux
brew services list  # macOS
```

**Fix:**
```bash
# Start MongoDB
systemctl start mongod  # Linux
brew services start mongodb-community  # macOS

# Verify MONGO_URI in backend/.env
```

### Issue: Port Already in Use

**Symptoms:**
- `Error: listen EADDRINUSE: address already in use :::5000`

**Diagnosis:**
```bash
# Find process using port 5000
lsof -ti:5000  # Unix
netstat -ano | findstr :5000  # Windows
```

**Fix:**
```bash
# Kill process (Unix)
lsof -ti:5000 | xargs kill -9

# Kill process (Windows)
taskkill /PID <process-id> /F

# Or change PORT in backend/.env
```

### Issue: Build Failures

**Symptoms:**
- `npm run build` fails with TypeScript errors

**Diagnosis:**
```bash
# Check TypeScript errors
npx tsc --noEmit

# Check for dependency issues
npm list
```

**Fix:**
```bash
# Clear TypeScript cache
rm tsconfig.tsbuildinfo

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Fix type errors before rebuilding
```

### Issue: CORS Errors

**Symptoms:**
- Frontend can't reach backend API
- Browser console: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Diagnosis:**
- Check backend CORS configuration in `backend/src/index.ts`
- Verify frontend API base URL in `frontend/src/services/api.ts`

**Fix:**
```javascript
// backend/src/index.ts
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

### Issue: Soft Delete Not Working

**Symptoms:**
- Deleted items still appear in lists
- Database shows `isDeleted: true` but frontend shows item

**Diagnosis:**
- Check API query filters for `isDeleted: false`
- Verify frontend filters deleted items

**Fix:**
```javascript
// Backend service should filter
const items = await Model.find({ isDeleted: { $ne: true } });

// Never use Model.deleteOne() - use soft delete
await Model.findByIdAndUpdate(id, { isDeleted: true });
```

### Issue: File Upload Fails

**Symptoms:**
- Document/avatar upload returns 413 or 500 error

**Diagnosis:**
- Check file size limits
- Verify multer configuration
- Check disk space

**Fix:**
```javascript
// Increase multer limits (backend/src/middleware/)
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Check upload directory permissions
chmod 755 uploads/
```

### Issue: Slow Dashboard Load

**Symptoms:**
- Dashboard takes > 3 seconds to load
- Multiple API calls visible in Network tab

**Diagnosis:**
```bash
# Check database query performance
use fetms
db.teachers.find().explain("executionStats")

# Check missing indexes
db.teachers.getIndexes()
```

**Fix:**
```javascript
// Add indexes to frequently queried fields
teacherSchema.index({ pipelineStage: 1 });
teacherSchema.index({ school: 1 });
teacherSchema.index({ projectId: 1 });

// Optimize aggregation queries
// Use $match early in pipeline
// Limit fields with $project
```

### Issue: Tests Failing in CI

**Symptoms:**
- Tests pass locally but fail in CI/CD pipeline

**Diagnosis:**
- Check Node.js version consistency
- Verify environment variables
- Check for timezone issues (date comparisons)

**Fix:**
```bash
# Match Node.js versions
# Local: node --version
# CI: Update workflow to match version

# Set CI environment variables
# Add to GitHub Actions / CI config

# Fix timezone-dependent tests
# Use UTC or mock dates
```

### Issue: Memory Leak

**Symptoms:**
- Backend memory usage increases over time
- Application becomes slow after hours of running

**Diagnosis:**
```bash
# Monitor memory usage
node --inspect backend/dist/index.js
# Use Chrome DevTools to profile

# Check for event listener leaks
# Check for unclosed database connections
```

**Fix:**
```javascript
// Close database connections properly
mongoose.connection.close();

// Remove event listeners
process.removeListener('SIGINT', handler);

// Limit result set sizes
const results = await Model.find().limit(1000);
```

## Performance Optimization

### Database Optimization

1. **Ensure indexes exist:**
   ```javascript
   // Check current indexes
   db.teachers.getIndexes()

   // Add missing indexes
   teacherSchema.index({ email: 1 }, { unique: true });
   teacherSchema.index({ pipelineStage: 1, projectId: 1 });
   ```

2. **Optimize queries:**
   - Use `select()` to limit returned fields
   - Use `lean()` for read-only queries
   - Avoid N+1 queries with `populate()`

3. **Monitor slow queries:**
   ```bash
   # Enable profiling
   db.setProfilingLevel(1, { slowms: 100 })

   # View slow queries
   db.system.profile.find().sort({ ts: -1 }).limit(10)
   ```

### Frontend Optimization

1. **Code splitting:**
   - Lazy load routes
   - Dynamic imports for heavy components
   - Chunk size currently ~1.5MB (acceptable)

2. **Caching:**
   - Browser caching for static assets
   - API response caching where appropriate
   - localStorage for user preferences

3. **Rendering:**
   - Use React.memo for expensive components
   - Avoid inline object/array creation in props
   - Optimize re-renders with proper dependencies

## Backup and Recovery

### Database Backup

#### Full Backup

```bash
# Backup entire database
mongodump --uri="mongodb://127.0.0.1:27017/fetms" --out=/backup/$(date +%Y%m%d)

# Compress backup
tar -czf fetms-backup-$(date +%Y%m%d).tar.gz /backup/$(date +%Y%m%d)
```

#### Restore from Backup

```bash
# Extract backup
tar -xzf fetms-backup-20260131.tar.gz

# Restore database
mongorestore --uri="mongodb://127.0.0.1:27017/fetms" /backup/20260131/fetms
```

### Automated Backup Strategy

**Recommendation:**
- Daily backups at 2 AM
- Retain 7 daily backups
- Retain 4 weekly backups
- Retain 3 monthly backups

**Cron job example:**
```bash
0 2 * * * /usr/local/bin/backup-fetms.sh
```

### Uploaded Files Backup

Backup the uploads directory containing avatars and documents:

```bash
# Backup uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz backend/uploads/

# Restore uploads
tar -xzf uploads-backup-20260131.tar.gz -C backend/
```

## Security Considerations

### Production Checklist

- [ ] HTTPS enabled (TLS 1.2+)
- [ ] Environment variables secured (no hardcoded secrets)
- [ ] CORS properly configured (specific origins, not `*`)
- [ ] MongoDB authentication enabled
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] File upload restrictions (size, type)
- [ ] Sensitive data sanitized in logs
- [ ] Error messages don't leak system info
- [ ] Security headers configured (Helmet.js)

### Regular Security Tasks

**Weekly:**
- Review access logs for suspicious activity
- Check for failed authentication attempts
- Monitor unusual API usage patterns

**Monthly:**
- Update dependencies: `npm audit fix`
- Review and rotate API keys
- Check for MongoDB security updates

**Quarterly:**
- Full security audit
- Penetration testing
- Review and update security policies

## Scaling Considerations

### Horizontal Scaling

**Backend:**
- Use load balancer (Nginx, AWS ALB)
- Session storage in Redis (currently stateless)
- Multiple Express instances

**Database:**
- MongoDB replica set for high availability
- Read replicas for read-heavy workloads
- Sharding for very large datasets

### Vertical Scaling

**When to scale:**
- CPU usage consistently > 70%
- Memory usage consistently > 80%
- Response times degrading

**How to scale:**
- Increase server resources (CPU, RAM)
- Optimize database queries first
- Consider caching layer (Redis)

## Maintenance Windows

### Recommended Schedule

- **Database maintenance:** Weekly, Sunday 2 AM - 4 AM
- **Dependency updates:** Monthly, first Sunday
- **Security patches:** As needed (emergency maintenance)

### Maintenance Procedures

1. **Announce maintenance:**
   - 48 hours notice for planned maintenance
   - Status page update

2. **Pre-maintenance:**
   - Backup database
   - Verify rollback procedures
   - Prepare rollback scripts

3. **During maintenance:**
   - Put application in maintenance mode
   - Execute changes
   - Verify functionality

4. **Post-maintenance:**
   - Remove maintenance mode
   - Monitor logs for errors
   - Verify critical flows

## Contact Information

**Emergency Contacts:**
- Development Team: [contact info]
- Database Admin: [contact info]
- Infrastructure: [contact info]

**Escalation Path:**
1. On-call developer
2. Team lead
3. Technical director

**Documentation:**
- This runbook: `docs/RUNBOOK.md`
- Contributing guide: `docs/CONTRIB.md`
- Project overview: `CLAUDE.md`
- API documentation: `CLAUDE.md` (API Routes section)
