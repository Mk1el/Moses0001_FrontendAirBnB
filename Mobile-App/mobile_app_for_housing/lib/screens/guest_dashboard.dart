import 'package:flutter/material.dart';

/// ---------------- ENUM ----------------
enum UserRole { ADMIN, HOST, GUEST }

/// ---------------- SIDEBAR ----------------
class AppSidebar extends StatelessWidget {
  final UserRole role;
  final Function(String route) onNavigate;

  const AppSidebar({
    super.key,
    required this.role,
    required this.onNavigate,
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

          ListTile(
            leading: const Icon(Icons.home),
            title: const Text("Dashboard"),
            onTap: () => onNavigate("/guest"),
          ),

          ListTile(
            leading: const Icon(Icons.book),
            title: const Text("My Bookings"),
            onTap: () => onNavigate("/guest/bookings"),
          ),

          const Spacer(),

          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text("Logout"),
            onTap: () {
              Navigator.popUntil(context, (route) => route.isFirst);
              Navigator.pushReplacementNamed(context, "/login");
            },
          ),
        ],
      ),
    );
  }
}

/// ---------------- PROPERTY CARD ----------------
class PropertyCard extends StatelessWidget {
  final VoidCallback onBook;

  const PropertyCard({super.key, required this.onBook});

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 120,
            color: Colors.grey[300],
            child: const Center(child: Icon(Icons.image, size: 40)),
          ),

          const Padding(
            padding: EdgeInsets.all(8),
            child: Text(
              "Luxury Apartment",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),

          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 8),
            child: Text(
              "Nairobi, Kenya",
              style: TextStyle(color: Colors.grey),
            ),
          ),

          const Padding(
            padding: EdgeInsets.all(8),
            child: Text(
              "KES 5,000 / night",
              style: TextStyle(
                color: Colors.green,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),

          const Spacer(),

          Padding(
            padding: const EdgeInsets.all(8),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onBook,
                child: const Text("Book Now"),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// ---------------- BOOKING MODAL ----------------
class BookingModal extends StatelessWidget {
  const BookingModal({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 16,
        right: 16,
        top: 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Center(
            child: Text(
              "Book Property",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ),

          const SizedBox(height: 20),

          const Text("Start Date"),
          const SizedBox(height: 6),
          TextField(
            readOnly: true,
            decoration: InputDecoration(
              hintText: "Select start date",
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),

          const SizedBox(height: 12),

          const Text("End Date"),
          const SizedBox(height: 6),
          TextField(
            readOnly: true,
            decoration: InputDecoration(
              hintText: "Select end date",
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),

          const SizedBox(height: 20),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Booking created!")),
                );
              },
              child: const Text("Confirm Booking"),
            ),
          ),

          const SizedBox(height: 12),
        ],
      ),
    );
  }
}

/// ---------------- DASHBOARD ----------------
class GuestDashboard extends StatelessWidget {
  const GuestDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: AppSidebar(
        role: UserRole.GUEST,
        onNavigate: (route) {
          Navigator.pop(context);
          Navigator.pushNamed(context, route);
        },
      ),
      appBar: AppBar(
        title: const Text("Available Properties"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: GridView.builder(
          itemCount: 10,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            childAspectRatio: 0.75,
          ),
          itemBuilder: (_, index) => PropertyCard(
            onBook: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                shape: const RoundedRectangleBorder(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                ),
                builder: (_) => const BookingModal(),
              );
            },
          ),
        ),
      ),
    );
  }
}
