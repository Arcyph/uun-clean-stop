import { createBrowserRouter, Navigate } from "react-router-dom";
import SplitLayout from "../layout/SplitLayout";
import StopListPage from "./stops/StopListPage";
import StopDetailPage from "./stops/StopDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SplitLayout />,
    children: [
      { index: true, element: <Navigate to="/stops" replace /> },
      { path: "stops", element: <StopListPage /> },
      { path: "stops/:stopId", element: <StopDetailPage /> },
    ],
  },
]);
