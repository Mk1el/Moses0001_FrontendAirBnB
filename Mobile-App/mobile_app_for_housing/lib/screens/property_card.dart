import 'package:flutter/material.dart';
import 'package:mobile_app_for_housing/common/app_theme.dart';

class PropertyCard extends StatelessWidget {
  final VoidCallback onBook;

  const PropertyCard({super.key, required this.onBook});

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 140,
            color: Colors.grey[300],
            child: const Center(child: Icon(Icons.image, size: 40)),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text("Luxury Apartment",
                    style:
                        TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                SizedBox(height: 4),
                Text("Nairobi, Kenya",
                    style: TextStyle(color: Colors.grey)),
                SizedBox(height: 8),
                Text("KES 5,000 / night",
                    style: TextStyle(
                        color: AppTheme.primaryGreen,
                        fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.all(12),
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
