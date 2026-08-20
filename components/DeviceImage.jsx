import DeviceIcon from "./DeviceIcon";

export default function DeviceImage({ slug, icon, imageUrl, name, className = "", iconWrapClassName = "p-3" }) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt={name || ""} className={`object-contain ${className}`} />;
  }
  return (
    <span className={`flex items-center justify-center ${iconWrapClassName} ${className}`}>
      <DeviceIcon slug={slug} icon={icon} />
    </span>
  );
}
