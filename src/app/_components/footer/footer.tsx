import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#ffb3c6] text-black">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand Section */}
                    <div>
                        <Link href="/" className="text-2xl font-bold tracking-wide mb-4 inline-block hover:opacity-80 transition-opacity">
                            schedula
                        </Link>
                        <p className="text-black/80 text-sm leading-relaxed">
                            Your trusted platform for booking salon appointments. Connect with top salons and manage your beauty appointments effortlessly.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-black/80 hover:text-black transition-colors text-sm">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/salons" className="text-black/80 hover:text-black transition-colors text-sm">
                                    Browse Salons
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="text-black/80 hover:text-black transition-colors text-sm">
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="text-black/80 hover:text-black transition-colors text-sm">
                                    Register
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal & Support */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Legal & Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/privacy" className="text-black/80 hover:text-black transition-colors text-sm">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-black/20 pt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-black/70 text-sm">
                            © {new Date().getFullYear()} Schedula. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <Link 
                                href="/privacy" 
                                className="text-black/70 hover:text-black transition-colors text-sm"
                            >
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}