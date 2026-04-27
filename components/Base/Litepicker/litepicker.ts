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
      const formatDateWithBE = (dateInstance: Date) => {
        const d = dayjs(dateInstance).locale('th');
        if (useBuddhistEra) {
          let formatted = d.format(format);
          formatted = formatted.replace(/\b(\d{4})\b/, (match, year) => {
            const yearNum = parseInt(year, 10);
            if (yearNum >= 1900 && yearNum <= 2200) {
              return (yearNum + 543).toString();
            }
            return match;
          });
          return formatted;
        }
        return d.format(format);
      };

      // Convert year dropdown to Buddhist Era if enabled
      if (useBuddhistEra) {
        const convertYearToBE = (select: HTMLSelectElement) => {
          if (select.options.length === 0) return false;

          const firstValue = parseInt(select.options[0].value, 10);
          if (!isNaN(firstValue) && firstValue >= 1900 && firstValue <= 2200) {
            Array.from(select.options).forEach((option: HTMLOptionElement) => {
              const adYear = parseInt(option.value, 10);
              if (!isNaN(adYear) && adYear >= 1900 && adYear <= 2200) {
                const beYear = adYear + 543;
                const currentText = option.textContent || '';
                const currentYear = parseInt(currentText, 10);
                if (isNaN(currentYear) || currentYear < 2500) {
                  option.textContent = beYear.toString();
                }
              }
            });
            return true;
          }
          return false;
        };

        /** When `root` is set, only patch that calendar (avoids touching other pickers). */
        const updateYearDropdowns = (root: Element | null) => {
          try {
            const containers = root
              ? [root]
              : Array.from(document.querySelectorAll('.litepicker'));
            containers.forEach((container: Element) => {
              container.querySelectorAll('select').forEach((select: HTMLSelectElement) => {
                convertYearToBE(select);
              });
            });
          } catch {
            // UI enhancement only
          }
        };

        let viewYearPatchTimer: ReturnType<typeof setTimeout> | null = null;

        let pickerUiListenersAttached = false;
        const attachPickerUiYearListeners = () => {
          const root = picker.ui as HTMLElement | undefined;
          if (!root || pickerUiListenersAttached) return;
          pickerUiListenersAttached = true;
          // Litepicker resets <option> text to A.D. after year/month change; re-apply B.E. labels.
          // Single rAF only — chained timers + `view` were able to feedback-loop with the library.
          root.addEventListener(
            'change',
            () => {
              requestAnimationFrame(() => updateYearDropdowns(root));
            },
            true
          );
        };

        if (picker.on) {
          picker.on('show', () => {
            const root = (picker.ui as Element | undefined) ?? null;
            setTimeout(() => {
              if (root) updateYearDropdowns(root);
              else updateYearDropdowns(null);
              attachPickerUiYearListeners();
            }, 50);
          });

          picker.on('view', () => {
            const root = (picker.ui as Element | undefined) ?? null;
            if (viewYearPatchTimer) clearTimeout(viewYearPatchTimer);
            viewYearPatchTimer = setTimeout(() => {
              viewYearPatchTimer = null;
              updateYearDropdowns(root);
            }, 80);
          });

          picker.on('selected', (startDate: any, endDate?: any) => {
            let date = formatDateWithBE(startDate.dateInstance);
            date +=
              endDate !== undefined
                ? ' - ' + formatDateWithBE(endDate.dateInstance)
                : '';
            if (el) {
              el.value = date;
            }
            props.onChange({
              target: {
                value: date,
              },
            });
            // Do not patch year dropdowns here — mutating DOM after `selected` can re-trigger
            // `view` / internal updates; React `value` sync is handled without reInit when DOM matches.
          });
        }

        setTimeout(() => updateYearDropdowns(null), 300);
      } else if (picker.on) {
        picker.on('selected', (startDate: any, endDate?: any) => {
          const d = dayjs(startDate.dateInstance).locale('th');
          let date = d.format(format);
          date +=
            endDate !== undefined
              ? ' - ' + dayjs(endDate.dateInstance).locale('th').format(format)
              : '';
          if (el) {
            el.value = date;
          }
          props.onChange({
            target: {
              value: date,
            },
          });
        });
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
