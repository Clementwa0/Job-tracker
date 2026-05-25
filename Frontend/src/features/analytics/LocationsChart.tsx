import { MapPin } from "lucide-react";
import TopLocationsChart from "./charts/TopLocationsChart";

type Props = {
  data: any[];
};

const LocationsChart = ({ data }: Props) => {
  return (
    <TopLocationsChart
      title="Applications by Location"
      icon={<MapPin className="h-5 w-5" />}
      data={data}
    />
  );
};

export default LocationsChart;