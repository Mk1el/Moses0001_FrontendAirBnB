import 'package:flutter/material.dart';

enum UserRole { ADMIN, HOST, GUEST }

class AppSidebar extends StatelessWidget {
  final UserRole role;

  const AppSidebar({
    super.key,
    required this.role,
  });

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Column(
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(color: Colors.blue),
            child: Center(
              child: Text(
                role.name,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),

          /// DASHBOARD
          ListTile(
            leading: const Icon(Icons.home),
            title: const Text("Dashboard"),
            onTap: () {
              Navigator.of(context, rootNavigator: true)
                  .pushReplacementNamed("/guest");
            },
          ),

          /// BOOKINGS
          ListTile(
            leading: const Icon(Icons.book),
            title: const Text("My Bookings"),
            onTap: () {
              Navigator.of(context, rootNavigator: true)
                  .pushReplacementNamed("/guest/bookings");
            },
          ),

          const Spacer(),

          /// LOGOUT
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text("Logout"),
            onTap: () {
              Navigator.of(context, rootNavigator: true)
                  .pushNamedAndRemoveUntil("/login", (route) => false);
            },
          ),
        ],
      ),
    );
  }
}
