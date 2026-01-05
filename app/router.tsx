
import React, { Suspense, lazy } from "react";
import { createHashRouter, Navigate, Outlet } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";

// Lazy load all page components
const CanaisPage = lazy(() => import("../pages/Series"));
const RoteirosPage = lazy(() => import("../pages/Roteiros"));
const MensagensPage = lazy(() => import("../pages/Mensagens"));
const VideoLabPage = lazy(() => import("../pages/Studio"));
const CastingPage = lazy(() => import("../pages/Casting"));
const VisuaisPage = lazy(() => import("../pages/VisualDev"));
const DialogueLab = lazy(() => import("../pages/DialogueLab"));
const ExportPage = lazy(() => import("../pages/Export"));
const SettingsPage = lazy(() => import("../pages/Settings"));
const AnalyticsPage = lazy(() => import("../pages/Analytics"));
const ProjetosPage = lazy(() => import("../pages/Projetos"));
const BillingPage = lazy(() => import("../pages/Billing"));
const GrowthPage = lazy(() => import("../pages/Growth"));
const MarketingStudioPage = lazy(() => import("../pages/MarketingStudio"));

const SuspenseLayout = () => (
  <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><LoadingSpinner /></div>}>
    <Outlet />
  </Suspense>
);

const Layout = () => (
  <MainLayout>
    <SuspenseLayout />
  </MainLayout>
);

export const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/canais" replace /> },
      { path: "canais", element: <CanaisPage /> },
      { path: "projetos", element: <ProjetosPage /> },
      { path: "roteiro/:storyId", element: <RoteirosPage /> },
      { path: "elenco", element: <CastingPage /> },
      { path: "visuais", element: <VisuaisPage /> },
      { path: "dialogos", element: <DialogueLab /> },
      { path: "video", element: <VideoLabPage /> },
      { path: "marketing", element: <MarketingStudioPage /> },
      { path: "analise", element: <AnalyticsPage /> },
      { path: "relatorio-growth", element: <GrowthPage /> },
      { path: "exportacao", element: <ExportPage /> },
      { path: "assistente", element: <MensagensPage /> }, 
      { path: "faturamento", element: <BillingPage /> },
      { path: "configuracoes", element: <SettingsPage /> },
    ],
  },
]);
