import { BrowserRouter, Routes, Route, Navigate } from "react-router";

// Layouts
import { AdminLayout } from "./layouts/admin";
import { CustomerLayout } from "./layouts/customer";

// Admin Pages
import { AdminDashboard } from "./pages/admin";
import { AdminModelsPage } from "./pages/admin/models";
import { CreateModelPage } from "./pages/admin/models/create";
import { EditModelPage } from "./pages/admin/models/edit"; 
import { AdminGraphicsPage } from "./pages/admin/graphics/page";
import { CreateGraphicPage } from "./pages/admin/graphics/create";

// Customer Pages
import { CustomerModelsPage } from "./pages/customer/models";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota principal redireciona para o admin por defeito */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        {/* Rotas de Administração */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          
          {/* Gestão de Estampas */}
          <Route path="graphics" element={<AdminGraphicsPage />} />
          <Route path="graphics/create" element={<CreateGraphicPage />} />
          
          {/* Gestão de Produtos (Modelos) */}
          <Route path="models" element={<AdminModelsPage />} />
          <Route path="models/create" element={<CreateModelPage />} />
          <Route path="models/edit/:id" element={<EditModelPage />} /> {/* <-- A nossa nova rota de edição */}
        </Route>

        {/* Rotas da Vitrine do Cliente */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<Navigate to="/customer/models" replace />} />
          <Route path="models" element={<CustomerModelsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};