import { Link } from "react-router-dom";
import { Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FooterSection({ ctaRef }: any) {
  return (
    <footer
      ref={ctaRef}
      className="bg-gradient-to-b from-gray-900 to-black text-white py-10 sm:py-12 px-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 sm:mb-10">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <Link
              to="/"
              className="text-xl sm:text-2xl font-bold hover:text-blue-300 transition-colors"
            >
              JobTrail
            </Link>
            <p className="text-gray-300 mt-1 sm:mt-2 text-sm sm:text-base">
              Your career journey, organized.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex gap-4 sm:gap-6">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin className="h-5 w-5 sm:h-6 sm:w-6 text-gray-300" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer">
                <Twitter className="h-5 w-5 sm:h-6 sm:w-6 text-gray-300" />
              </a>
            </div>

            <div className="flex flex-cols-2 gap-8 sm:flex-row items-center gap-3 sm:gap-4 mt-2 sm:mt-0">
              <Link
                to="/login"
                className="text-gray-300 hover:text-yellow-200 transition-colors text-sm sm:text-base"
              >
                Login
              </Link>

              <Button asChild variant="outline" className="text-white">
                <Link to="/register">Sign Up Free</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-400 text-xs sm:text-sm pt-6 sm:pt-8 border-t border-gray-800">
          © {new Date().getFullYear()} JobTrail. All rights reserved.
        </div>
      </div>
    </footer>
  );
}