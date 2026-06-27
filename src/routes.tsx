import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AdminLayout } from "./layouts/admin";
import { CustomerLayout } from "./layouts/customer";
import { AdminDashboard } from "./pages/admin";
import { AdminModelsPage } from "./pages/admin/models";
import { CreateModelPage } from "./pages/admin/models/create";
import { EditModelPage } from "./pages/admin/models/edit"; 
import { AdminGraphicsPage } from "./pages/admin/graphics/page";
import { CreateGraphicPage } from "./pages/admin/graphics/create";
import { CustomerModelsPage } from "./pages/customer/models";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="graphics" element={<AdminGraphicsPage />} />
          <Route path="graphics/create" element={<CreateGraphicPage />} />
          <Route path="models" element={<AdminModelsPage />} />
          <Route path="models/create" element={<CreateModelPage />} />
          <Route path="models/edit/:id" element={<EditModelPage />} />
        </Route>

        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<Navigate to="/customer/models" replace />} />
          <Route path="models" element={<CustomerModelsPage />} />
          <Route path="models/:id" element={<CustomerModelsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};