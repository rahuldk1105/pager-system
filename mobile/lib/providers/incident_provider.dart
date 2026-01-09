import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/incident_service.dart';

class IncidentProvider with ChangeNotifier {
  final IncidentService _incidentService = IncidentService();

  List<Incident> _incidents = [];
  bool _isLoading = false;
  String? _error;

  List<Incident> get incidents => _incidents;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadIncidents() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _incidents = await _incidentService.getIncidents();
    } catch (e) {
      _error = 'Failed to load incidents: ${e.toString()}';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> createIncident({
    required String title,
    required String description,
    required String severity,
    required String service,
  }) async {
    try {
      final incident = await _incidentService.createIncident(
        title: title,
        description: description,
        severity: severity,
        service: service,
      );

      _incidents.insert(0, incident);
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Failed to create incident: ${e.toString()}';
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateIncidentStatus(String incidentId, String status) async {
    try {
      final updatedIncident = await _incidentService.updateIncidentStatus(incidentId, status);

      final index = _incidents.indexWhere((incident) => incident.id == incidentId);
      if (index != -1) {
        _incidents[index] = updatedIncident;
        notifyListeners();
      }
      return true;
    } catch (e) {
      _error = 'Failed to update incident: ${e.toString()}';
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}