import Image from "next/image";
import Navbar from "./_components/navbar/navbar";
import Footer from "./_components/footer/footer";
import AboutUs from "./_components/home/aboutus";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de]">     
      <Navbar />  
      <AboutUs />
      <div className="h-full"></div>
    <Footer />
    </div>
  );
}
