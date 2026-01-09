import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/incident_provider.dart';
import '../widgets/custom_widgets.dart';
import '../utils/constants.dart';

class CreateIncidentScreen extends StatefulWidget {
  const CreateIncidentScreen({super.key});

  @override
  State<CreateIncidentScreen> createState() => _CreateIncidentScreenState();
}

class _CreateIncidentScreenState extends State<CreateIncidentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _serviceController = TextEditingController();

  String _selectedSeverity = 'MEDIUM';

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _serviceController.dispose();
    super.dispose();
  }

  Future<void> _submitIncident() async {
    if (!_formKey.currentState!.validate()) return;

    final incidentProvider = Provider.of<IncidentProvider>(context, listen: false);
    final success = await incidentProvider.createIncident(
      title: _titleController.text.trim(),
      description: _descriptionController.text.trim(),
      severity: _selectedSeverity,
      service: _serviceController.text.trim(),
    );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Incident created successfully')),
      );
      Navigator.of(context).pop();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(incidentProvider.error ?? 'Failed to create incident'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final incidentProvider = Provider.of<IncidentProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Incident'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CustomTextField(
                controller: _titleController,
                label: 'Title',
                hint: 'Brief description of the incident',
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a title';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              CustomTextField(
                controller: _descriptionController,
                label: 'Description',
                hint: 'Detailed description of the incident',
                maxLines: 4,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a description';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              CustomTextField(
                controller: _serviceController,
                label: 'Service',
                hint: 'Which service is affected? (e.g., API, Database, Web)',
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter the affected service';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              const Text(
                'Severity',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),

              DropdownButtonFormField<String>(
                value: _selectedSeverity,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.grey[100],
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide.none,
                  ),
                ),
                items: Constants.incidentSeverities.map((severity) {
                  return DropdownMenuItem(
                    value: severity,
                    child: Text(severity),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedSeverity = value!;
                  });
                },
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please select a severity';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 32),

              CustomButton(
                text: 'Create Incident',
                onPressed: incidentProvider.isLoading ? null : _submitIncident,
                isLoading: incidentProvider.isLoading,
              ),
            ],
          ),
        ),
      ),
    );
  }
}