# Disaster Recovery Procedures

## Overview
This document outlines procedures for recovering the Pager System from various failure scenarios.

## Recovery Scenarios

### 1. Application Pod Failure
**Detection**: Kubernetes will automatically restart failed pods
**Recovery**: No manual intervention required - HPA will maintain replica count

### 2. Database Pod Failure
**Detection**: Check PostgreSQL StatefulSet status
```bash
kubectl get pods -n pager-system -l app=postgres
```

**Recovery Steps**:
1. If pod is CrashLoopBackOff, check logs:
   ```bash
   kubectl logs -n pager-system postgres-0
   ```
2. If data corruption suspected, restore from backup:
   ```bash
   # List available backups
   kubectl exec -n pager-system -it backup-pod -- ls /backup

   # Restore database
   kubectl exec -n pager-system -it postgres-0 -- bash
   psql -U pager_admin pager_db < /backup/backup-file.sql
   ```

### 3. Redis Failure
**Detection**: Check Redis deployment status
```bash
kubectl get pods -n pager-system -l app=redis
```

**Recovery Steps**:
1. Redis persistence is enabled with AOF
2. If complete failure, restore from RDB backup:
   ```bash
   kubectl cp backup-pod:/backup/redis-backup.rdb redis-pod:/data/dump.rdb
   kubectl exec -n pager-system redis-pod -- redis-cli SHUTDOWN NOSAVE
   # Pod will restart and load the RDB file
   ```

### 4. Node Failure
**Detection**: Kubernetes events and pod status
**Recovery**: Automatic - pods rescheduled to healthy nodes

### 5. Complete Cluster Failure
**Recovery Steps**:
1. Restore cluster from infrastructure backups
2. Apply all Kubernetes manifests in order:
   - Namespace and RBAC
   - ConfigMaps and Secrets
   - Persistent Volumes
   - Database (PostgreSQL)
   - Cache (Redis)
   - Application
3. Restore data from backups
4. Verify application functionality

## Backup Verification

Run these commands to verify backup integrity:

```bash
# PostgreSQL backup verification
kubectl run pg-test --image=postgres:15-alpine --rm -it --restart=Never -- \
  bash -c "pg_restore --list /backup/backup-file.sql"

# Redis backup verification
kubectl run redis-test --image=redis:7-alpine --rm -it --restart=Never -- \
  redis-cli --rdb /backup/redis-backup.rdb INFO
```

## Monitoring During Recovery

- Monitor application logs: `kubectl logs -n pager-system -l app=pager-api`
- Check database connectivity: `kubectl exec -n pager-system postgres-0 -- pg_isready`
- Verify Redis: `kubectl exec -n pager-system redis-pod -- redis-cli PING`

## Contact Information

- **On-call Engineer**: pager-alerts@company.com
- **Infrastructure Team**: infra@company.com
- **Management**: management@company.com