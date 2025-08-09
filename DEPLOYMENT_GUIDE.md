# Stylo Fashion E-commerce Platform - Deployment Guide for Pune

## 🚀 Complete Platform Overview

Stylo is a **Blinkit-like fashion e-commerce platform** specifically designed for Pune, connecting local fashion stores with customers for fast delivery and pickup options.

### ✨ Key Features Implemented

#### 🏪 **Store Owner Features**
- **Store Registration**: Complete store setup with location, hours, delivery options
- **Product Management**: Upload products with images, variants, pricing
- **Inventory Management**: Track stock, sizes, colors
- **Order Management**: View and manage incoming orders
- **Dashboard Analytics**: View sales, performance metrics

#### 🛍️ **Customer Features**
- **Location-based Shopping**: Find nearby stores and products
- **Quick Delivery**: 2-hour delivery from local stores
- **Multiple Payment Options**: UPI, Cards, Net Banking, Wallets, COD
- **Real-time Tracking**: Order status and delivery updates
- **User Profiles**: Manage addresses, preferences, order history

#### 💳 **Payment Integration**
- **Indian Payment Methods**: UPI (GPay, PhonePe, Paytm), Cards, Net Banking
- **Secure Processing**: Industry-standard encryption
- **Cash on Delivery**: Available for all orders
- **Multiple Wallets**: Paytm, PhonePe, Amazon Pay support

## 🏗️ Architecture

### Backend (Node.js/Express)
- **RESTful API** with comprehensive endpoints
- **MongoDB** for data storage with geospatial indexing
- **JWT Authentication** with role-based access
- **File Upload** handling for product images
- **Payment Gateway** integration ready

### Frontend (React TypeScript)
- **Modern React** with TypeScript for type safety
- **Tailwind CSS** for beautiful, responsive UI
- **React Query** for efficient data fetching
- **React Router** for navigation
- **Context API** for state management

## 📋 Pre-Deployment Setup

### 1. System Requirements
```bash
# Install Node.js (v16 or higher)
node --version  # Should be 16+
npm --version   # Should be 8+

# Install MongoDB
# For Windows: Download from mongodb.com
# For Linux: sudo apt-get install mongodb
# For Cloud: Use MongoDB Atlas (recommended)
```

### 2. Environment Variables
Create `.env` file in project root:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/stylo-fashion
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/stylo-fashion

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5000
NODE_ENV=production
CLIENT_URL=http://localhost:3000

