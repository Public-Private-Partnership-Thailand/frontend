import { createRef, useEffect, useRef } from "react";
import ChartJs, { ChartConfiguration } from "chart.js/auto";

export interface ChartElement extends HTMLCanvasElement {
  instance: ChartJs;
}

export interface ChartProps
  extends React.ComponentPropsWithoutRef<"canvas">,
    ChartConfiguration {
  width?: number | "auto";
  height?: number | "auto";
  getRef?: (el: ChartElement | null) => void;
}

const init = (el: ChartElement, props: ChartProps) => {
  const canvas = el?.getContext("2d");
  if (canvas) {
    const chart = new ChartJs(canvas, {
      type: props.type,
      data: props.data,
      options: props.options,
    });

    // Attach ChartJs instance
    el.instance = chart;
  }
};

// Helper function to check if chart data actually changed
const hasDataChanged = (oldData: any, newData: any): boolean => {
  if (oldData === newData) return false;
  if (!oldData || !newData) return true;
  
  // Compare labels
  if (JSON.stringify(oldData.labels) !== JSON.stringify(newData.labels)) {
    return true;
  }
  
  // Compare datasets
  if (!oldData.datasets || !newData.datasets) return true;
  if (oldData.datasets.length !== newData.datasets.length) return true;
  
  for (let i = 0; i < oldData.datasets.length; i++) {
    const oldDataset = oldData.datasets[i];
    const newDataset = newData.datasets[i];
    if (JSON.stringify(oldDataset.data) !== JSON.stringify(newDataset.data)) {
      return true;
    }
  }
  
  return false;
};

// Helper function to check if options changed (shallow comparison for most cases)
// Note: Functions in options are compared by reference, which is fine since they're memoized
const hasOptionsChanged = (oldOptions: any, newOptions: any): boolean => {
  if (oldOptions === newOptions) return false;
  if (!oldOptions || !newOptions) return true;
  
  // For options, we do a shallow comparison of the structure
  // Since options often contain functions, we compare the keys and non-function values
  const oldKeys = Object.keys(oldOptions);
  const newKeys = Object.keys(newOptions);
  
  if (oldKeys.length !== newKeys.length) return true;
  
  for (const key of oldKeys) {
    const oldVal = oldOptions[key];
    const newVal = newOptions[key];
    
    // If both are objects (but not functions), compare recursively
    if (typeof oldVal === 'object' && typeof newVal === 'object' && oldVal !== null && newVal !== null) {
      if (typeof oldVal !== 'function' && typeof newVal !== 'function') {
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          return true;
        }
      } else if (oldVal !== newVal) {
        return true;
      }
    } else if (oldVal !== newVal) {
      return true;
    }
  }
  
  return false;
};

function Chart({
  type = "line",
  data = {
    datasets: [],
  },
  options = {},
  width = "auto",
  height = "auto",
  getRef = () => {},
  className = "",
  ...computedProps
}: ChartProps) {
  const initialRender = useRef(true);
  const chartRef = createRef<ChartElement>();
  const prevDataRef = useRef<any>(null);
  const prevOptionsRef = useRef<any>(null);

  useEffect(() => {
    if (initialRender.current) {
      getRef(chartRef.current);
      if (chartRef.current) {
        init(chartRef.current, {
          type,
          data,
          options,
          width,
          height,
          getRef,
          className,
        });
        prevDataRef.current = data;
        prevOptionsRef.current = options;
        initialRender.current = false;
      }
    } else {
      if (chartRef.current) {
        // Only update if data or options actually changed
        const dataChanged = hasDataChanged(prevDataRef.current, data);
        const optionsChanged = hasOptionsChanged(prevOptionsRef.current, options);
        
        if (dataChanged || optionsChanged) {
          if (dataChanged) {
            chartRef.current.instance.data = data;
          }
          if (optionsChanged && options) {
            chartRef.current.instance.options = options;
          }
          chartRef.current.instance.update();
          prevDataRef.current = data;
          prevOptionsRef.current = options;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, options]);

  return (
    <div
      style={{
        width: width === "auto" ? "100%" : `${width}px`,
        height: height === "auto" ? "100%" : `${height}px`,
      }}
    >
      <canvas
        {...computedProps}
        className={className}
        ref={chartRef}
      ></canvas>
    </div>
  );
}

export default Chart;

