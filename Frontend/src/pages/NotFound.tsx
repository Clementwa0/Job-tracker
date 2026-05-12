import { Link } from "react-router-dom";
import { ArrowLeft, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-black px-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shadow-sm">
            <SearchX className="w-12 h-12 text-sky-600 dark:text-sky-400" />
          </div>
        </div>

        {/* 404 */}
        <h1 className="text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          404
        </h1>

        {/* Title */}
        <h2 className="mt-4 text-2xl font-semibold text-slate-800 dark:text-slate-100">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
          The page you are looking for does not exist or may have been moved.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/">
              Go Home
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link to={-1 as unknown as string}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <p className="mt-10 text-xs text-slate-500 dark:text-slate-500">
          JobTrail • Track your career journey
        </p>
      </div>
    </div>
  );
};

export default NotFound;