import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/incident_provider.dart';
import '../widgets/incident_card.dart';
import '../widgets/custom_button.dart';
import '../screens/create_incident_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // Load incidents when screen opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final incidentProvider = Provider.of<IncidentProvider>(context, listen: false);
      incidentProvider.loadIncidents();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final incidentProvider = Provider.of<IncidentProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Incidents'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await authProvider.logout();
              if (mounted) {
                Navigator.of(context).pushReplacementNamed('/login');
              }
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await incidentProvider.loadIncidents();
        },
        child: incidentProvider.isLoading
            ? const Center(child: CircularProgressIndicator())
            : incidentProvider.incidents.isEmpty
                ? _buildEmptyState()
                : _buildIncidentList(incidentProvider),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => const CreateIncidentScreen(),
            ),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_none,
            size: 80,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'No incidents yet',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Create your first incident to get started',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
          const SizedBox(height: 24),
          CustomButton(
            text: 'Create Incident',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => const CreateIncidentScreen(),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildIncidentList(IncidentProvider incidentProvider) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: incidentProvider.incidents.length,
      itemBuilder: (context, index) {
        final incident = incidentProvider.incidents[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: IncidentCard(
            incident: incident,
            onTap: () {
              // Navigate to incident detail screen
              _showIncidentDetails(context, incident);
            },
          ),
        );
      },
    );
  }

  void _showIncidentDetails(BuildContext context, dynamic incident) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.6,
        maxChildSize: 0.9,
        builder: (context, scrollController) => Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                incident.title,
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 16),
              Text(
                'Status: ${incident.status}',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              Text(
                'Severity: ${incident.severity}',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              Text(
                incident.description,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const Spacer(),
              Row(
                children: [
                  Expanded(
                    child: CustomButton(
                      text: 'Acknowledge',
                      onPressed: () {
                        // Acknowledge incident
                        Navigator.of(context).pop();
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: CustomButton(
                      text: 'Resolve',
                      backgroundColor: Colors.green,
                      onPressed: () {
                        // Resolve incident
                        Navigator.of(context).pop();
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}