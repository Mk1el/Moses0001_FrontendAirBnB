import 'package:flutter/material.dart';
import 'package:mobile_app_for_housing/screens/guest_dashboard.dart';
import 'package:mobile_app_for_housing/screens/login_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      initialRoute: "/login",
      routes: {
        "/login": (_) => const LoginPage(),
        "/guest": (_) => GuestDashboard(), // ✅ FIXED
        "/guest/bookings": (_) => Scaffold(
              appBar: AppBar(title: Text("My Bookings")),
              body: Center(child: Text("Bookings page")),
            ),
      },
    );
  }
}
