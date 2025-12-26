 import 'package:mobile_app_for_housing/utils/token_storage.dart';
 import 'package:http/http.dart' as http;
 import 'dart:convert';

class ApiClient{
  static const String baseUrl = "http://192.168.100.29:8000/api/";
  static Future<Map<String, String>> _headers() async{
    final token = await TokenStorage.getAuthToken();
    return {
      "Content-Type" : "application/json",
      if(token != null) "Authorization": "Bearer $token",
    };
  }
  static Future<http.Response> get(String endpoint) async{
    final res = await http.get(
      Uri.parse("$baseUrl$endpoint"),
      headers: await _headers(),
    );
    _handle401(res);
    return res;
  }
  static Future<http.Response> post(
    String endpoint, {
      Map<String, dynamic>? body,
    }
  )async{
    final res = await http.post(
      Uri.parse("$baseUrl$endpoint"),
      headers: await _headers(),
      body: body != null ?jsonEncode(body): null,
    );
    _handle401(res);
    return res;
  }
  static void _handle401(http.Response res)async{
    if(res.statusCode == 401){
      await TokenStorage.clearAuthData();
    }
  }


}