# Payment Integration
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload (optional - for cloud storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Cloudinary Setup (Required for Production)
Cloudinary is used for storing product images in the cloud. This is essential for production deployment.

#### Steps to Set Up Cloudinary:
1. **Create Account**: Go to [cloudinary.com](https://cloudinary.com) and sign up for a free account
2. **Get Credentials**: From your dashboard, copy:
   - Cloud Name
   - API Key  
   - API Secret
3. **Update Environment Variables**: Set these in your `.env` file and production environment

#### Why Cloudinary?
- **Local Storage**: Files are lost when server restarts (not suitable for production)
- **Cloud Storage**: Images persist across deployments and server restarts
- **CDN**: Fast image delivery worldwide
- **Free Tier**: 25GB storage and 25GB bandwidth per month

### 4. Database Setup
```bash
# Start MongoDB locally
mongod

# Or set up MongoDB Atlas
# 1. Go to https://www.mongodb.com/atlas
# 2. Create free cluster
# 3. Get connection string
# 4. Update MONGODB_URI in .env
```

## 🚀 Local Development

### 1. Install Dependencies
```bash
# Install all dependencies
npm run install-all

# Or install separately
npm install
cd client && npm install
```

### 2. Start Development Servers
```bash
# Start both server and client
npm run dev

# Or start separately
npm run server    # Backend on port 5000
npm run client    # Frontend on port 3000
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🌐 Production Deployment

### Option 1: Traditional Server (VPS/Dedicated)

#### 1. Server Setup (Ubuntu/CentOS)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Nginx (reverse proxy)
sudo apt install nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### 2. Deploy Application
```bash
# Clone repository
git clone <your-repo-url>
cd stylo

# Install dependencies
npm run install-all

# Build client
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 3. Nginx Configuration
```nginx
# /etc/nginx/sites-available/stylo
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Serve static files
    location /uploads {
        alias /path/to/stylo/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API requests
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve React app
    location / {
        root /path/to/stylo/client/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

### Option 2: Cloud Deployment (Heroku/Vercel/Railway)

#### Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create stylo-pune

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main
```

#### Vercel Deployment (Frontend)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd client
vercel --prod
```

#### Render Deployment (Recommended - One-Click)
Render provides the easiest deployment option with automatic builds and scaling.

##### 1. One-Click Deployment
1. **Fork/Clone**: Ensure your code is in a GitHub repository
2. **Connect to Render**: Go to [render.com](https://render.com) and sign up
3. **New Web Service**: Click "New +" → "Web Service"
4. **Connect Repository**: Connect your GitHub account and select the Stylo repository
5. **Auto-Deploy**: Render will automatically detect the `render.yaml` configuration

##### 2. Environment Variables (Set in Render Dashboard)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=https://your-app-name.onrender.com
STRIPE_SECRET_KEY=your-stripe-secret-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

##### 3. Automatic Deployment
- **Build Command**: `npm install && cd client && npm install && cd .. && npm run build`
- **Start Command**: `node server/index.js`
- **Health Check**: `/api/health`

##### 4. Custom Domain (Optional)
- Add your custom domain in Render dashboard
- Update `CLIENT_URL` environment variable
- SSL certificate is automatically provided

### Option 3: Docker Deployment

#### 1. Create Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build client
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

#### 2. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  stylo-app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/stylo-fashion
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - mongo
    volumes:
      - ./uploads:/app/uploads

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

## 📱 Going Live in Pune

### 1. Domain & SSL
```bash
# Get domain (e.g., stylopune.com)
# Set up DNS records
# Install SSL certificate (Let's Encrypt)
sudo certbot --nginx -d yourdomain.com
```

### 2. Business Setup for Pune
- **Local Store Partnerships**: Reach out to fashion stores in areas like:
  - FC Road, Koregaon Park, Camp, Aundh, Baner, Wakad
  - Popular markets: Laxmi Road, Hong Kong Lane, Phoenix Mall area
- **Delivery Partners**: Integrate with local delivery services
- **Payment Gateway**: Set up with Indian providers (Razorpay, PayU, CCAvenue)

### 3. Marketing & Growth
- **Store Onboarding**: Create marketing materials for store owners
- **Customer Acquisition**: Social media marketing, local influencers
- **SEO Optimization**: Target Pune fashion keywords

### 4. Performance Optimization
```bash
# Enable compression
# Set up CDN (Cloudflare)
# Optimize images
# Implement caching strategies
# Monitor with tools like New Relic, DataDog
```

## 🔧 Key Features to Demo

### For Store Owners
1. **Register Store**: `/stores/register`
2. **Upload Products**: `/products/add`
3. **Manage Inventory**: `/dashboard`
4. **Process Orders**: Order management system

### For Customers
1. **Browse Products**: Location-based product discovery
2. **Quick Checkout**: Fast, secure payment
3. **Track Orders**: Real-time order tracking
4. **Multiple Payments**: UPI, Cards, COD

## 📊 Monitoring & Analytics

### Production Monitoring
```bash
# PM2 monitoring
pm2 monit

# Application logs
pm2 logs

# System resources
htop
df -h
```

### Analytics Integration
- Google Analytics for user behavior
- Custom dashboard for business metrics
- Order tracking and conversion rates

## 🚨 Troubleshooting Common Issues

### 1. Port Already in Use
```bash
# Kill processes on port 5000/3000
taskkill /f /im node.exe  # Windows
sudo lsof -ti:5000 | xargs kill  # Linux/Mac
```

### 2. MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

### 3. Build Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules client/node_modules
npm run install-all
```

## 📞 Support & Next Steps

### Immediate Next Steps
1. **Set up production environment** with proper hosting
2. **Configure payment gateway** (Razorpay recommended for India)
3. **Partner with local stores** in Pune for initial inventory
4. **Launch MVP** with select stores and test customers
5. **Gather feedback** and iterate

### Growth Features to Add
- **Real-time chat** with store owners
- **AR try-on** for clothing
- **Social features** (reviews, wishlist sharing)
- **Loyalty program** for frequent customers
- **Bulk orders** for corporate clients

Your Stylo platform is now **production-ready** with all the essential features for a successful fashion e-commerce marketplace in Pune! 🎉

For any technical support or questions about deployment, feel free to reach out.
