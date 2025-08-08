const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Stylo Deployment Script');
console.log('===========================\n');

// Function to run commands
function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

// Function to create directories
function createDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
}

// Function to create environment file
function createEnvFile() {
  const envContent = `# Stylo Environment Configuration
# Database
MONGODB_URI=mongodb://localhost:27017/stylo-fashion
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/stylo-fashion

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=production
CLIENT_URL=http://localhost:3000

# Payment Integration (Optional - get from payment provider)
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload (Optional - for cloud storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
`;

  if (!fs.existsSync('.env')) {
    fs.writeFileSync('.env', envContent);
    console.log('📄 Created .env file with default configuration');
    console.log('⚠️  Please update the .env file with your actual values!\n');
  }
}

// Function to create PM2 ecosystem file
function createPM2Config() {
  const pm2Config = {
    apps: [{
      name: 'stylo-backend',
      script: 'server/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }]
  };

  fs.writeFileSync('ecosystem.config.js', `module.exports = ${JSON.stringify(pm2Config, null, 2)};`);
  console.log('📄 Created PM2 ecosystem.config.js');
}

// Main deployment function
function deploy() {
  console.log('🎯 Starting Stylo deployment...\n');

  // Create necessary directories
  createDirectory('uploads/products');
  
  // Create configuration files
  createEnvFile();
  createPM2Config();

  // Install dependencies
  runCommand('npm install', 'Installing backend dependencies');
  runCommand('cd client && npm install', 'Installing frontend dependencies');

  // Build frontend
  runCommand('npm run build', 'Building React frontend');

  console.log('🎉 Deployment preparation completed!\n');
  console.log('📋 Next Steps:');
  console.log('1. Update .env file with your actual values');
  console.log('2. Start MongoDB: mongod (or use MongoDB Atlas)');
  console.log('3. Start the application:');
  console.log('   - Development: npm run dev');
  console.log('   - Production: npm start');
  console.log('   - PM2: pm2 start ecosystem.config.js');
  console.log('\n🌐 Access your app:');
  console.log('   - Frontend: http://localhost:3000');
  console.log('   - Backend API: http://localhost:5000');
  console.log('   - Health Check: http://localhost:5000/api/health');
  console.log('\n📚 For detailed deployment guide, see DEPLOYMENT_GUIDE.md');
}

// Run deployment
if (require.main === module) {
  deploy();
}
