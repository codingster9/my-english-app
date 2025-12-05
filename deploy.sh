#!/bin/bash

# 🚀 English Learning Platform - Deployment Prep Script

echo "🎓 Preparing Advanced English Learning Platform for deployment..."

# 1. Clean up previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf .next
rm -rf dist

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 3. Generate Prisma client
echo "🗄️ Generating Prisma client..."
npm run db:generate

# 4. Build the application
echo "🔨 Building application..."
npm run build

# 5. Create deployment package
echo "📦 Creating deployment package..."
DEPLOY_DIR="english-learning-platform-deploy"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy necessary files
cp -r .next $DEPLOY_DIR/
cp -r public $DEPLOY_DIR/
cp -r api $DEPLOY_DIR/  # In case we need API files
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/
cp netlify.toml $DEPLOY_DIR/
cp README.md $DEPLOY_DIR/
cp DEPLOYMENT_GUIDE.md $DEPLOY_DIR/

# Create .env template
echo "📝 Creating environment template..."
cat > $DEPLOY_DIR/.env.template << EOF
# Database Configuration
# Option 1: Neon PostgreSQL (Recommended for production)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Option 2: SQLite (Good for development)
# DATABASE_URL=file:./db/custom.db

# Get Neon connection string from: https://neon.tech
EOF

# Create zip file
echo "🗜️ Creating deployment zip..."
cd $DEPLOY_DIR
zip -r ../english-learning-platform.zip .
cd ..

# Clean up deploy directory
rm -rf $DEPLOY_DIR

echo "✅ Deployment package created: english-learning-platform.zip"
echo ""
echo "📋 Next Steps:"
echo "1. Upload english-learning-platform.zip to Netlify"
echo "2. Configure DATABASE_URL environment variable in Netlify dashboard"
echo "3. Your site will be live! 🎉"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md"