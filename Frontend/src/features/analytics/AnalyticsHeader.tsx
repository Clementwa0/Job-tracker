type Props = {
  totalJobs: number;
};

const AnalyticsHeader = ({ totalJobs }: Props) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Job Analytics
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Insights into your applications
        </p>
      </div>

      <div
        className="
          px-4 py-2 rounded-xl
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-800
          text-sm font-medium
          text-slate-700 dark:text-slate-300
        "
      >
        {totalJobs} Applications
      </div>
    </div>
  );
};

export default AnalyticsHeader;