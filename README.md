# CargoOpt: AI-Powered 3D Container Packing & Route Optimization Tool

CargoOpt is an advanced web application designed to revolutionize supply chain management by optimizing container packing and delivery route planning. It leverages intelligent algorithms to visualize 3D packing layouts and generate efficient routes with interactive maps. As a supply chain expert , We've crafted this tool to address real-world logistics challenges, ensuring scalability, user-friendliness, and integration potential.

## Industry Problem
In the global supply chain and logistics industry, inefficiencies in container packing and route planning lead to significant waste and increased costs. Key issues include:
- **Wasted Space in Containers**: Manual packing often results in 20-30% underutilization of container volume, leading to higher shipping expenses, more trips, and environmental impact (e.g., increased fuel consumption and emissions). Factors like item fragility, weight distribution, and stacking constraints are frequently overlooked, causing damage or instability during transit.
- **Inefficient Routing**: Traditional route planning relies on spreadsheets or basic GPS, ignoring real-time factors like time windows, service times, and geocoding accuracy. This results in delayed deliveries, higher fuel costs (up to 15-25% excess), and poor driver productivity. In a market valued at over $200 billion for logistics software (growing at 10% YoY per Gartner), these problems exacerbate supply chain bottlenecks, especially for e-commerce, manufacturing, and freight companies.
- **Lack of Visibility and Collaboration**: Admins and drivers often lack integrated tools for user management, real-time tracking, and reporting, leading to errors, compliance issues, and suboptimal decision-making.

## How CargoOpt Solves It
CargoOpt addresses these challenges through AI-driven optimization:
- **Smart 3D Packing**: Uses heuristic algorithms to maximize fill rates while respecting constraints like weight limits, fragility (placing delicate items on top), and stackability. It provides interactive 3D visualizations for better planning and reduces waste by suggesting optimal layouts.
- **Route Optimization with Maps**: Employs TSP (Traveling Salesman Problem) solvers with Haversine distance calculations, time windows, and ETAs to create efficient routes. Integrated with Leaflet maps and OpenStreetMap geocoding, it minimizes distance, duration, and violations, potentially saving 15-25% in fuel and time.
- **Integrated Dashboards**: Admin tools for user management and job sharing; Driver dashboards for real-time navigation and status updates. This enhances collaboration, reduces errors, and improves overall supply chain efficiency.
- **Business Impact**: By automating these processes, CargoOpt aims for reducing costs, improving sustainability, and scaling to enterprise needs (e.g., API integrations for ERP systems).

## Website Details
CargoOpt is a responsive, single-page application (SPA) built for ease of use across desktops and mobiles. Key pages and functionalities:
- **Home/Dashboard (`/`)**: Main packing interface with sidebar for container/item inputs, 3D visualization (powered by Three.js), and summary stats (fill rate, weight, unplaced items). Users can upload Excel for bulk items, optimize packing, and download reports.
- **Route Planner (`/route-planner`)**: Interactive map (Leaflet) for adding stops via search or clicks, setting depots/time windows, optimizing routes, and viewing summaries (distance, duration, ETAs). Supports geocoding and exports.
- **Admin Dashboard (`/admin/users`)**: Manage users (add/edit/delete), assign roles (admin/driver), and search/filter lists.
- **Driver Dashboard (`/driver`)**: Tabbed view of today's routes, stop details (ETA, address, items), mark as delivered, and quick actions for navigation/calls.
- **Shared Job View (`/shared-job/:id`)**: View-only page for job status, container details, packed items, and route stops.
- **Help Page (`/help`)**: FAQ, role-specific guides, and search for topics.
- **Login/Signup (`/login`)**: Secure authentication with role-based access.
- **404 Not Found (`*`)**: Custom error page with redirect to home.
- **Additional Features**: Excel imports/exports, color-coded legends, collapsible sections for UX, and toast notifications for feedback.

The site emphasizes intuitive UX with glassmorphism panels, animations, and mobile responsiveness. No backend yet (mock data used), but expandable to Node.js/MongoDB for persistence.

## Features
- 3D packing visualization with color-coded item types (e.g., pallets in blue).
- Route mapping with polyline overlays, markers, and popups for ETAs.
- Constraint-aware optimization (fragility, weight, time windows).
- User roles and authentication.
- Export reports to Excel.
- Geocoding and reverse geocoding via OpenStreetMap.
- Mock data for demos; supports real-time edits.

## Tech Stack
- **Frontend**: React, TypeScript, Vite (for fast builds).
- **UI Components**: shadcn-ui, Tailwind CSS (custom themes for items like --item-pallet).
- **3D Rendering**: @react-three/fiber, Three.js.
- **Maps**: Leaflet.
- **Algorithms**: Custom JS (Packing Algorithm for bin-packing; Route Optimization Algorithm for TSP with Haversine).
- **Utilities**: XLSX for Excel handling, Sonner for toasts, Lucide-react for icons.
- **Other**: React Router for navigation, React Hook Form (implied for forms).

## Basic Code Logic
Here's a high-level overview of the code's logic to help you understand it:

- **Packing Logic (lib/packingAlgorithm.ts)**: 
  - Prepares items by calculating volumes and sorting (heavy/fragile first for stability).
  - Uses a space-filling heuristic: Scans container in layers (z, y, x), placing items if they fit without overlap/exceeding dimensions/weight.
  - Handles rotations (6 orientations), stacking limits, and fragility (avoids stacking on fragile items).
  - Outputs placed positions for 3D viz, unplaced items with reasons, and summary stats.

- **Route Optimization (lib/routeOptimization.ts)**:
  - Builds distance matrix using Haversine formula.
  - Solves TSP with nearest neighbor + 2-opt improvements for optimal stop order.
  - Calculates ETAs considering speeds (50km/h avg), service times, and time windows (checks violations).
  - Integrates geocoding via Nominatim API for address-to-coords.

- **App Structure**:
  - `App.tsx`: Sets up router, providers (QueryClient, Tooltip).
  - `pages/`: Core views (Index for packing, RoutePlanner for routes).
  - `components/`: Reusable (e.g., PackingSidebar for inputs, ContainerVisualization for 3D).
  - `types/`: Interfaces for packing/route data.
  - State managed via useState/useEffect; no Redux yet for simplicity.



## Setup Instructions
### Prerequisites
- Node.js >= 18
- npm

### Installation
1. Clone the repo: git clone [__]
2.  Install dependencies: npm install
3.  Run development server: npm run dev
4.  Access at `http://localhost:8080`.
5.  

### Build for Production

1. npm run build

Deploy `dist/` to Vercel.

### Deployment
- **Vercel**: Connect GitHub, set build command to `npm run build`.
- **Docker** (optional): Use provided Dockerfile for containerization.

## Contributing
Fork the repo, create a feature branch, and submit a PR. Follow ESLint rules.

## License
MIT License. Created by Min2 Yadav and Jayant Kr. Jha. 