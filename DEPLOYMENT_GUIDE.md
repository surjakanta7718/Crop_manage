# AgroConnect - Deployment & Production Guide

## Production Deployment Checklist

### Backend Deployment

#### 1. Environment Variables (.env)
Update `.env` for production:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agroconnect
JWT_SECRET=use_a_strong_random_string_here_min_32_chars
ADMIN_EMAIL=your_admin@email.com
ADMIN_PASSWORD=your_secure_password
PORT=5000
NODE_ENV=production
```

Generate strong JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 2. MongoDB Setup
- **Option A:** MongoDB Atlas (Recommended)
  - Create account at https://www.mongodb.com/cloud/atlas
  - Create a free or paid cluster
  - Get connection string with credentials
  - Update MONGODB_URI in .env

- **Option B:** Self-hosted MongoDB
  - Install MongoDB on your server
  - Configure authentication
  - Enable firewall rules
  - Set up backups

#### 3. Install Production Dependencies
```bash
cd backend
npm install --production
npm install --save-dev pm2
```

#### 4. Using PM2 for Process Management
Install PM2 globally:
```bash
npm install -g pm2
```

Start with PM2:
```bash
pm2 start server.js --name agroconnect-api
pm2 save
pm2 startup
```

Monitor:
```bash
pm2 monit
pm2 logs agroconnect-api
```

#### 5. CORS Configuration
Update CORS for production in `server.js`:
```javascript
app.use(cors({
  origin: ["https://yourdomain.com", "https://www.yourdomain.com"],
  credentials: true
}));
```

#### 6. Security Headers
Install helmet for security:
```bash
npm install helmet
```

Add to `server.js`:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

#### 7. Rate Limiting
Install express-rate-limit:
```bash
npm install express-rate-limit
```

Add to `server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

#### 8. Logging
Install winston for logging:
```bash
npm install winston
```

Configure logging in a new file `config/logger.js`:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

---

### Frontend Deployment

#### 1. Build for Production
```bash
cd frontend
npm run build
```

This creates a `dist` folder with optimized files.

#### 2. Deployment Options

**Option A: Vercel (Recommended for React)**
```bash
npm install -g vercel
vercel
```

**Option B: Netlify**
1. Connect GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

**Option C: Traditional Hosting**
1. Upload `dist` folder to your server
2. Configure web server (Nginx/Apache)

#### 3. Update API Base URL
Update `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = "https://your-backend-domain.com/api";
```

#### 4. Nginx Configuration
Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/agroconnect-frontend/dist;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # SSL
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
}
```

---

## Docker Deployment

### Backend Dockerfile
Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

### Frontend Dockerfile
Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: agroconnect-db
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  backend:
    build: ./backend
    container_name: agroconnect-api
    environment:
      MONGODB_URI: mongodb://root:password@mongodb:27017/agroconnect
      JWT_SECRET: your_jwt_secret
      ADMIN_EMAIL: admin@t.com
      ADMIN_PASSWORD: admin@123
    ports:
      - "5000:5000"
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    container_name: agroconnect-web
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo-data:
```

Deploy with Docker:
```bash
docker-compose up -d
```

---

## Server Setup (Ubuntu/Debian)

### 1. Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. Install MongoDB
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 4. Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
```

### 5. Setup SSL/TLS (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

### 6. Create App Directory
```bash
sudo mkdir -p /var/www/agroconnect
sudo chown $USER:$USER /var/www/agroconnect
```

### 7. Clone and Deploy
```bash
cd /var/www/agroconnect
git clone your-repo-url .

# Backend
cd backend
npm install --production
pm2 start server.js --name agroconnect-api

# Frontend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/agroconnect-frontend/
```

---

## Database Backup & Restoration

### Backup MongoDB
```bash
# Local backing up
mongodump --db agroconnect --out /backup/agroconnect

# Automated daily backup
0 2 * * * mongodump --db agroconnect --out /backup/agroconnect-$(date +\%Y\%m\%d)
```

### Restore MongoDB
```bash
mongorestore --db agroconnect /backup/agroconnect
```

### Atlas Backup (Auto-enabled)
- MongoDB Atlas provides automatic daily backups
- Configure backup schedule in Atlas Dashboard
- 35-day backup retention

---

## Monitoring & Maintenance

### Server Monitoring
```bash
# CPU and Memory
htop

# Disk space
df -h

# Processes
ps aux | grep node
```

### Application Logs
```bash
# Backend logs
pm2 logs agroconnect-api

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Database Monitoring
```bash
# Connect to MongoDB
mongo

# Check database size
db.stats()

# Check collections
db.getCollectionNames()
```

---

## Performance Optimization

### Frontend
1. **Code Splitting:** Already done with React Router
2. **Lazy Loading:** Implement for components
3. **Image Optimization:** Compress images
4. **Caching:** Configure cache headers in Nginx

### Backend
1. **Database Indexing:**
```javascript
// In models, add indexes
userSchema.index({ email: 1 });
offerSchema.index({ status: 1 });
```

2. **Connection Pooling:**
```javascript
// Mongoose auto-handles connection pooling
// Verify in MongoDB Atlas: Database > Metrics > Connection Pool
```

3. **Query Optimization:**
- Use `.select()` to limit fields
- Use `.populate()` efficiently
- Implement pagination for large datasets

4. **Caching:**
```bash
npm install redis
```

---

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/agroconnect
            git pull origin main
            cd backend && npm install --production
            cd ../frontend && npm install && npm run build
            pm2 restart agroconnect-api
```

---

## Scaling Strategies

### Horizontal Scaling
1. Load Balancer (Nginx, HAProxy)
2. Multiple Node.js instances
3. PM2 Cluster Mode:
```bash
pm2 start server.js -i max --name agroconnect-api
```

### Database Scaling
1. MongoDB Sharding
2. Read Replicas
3. Connection pooling

### Caching Layer
```bash
npm install redis
```

---

## Security Checklist

- [ ] Update all dependencies: `npm audit fix`
- [ ] Change admin credentials
- [ ] Set strong JWT_SECRET (32+ chars)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall
- [ ] Regular backups enabled
- [ ] Rate limiting configured
- [ ] CORS configured for specific domains
- [ ] SQL Injection prevention (N/A - using MongoDB)
- [ ] XSS prevention (React handles)
- [ ] CSRF tokens (N/A - using JWT)

---

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# View logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongo mongodb://localhost:27017
```

### Port Issues
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Memory Leaks
```bash
# Monitor with PM2
pm2 monit

# Generate heap dumps
node --inspect-brk server.js
```

---

## Cost Optimization

**Recommended Setup (Low Cost):**
1. MongoDB Atlas Free Tier (512MB)
2. Heroku Free Tier or Railway (Both offer free tier)
3. Cloudflare for CDN (Free)
4. GitHub for CI/CD (Free)

**Production Setup:**
1. MongoDB Atlas M2 (~$9/month)
2. AWS EC2 t3.small (~$10/month)
3. Cloudflare Pro ($20/month)

Total: ~$39/month for production-grade hosting

---

## Support & Documentation

- Node.js: https://nodejs.org/docs/
- MongoDB: https://docs.mongodb.com/
- React: https://react.dev/
- Vite: https://vitejs.dev/
- Express: https://expressjs.com/
- PM2: https://pm2.keymetrics.io/

---

## Conclusion

Your AgroConnect application is ready for production deployment. Follow this guide to ensure:
- Security
- Scalability
- Performance
- Reliability
- Maintainability

For questions or issues, refer to the documentation or community forums of respective technologies.

Happy deploying! 🚀
