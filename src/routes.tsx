import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AdminLayout } from "./layouts/admin";
import { CustomerLayout } from "./layouts/customer";
import { LoginPage } from "./pages/auth/login";
import { RegisterPage } from "./pages/auth/register";
import { ForgotPasswordPage } from "./pages/auth/forgot-password";
import { ResetPasswordPage } from "./pages/auth/reset-password";
import { ProtectedRoute } from "./components/protected-route";
import { AdminDashboard } from "./pages/admin";
import { AdminModelsPage } from "./pages/admin/models";
import { CreateModelPage } from "./pages/admin/models/create";
import { EditModelPage } from "./pages/admin/models/edit";
import { AdminGraphicsPage } from "./pages/admin/graphics/page";
import { CreateGraphicPage } from "./pages/admin/graphics/create";
import { EditGraphicPage } from "./pages/admin/graphics/edit";
import { CustomerModelsPage } from "./pages/customer/models";
import { CustomerCustomizePage } from "./pages/customer/models/customize";
import { CustomerCartPage } from "./pages/customer/cart";
import { CustomerOrdersPage } from "./pages/customer/orders";
import { PublicHomePage } from "./pages/public/home";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicHomePage />} />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="graphics" element={<AdminGraphicsPage />} />
            <Route path="graphics/create" element={<CreateGraphicPage />} />
            <Route path="graphics/edit/:id" element={<EditGraphicPage />} />
            <Route path="models" element={<AdminModelsPage />} />
            <Route path="models/create" element={<CreateModelPage />} />
            <Route path="models/edit/:id" element={<EditModelPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<Navigate to="/customer/models" replace />} />
            <Route path="models" element={<CustomerModelsPage />} />
            <Route path="models/:id" element={<CustomerCustomizePage />} />
            <Route path="cart" element={<CustomerCartPage />} />
            <Route path="orders" element={<CustomerOrdersPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};