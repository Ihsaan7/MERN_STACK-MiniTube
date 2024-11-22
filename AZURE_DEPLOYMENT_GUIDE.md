# StreamVault - Azure Deployment Guide

## Overview
This guide will help you deploy your StreamVault video platform to Microsoft Azure using Azure App Service for both frontend and backend.

## Prerequisites
- Azure account (free tier available at https://azure.microsoft.com/free/)
- Azure CLI installed (https://docs.microsoft.com/cli/azure/install-azure-cli)
- Git installed
- Node.js installed locally

## Architecture
- **Frontend**: Azure Static Web Apps or Azure App Service
- **Backend**: Azure App Service (Node.js)
- **Database**: Azure Cosmos DB (MongoDB API) or MongoDB Atlas
- **Storage**: Azure Blob Storage for videos and images

---

## Part 1: Prepare Your Application

### 1.1 Backend Preparation

1. **Create a production environment file** (`.env.production`):
```env
NODE_ENV=production
PORT=8000
MONGODB_URI=<your-mongodb-connection-string>
CORS_ORIGIN=https://your-frontend-url.azurewebsites.net
ACCESS_TOKEN_SECRET=<generate-strong-secret>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<generate-strong-secret>
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
```

2. **Update package.json** with production scripts:
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "build": "echo 'No build step required for Node.js'"
  }
}
```

3. **Create `.deployment` file** in backend root:
```
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

### 1.2 Frontend Preparation

1. **Create environment files**:

`.env.production`:
```env
VITE_API_BASE_URL=https://your-backend-app.azurewebsites.net/api/v1
```

2. **Update vite.config.js** for production:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
  server: {
    port: 3000
  }
})
```

3. **Update package.json**:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "vite preview --port 8080 --host"
  }
}
```

---

## Part 2: Deploy Backend to Azure

### 2.1 Login to Azure
```bash
az login
```

### 2.2 Create Resource Group
```bash
az group create --name streamvault-rg --location eastus
```

### 2.3 Create App Service Plan
```bash
az appservice plan create \
  --name streamvault-plan \
  --resource-group streamvault-rg \
  --sku B1 \
  --is-linux
```

### 2.4 Create Backend Web App
```bash
az webapp create \
  --resource-group streamvault-rg \
  --plan streamvault-plan \
  --name streamvault-backend \
  --runtime "NODE:18-lts"
```

### 2.5 Configure Backend Environment Variables
```bash
az webapp config appsettings set \
  --resource-group streamvault-rg \
  --name streamvault-backend \
  --settings \
    NODE_ENV=production \
    PORT=8000 \
    MONGODB_URI="<your-mongodb-uri>" \
    CORS_ORIGIN="https://streamvault-frontend.azurewebsites.net" \
    ACCESS_TOKEN_SECRET="<your-secret>" \
    ACCESS_TOKEN_EXPIRY="1d" \
    REFRESH_TOKEN_SECRET="<your-secret>" \
    REFRESH_TOKEN_EXPIRY="10d" \
    CLOUDINARY_CLOUD_NAME="<your-cloudinary-name>" \
    CLOUDINARY_API_KEY="<your-key>" \
    CLOUDINARY_API_SECRET="<your-secret>"
```

### 2.6 Deploy Backend Code

**Option A: Using Git Deployment**
```bash
# Navigate to backend directory
cd backend

# Initialize git if not already done
git init

# Add Azure remote
az webapp deployment source config-local-git \
  --name streamvault-backend \
  --resource-group streamvault-rg

# Get deployment credentials
az webapp deployment list-publishing-credentials \
  --name streamvault-backend \
  --resource-group streamvault-rg

# Add remote and push
git remote add azure <git-url-from-above>
git add .
git commit -m "Initial backend deployment"
git push azure main
```

**Option B: Using ZIP Deployment**
```bash
# Create a zip of your backend
zip -r backend.zip . -x "node_modules/*" ".git/*"

# Deploy
az webapp deployment source config-zip \
  --resource-group streamvault-rg \
  --name streamvault-backend \
  --src backend.zip
```

