import 'package:flutter/material.dart';

class ReusableTable<T> extends StatelessWidget {
  final List<T> data;
  final Widget Function(T row) rowBuilder;

  const ReusableTable({
    super.key,
    required this.data,
    required this.rowBuilder,
  });

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return const Center(child: Text("No data found"));
    }

    return ListView.builder(
      itemCount: data.length,
      itemBuilder: (_, i) => Card(
        margin: const EdgeInsets.all(8),
        child: rowBuilder(data[i]),
      ),
    );
  }
}
