import dayjs from "dayjs";
import "dayjs/locale/th";
import { LitepickerElement, LitepickerProps } from "./index";
import { parseThaiDate } from "@/lib/utils/dateUtils";

// Lazy load Litepicker to avoid SSR issues
const getLitepicker = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return require("litepicker").default;
  } catch (e) {
    return null;
  }
};

const getDateFormat = (format: string | undefined) => {
  return format !== undefined ? format : "D MMM YYYY";
};

const setValue = (props: LitepickerProps) => {
  // Don't set a default value - let it remain empty to show "all time"
  // The placeholder will be shown when value is empty
  return;
};

const init = (el: LitepickerElement, props: LitepickerProps) => {
  // Only initialize on client side
  if (typeof window === 'undefined') {
    return;
  }
  
  // Lazy load Litepicker
  const LitepickerJs = getLitepicker();
  if (!LitepickerJs) {
    return;
  }
  
  // Set Thai locale for dayjs
  dayjs.locale('th');
  
  const format = getDateFormat(props.options.format);
  // Check if Buddhist Era should be used (default to true for Thai locale)
  const useBuddhistEra = props.options.useBuddhistEra !== false;
  
  // Explicitly set maxDays to null to allow unlimited date range selection
  // This overrides any default constraints that might limit the range
  const options: any = {
    ...props.options,
    maxDays: props.options.maxDays !== undefined ? props.options.maxDays : null,
  };
  el.litePickerInstance = new LitepickerJs({
    ...options,
    element: el,
    format: format,
    lang: 'th-TH', // Set Thai locale for Litepicker
    setup: (picker: any) => {
      if (picker.on) {
        picker.on("selected", (startDate: any, endDate?: any) => {
          // Format date with BE year conversion if enabled
          const formatDateWithBE = (dateInstance: Date) => {
            const d = dayjs(dateInstance).locale('th');
            if (useBuddhistEra) {
              const beYear = d.year() + 543;
              // Format the date and replace the year with BE year
              let formatted = d.format(format);
              // Replace YYYY (4-digit year) with BE year
              // This handles formats like "D MMM YYYY" -> "15 ม.ค. 2567"
              formatted = formatted.replace(/\b(\d{4})\b/, (match, year) => {
                const yearNum = parseInt(year);
                if (yearNum >= 1900 && yearNum <= 2100) {
                  return (yearNum + 543).toString();
                }
                return match;
              });
              return formatted;
            } else {
              return d.format(format);
            }
          };
          
          let date = formatDateWithBE(startDate.dateInstance);
          date +=
            endDate !== undefined
              ? " - " + formatDateWithBE(endDate.dateInstance)
              : "";
          // Update the input element value directly to ensure it's visible
          if (el) {
            el.value = date;
          }
          // Update React state
          props.onChange({
            target: {
              value: date,
            },
          });
        });
      }
      
      // Convert year dropdown to Buddhist Era if enabled
      if (useBuddhistEra) {
        const convertYearToBE = (select: HTMLSelectElement) => {
          // Check if this is a year dropdown by examining the first option
          if (select.options.length === 0) return false;
          
          const firstValue = parseInt(select.options[0].value);
          // Year dropdowns typically have values in the range 1900-2100
          if (!isNaN(firstValue) && firstValue >= 1900 && firstValue <= 2100) {
            // This is a year dropdown - convert all options to BE
            Array.from(select.options).forEach((option: HTMLOptionElement) => {
              const adYear = parseInt(option.value);
              if (!isNaN(adYear) && adYear >= 1900 && adYear <= 2100) {
                const beYear = adYear + 543;
                // Update the display text to BE, but keep AD value
                // Only update if it's not already converted (check if text is BE format)
                const currentText = option.textContent || '';
                const currentYear = parseInt(currentText);
                if (isNaN(currentYear) || currentYear < 2500) {
                  option.textContent = beYear.toString();
                }
              }
            });
            return true;
          }
          return false;
        };
        
        const updateYearDropdowns = () => {
          try {
            // Find all Litepicker containers
            const pickerContainers = document.querySelectorAll('.litepicker');
            pickerContainers.forEach((container: Element) => {
              // Find all select elements that are year dropdowns
              const selects = container.querySelectorAll('select');
              selects.forEach((select: HTMLSelectElement) => {
                convertYearToBE(select);
              });
            });
          } catch (error) {
            // Silently fail - this is a UI enhancement
          }
        };
        
        // Update when picker is shown
        let conversionInterval: NodeJS.Timeout | null = null;
        if (picker.on) {
          picker.on('show', () => {
            setTimeout(updateYearDropdowns, 50);
            // Start continuous conversion while picker is visible
            if (conversionInterval) {
              clearInterval(conversionInterval);
            }
            conversionInterval = setInterval(() => {
              updateYearDropdowns();
            }, 100); // Check every 100ms while visible
          });
          
          picker.on('hide', () => {
            // Stop continuous conversion when picker is hidden
            if (conversionInterval) {
              clearInterval(conversionInterval);
              conversionInterval = null;
            }
          });
          
          // Also listen for month/year changes
          picker.on('view', () => {
            setTimeout(updateYearDropdowns, 10);
            requestAnimationFrame(() => updateYearDropdowns());
          });
        }
        
        // Also update after initialization
        setTimeout(updateYearDropdowns, 300);
        
        // Watch for changes to the picker UI, especially when dropdowns are updated
        const watchPickerUI = () => {
          if (!picker.ui) return;
          
          // Watch for changes in the picker UI with immediate conversion
          const uiObserver = new MutationObserver(() => {
            // Convert immediately when DOM changes
            updateYearDropdowns();
            // Also use requestAnimationFrame for immediate visual update
            requestAnimationFrame(() => {
              updateYearDropdowns();
            });
          });
          
          uiObserver.observe(picker.ui, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: true,
          });
          
          // Also add event listeners to year dropdowns directly with immediate conversion
          const attachYearListeners = () => {
            const selects = picker.ui.querySelectorAll('select');
            selects.forEach((select: HTMLSelectElement) => {
              if (convertYearToBE(select)) {
                // This is a year dropdown - add listeners to maintain BE display
                // Use a flag to track if we've already added listeners
                if ((select as any).__beConverted) return;
                (select as any).__beConverted = true;
                
                // Convert immediately
                convertYearToBE(select);
                
                // Add listeners with immediate conversion - use capture phase for early interception
                const convertHandler = () => {
                  convertYearToBE(select);
                  requestAnimationFrame(() => convertYearToBE(select));
                };
                
                select.addEventListener('focus', convertHandler, true);
                select.addEventListener('mousedown', convertHandler, true);
                select.addEventListener('mouseup', convertHandler, true);
                select.addEventListener('change', convertHandler, true);
                select.addEventListener('click', convertHandler, true);
                select.addEventListener('input', convertHandler, true);
                
                // Also intercept when dropdown opens
                select.addEventListener('focusin', convertHandler, true);
              }
            });
          };
          
          // Attach listeners when UI is ready
          setTimeout(attachYearListeners, 100);
          
          // Re-attach when picker is shown
          if (picker.on) {
            picker.on('show', () => {
              setTimeout(attachYearListeners, 50);
              // Also convert immediately
              requestAnimationFrame(() => {
                updateYearDropdowns();
              });
            });
          }
        };
        
        // Start watching the picker UI
        setTimeout(watchPickerUI, 200);
        
        // Watch for new picker instances - only observe when picker container is added
        let observer: MutationObserver | null = null;
        
        const startObserving = () => {
          if (observer) return; // Already observing
          
          observer = new MutationObserver((mutations) => {
            let hasPickerChanges = false;
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node: any) => {
                if (node.nodeType === 1) {
                  // Check if it's a litepicker container or contains one
                  if (node.classList?.contains('litepicker') || node.querySelector?.('.litepicker')) {
                    hasPickerChanges = true;
                  }
                  // Also check if it's a select element (year dropdown)
                  if (node.tagName === 'SELECT') {
                    hasPickerChanges = true;
                  }
                }
              });
            });
            if (hasPickerChanges) {
              setTimeout(updateYearDropdowns, 50);
            }
          });
          
          // Only observe document body for new picker containers
          if (document.body) {
            observer.observe(document.body, {
              childList: true,
              subtree: true, // Changed to true to catch nested selects
            });
          }
        };
        
        startObserving();
      }
    },
  });
  
  // Set initial value if provided (parse as B.E. so display persists after click away)
  if (props.value && props.value.length > 0) {
    el.value = props.value;
    if (el.litePickerInstance && el.litePickerInstance.setDate) {
      const dateParts = props.value.split(' - ').map((p: string) => p.trim()).filter(Boolean);
      if (dateParts.length >= 2) {
        const startDate = parseThaiDate(dateParts[0]);
        const endDate = parseThaiDate(dateParts[1]);
        if (startDate && endDate && startDate.isValid() && endDate.isValid()) {
          el.litePickerInstance.setDateRange(startDate.toDate(), endDate.toDate());
        }
      } else if (dateParts.length === 1) {
        const date = parseThaiDate(dateParts[0]);
        if (date && date.isValid()) {
          el.litePickerInstance.setDate(date.toDate());
        }
      }
    }
  }
};

const reInit = (el: LitepickerElement, props: LitepickerProps) => {
  // Only reinitialize on client side
  if (typeof window === 'undefined') {
    return;
  }
  
  if (el.litePickerInstance) {
    el.litePickerInstance.destroy();
  }
  init(el, props);
};

export { setValue, init, reInit };
