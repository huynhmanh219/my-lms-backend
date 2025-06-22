#!/bin/bash

# LMS Backend Deployment Script
# Comprehensive production deployment with health checks and rollback

set -e  # Exit on any error

# Configuration
APP_NAME="lms-backend"
DOCKER_IMAGE="lms-backend:latest"
BACKUP_DIR="/opt/backups"
LOG_DIR="/var/log/lms-backend"
HEALTH_ENDPOINT="/health"
MAX_HEALTH_RETRIES=30
HEALTH_RETRY_INTERVAL=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Print usage
usage() {
    echo "Usage: $0 [ENVIRONMENT] [OPTIONS]"
    echo ""
    echo "Environments:"
    echo "  staging     Deploy to staging environment"
    echo "  production  Deploy to production environment"
    echo ""
    echo "Options:"
    echo "  --skip-backup    Skip database backup"
    echo "  --skip-tests     Skip health checks"
    echo "  --rollback       Rollback to previous version"
    echo "  --build          Build new Docker image"
    echo "  --help           Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 staging --build"
    echo "  $0 production"
    echo "  $0 production --rollback"
    exit 1
}

# Parse arguments
ENVIRONMENT=""
SKIP_BACKUP=false
SKIP_TESTS=false
ROLLBACK=false
BUILD_IMAGE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        staging|production)
            ENVIRONMENT="$1"
            shift
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --rollback)
            ROLLBACK=true
            shift
            ;;
        --build)
            BUILD_IMAGE=true
            shift
            ;;
        --help)
            usage
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            ;;
    esac
done

# Validate environment
if [[ -z "$ENVIRONMENT" ]]; then
    log_error "Environment is required"
    usage
fi

# Set environment-specific configuration
case $ENVIRONMENT in
    staging)
        DOCKER_COMPOSE_FILE="docker-compose.staging.yml"
        SERVER_URL="https://staging-api.yourdomain.com"
        BACKUP_RETENTION_DAYS=7
        ;;
    production)
        DOCKER_COMPOSE_FILE="docker-compose.yml"
        SERVER_URL="https://api.yourdomain.com"
        BACKUP_RETENTION_DAYS=30
        ;;
esac

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running"
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if compose file exists
    if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
        log_error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    
    sudo mkdir -p "$BACKUP_DIR" "$LOG_DIR"
    sudo chown $(whoami):$(whoami) "$BACKUP_DIR" "$LOG_DIR"
    
    log_success "Directories created"
}

# Database backup
backup_database() {
    if [[ "$SKIP_BACKUP" == true ]]; then
        log_warning "Skipping database backup"
        return 0
    fi
    
    log_info "Creating database backup..."
    
    BACKUP_FILE="$BACKUP_DIR/lms_backend_$(date +%Y%m%d_%H%M%S).sql"
    
    # Get database credentials from environment or Docker Compose
    DB_CONTAINER=$(docker-compose -f "$DOCKER_COMPOSE_FILE" ps -q mysql 2>/dev/null || echo "")
    
    if [[ -n "$DB_CONTAINER" ]]; then
        # Backup from running container
        docker exec "$DB_CONTAINER" mysqldump -u root -p"${MYSQL_ROOT_PASSWORD:-root_password}" lms_backend > "$BACKUP_FILE"
    else
        log_warning "Database container not running, skipping backup"
        return 0
    fi
    
    if [[ -f "$BACKUP_FILE" && -s "$BACKUP_FILE" ]]; then
        log_success "Database backup created: $BACKUP_FILE"
        
        # Compress backup
        gzip "$BACKUP_FILE"
        log_success "Backup compressed: $BACKUP_FILE.gz"
        
        # Clean old backups
        find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$BACKUP_RETENTION_DAYS -delete
        log_info "Old backups cleaned (retention: $BACKUP_RETENTION_DAYS days)"
    else
        log_error "Database backup failed"
        exit 1
    fi
}

# Build Docker image
build_image() {
    if [[ "$BUILD_IMAGE" != true ]]; then
        return 0
    fi
    
    log_info "Building Docker image..."
    
    docker build -t "$DOCKER_IMAGE" .
    
    if [[ $? -eq 0 ]]; then
        log_success "Docker image built successfully"
    else
        log_error "Docker image build failed"
        exit 1
    fi
}

# Deploy application
deploy_application() {
    log_info "Deploying application..."
    
    # Pull latest images
    log_info "Pulling latest images..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" pull
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    # Start new containers
    log_info "Starting new containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    # Wait for containers to start
    sleep 10
    
    log_success "Application deployed"
}

