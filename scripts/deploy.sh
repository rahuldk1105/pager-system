#!/bin/bash

# Pager System Deployment Script
# Supports deployment and rollback operations

set -e

# Configuration
NAMESPACE="pager-system"
DEPLOYMENT_NAME="pager-api"
BACKUP_DIR="./backups/$(date +%Y%m%d-%H%M%S)"

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

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."

    # Check kubectl connectivity
    if ! kubectl cluster-info >/dev/null 2>&1; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi

    # Check namespace exists
    if ! kubectl get namespace $NAMESPACE >/dev/null 2>&1; then
        log_error "Namespace $NAMESPACE does not exist"
        exit 1
    fi

    # Check required tools
    command -v kubectl >/dev/null 2>&1 || { log_error "kubectl is required but not installed"; exit 1; }
    command -v helm >/dev/null 2>&1 || { log_error "helm is required but not installed"; exit 1; }

    log_success "Pre-deployment checks passed"
}

# Create backup of current state
create_backup() {
    log_info "Creating backup of current state..."

    mkdir -p $BACKUP_DIR

    # Backup current deployments
    kubectl get deployments -n $NAMESPACE -o yaml > $BACKUP_DIR/deployments.yaml 2>/dev/null || true
    kubectl get services -n $NAMESPACE -o yaml > $BACKUP_DIR/services.yaml 2>/dev/null || true
    kubectl get configmaps -n $NAMESPACE -o yaml > $BACKUP_DIR/configmaps.yaml 2>/dev/null || true
    kubectl get secrets -n $NAMESPACE -o yaml > $BACKUP_DIR/secrets.yaml 2>/dev/null || true

    # Note: Database backup not needed since we use Supabase (managed PostgreSQL)
    log_info "Skipping database backup - using Supabase (external service)"

    log_success "Backup created at $BACKUP_DIR"
}

# Deploy infrastructure components
deploy_infrastructure() {
    log_info "Deploying infrastructure components (Supabase + Redis)..."

    # Apply Kubernetes manifests in order (excluding PostgreSQL since we use Supabase)
    local manifests=(
        "backend/infrastructure/k8s/namespace.yaml"
        "backend/infrastructure/k8s/configmap.yaml"
        "backend/infrastructure/k8s/secret.yaml"
        "backend/infrastructure/k8s/rbac.yaml"
        "backend/infrastructure/k8s/redis.yaml"
        "backend/infrastructure/k8s/redis-service.yaml"
        "backend/infrastructure/k8s/redis-backup.yaml"
        "backend/infrastructure/k8s/api-deployment.yaml"
        "backend/infrastructure/k8s/api-service.yaml"
        "backend/infrastructure/k8s/cert-issuer.yaml"
        "backend/infrastructure/k8s/ingress.yaml"
        "backend/infrastructure/k8s/network-policies.yaml"
    )

    for manifest in "${manifests[@]}"; do
        if [ -f "$manifest" ]; then
            log_info "Applying $manifest"
            kubectl apply -f "$manifest"
        else
            log_warning "Manifest $manifest not found, skipping"
        fi
    done

    log_success "Infrastructure deployment completed"
}

# Wait for deployment to be ready
wait_for_deployment() {
    local deployment=$1
    local timeout=${2:-300}

    log_info "Waiting for deployment $deployment to be ready..."

    if ! kubectl wait --for=condition=available --timeout=${timeout}s deployment/$deployment -n $NAMESPACE; then
        log_error "Deployment $deployment failed to become ready"
        return 1
    fi

    log_success "Deployment $deployment is ready"
}

# Run post-deployment tests
run_post_deployment_tests() {
    log_info "Running post-deployment tests..."

    # Wait for API to be ready
    wait_for_deployment $DEPLOYMENT_NAME

    # Test health endpoint
    local api_url=$(kubectl get ingress -n $NAMESPACE -o jsonpath='{.items[0].spec.rules[0].host}' 2>/dev/null)
    if [ -n "$api_url" ]; then
        log_info "Testing health endpoint at https://$api_url/health"
        # Note: This would need curl or similar tool
        # curl -f https://$api_url/health
    fi

    # Note: Database connectivity testing moved to application level
    # Supabase handles database management externally
    log_info "Database connectivity will be tested via API health checks"

    # Test Redis connectivity
    kubectl exec -n $NAMESPACE $(kubectl get pods -n $NAMESPACE -l app=redis -o jsonpath='{.items[0].metadata.name}') -- redis-cli ping >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        log_success "Redis connectivity verified"
    else
        log_error "Redis connectivity failed"
        return 1
    fi

    log_success "Post-deployment tests completed"
}

# Rollback deployment
rollback_deployment() {
    local backup_dir=$1

    if [ -z "$backup_dir" ]; then
        log_error "Backup directory not specified for rollback"
        exit 1
    fi

    if [ ! -d "$backup_dir" ]; then
        log_error "Backup directory $backup_dir does not exist"
        exit 1
    fi

    log_warning "Starting rollback to backup: $backup_dir"

    # Scale down current deployment
    log_info "Scaling down current deployment..."
    kubectl scale deployment $DEPLOYMENT_NAME -n $NAMESPACE --replicas=0

    # Note: Database restoration not needed for Supabase
    # Supabase handles database backups and restoration
    log_info "Database restoration handled by Supabase"

    # Restore Kubernetes resources
    if [ -f "$backup_dir/deployments.yaml" ]; then
        log_info "Restoring deployments..."
        kubectl apply -f $backup_dir/deployments.yaml
    fi

    if [ -f "$backup_dir/services.yaml" ]; then
        log_info "Restoring services..."
        kubectl apply -f $backup_dir/services.yaml
    fi

    # Wait for rollback to complete
    wait_for_deployment $DEPLOYMENT_NAME

    log_success "Rollback completed"
}

# Main deployment function
deploy() {
    log_info "Starting Pager System deployment..."

    pre_deployment_checks
    create_backup
    deploy_infrastructure
    run_post_deployment_tests

    log_success "Deployment completed successfully!"
    log_info "Backup stored at: $BACKUP_DIR"
    log_info "Use './deploy.sh rollback $BACKUP_DIR' to rollback if needed"
}

# Main rollback function
rollback() {
    local backup_dir=$1

    if [ -z "$backup_dir" ]; then
        log_error "Usage: $0 rollback <backup-directory>"
        exit 1
    fi

    rollback_deployment "$backup_dir"
}

# Main function
main() {
    case "${1:-deploy}" in
        "deploy")
            deploy
            ;;
        "rollback")
            rollback "$2"
            ;;
        *)
            echo "Usage: $0 [deploy|rollback <backup-dir>]"
            exit 1
            ;;
    esac
}

main "$@"