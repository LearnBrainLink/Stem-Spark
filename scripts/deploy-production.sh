#!/bin/bash

# STEM Spark Academy - Production Deployment Script
# This script automates the deployment process for the production environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="stems spark-academy"
VERCEL_PROJECT_ID="your-vercel-project-id"
SUPABASE_PROJECT_REF="your-supabase-project-ref"
FLASK_MAIL_DOMAIN="your-flask-mail-domain.com"
BACKUP_BUCKET="your-backup-bucket"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if required tools are installed
    command -v node >/dev/null 2>&1 || { error "Node.js is required but not installed"; exit 1; }
    command -v npm >/dev/null 2>&1 || { error "npm is required but not installed"; exit 1; }
    command -v vercel >/dev/null 2>&1 || { error "Vercel CLI is required but not installed"; exit 1; }
    command -v supabase >/dev/null 2>&1 || { error "Supabase CLI is required but not installed"; exit 1; }
    command -v docker >/dev/null 2>&1 || { error "Docker is required but not installed"; exit 1; }
    command -v docker-compose >/dev/null 2>&1 || { error "Docker Compose is required but not installed"; exit 1; }
    
    success "All prerequisites are satisfied"
}

# Backup current database
backup_database() {
    log "Creating database backup..."
    
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if supabase db dump --project-ref "$SUPABASE_PROJECT_REF" > "backups/$BACKUP_FILE"; then
        success "Database backup created: backups/$BACKUP_FILE"
        
        # Compress backup
        gzip "backups/$BACKUP_FILE"
        success "Backup compressed: backups/$BACKUP_FILE.gz"
        
        # Upload to cloud storage if configured
        if [ -n "$BACKUP_BUCKET" ]; then
            if aws s3 cp "backups/$BACKUP_FILE.gz" "s3://$BACKUP_BUCKET/"; then
                success "Backup uploaded to S3"
            else
                warning "Failed to upload backup to S3"
            fi
        fi
    else
        error "Failed to create database backup"
        exit 1
    fi
}

# Deploy database migrations
deploy_database() {
    log "Deploying database migrations..."
    
    if supabase db push --project-ref "$SUPABASE_PROJECT_REF"; then
        success "Database migrations deployed successfully"
    else
        error "Failed to deploy database migrations"
        exit 1
    fi
    
    # Verify migrations
    log "Verifying database schema..."
    if supabase db diff --project-ref "$SUPABASE_PROJECT_REF" | grep -q "No differences"; then
        success "Database schema is up to date"
    else
        warning "Database schema differences detected"
    fi
}

# Deploy Flask Mail microservice
deploy_flask_mail() {
    log "Deploying Flask Mail microservice..."
    
    cd flask-mail-service
    
    # Build production Docker image
    if docker build -f Dockerfile.prod -t "$PROJECT_NAME-flask-mail:latest" .; then
        success "Flask Mail Docker image built successfully"
    else
        error "Failed to build Flask Mail Docker image"
        exit 1
    fi
    
    # Deploy using Docker Compose
    if docker-compose -f ../docker-compose.prod.yml up -d flask-mail; then
        success "Flask Mail microservice deployed successfully"
    else
        error "Failed to deploy Flask Mail microservice"
        exit 1
    fi
    
    # Wait for service to be healthy
    log "Waiting for Flask Mail service to be healthy..."
    for i in {1..30}; do
        if curl -f "http://localhost:5000/health" >/dev/null 2>&1; then
            success "Flask Mail service is healthy"
            break
        fi
        
        if [ $i -eq 30 ]; then
            error "Flask Mail service failed to become healthy"
            exit 1
        fi
        
        sleep 2
    done
    
    cd ..
}

# Deploy Next.js application
deploy_nextjs() {
    log "Deploying Next.js application..."
    
    # Install dependencies
    if npm ci --production; then
        success "Dependencies installed"
    else
        error "Failed to install dependencies"
        exit 1
    fi
    
    # Build application
    if npm run build; then
        success "Application built successfully"
    else
        error "Failed to build application"
        exit 1
    fi
    
    # Deploy to Vercel
    if vercel --prod --yes; then
        success "Next.js application deployed to Vercel"
    else
        error "Failed to deploy to Vercel"
        exit 1
    fi
}

# Run health checks
run_health_checks() {
    log "Running health checks..."
    
    # Get Vercel deployment URL
    DEPLOYMENT_URL=$(vercel ls | grep "$PROJECT_NAME" | head -1 | awk '{print $2}')
    
    if [ -z "$DEPLOYMENT_URL" ]; then
        error "Could not determine deployment URL"
        return 1
    fi
    
    # Check application health
    if curl -f "$DEPLOYMENT_URL/api/health" >/dev/null 2>&1; then
        success "Application health check passed"
    else
        error "Application health check failed"
        return 1
    fi
    
    # Check Flask Mail service
    if curl -f "https://$FLASK_MAIL_DOMAIN/health" >/dev/null 2>&1; then
        success "Flask Mail service health check passed"
    else
        error "Flask Mail service health check failed"
        return 1
    fi
    
    # Check database connectivity
    if supabase status --project-ref "$SUPABASE_PROJECT_REF" >/dev/null 2>&1; then
        success "Database connectivity check passed"
    else
        error "Database connectivity check failed"
        return 1
    fi
}