# Health check
health_check() {
    if [[ "$SKIP_TESTS" == true ]]; then
        log_warning "Skipping health checks"
        return 0
    fi
    
    log_info "Performing health checks..."
    
    local retries=0
    while [[ $retries -lt $MAX_HEALTH_RETRIES ]]; do
        log_info "Health check attempt $((retries + 1))/$MAX_HEALTH_RETRIES"
        
        if curl -f -s "$SERVER_URL$HEALTH_ENDPOINT" > /dev/null; then
            log_success "Health check passed"
            return 0
        fi
        
        retries=$((retries + 1))
        if [[ $retries -lt $MAX_HEALTH_RETRIES ]]; then
            log_info "Waiting ${HEALTH_RETRY_INTERVAL}s before next attempt..."
            sleep $HEALTH_RETRY_INTERVAL
        fi
    done
    
    log_error "Health check failed after $MAX_HEALTH_RETRIES attempts"
    return 1
}

# Rollback to previous version
rollback_deployment() {
    log_warning "Rolling back to previous version..."
    
    # Find previous backup
    LATEST_BACKUP=$(find "$BACKUP_DIR" -name "*.sql.gz" -type f -printf "%T@ %p\n" | sort -n | tail -2 | head -1 | cut -d' ' -f2-)
    
    if [[ -n "$LATEST_BACKUP" ]]; then
        log_info "Found backup: $LATEST_BACKUP"
        
        # Stop current containers
        docker-compose -f "$DOCKER_COMPOSE_FILE" down
        
        # Restore database
        log_info "Restoring database from backup..."
        gunzip -c "$LATEST_BACKUP" | docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T mysql mysql -u root -p"${MYSQL_ROOT_PASSWORD:-root_password}" lms_backend
        
        # Start containers with previous image
        docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
        
        log_success "Rollback completed"
    else
        log_error "No backup found for rollback"
        exit 1
    fi
}

# Performance test
performance_test() {
    if [[ "$SKIP_TESTS" == true ]]; then
        return 0
    fi
    
    log_info "Running performance tests..."
    
    # Basic performance test
    if command -v curl &> /dev/null; then
        local response_time=$(curl -o /dev/null -s -w "%{time_total}" "$SERVER_URL$HEALTH_ENDPOINT")
        log_info "Health endpoint response time: ${response_time}s"
        
        if (( $(echo "$response_time < 1.0" | bc -l) )); then
            log_success "Performance test passed"
        else
            log_warning "Performance test shows slow response time"
        fi
    fi
}

# Cleanup old Docker resources
cleanup_docker() {
    log_info "Cleaning up Docker resources..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused networks
    docker network prune -f
    
    # Remove unused volumes (be careful with this in production)
    if [[ "$ENVIRONMENT" != "production" ]]; then
        docker volume prune -f
    fi
    
    log_success "Docker cleanup completed"
}

# Send notification
send_notification() {
    local status="$1"
    local message="$2"
    
    # Slack notification (if webhook URL is set)
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 LMS Backend Deployment - $ENVIRONMENT\\nStatus: $status\\nMessage: $message\"}" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || true
    fi
    
    # Email notification (if configured)
    if command -v mail &> /dev/null && [[ -n "${NOTIFICATION_EMAIL:-}" ]]; then
        echo "$message" | mail -s "LMS Backend Deployment - $status" "$NOTIFICATION_EMAIL" || true
    fi
}

# Main deployment function
main() {
    local start_time=$(date +%s)
    
    log_info "Starting LMS Backend deployment to $ENVIRONMENT"
    log_info "Timestamp: $(date)"
    
    # Handle rollback
    if [[ "$ROLLBACK" == true ]]; then
        rollback_deployment
        send_notification "ROLLBACK" "Successfully rolled back to previous version"
        exit 0
    fi
    
    # Main deployment flow
    check_prerequisites
    create_directories
    backup_database
    build_image
    
    # Deploy and test
    if deploy_application; then
        if health_check; then
            performance_test
            cleanup_docker
            
            local end_time=$(date +%s)
            local duration=$((end_time - start_time))
            
            log_success "Deployment completed successfully in ${duration}s"
            send_notification "SUCCESS" "Deployment completed successfully in ${duration}s"
        else
            log_error "Health check failed, rolling back..."
            rollback_deployment
            send_notification "FAILED" "Deployment failed health check, rolled back to previous version"
            exit 1
        fi
    else
        log_error "Deployment failed"
        send_notification "FAILED" "Deployment failed during application startup"
        exit 1
    fi
}

# Trap signals for cleanup
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@" 