import 'package:flutter/material.dart';

class HostHome extends StatelessWidget {
  const HostHome({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Host Dashboard"),
        backgroundColor: Colors.green,
      ),
      body: GridView.count(
        padding: const EdgeInsets.all(20),
        crossAxisCount: 2,
        crossAxisSpacing: 15,
        mainAxisSpacing: 15,
        children: const [
          DashboardCard(title: "My Properties", icon: Icons.home),
          DashboardCard(title: "Add Property", icon: Icons.add_home),
          DashboardCard(title: "Bookings", icon: Icons.event_available),
          DashboardCard(title: "Reviews", icon: Icons.reviews),
          DashboardCard(title: "Earnings", icon: Icons.payments),
          DashboardCard(title: "Logout", icon: Icons.logout),
        ],
      ),
    );
  }
}

class DashboardCard extends StatelessWidget {
  final String title;
  final IconData icon;

  const DashboardCard({super.key, required this.title, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shadowColor: Colors.black26,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: () {},
        borderRadius: BorderRadius.circular(16),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 45, color: Colors.green),
              const SizedBox(height: 10),
              Text(
                title,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              )
            ],
          ),
        ),
      ),
    );
  }
}
