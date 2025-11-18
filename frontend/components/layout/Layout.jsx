import Navbar from "./Navbar";
import { useTheme } from "../../context/ThemeContext";

const Layout = ({ children }) => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-neutral-950' : 'bg-neutral-50'
    }`}>
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
