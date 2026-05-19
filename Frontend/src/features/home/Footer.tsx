import { Link } from "react-router-dom";
import { Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <Link to="/" className="text-2xl font-bold">
              JobTrail
            </Link>

            <p className="text-gray-400 mt-2">
              Your career journey, organized.
            </p>
          </div>

          <div className="flex items-center gap-6 mt-6 md:mt-0">
            <a href="https://linkedin.com">
              <Linkedin className="h-5 w-5" />
            </a>

            <a href="https://twitter.com">
              <Twitter className="h-5 w-5" />
            </a>

            <Link to="/login">
              Login
            </Link>

            <Button asChild variant="outline">
              <Link to="/register">
                Sign Up Free
              </Link>
            </Button>
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm mt-10 border-t border-gray-800 pt-6">
          © {new Date().getFullYear()} JobTrail. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;