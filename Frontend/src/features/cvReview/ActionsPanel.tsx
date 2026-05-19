import { Button } from "@/components/ui/button";
import { Copy, Download, RefreshCw } from "lucide-react";

interface Props {
  onCopy: () => void;
  onReset: () => void;
}

const ActionsPanel = ({ onCopy, onReset }: Props) => {
  return (
    <div className="space-y-3">
      <Button onClick={onCopy} className="w-full">
        <Copy className="h-4 w-4 mr-2" />
        Copy Report
      </Button>

      <Button variant="outline" className="w-full">
        <Download className="h-4 w-4 mr-2" />
        Export PDF
      </Button>

      <Button variant="secondary" onClick={onReset} className="w-full">
        <RefreshCw className="h-4 w-4 mr-2" />
        Reset
      </Button>
    </div>
  );
};

export default ActionsPanel;