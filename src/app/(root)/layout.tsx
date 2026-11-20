import type { ReactNode } from "react";
import { Footer } from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

export default RootLayout;
