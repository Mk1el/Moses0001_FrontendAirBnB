import 'package:flutter/material.dart';
import 'package:mobile_app_for_housing/common/app_theme.dart';

class PropertyCard extends StatelessWidget{
  final String name;
  final String location;
  final double price;
  final bool isBooked;
  final VoidCallback onBook;

  const PropertyCard({
    super.key,
    required this.name,
    required this.location,
    required this.price,
    required this.isBooked,
    required this.onBook,
  });
  @override
  Widget build(BuildContext context){
    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 140,
            color: Colors.grey[300],
            child: const Center(child: Icon(Icons.image, size:40)),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [Text(name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height:4),
              Text(location, style: const TextStyle(color: Colors.grey)),
              const SizedBox(height:8),
              Text("KES ${price.toStringAsFixed(0)} / night",
              style: const TextStyle(
                color: AppTheme.primaryGreen,
                fontWeight: FontWeight.w600),
              )
              ],
              ),
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.all(12),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isBooked ? null:onBook,
                child: Text(isBooked ? "Already Booked" : "Book Now"),
              )
            )
          )
        ]
      )
    );
  }
}