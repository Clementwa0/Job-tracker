import { recentApplications } from "@/constants";

const DashboardPreview = () => {
  return (
    <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[420px]">
      <div className="bg-white rounded-xl shadow-xl p-6 border border-slate-200">
        <div className="flex gap-2 pb-2 border-b">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
          <div className="w-2 h-2 bg-green-500 rounded-full" />
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold mb-3">
            Recent Applications
          </p>

          <div className="space-y-2">
            {recentApplications.map((job, i) => (
              <div
                key={i}
                className="flex justify-between bg-slate-50 p-3 rounded-md"
              >
                <div>
                  <p className="font-medium">
                    {job.position}
                  </p>

                  <span className="text-xs text-gray-500">
                    {job.company}
                  </span>
                </div>

                <span className="text-xs text-gray-500">
                  {job.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;