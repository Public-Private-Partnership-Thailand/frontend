import Chart from "@/components/Base/Chart";
import { ChartData, ChartOptions } from "chart.js/auto";
import {
  getColor,
  chartPieBackgroundColors,
  chartPieHoverBackgroundColors,
} from "@/lib/utils/colors";
import { selectColorScheme } from "@/lib/stores/colorSchemeSlice";
import { selectDarkMode } from "@/lib/stores/darkModeSlice";
import { useAppSelector } from "@/lib/stores/hooks";
import { useMemo } from "react";

interface MainProps extends React.ComponentPropsWithoutRef<"canvas"> {
  width?: number | "auto";
  height?: number | "auto";
  data?: number[];
  labels?: string[];
  colors?: string[];
  options?: ChartOptions;
  type?: "pie" | "doughnut";
}

function Main({ 
  width = "auto", 
  height = "auto", 
  className = "",
  data: propData,
  labels: propLabels,
  colors: propColors,
  options: propOptions,
  type = "pie"
}: MainProps) {
  const props = {
    width: width,
    height: height,
    className: className,
  };
  const colorScheme = useAppSelector(selectColorScheme);
  const darkMode = useAppSelector(selectDarkMode);

  const chartData = propData || [15, 10, 65];
  const data: ChartData = useMemo(() => {
    const keys = propColors && propColors.length > 0 ? propColors : undefined
    const bg = chartPieBackgroundColors(keys)
    const hover = chartPieHoverBackgroundColors(keys)
    return {
      labels: propLabels || ["Yellow", "Dark"],
      datasets: [
        {
          data: chartData,
          backgroundColor: bg,
          hoverBackgroundColor: hover,
          borderWidth: 3,
          borderColor: darkMode ? getColor("darkmode.700") : getColor("white"),
        },
      ],
    };
  }, [colorScheme, darkMode, chartData, propLabels, propColors]);

  const options: ChartOptions = useMemo(() => {
    const defaultOptions: ChartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
    };
    
    // Merge with provided options if any
    if (propOptions) {
      return {
        ...defaultOptions,
        ...propOptions,
        plugins: {
          ...defaultOptions.plugins,
          ...propOptions.plugins,
        },
      };
    }
    
    return defaultOptions;
  }, [colorScheme, darkMode, propOptions]);

  return (
    <Chart
      type={type}
      width={props.width}
      height={props.height}
      data={data}
      options={options}
      className={props.className}
    />
  );
}

export default Main;
