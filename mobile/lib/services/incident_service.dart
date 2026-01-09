import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user.dart';
import '../utils/constants.dart';

class IncidentService {
  final String baseUrl = Constants.apiBaseUrl;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<String?> _getToken() async {
    return await _storage.read(key: Constants.authTokenKey);
  }

  Future<List<Incident>> getIncidents() async {
    final token = await _getToken();
    if (token == null) throw Exception('Not authenticated');

    final response = await http.get(
      Uri.parse('$baseUrl/incidents'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Incident.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load incidents');
    }
  }

  Future<Incident> createIncident({
    required String title,
    required String description,
    required String severity,
    required String service,
  }) async {
    final token = await _getToken();
    if (token == null) throw Exception('Not authenticated');

    final response = await http.post(
      Uri.parse('$baseUrl/incidents'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'title': title,
        'description': description,
        'severity': severity,
        'service': service,
      }),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return Incident.fromJson(data);
    } else {
      throw Exception('Failed to create incident');
    }
  }

  Future<Incident> updateIncidentStatus(String incidentId, String status) async {
    final token = await _getToken();
    if (token == null) throw Exception('Not authenticated');

    final response = await http.put(
      Uri.parse('$baseUrl/incidents/$incidentId'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'status': status,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return Incident.fromJson(data);
    } else {
      throw Exception('Failed to update incident');
    }
  }

  Future<Incident> getIncident(String incidentId) async {
    final token = await _getToken();
    if (token == null) throw Exception('Not authenticated');

    final response = await http.get(
      Uri.parse('$baseUrl/incidents/$incidentId'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return Incident.fromJson(data);
    } else {
      throw Exception('Failed to load incident');
    }
  }
}