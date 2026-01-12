import Image from "next/image";
import Footer from "./_components/footer/footer";
import AboutUs from "./_components/home/aboutus";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de]">    
      <AboutUs />
    </div>
  );
}
