import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, MapPin, Clock, CheckCircle2, Navigation, Camera, Phone, 
  ArrowLeft, Route, List, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DeliveryStop {
  id: string;
  stopNumber: number;
  name: string;
  address: string;
  eta: string;
  scheduledTime?: string;
  status: 'pending' | 'in_progress' | 'delivered';
  phone?: string;
  notes?: string;
  items?: string[];
}

// Mock today's route with stops
const MOCK_ROUTE = {
  id: 'ROUTE-2024-001',
  date: new Date().toLocaleDateString(),
  vehicleNumber: 'MH-12-AB-1234',
  totalDistance: '142 km',
  estimatedDuration: '6h 30m',
  depot: {
    name: 'Central Warehouse',
    address: 'Plot 45, Industrial Area, Mumbai 400001',
    departureTime: '08:00 AM',
  },
};

const MOCK_STOPS: DeliveryStop[] = [
  {
    id: '1',
    stopNumber: 1,
    name: 'APMC Market Delivery',
    address: 'Gala No. 45, APMC Market, Vashi, Navi Mumbai 400703',
    eta: '09:30 AM',
    scheduledTime: '09:00 AM - 10:00 AM',
    status: 'delivered',
    phone: '+91 98765 43210',
    items: ['Pallet x 2', 'Crates x 4'],
  },
  {
    id: '2',
    stopNumber: 2,
    name: 'Industrial Area Drop',
    address: 'Plot 23, Industrial Area, Andheri East, Mumbai',
    eta: '11:00 AM',
    scheduledTime: '10:30 AM - 11:30 AM',
    status: 'in_progress',
    phone: '+91 99887 76655',
    notes: 'Gate 2 entry, ask for Mr. Sharma',
    items: ['Boxes x 10', 'Drums x 2'],
  },
  {
    id: '3',
    stopNumber: 3,
    name: 'Retail Store - Phoenix Mall',
    address: 'Lower Parel, Mumbai 400013',
    eta: '01:30 PM',
    scheduledTime: '01:00 PM - 02:00 PM',
    status: 'pending',
    phone: '+91 98123 45678',
    items: ['Bags x 20', 'Trays x 8'],
  },
  {
    id: '4',
    stopNumber: 4,
    name: 'Azadpur Distribution Center',
    address: 'Shop 156, Azadpur Mandi, Delhi 110033',
    eta: '03:30 PM',
    scheduledTime: '03:00 PM - 04:00 PM',
    status: 'pending',
    phone: '+91 99887 76655',
    items: ['Pallets x 3'],
  },
];

