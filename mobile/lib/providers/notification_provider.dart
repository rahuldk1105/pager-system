import 'package:flutter/material.dart';
import '../services/notification_service.dart';

class NotificationProvider with ChangeNotifier {
  final NotificationService _notificationService = NotificationService();

  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = false;
  String? _error;

  List<Map<String, dynamic>> get notifications => _notifications;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> initialize() async {
    try {
      await _notificationService.initialize();
    } catch (e) {
      _error = 'Failed to initialize notifications: ${e.toString()}';
      notifyListeners();
    }
  }

  Future<String?> getFCMToken() async {
    try {
      return await _notificationService.getFCMToken();
    } catch (e) {
      _error = 'Failed to get FCM token: ${e.toString()}';
      notifyListeners();
      return null;
    }
  }

  void addNotification(Map<String, dynamic> notification) {
    _notifications.insert(0, notification);
    notifyListeners();
  }

  void clearNotifications() {
    _notifications.clear();
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}