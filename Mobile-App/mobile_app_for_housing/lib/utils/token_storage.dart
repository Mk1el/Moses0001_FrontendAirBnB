import 'package:shared_preferences/shared_preferences.dart';

class TokenStorage{
  static const _tokenKey = "token";
  static const _roleKey = "role";

  static Future<void> saveAuthData(String token, String role) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_roleKey, role);
  }
  static Future<String?> getAuthToken() async{
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }
  static Future<String?> getAuthRole() async{
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_roleKey);
  }
  static Future<void> clearAuthData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_roleKey);
  }
}