### 2.7 Verify Backend Deployment
```bash
# Check logs
az webapp log tail --name streamvault-backend --resource-group streamvault-rg

# Test endpoint
curl https://streamvault-backend.azurewebsites.net/api/v1/healthz
```

---

## Part 3: Deploy Frontend to Azure

### 3.1 Build Frontend
```bash
cd frontend
npm install
npm run build
```

### 3.2 Create Frontend Web App
```bash
az webapp create \
  --resource-group streamvault-rg \
  --plan streamvault-plan \
  --name streamvault-frontend \
  --runtime "NODE:18-lts"
```

### 3.3 Configure Frontend Environment
```bash
az webapp config appsettings set \
  --resource-group streamvault-rg \
  --name streamvault-frontend \
  --settings \
    VITE_API_BASE_URL="https://streamvault-backend.azurewebsites.net/api/v1"
```

### 3.4 Deploy Frontend

**Option A: Deploy Built Files (Recommended)**
```bash
# Create web.config for SPA routing
cat > dist/web.config << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
EOF

# Deploy
cd dist
zip -r ../frontend.zip .
cd ..
az webapp deployment source config-zip \
  --resource-group streamvault-rg \
  --name streamvault-frontend \
  --src frontend.zip
```

**Option B: Using Git Deployment**
```bash
# Add startup command
az webapp config set \
  --resource-group streamvault-rg \
  --name streamvault-frontend \
  --startup-file "npm run start"

# Configure git deployment
az webapp deployment source config-local-git \
  --name streamvault-frontend \
  --resource-group streamvault-rg

# Push code
git remote add azure-frontend <git-url>
git push azure-frontend main
```

---

## Part 4: Database Setup

### Option A: MongoDB Atlas (Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Whitelist Azure IP ranges or use 0.0.0.0/0 (less secure)
4. Get connection string and update backend environment variables

### Option B: Azure Cosmos DB
```bash
# Create Cosmos DB account
az cosmosdb create \
  --name streamvault-db \
  --resource-group streamvault-rg \
  --kind MongoDB \
  --server-version 4.2

# Get connection string
az cosmosdb keys list \
  --name streamvault-db \
  --resource-group streamvault-rg \
  --type connection-strings
```

---

## Part 5: Configure Custom Domain (Optional)

### 5.1 Add Custom Domain
```bash
# Map custom domain
az webapp config hostname add \
  --webapp-name streamvault-frontend \
  --resource-group streamvault-rg \
  --hostname www.yourdomain.com

# Enable HTTPS
az webapp config ssl bind \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI \
  --name streamvault-frontend \
  --resource-group streamvault-rg
```

---

## Part 6: Monitoring and Scaling

### 6.1 Enable Application Insights
```bash
# Create Application Insights
az monitor app-insights component create \
  --app streamvault-insights \
  --location eastus \
  --resource-group streamvault-rg

# Link to web apps
az webapp config appsettings set \
  --resource-group streamvault-rg \
  --name streamvault-backend \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="<key>"
```

### 6.2 Configure Auto-Scaling
```bash
az monitor autoscale create \
  --resource-group streamvault-rg \
  --resource streamvault-backend \
  --resource-type Microsoft.Web/serverfarms \
  --name autoscale-plan \
  --min-count 1 \
  --max-count 3 \
  --count 1
```

### 6.3 View Logs
```bash
# Stream logs
az webapp log tail --name streamvault-backend --resource-group streamvault-rg

# Download logs
az webapp log download --name streamvault-backend --resource-group streamvault-rg
```

---

## Part 7: CI/CD with GitHub Actions (Optional)

### 7.1 Create GitHub Workflow for Backend

Create `.github/workflows/backend-deploy.yml`:
```yaml
name: Deploy Backend to Azure

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd backend
        npm install
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'streamvault-backend'
        publish-profile: ${{ secrets.AZURE_BACKEND_PUBLISH_PROFILE }}
        package: ./backend
```