# Run smoke tests
run_smoke_tests() {
    log "Running smoke tests..."
    
    DEPLOYMENT_URL=$(vercel ls | grep "$PROJECT_NAME" | head -1 | awk '{print $2}')
    
    # Test homepage
    if curl -f "$DEPLOYMENT_URL" >/dev/null 2>&1; then
        success "Homepage test passed"
    else
        error "Homepage test failed"
        return 1
    fi
    
    # Test API endpoints
    if curl -f "$DEPLOYMENT_URL/api/health" >/dev/null 2>&1; then
        success "API health endpoint test passed"
    else
        error "API health endpoint test failed"
        return 1
    fi
    
    # Test email service
    if curl -f "https://$FLASK_MAIL_DOMAIN/api/health" >/dev/null 2>&1; then
        success "Email service test passed"
    else
        error "Email service test failed"
        return 1
    fi
}

# Send deployment notification
send_notification() {
    log "Sending deployment notification..."
    
    DEPLOYMENT_URL=$(vercel ls | grep "$PROJECT_NAME" | head -1 | awk '{print $2}')
    
    # Create notification message
    MESSAGE="🚀 STEM Spark Academy Production Deployment Complete
    
    ✅ Database: Migrations applied successfully
    ✅ Flask Mail: Microservice deployed and healthy
    ✅ Next.js App: Deployed to Vercel
    ✅ Health Checks: All services operational
    
    🌐 Production URL: $DEPLOYMENT_URL
    📧 Email Service: https://$FLASK_MAIL_DOMAIN
    🗄️ Database: $SUPABASE_PROJECT_REF
    
    Deployed at: $(date)
    "
    
    # Send notification (customize based on your notification system)
    if command -v curl >/dev/null 2>&1; then
        # Example: Send to Slack webhook
        if [ -n "$SLACK_WEBHOOK_URL" ]; then
            curl -X POST -H 'Content-type: application/json' \
                --data "{\"text\":\"$MESSAGE\"}" \
                "$SLACK_WEBHOOK_URL" >/dev/null 2>&1
        fi
        
        # Example: Send email notification
        if [ -n "$NOTIFICATION_EMAIL" ]; then
            echo "$MESSAGE" | mail -s "STEM Spark Academy Deployment Complete" "$NOTIFICATION_EMAIL"
        fi
    fi
    
    success "Deployment notification sent"
}

# Rollback function
rollback() {
    error "Deployment failed. Starting rollback..."
    
    # Rollback database if backup exists
    if [ -f "backups/backup_*.sql.gz" ]; then
        log "Rolling back database..."
        LATEST_BACKUP=$(ls -t backups/backup_*.sql.gz | head -1)
        gunzip -c "$LATEST_BACKUP" | supabase db reset --project-ref "$SUPABASE_PROJECT_REF"
        warning "Database rolled back to: $LATEST_BACKUP"
    fi
    
    # Stop Flask Mail service
    log "Stopping Flask Mail service..."
    docker-compose -f docker-compose.prod.yml down
    
    # Revert Vercel deployment
    log "Reverting Vercel deployment..."
    vercel rollback
    
    error "Rollback completed"
    exit 1
}

# Main deployment function
main() {
    log "Starting STEM Spark Academy production deployment..."
    
    # Set up error handling
    trap rollback ERR
    
    # Create backups directory if it doesn't exist
    mkdir -p backups
    
    # Run deployment steps
    check_prerequisites
    backup_database
    deploy_database
    deploy_flask_mail
    deploy_nextjs
    run_health_checks
    run_smoke_tests
    send_notification
    
    success "🎉 Production deployment completed successfully!"
    
    # Display deployment information
    DEPLOYMENT_URL=$(vercel ls | grep "$PROJECT_NAME" | head -1 | awk '{print $2}')
    echo ""
    echo "Deployment Summary:"
    echo "=================="
    echo "🌐 Production URL: $DEPLOYMENT_URL"
    echo "📧 Email Service: https://$FLASK_MAIL_DOMAIN"
    echo "🗄️ Database: $SUPABASE_PROJECT_REF"
    echo "⏰ Deployed at: $(date)"
    echo ""
    echo "Next Steps:"
    echo "==========="
    echo "1. Monitor application logs for any issues"
    echo "2. Verify all features are working correctly"
    echo "3. Update DNS if using custom domain"
    echo "4. Configure monitoring alerts"
    echo "5. Update team documentation"
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --backup-only  Only create database backup"
        echo "  --db-only      Only deploy database migrations"
        echo "  --app-only     Only deploy Next.js application"
        echo "  --mail-only    Only deploy Flask Mail service"
        echo ""
        echo "Examples:"
        echo "  $0              # Full deployment"
        echo "  $0 --backup-only # Only backup database"
        echo "  $0 --db-only    # Only deploy database"
        exit 0
        ;;
    --backup-only)
        check_prerequisites
        backup_database
        success "Database backup completed"
        exit 0
        ;;
    --db-only)
        check_prerequisites
        backup_database
        deploy_database
        success "Database deployment completed"
        exit 0
        ;;
    --app-only)
        check_prerequisites
        deploy_nextjs
        success "Next.js application deployment completed"
        exit 0
        ;;
    --mail-only)
        check_prerequisites
        deploy_flask_mail
        success "Flask Mail service deployment completed"
        exit 0
        ;;
    "")
        main
        ;;
    *)
        error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac 