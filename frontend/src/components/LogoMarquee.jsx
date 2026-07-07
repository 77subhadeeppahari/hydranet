import "./LogoMarquee.css";

export const LogoMarquee = ({ items, testId, speed = 40 }) => {
  const doubled = [...items, ...items];
  return (
    <div className="logo-marquee-wrapper" data-testid={testId}>
      <div className="logo-marquee-track" style={{ animationDuration: `${speed}s` }}>
        {doubled.map((item, i) => (
          <LogoChip key={i} {...item} />
        ))}
      </div>
    </div>
  );
};

const LogoChip = ({ label, color = "#F26B21", font = "font-display" }) => (
  <div className="logo-chip">
    <span className={`logo-chip-text ${font}`} style={{ color }}>{label}</span>
  </div>
);
