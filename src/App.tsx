import { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { MarketplacePage } from './components/pages/MarketplacePage';
import { AgentDetailPage } from './components/pages/AgentDetailPage';
import { WorkflowDetailPage } from './components/pages/WorkflowDetailPage';
import { WorkflowFactoryPage } from './components/pages/WorkflowFactoryPage';
import { StudioCreatePage } from './components/pages/StudioCreatePage';
import { StudioCanvasPage } from './components/pages/StudioCanvasPage';
import { SuperFactoryPage } from './components/pages/SuperFactoryPage';
import { AgentManagementPage } from './components/pages/AgentManagementPage';
import { DeveloperManagementPage } from './components/pages/DeveloperManagementPage';
import { DeveloperDocsPage } from './components/pages/DeveloperDocsPage';
import { KeyManagementPage } from './components/pages/KeyManagementPage';
import { DatabaseManagementPage } from './components/pages/DatabaseManagementPage';
import { MonitoringCenterPage } from './components/pages/MonitoringCenterPage';
import { UnderDevelopmentPage } from './components/pages/UnderDevelopmentPage';
import { GalaxyGuardianPage } from './components/pages/GalaxyGuardianPage';
import { SecurityMonitoringDashboard } from './components/pages/SecurityMonitoringDashboard';
import { AgentMonitorDashboard } from './components/pages/AgentMonitorDashboard';
import { ExecutionEffectDashboard } from './components/pages/ExecutionEffectDashboard';
import { WorkshopCreatePage } from './components/pages/factory/WorkshopCreatePage';
import { WarehousePage } from './components/pages/factory/WarehousePage';
import { MaterialsResourcesPage } from './components/pages/factory/MaterialsResourcesPage';
import { DashboardPage } from './components/pages/factory/DashboardPage';
import { AgentWarehouseDetailPage } from './components/pages/factory/AgentWarehouseDetailPage';

export type UserMode = 'developer' | 'user';

function App() {
  const [userMode, setUserMode] = useState<UserMode>('user');

  return (
    <Router>
      <Routes>
        {/* Routes without Layout */}
        <Route path="/monitoring" element={<MonitoringCenterPage />} />
        <Route path="/studio" element={<StudioCreatePage />} />
        <Route path="/studio/create" element={<StudioCreatePage />} />
        <Route path="/studio/canvas/:workflowId?" element={<StudioCanvasPage />} />
        <Route path="/security-monitoring" element={<SecurityMonitoringDashboard />} />
        <Route path="/dashboard/agent-monitor" element={<AgentMonitorDashboard />} />
        <Route path="/dashboard/execution-effect" element={<ExecutionEffectDashboard />} />
        
        {/* Routes with Layout */}
        <Route path="*" element={
          <Layout userMode={userMode} setUserMode={setUserMode}>
            <Routes>
              <Route path="/galaxy" element={<GalaxyGuardianPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/marketplace/:agentId" element={<AgentDetailPage userMode={userMode} />} />
              <Route path="/workflow/:workflowId" element={<WorkflowDetailPage />} />
              <Route path="/workflow-factory" element={<WorkflowFactoryPage />} />
              <Route path="/factory" element={<Navigate to="/factory/warehouse" replace />} />
              <Route path="/factory/workshop/create" element={<WorkshopCreatePage />} />
              <Route path="/factory/workshop/editor/new" element={<WorkshopCreatePage />} />
              <Route path="/factory/workshop/editor/:agentId" element={<WorkshopCreatePage />} />
              <Route path="/factory/warehouse" element={<WarehousePage />} />
              <Route path="/factory/warehouse/:agentId" element={<AgentWarehouseDetailPage />} />
              <Route path="/factory/upgrade" element={<Navigate to="/factory/warehouse" replace />} />
              <Route path="/factory/workshop/wip" element={<Navigate to="/factory/warehouse" replace />} />
              <Route path="/factory/workshop" element={<Navigate to="/factory/workshop/create" replace />} />
              <Route path="/factory/quality" element={<Navigate to="/factory/warehouse" replace />} />
              <Route path="/factory/materials" element={<Navigate to="/factory/materials/resources" replace />} />
              <Route path="/factory/materials/resources" element={<MaterialsResourcesPage />} />
              <Route path="/factory/dashboard" element={<DashboardPage />} />
              <Route path="/super-factory" element={<SuperFactoryPage />} />
              <Route path="/monitor" element={<UnderDevelopmentPage />} />
              <Route path="/management/agents" element={<DeveloperManagementPage />} />
              <Route path="/management/keys" element={<KeyManagementPage />} />
              <Route path="/management/database" element={<DatabaseManagementPage />} />
              <Route path="/docs" element={<DeveloperDocsPage />} />
              <Route path="/" element={<Navigate to="/galaxy" replace />} />
              <Route path="*" element={<Navigate to="/galaxy" replace />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;