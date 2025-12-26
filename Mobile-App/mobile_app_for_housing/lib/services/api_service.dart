import 'dart:convert';
import 'api_client.dart';

class ApiService {
  static Future<List<dynamic>> fetchProperties() async {
    final res = await ApiClient.get("/properties/guest/all-properties");
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    throw Exception("Failed to load properties");
  }

  static Future<List<dynamic>> availableProperties(
      String start, String end) async {
    final res = await ApiClient.get(
      "/properties/available?startDate=$start&endDate=$end",
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    throw Exception("Failed to check availability");
  }

  static Future<Map<String, dynamic>> calculatePrice({
    required String propertyId,
    required String start,
    required String end,
  }) async {
    final res = await ApiClient.get(
      "/bookings/calculate?propertyId=$propertyId&start=$start&end=$end",
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    throw Exception("Failed to calculate price");
  }

  static Future<Map<String, dynamic>> createBooking({
    required String propertyId,
    required String startDate,
    required String endDate,
  }) async {
    final res = await ApiClient.post(
      "/bookings/create",
      body: {
        "propertyId": propertyId,
        "startDate": startDate,
        "endDate": endDate,
      },
    );

    if (res.statusCode == 200 || res.statusCode == 201) {
      return jsonDecode(res.body);
    }
    throw Exception("Booking failed");
  }

  static Future<List<dynamic>> fetchBookings(String role) async {
    String endpoint = "/bookings/me";
    if (role == "HOST") endpoint = "/bookings/host/my";
    if (role == "ADMIN") endpoint = "/bookings/all";

    final res = await ApiClient.get(endpoint);
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    throw Exception("Failed to load bookings");
  }

  static Future<void> cancelBooking(String bookingId) async {
    final res = await ApiClient.post("/api/bookings/$bookingId/cancel");
    if (res.statusCode != 200) {
      throw Exception("Cancel failed");
    }
  }
}
