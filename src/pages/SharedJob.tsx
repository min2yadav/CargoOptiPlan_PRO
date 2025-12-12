import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Route, Clock, MapPin, ArrowLeft, Eye } from 'lucide-react';

// Mock shared job data
const MOCK_SHARED_JOB = {
  id: '123',
  customer_name: 'Acme Logistics',
  status: 'in_progress',
  created_at: '2024-01-15',
  container: {
    length: 12,
    width: 2.4,
    height: 2.6,
    type: '40ft Standard',
  },
  items: [
    { name: 'Pallet A', quantity: 10, packed: true },
    { name: 'Crate B', quantity: 5, packed: true },
    { name: 'Box C', quantity: 20, packed: false },
  ],
  route: {
    stops: [
      { name: 'Warehouse Mumbai', address: 'APMC Market, Vashi, Navi Mumbai', eta: '08:00 AM' },
      { name: 'Stop 1', address: 'Industrial Area, Andheri East', eta: '10:30 AM' },
      { name: 'Stop 2', address: 'Bandra Kurla Complex', eta: '12:00 PM' },
    ],
    total_distance: '45 km',
    total_duration: '2h 30m',
  },
  packing_efficiency: 85,
};

export default function SharedJob() {
  const { jobId } = useParams<{ jobId: string }>();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<typeof MOCK_SHARED_JOB | null>(null);

  useEffect(() => {
    // Simulate loading shared job data
    setTimeout(() => {
      setJob(MOCK_SHARED_JOB);
      setLoading(false);
    }, 500);
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="glass-panel max-w-md mx-4">
          <CardContent className="py-12 text-center">
            <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
            <p className="text-muted-foreground">
              This share link may have expired or the job doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <Route className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold">CargoOpt & Planner</h1>
            <Badge variant="outline" className="ml-auto">
              <Eye className="mr-1 h-3 w-3" />
              Shared View
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Shipment Details</h2>
          <p className="text-muted-foreground">
            Reference: #{jobId} • Created: {job.created_at}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Container Info */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Container Details
              </CardTitle>
              <CardDescription>{job.container.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{job.container.length}m</p>
                  <p className="text-sm text-muted-foreground">Length</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{job.container.width}m</p>
                  <p className="text-sm text-muted-foreground">Width</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{job.container.height}m</p>
                  <p className="text-sm text-muted-foreground">Height</p>
                </div>
              </div>
              
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-3xl font-bold text-primary">{job.packing_efficiency}%</p>
                <p className="text-sm text-muted-foreground">Packing Efficiency</p>
              </div>
            </CardContent>
          </Card>

          {/* Route Info */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5 text-primary" />
                Delivery Route
              </CardTitle>
              <CardDescription>
                {job.route.total_distance} • {job.route.total_duration}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {job.route.stops.map((stop, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{stop.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        <MapPin className="inline h-3 w-3 mr-1" />
                        {stop.address}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <Badge variant="outline">
                        <Clock className="mr-1 h-3 w-3" />
                        {stop.eta}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          <Card className="glass-panel md:col-span-2">
            <CardHeader>
              <CardTitle>Items to Ship</CardTitle>
              <CardDescription>
                {job.items.filter((i) => i.packed).length} of {job.items.length} items packed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {job.items.map((item, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      item.packed
                        ? 'bg-success/10 border-success/30'
                        : 'bg-muted/50 border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant={item.packed ? 'default' : 'outline'}>
                        {item.packed ? 'Packed' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Powered by CargoOpt & Planner</p>
        </div>
      </main>
    </div>
  );
}
