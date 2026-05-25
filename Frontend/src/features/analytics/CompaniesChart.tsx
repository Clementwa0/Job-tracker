import { Building } from "lucide-react";
import TopCompaniesChart from "./charts/TopCompaniesChart";

type Props = {
  data: any[];
};

const CompaniesChart = ({ data }: Props) => {
  return (
    <TopCompaniesChart
      title="Top Companies Applied To"
      icon={<Building className="h-5 w-5" />}
      data={data}
    />
  );
};

export default CompaniesChart;