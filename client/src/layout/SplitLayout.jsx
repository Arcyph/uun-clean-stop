import { Outlet } from "react-router-dom";
import AppLayout from "./AppLayout";
import MapPanel from "../map/MapPanel";
import QrScanButton from "../components/QrScanButton";
import DialogHost from "../dialogs/DialogHost";
import Footer from "./Footer";

export default function SplitLayout() {
  return (
    <AppLayout>
      <main className="splitMain">
        <section className="panel panelLeft">
          <div className="leftTitleRow">
            <h1 className="leftTitle">CleanStop</h1>
          </div>

          <div className="panelContent">
            <Outlet />
          </div>

          <Footer />
        </section>

        <section className="panel panelRight">
          <div className="mapPanel">
            <MapPanel />
            <div className="floatingBtn">
              <QrScanButton />
            </div>
          </div>
        </section>
      </main>

      <DialogHost />
    </AppLayout>
  );
}