export default function DriverDashboard() {
  const [stops, setStops] = useState<DeliveryStop[]>(MOCK_STOPS);
  const [activeTab, setActiveTab] = useState('route');

  const completedCount = stops.filter((d) => d.status === 'delivered').length;
  const totalCount = stops.length;
  const currentStop = stops.find((s) => s.status === 'in_progress');
  const nextStop = stops.find((s) => s.status === 'pending');

  const handleMarkDelivered = (id: string) => {
    setStops(prev => {
      const updated = prev.map((d) =>
        d.id === id ? { ...d, status: 'delivered' as const } : d
      );
      
      const nextPendingIdx = updated.findIndex((d) => d.status === 'pending');
      if (nextPendingIdx !== -1) {
        updated[nextPendingIdx] = { ...updated[nextPendingIdx], status: 'in_progress' as const };
      }
      
      return updated;
    });
    
    toast.success('Delivery completed!');
  };

  const handleUploadPOD = (id: string) => {
    toast.info('POD capture - Camera would open here');
  };

  const getStatusBadge = (status: DeliveryStop['status']) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Current</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="p-2 rounded-xl bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Driver Dashboard</h1>
                <p className="text-xs text-muted-foreground">{MOCK_ROUTE.vehicleNumber} • {MOCK_ROUTE.date}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://hackathon-gemba.streamlit.app/Vehicle_Routing', '_blank')}
            >
              <Calendar className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Operation Planner</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 max-w-2xl">
        {/* Route Summary Card */}
        <Card className="glass-panel mb-4">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Route Progress</p>
                <p className="text-xl font-bold">{completedCount}/{totalCount} Stops</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Est. Total</p>
                <p className="text-sm font-medium">{MOCK_ROUTE.totalDistance} • {MOCK_ROUTE.estimatedDuration}</p>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Route vs Stops */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="route" className="flex items-center gap-2">
              <Route className="w-4 h-4" />
              Route Overview
            </TabsTrigger>
            <TabsTrigger value="stops" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Stops ({totalCount})
            </TabsTrigger>
          </TabsList>

          {/* Route Overview Tab */}
          <TabsContent value="route" className="space-y-4 mt-4">
            {/* Depot Start */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <Truck className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div className="w-0.5 h-8 bg-border" />
              </div>
              <div className="flex-1 pb-2">
                <p className="font-medium text-sm">{MOCK_ROUTE.depot.name}</p>
                <p className="text-xs text-muted-foreground">{MOCK_ROUTE.depot.address}</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  Departed {MOCK_ROUTE.depot.departureTime}
                </Badge>
              </div>
            </div>

            {/* Route Stops Timeline */}
            {stops.map((stop, index) => (
              <div key={stop.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    stop.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                    stop.status === 'in_progress' ? 'bg-primary text-primary-foreground' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {stop.status === 'delivered' ? <CheckCircle2 className="h-4 w-4" /> : stop.stopNumber}
                  </div>
                  {index < stops.length - 1 && <div className="w-0.5 h-16 bg-border" />}
                </div>
                <div className={`flex-1 pb-4 ${stop.status === 'in_progress' ? 'bg-primary/5 -mx-2 px-2 py-2 rounded-lg' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{stop.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{stop.address}</p>
                    </div>
                    {getStatusBadge(stop.status)}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ETA: {stop.eta}
                    </span>
                    {stop.items && (
                      <span>{stop.items.length} item types</span>
                    )}
                  </div>
                  {stop.status === 'in_progress' && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => window.open(`tel:${stop.phone}`)}>
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.address)}`)}
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Navigate
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Return to Depot */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div>
                <p className="font-medium text-sm text-muted-foreground">Return to Depot</p>
                <p className="text-xs text-muted-foreground">{MOCK_ROUTE.depot.name}</p>
              </div>
            </div>
          </TabsContent>

          {/* Stops List Tab */}
          <TabsContent value="stops" className="space-y-3 mt-4">
            {stops.map((stop) => (
              <Card 
                key={stop.id} 
                className={`glass-panel ${stop.status === 'in_progress' ? 'ring-2 ring-primary' : ''}`}
              >
                <CardHeader className="py-3 px-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                        stop.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                        stop.status === 'in_progress' ? 'bg-primary text-primary-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {stop.status === 'delivered' ? <CheckCircle2 className="h-5 w-5" /> : stop.stopNumber}
                      </div>
                      <div>
                        <CardTitle className="text-sm">{stop.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(stop.status)}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {stop.scheduledTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4">
                  <p className="text-xs text-muted-foreground flex items-start gap-2 mb-2">
                    <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    {stop.address}
                  </p>

                  {stop.items && (
                    <div className="text-xs text-muted-foreground mb-2">
                      <span className="font-medium">Items:</span> {stop.items.join(', ')}
                    </div>
                  )}

                  {stop.notes && (
                    <p className="text-xs bg-amber-500/10 text-amber-600 p-2 rounded mb-3">
                      📝 {stop.notes}
                    </p>
                  )}

                  {stop.status !== 'delivered' && (
                    <div className="flex gap-2">
                      {stop.phone && (
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(`tel:${stop.phone}`)}>
                          <Phone className="mr-1 h-3 w-3" />
                          Call
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.address)}`)}
                      >
                        <Navigation className="mr-1 h-3 w-3" />
                        Navigate
                      </Button>
                    </div>
                  )}

                  {stop.status === 'in_progress' && (
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleUploadPOD(stop.id)}>
                        <Camera className="mr-1 h-3 w-3" />
                        POD
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => handleMarkDelivered(stop.id)}>
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Complete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Quick Action for Current Stop */}
      {currentStop && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-area-pb">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Current Stop</p>
              <p className="font-medium text-sm truncate">{currentStop.name}</p>
            </div>
            <Button size="sm" onClick={() => handleMarkDelivered(currentStop.id)}>
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Complete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}