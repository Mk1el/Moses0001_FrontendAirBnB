import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
 class AuthService{
  final String baseUrl = "http://http://localhost:8000/api/auth/login";
  Future<Map<String, dynamic>> login(String email, String password) async{
    final response = await http.post(
      Uri.parse(baseUrl),
      headers:{"Content-Type": "application/json"},
      body:jsonEncode({
        "email": email,
        "password": password,
      }),
    );
    if(response.statusCode == 200){
      final data = jsonDecode(response.body);
      SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.setString("token", data["token"]);
      await prefs.setString("role", data["role"]);

      return {"success":true, "role": data["role"]};
    }else{
      return {"success": false, "message":"Invalid credentials"};
    }
  }
  Future<bool> isLoggedIn() async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString("token")!= null;
  }
  Future <String?>getRole() async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString("role");
  }
  Future<void> logout() async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
 }