import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UploadSection({
  onFile,
  fileInputRef,
}: any) {
  return (
    <div className="border-2 border-dashed p-6 text-center">
      <Input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      <Button onClick={() => fileInputRef.current?.click()}>
        Upload CV
      </Button>
    </div>
  );
}