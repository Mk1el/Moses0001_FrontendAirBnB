import 'package:flutter/material.dart';

class FormFieldConfig {
  final String name;
  final String label;
  final TextInputType type;

  FormFieldConfig({
    required this.name,
    required this.label,
    this.type = TextInputType.text,
  });
}

class ReusableForm extends StatefulWidget {
  final List<FormFieldConfig> fields;
  final Function(Map<String, String>) onSubmit;
  final VoidCallback onClose;

  const ReusableForm({
    super.key,
    required this.fields,
    required this.onSubmit,
    required this.onClose,
  });

  @override
  State<ReusableForm> createState() => _ReusableFormState();
}

class _ReusableFormState extends State<ReusableForm> {
  final Map<String, TextEditingController> controllers = {};

  @override
  void initState() {
    super.initState();
    for (var f in widget.fields) {
      controllers[f.name] = TextEditingController();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ...widget.fields.map(
              (f) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: TextField(
                  controller: controllers[f.name],
                  keyboardType: f.type,
                  decoration: InputDecoration(labelText: f.label),
                ),
              ),
            ),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      final data = <String, String>{};
                      controllers.forEach((k, v) => data[k] = v.text);
                      widget.onSubmit(data);
                    },
                    child: const Text("Submit"),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton(
                    onPressed: widget.onClose,
                    child: const Text("Cancel"),
                  ),
                )
              ],
            )
          ],
        ),
      ),
    );
  }
}
