import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../reusable/reusable_table.dart';

class BookingsPage extends StatefulWidget {
  const BookingsPage({super.key});

  @override
  State<BookingsPage> createState() => _BookingsPageState();
}

class _BookingsPageState extends State<BookingsPage> {
  List bookings = [];
  bool loading = true;
  final role = "GUEST"; // get from storage

  @override
  void initState() {
    super.initState();
    loadBookings();
  }

  Future<void> loadBookings() async {
    try {
      final res = await ApiService.fetchBookings(role);
      setState(() {
        bookings = res;
        loading = false;
      });
    } catch (_) {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());

    return Scaffold(
      appBar: AppBar(title: const Text("Booking Management")),
      body: ReusableTable(
        data: bookings,
        rowBuilder: (b) {
          return ListTile(
            title: Text(b['propertyName']),
            subtitle: Text("${b['startDate']} → ${b['endDate']}"),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (role == "GUEST" && b['status'] == "PENDING")
                  IconButton(
                    icon: const Icon(Icons.payment, color: Colors.green),
                    onPressed: () {},
                  ),
                if (role == "GUEST" && b['status'] != "CANCELED")
                  IconButton(
                    icon: const Icon(Icons.cancel, color: Colors.red),
                    onPressed: () async {
                      await ApiService.cancelBooking(b['bookingId']);
                      loadBookings();
                    },
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
