import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Search, HelpCircle, Package, Route, Users, Truck, Warehouse, ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppRole, ROLE_LABELS, ROLE_COLORS } from '@/types/auth';

interface HelpSection {
  id: string;
  title: string;
  content: string;
  roles: AppRole[];
}

const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: `Welcome to CargoOpt & Planner! This platform helps you optimize container packing and delivery routes.

**Quick Start:**
1. Navigate to the main dashboard
2. Add your container dimensions
3. Add items to pack
4. Run the 3D packing optimization
5. View the results and download reports

**Navigation:**
- Use the top navigation bar to switch between Packing and Route Planning
- Your role determines what features you can access`,
    roles: ['admin', 'sales', 'operations', 'warehouse', 'driver'],
  },
  {
    id: 'packing-optimization',
    title: 'Container Packing',
    content: `**Adding Items:**
1. Go to the main page
2. Enter container dimensions (length, width, height)
3. Add items with their dimensions and quantities
4. Set item types for visual distinction

**Running Optimization:**
1. Click "Optimize Packing"
2. View the 3D visualization
3. Check the packing summary for efficiency metrics
4. Download the packing report

**Tips:**
- Heavier items should be loaded first
- Use the color legend to identify item types
- Export to Excel for detailed reports`,
    roles: ['admin', 'sales', 'operations', 'warehouse'],
  },
  {
    id: 'route-planning',
    title: 'Route Optimization',
    content: `**Adding Stops:**
1. Go to Route Planner page
2. Search for addresses or click on the map
3. Set one stop as the depot (starting point)
4. Add service time if needed at each stop

**Optimizing Routes:**
1. Add all your delivery stops
2. Select the depot location
3. Click "Optimize Route"
4. View the optimized order and ETAs

**Features:**
- Real-time route visualization on map
- Turn-by-turn directions
- Time window support
- Export route to Excel`,
    roles: ['admin', 'sales', 'operations', 'driver'],
  },
  {
    id: 'warehouse-loading',
    title: 'Warehouse Loading Guide',
    content: `**Viewing Loading Instructions:**
1. Open the assigned job
2. View the 3D packing visualization
3. Follow the loading sequence (numbered items)
4. Mark items as loaded using the checkboxes

**Loading Best Practices:**
- Load items in the sequence shown
- Heavy items go at the bottom
- Fragile items should be secured
- Use the color codes to identify item types

**Marking Progress:**
- Check off each item as it's loaded
- The system tracks loading completion
- Notify operations when loading is complete`,
    roles: ['admin', 'warehouse'],
  },
  {
    id: 'driver-guide',
    title: 'Driver Delivery Guide',
    content: `**Today's Deliveries:**
1. Open the Driver Dashboard
2. View your assigned stops for today
3. Follow the optimized route order

**At Each Stop:**
1. Navigate to the delivery location
2. Complete the delivery
3. Mark as "Delivered"
4. Upload proof of delivery photo

**Navigation:**
- Use the in-app map for directions
- Each stop shows ETA and address
- Contact support if issues arise`,
    roles: ['admin', 'driver'],
  },
  {
    id: 'admin-guide',
    title: 'Admin & User Management',
    content: `**Managing Users:**
1. Go to Admin > Users
2. Invite new users via email
3. Assign appropriate roles
4. Edit or remove users as needed


**Company Settings:**
- Manage pricing and cost margins
- Export all data
- Configure system preferences`,
    roles: ['admin'],
  },
 
];

export default function Help() {
  const { role } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter sections based on user role and search term
  const filteredSections = HELP_SECTIONS.filter((section) => {
    const matchesRole = role ? section.roles.includes(role) : true;
    const matchesSearch =
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleIcon = (r: AppRole) => {
    switch (r) {
      case 'admin':
        return <Users className="h-4 w-4" />;
      case 'sales':
        return <Package className="h-4 w-4" />;
      case 'operations':
        return <Route className="h-4 w-4" />;
      case 'warehouse':
        return <Warehouse className="h-4 w-4" />;
      case 'driver':
        return <Truck className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Help Center</h1>
          </div>
          {role && (
            <Badge className={ROLE_COLORS[role]}>
              {getRoleIcon(role)}
              <span className="ml-1">{ROLE_LABELS[role]}</span>
            </Badge>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="glass-panel mb-8">
          <CardHeader>
            <CardTitle>How can we help?</CardTitle>
            <CardDescription>
              Search for help topics or browse the guides below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search help topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Accordion type="single" collapsible className="space-y-4">
            {filteredSections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="glass-panel border rounded-xl px-6 data-[state=open]:ring-2 data-[state=open]:ring-primary/20"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <HelpCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-semibold">{section.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <div className="prose prose-sm max-w-none text-muted-foreground pl-11">
                    {section.content.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <h4 key={i} className="font-semibold text-foreground mt-4 mb-2">
                            {line.replace(/\*\*/g, '')}
                          </h4>
                        );
                      }
                      if (line.match(/^\d+\./)) {
                        return (
                          <p key={i} className="ml-4">
                            {line}
                          </p>
                        );
                      }
                      if (line.startsWith('- **')) {
                        const [role, desc] = line.replace('- **', '').split('**: ');
                        return (
                          <p key={i} className="ml-4">
                            <strong>{role}:</strong> {desc}
                          </p>
                        );
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <p key={i} className="ml-4">
                            • {line.replace('- ', '')}
                          </p>
                        );
                      }
                      return line ? <p key={i}>{line}</p> : <br key={i} />;
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filteredSections.length === 0 && (
            <Card className="glass-panel">
              <CardContent className="py-12 text-center">
                <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No help topics found matching your search.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="glass-panel mt-8">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">Still need help?</h3>
                <p className="text-sm text-muted-foreground">
                  Contact our support team for assistance
                </p>
              </div>
              <Button className="btn-primary">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
