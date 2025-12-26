import 'package:flutter/material.dart';

class AppTheme {
  static const primaryGreen = Color(0xFF16A34A); // green-600
  static const bgLight = Color(0xFFF9FAFB); // gray-50

  static ThemeData lightTheme = ThemeData(
    scaffoldBackgroundColor: bgLight,
    primaryColor: primaryGreen,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryGreen,
      primary: primaryGreen,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: Colors.black,
      elevation: 1,
    ),
    cardTheme: const CardThemeData(
      elevation: 4,
      margin: EdgeInsets.all(8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(16)),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryGreen,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),
  );
}
