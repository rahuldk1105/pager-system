import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/auth_service.dart';
import '../models/user.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  User? _user;
  bool _isLoading = true;
  String? _token;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null && _token != null;
  String? get token => _token;
  String? get error => _error;

  AuthProvider() {
    checkAuthStatus();
  }

  Future<void> checkAuthStatus() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final storedToken = await _storage.read(key: 'auth_token');
      final storedUserId = await _storage.read(key: 'user_id');

      if (storedToken != null && storedUserId != null) {
        _token = storedToken;
        // In a real app, you'd validate the token with the server
        // For now, we'll assume it's valid if it exists
        _user = User(id: storedUserId, email: '', name: ''); // Minimal user object
      }
    } catch (e) {
      _error = 'Failed to check authentication status';
      debugPrint('Auth check error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.login(email, password);

      if (result['success']) {
        _token = result['token'];
        _user = User.fromJson(result['user']);

        // Store in secure storage
        await _storage.write(key: 'auth_token', value: _token);
        await _storage.write(key: 'user_id', value: _user!.id);

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = result['message'] ?? 'Login failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Network error occurred';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String name, String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _authService.register(name, email, password);

      if (result['success']) {
        _token = result['token'];
        _user = User.fromJson(result['user']);

        // Store in secure storage
        await _storage.write(key: 'auth_token', value: _token);
        await _storage.write(key: 'user_id', value: _user!.id);

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = result['message'] ?? 'Registration failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Network error occurred';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      // Call logout API if needed
      await _authService.logout();

      // Clear local storage
      await _storage.delete(key: 'auth_token');
      await _storage.delete(key: 'user_id');

      _user = null;
      _token = null;
      _error = null;
    } catch (e) {
      debugPrint('Logout error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}