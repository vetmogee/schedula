import Link from "next/link";
import { Calendar, Users, Scissors, Clock, CheckCircle, Sparkles } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-24">
      {/* Hero Section */}
      <div className="text-center mb-10 sm:mb-12 md:mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/80 backdrop-blur mb-4 sm:mb-6">
          <Calendar className="w-12 h-12 sm:w-14 sm:h-14 text-[#ff4a7a] sm:text-[#ff6b9d]" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
          Welcome to Schedula
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 max-w-2xl mx-auto leading-relaxed px-2">
          Your all-in-one platform for salon bookings and appointment management
        </p>
      </div>

      {/* What is Schedula */}
      <section className="mb-10 sm:mb-12 md:mb-16">
        <div className="rounded-2xl bg-white/80 backdrop-blur shadow-lg p-5 sm:p-6 md:p-8 lg:p-12 border border-white/60">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            What is Schedula?
          </h2>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-3 sm:mb-4">
            Schedula is a modern, user-friendly platform that connects customers with salons 
            and makes appointment booking effortless. Whether you&apos;re looking to book your next 
            haircut or manage your salon&apos;s schedule, Schedula provides all the tools you need 
            in one beautiful, intuitive interface.
          </p>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
            We believe that scheduling appointments should be simple, fast, and stress-free. 
            That&apos;s why we&apos;ve built Schedula with both customers and businesses in mind, ensuring 
            a seamless experience for everyone.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 text-center leading-tight">
          Features
        </h2>
        <div className="grid md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {/* Customer Features */}
          <div className="rounded-2xl bg-white/80 backdrop-blur shadow-lg p-5 sm:p-6 md:p-8 border border-white/60">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#ffb5c2] flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">For Customers</h3>
            </div>
            <ul className="space-y-2.5 sm:space-y-3 text-gray-700">
              <li className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff6b9d] mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base leading-relaxed">Browse and discover salons in your area</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff6b9d] mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base leading-relaxed">Book appointments with ease</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff6b9d] mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base leading-relaxed">View and manage your upcoming bookings</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff6b9d] mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base leading-relaxed">Choose from available services and stylists</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff6b9d] mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base leading-relaxed">Simple, intuitive booking process</span>
              </li>
            </ul>
          </div>

          {/* Business Features */}
          <div className="rounded-2xl bg-white/80 backdrop-blur shadow-lg p-5 sm:p-6 md:p-8 border border-white/60">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#ffb5c2] flex items-center justify-center flex-shrink-0">
                <Scissors className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">For Salons</h3>
            </div>
            <ul className="space-y-2.5 sm:space-y-3 text-gray-700">
              <li className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff6b9d] mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base leading-relaxed">Manage your salon&apos;s calendar and availability</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff6b9d] mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base leading-relaxed">Create and organize your services</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff6b9d] mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base leading-relaxed">Track appointments and bookings</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff6b9d] mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base leading-relaxed">Manage your team and employees</span>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="w-5 h-5 text-[#ff6b9d] mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base leading-relaxed">Streamlined dashboard for easy management</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Why Choose Schedula */}
      <section className="mb-10 sm:mb-12 md:mb-16">
        <div className="rounded-2xl bg-white/80 backdrop-blur shadow-lg p-5 sm:p-6 md:p-8 lg:p-12 border border-white/60">
          <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#ff6b9d] flex-shrink-0" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Why Choose Schedula?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#ffb5c2] flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 leading-tight">Save Time</h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                Book appointments in minutes, not hours. No more phone calls or back-and-forth emails.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#ffb5c2] flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 leading-tight">Easy to Use</h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                Our intuitive interface makes scheduling simple for everyone, regardless of tech experience.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#ffb5c2] flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 leading-tight">Stay Organized</h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                Keep track of all your appointments in one place. Never miss a booking again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <div className="rounded-2xl bg-white/80 backdrop-blur shadow-lg p-5 sm:p-6 md:p-8 lg:p-12 border border-white/60">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            Ready to Get Started?
          </h2>
          <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Join Schedula today and experience the future of salon booking. 
            Whether you&apos;re a customer or a salon owner, we have something for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-3 bg-[#ff6b9d] text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-[#ff5a8a] active:bg-[#ff4a7a] transition-colors shadow-md min-h-[44px] touch-manipulation"
            >
              Sign Up as Customer
            </Link>
            <Link
              href="/salon-register"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-3 bg-white text-[#ff6b9d] text-sm sm:text-base font-semibold rounded-lg border-2 border-[#ff6b9d] hover:bg-[#ff6b9d] hover:text-white active:bg-[#ff5a8a] transition-colors shadow-md min-h-[44px] touch-manipulation"
            >
              Register Your Salon
            </Link>
          </div>
          <p className="mt-5 sm:mt-6 text-sm sm:text-base text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-[#ff6b9d] font-semibold hover:underline active:text-[#ff5a8a]">
              Sign in here
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}