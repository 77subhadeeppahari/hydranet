import { Link } from "react-router-dom";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_c01b63a2-5c92-4b76-ba5b-d8f93187c2a3/artifacts/khimfeud_Hydranet.png";

export const Logo = ({ size = "md", withText = true, asLink = true }) => {
  const dims = size === "lg" ? "h-12" : size === "sm" ? "h-7" : "h-9";
  const content = (
    <div className="flex items-center gap-3" data-testid="site-logo">
      <div className="relative">
        <div className={`${dims} aspect-[3/2] rounded-md bg-white/95 p-1 flex items-center justify-center`}>
          <img src={LOGO_URL} alt="Hydranet Broadband" className="h-full w-auto object-contain" />
        </div>
      </div>
      {withText && (
        <div className="hidden sm:flex flex-col leading-none">
          <span className="font-display font-black text-lg text-white tracking-tight">Hydranet</span>
          <span className="font-mono-metric text-[10px] uppercase tracking-[0.24em] text-[#F26B21]">Broadband</span>
        </div>
      )}
    </div>
  );
  if (!asLink) return content;
  return <Link to="/" className="inline-flex">{content}</Link>;
};