### 7.2 Create GitHub Workflow for Frontend

Create `.github/workflows/frontend-deploy.yml`:
```yaml
name: Deploy Frontend to Azure

on:
  push:
    branches: [ main ]
    paths:
      - 'frontend/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install and Build
      run: |
        cd frontend
        npm install
        npm run build
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'streamvault-frontend'
        publish-profile: ${{ secrets.AZURE_FRONTEND_PUBLISH_PROFILE }}
        package: ./frontend/dist
```

### 7.3 Get Publish Profiles
```bash
# Get backend publish profile
az webapp deployment list-publishing-profiles \
  --name streamvault-backend \
  --resource-group streamvault-rg \
  --xml

# Get frontend publish profile
az webapp deployment list-publishing-profiles \
  --name streamvault-frontend \
  --resource-group streamvault-rg \
  --xml
```

Add these as GitHub secrets: `AZURE_BACKEND_PUBLISH_PROFILE` and `AZURE_FRONTEND_PUBLISH_PROFILE`

---

## Part 8: Cost Optimization

### Free Tier Options:
- **App Service**: F1 (Free) tier - Limited to 60 CPU minutes/day
- **MongoDB Atlas**: M0 (Free) tier - 512MB storage
- **Cloudinary**: Free tier - 25GB storage, 25GB bandwidth

### Paid Recommendations:
- **App Service**: B1 (Basic) - $13/month per app
- **MongoDB Atlas**: M10 - $57/month
- **Total Estimated Cost**: ~$85-100/month

### Cost Saving Tips:
1. Use Azure Free tier for testing
2. Scale down during off-peak hours
3. Use CDN for static assets
4. Implement caching strategies
5. Monitor usage with Azure Cost Management

---

## Troubleshooting

### Common Issues:

**1. CORS Errors**
- Ensure CORS_ORIGIN in backend matches frontend URL exactly
- Check Azure App Service CORS settings

**2. 500 Internal Server Error**
- Check application logs: `az webapp log tail`
- Verify environment variables are set correctly
- Check MongoDB connection string

**3. Build Failures**
- Ensure Node.js version matches locally and on Azure
- Check package.json scripts
- Verify all dependencies are in package.json (not devDependencies for production)

**4. Routing Issues (404 on refresh)**
- Ensure web.config is in the dist folder
- Check rewrite rules are configured

**5. Slow Performance**
- Upgrade to higher tier App Service plan
- Enable Application Insights to identify bottlenecks
- Implement caching (Redis)

---

## Security Checklist

- [ ] Use HTTPS for all endpoints
- [ ] Set strong secrets for tokens
- [ ] Whitelist MongoDB IP addresses
- [ ] Enable Azure Security Center
- [ ] Implement rate limiting
- [ ] Use Azure Key Vault for secrets
- [ ] Enable Web Application Firewall (WAF)
- [ ] Regular security updates
- [ ] Monitor with Azure Security Center

---

## Useful Commands

```bash
# Restart apps
az webapp restart --name streamvault-backend --resource-group streamvault-rg
az webapp restart --name streamvault-frontend --resource-group streamvault-rg

# View app settings
az webapp config appsettings list --name streamvault-backend --resource-group streamvault-rg

# Delete everything (cleanup)
az group delete --name streamvault-rg --yes

# Check deployment status
az webapp deployment list --name streamvault-backend --resource-group streamvault-rg
```

---

## Next Steps

1. Set up monitoring and alerts
2. Configure backup strategies
3. Implement CDN for better performance
4. Set up staging environments
5. Configure custom domains
6. Implement automated testing in CI/CD

---

## Support Resources

- Azure Documentation: https://docs.microsoft.com/azure/
- Azure Support: https://azure.microsoft.com/support/
- Azure Pricing Calculator: https://azure.microsoft.com/pricing/calculator/
- Azure Status: https://status.azure.com/

---

**Congratulations!** Your StreamVault application is now deployed to Azure! 🎉
