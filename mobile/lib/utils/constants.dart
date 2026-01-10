class Constants {
  // API Configuration - Update with your deployed backend URL
  static const String apiBaseUrl = 'https://pager-backend-production.up.railway.app'; // Railway deployment URL
  // static const String apiBaseUrl = 'http://localhost:3000'; // Local development
  static const String apiVersion = 'v1';

  // App Configuration
  static const String appName = 'Pager System';
  static const String appVersion = '1.0.0';

  // Storage Keys
  static const String authTokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userIdKey = 'user_id';

  // Notification Channels
  static const String incidentChannelId = 'incidents';
  static const String incidentChannelName = 'Incidents';
  static const String incidentChannelDescription = 'Notifications for new incidents';

  // Incident Statuses
  static const List<String> incidentStatuses = [
    'CREATED',
    'ACKNOWLEDGED',
    'ESCALATED',
    'RESOLVED',
    'CLOSED'
  ];

  // Incident Severities
  static const List<String> incidentSeverities = [
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
  ];

  // Timeouts
  static const int connectionTimeout = 30000; // 30 seconds
  static const int receiveTimeout = 30000; // 30 seconds

  // Cache Configuration
  static const int maxCacheAge = 300; // 5 minutes
  static const int maxStale = 3600; // 1 hour
}