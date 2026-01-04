import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

import AppRefreshProvider from "./providers/AppRefreshProvider";
import StopListProvider from "./providers/StopListProvider";
import ReportListProvider from "./providers/ReportListProvider";
import DialogProvider from "./dialogs/DialogProvider";

export default function App() {
  return (
    <AppRefreshProvider>
      <StopListProvider>
        <ReportListProvider>
          <DialogProvider>
            <RouterProvider router={router} />
          </DialogProvider>
        </ReportListProvider>
      </StopListProvider>
    </AppRefreshProvider>
  );
}
