import clsx from "clsx";
import Lucide from "@/components/Base/Lucide";
import Tippy from "@/components/Base/Tippy";

interface ReportCardProps {
  icon: keyof typeof import('lucide-react').icons;
  iconColor?: string;
  value: string | number;
  label: string;
  trend?: {
    value: number;
    isPositive: boolean;
    text: string;
  };
}

function ReportCard({
  icon,
  iconColor = "text-primary",
  value,
  label,
  trend,
}: ReportCardProps) {
  return (
    <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
      <div
        className={clsx([
          "relative zoom-in",
          "before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']",
        ])}
      >
        <div className="p-5 box">
          <div className="flex">
            <Lucide
              icon={icon}
              className={clsx("w-[28px] h-[28px]", iconColor)}
            />
            {trend && (
              <div className="ml-auto">
                <Tippy
                  as="div"
                  className={clsx(
                    "cursor-pointer py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium",
                    trend.isPositive ? "bg-success" : "bg-danger"
                  )}
                  content={trend.text}
                >
                  {trend.value}%
                  <Lucide
                    icon={trend.isPositive ? "ChevronUp" : "ChevronDown"}
                    className="w-4 h-4 ml-0.5"
                  />
                </Tippy>
              </div>
            )}
          </div>
          <div className="mt-6 text-3xl font-medium leading-8">
            {value}
          </div>
          <div className="mt-1 text-base text-slate-500">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportCard;
