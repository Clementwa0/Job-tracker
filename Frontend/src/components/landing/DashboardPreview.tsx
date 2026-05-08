export default function DashboardPreview({ recentApplications }: any) {
  return (
    <div className="hidden lg:block absolute -right-18 top-6/4 -translate-y-1/2 w-[480px] z-10">
      <div className="relative">
        <div className="absolute -inset-6 bg-gradient-to-r from-blue-300 to-green-300 blur-3xl opacity-10 rounded-xl" />
        <div className="relative bg-white rounded-xl shadow-xl p-6 border border-slate-200 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex gap-2 pb-2 border-b">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="ml-3 text-sm text-slate-500">
              Job Applications Dashboard
            </span>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Recent Applications</p>
            <div className="space-y-2">
              {recentApplications.map((job: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between bg-slate-50 p-2 rounded-md hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-200"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {job.position}
                    </p>
                    <span className="text-xs text-slate-600">
                      {job.company}
                    </span>
                  </div>
                  <span className="text-xs text-slate-600 font-medium">
                    {job.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}