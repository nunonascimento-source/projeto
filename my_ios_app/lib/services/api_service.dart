import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/measurement.dart';

class ApiService {
  static const String baseUrl =
      'https://projeto-production-4f74.up.railway.app/api';
  static String? _token;
  static String? _userId;

  // Register a new user
  static Future<Map<String, dynamic>?> register(
    String email,
    String password, {
    String? name,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password, 'name': name}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _token = data['token'];
        _userId = data['userId'];

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);
        await prefs.setString('user_id', _userId!);
        await prefs.setString('user_email', data['email']);
        await prefs.setString('user_name', data['name'] ?? '');

        return data;
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['error'] ?? 'Registration failed');
      }
    } catch (e) {
      print('Error registering: $e');
      return null;
    }
  }

  // Login user
  static Future<Map<String, dynamic>?> login(
    String email,
    String password,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _token = data['token'];
        _userId = data['userId'];

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);
        await prefs.setString('user_id', _userId!);
        await prefs.setString('user_email', data['email']);
        await prefs.setString('user_name', data['name'] ?? '');

        return data;
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['error'] ?? 'Login failed');
      }
    } catch (e) {
      print('Error logging in: $e');
      return null;
    }
  }

  // Restore session from saved token
  static Future<bool> restoreSession() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
    _userId = prefs.getString('user_id');
    return _token != null && _userId != null;
  }

  // Logout user
  static Future<void> logout() async {
    _token = null;
    _userId = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_id');
    await prefs.remove('user_email');
    await prefs.remove('user_name');
  }

  // Get current user info
  static Future<Map<String, dynamic>?> getUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      'userId': prefs.getString('user_id'),
      'email': prefs.getString('user_email'),
      'name': prefs.getString('user_name'),
    };
  }

  // Upload a measurement
  static Future<bool> uploadMeasurement(Measurement measurement) async {
    if (_token == null) {
      await restoreSession();
    }

    if (_token == null) {
      print('Not authenticated');
      return false;
    }

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/measurements'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_token',
        },
        body: jsonEncode({
          'date': measurement.date,
          'time': measurement.time,
          'glicemia': measurement.glicemia,
          'insulina': measurement.insulina,
          'observations': measurement.observations,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error uploading measurement: $e');
      return false;
    }
  }

  // Download all measurements
  static Future<List<Measurement>> downloadMeasurements() async {
    if (_token == null) {
      await restoreSession();
    }

    if (_token == null) {
      print('Not authenticated');
      return [];
    }

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/measurements'),
        headers: {'Authorization': 'Bearer $_token'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Measurement.fromMap(json)).toList();
      } else if (response.statusCode == 401) {
        await logout();
        throw Exception('Session expired');
      }
    } catch (e) {
      print('Error downloading measurements: $e');
    }

    return [];
  }

  // Sync measurements (upload local, download remote)
  static Future<void> syncMeasurements(
    List<Measurement> localMeasurements,
  ) async {
    // Upload all local measurements
    for (final measurement in localMeasurements) {
      await uploadMeasurement(measurement);
    }

    // Download all remote measurements
    final remoteMeasurements = await downloadMeasurements();
    // You can merge local and remote here if needed
  }

  // Check server health
  static Future<bool> isServerAvailable() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/health'))
          .timeout(const Duration(seconds: 5));

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
