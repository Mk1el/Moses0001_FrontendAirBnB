import 'package:flutter/material.dart';

class GuestHome extends StatelessWidget {
  const GuestHome({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Guest Dashboard"),
        backgroundColor: Colors.orange,
      ),
      body: GridView.count(
        padding: const EdgeInsets.all(20),
        crossAxisCount: 2,
        crossAxisSpacing: 15,
        mainAxisSpacing: 15,
        children: const [
          DashboardCard(title: "Explore Homes", icon: Icons.travel_explore),
          DashboardCard(title: "My Bookings", icon: Icons.book),
          DashboardCard(title: "Favorites", icon: Icons.favorite),
          DashboardCard(title: "Support", icon: Icons.support_agent),
          DashboardCard(title: "Profile", icon: Icons.person),
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
              Icon(icon, size: 45, color: Colors.orange),
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
