import StatusPieChart from "./charts/StatusPieChart";
import JobTypeBarChart from "./charts/JobTypeBarChart";

type Props = {
  statusData: any[];
  jobTypeData: any[];
};

const OverviewCharts = ({ statusData, jobTypeData }: Props) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <StatusPieChart data={statusData} />
      <JobTypeBarChart data={jobTypeData} />
    </div>
  );
};

export default OverviewCharts;