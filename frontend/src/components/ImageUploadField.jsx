import { useRef } from "react";
import { Upload } from "lucide-react";

export const ImageUploadField = ({ value, onChange, testId = "image-upload" }) => {
  const ref = useRef();
  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Image must be under 2MB. Please compress it."); return; }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <input value={value || ""} onChange={(e) => onChange(e.target.value)}
          data-testid={`${testId}-url`}
          placeholder="Paste image URL or upload →"
          className="flex-1 rounded-md bg-[#020617] border border-white/10 focus:border-[#F26B21] outline-none px-3 py-2.5 text-white text-sm" />
        <button type="button" onClick={() => ref.current?.click()} data-testid={`${testId}-btn`}
          className="hn-btn-secondary !py-2 !px-3 text-xs inline-flex items-center gap-2">
          <Upload size={13} /> Upload
        </button>
        <input ref={ref} type="file" accept="image/*" onChange={onFile} className="hidden" data-testid={`${testId}-file`} />
      </div>
      {value && <img src={value} alt="preview" className="w-20 h-20 rounded-lg object-cover border border-white/10" />}
    </div>
  );
};
