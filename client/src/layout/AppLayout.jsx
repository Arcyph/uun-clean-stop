import Header from "./Header";

export default function AppLayout({ children }) {
  return (
    <div className="appShell">
      <Header />
      {children}
    </div>
  );
}
