import "@/styles/vendors/litepicker.css";
import { createRef, useEffect, useRef } from "react";
import { setValue, init, reInit } from "./litepicker";
import { FormInput } from "@/components/Base/Form";
import { ILPConfiguration } from "litepicker/dist/types/interfaces";

export interface LitepickerElement extends HTMLInputElement {
  litePickerInstance: any;
}

type LitepickerConfig = Partial<ILPConfiguration>;

export interface LitepickerProps
  extends React.PropsWithChildren,
    Omit<React.ComponentPropsWithoutRef<"input">, "onChange"> {
  options: {
    format?: string | undefined;
    useBuddhistEra?: boolean;
  } & LitepickerConfig;
  onChange: (e: {
    target: {
      value: string;
    };
  }) => void;
  value?: string;
  getRef?: (el: LitepickerElement) => void;
}

function Litepicker({
  options = {},
  value = "",
  onChange = () => {},
  getRef = () => {},
  ...computedProps
}: LitepickerProps) {
  const props = {
    options: options,
    value: value,
    onChange: onChange,
    getRef: getRef,
  };
  const initialRender = useRef(true);
  const litepickerRef = createRef<LitepickerElement>();
  const tempValue = useRef(props.value);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    if (litepickerRef.current) {
      props.getRef(litepickerRef.current);
    }

    if (initialRender.current) {
      // Only set value if it's not empty - otherwise let placeholder show
      if (props.value && props.value.length > 0) {
        setValue(props);
      }
      if (litepickerRef.current !== null) {
        init(litepickerRef.current, props);
      }
      initialRender.current = false;
    } else {
      if (tempValue.current !== props.value && litepickerRef.current !== null) {
        const next = props.value || '';
        const dom = litepickerRef.current.value || '';
        // If the input already matches React state, skip reInit — otherwise `setDate`
        // during init can fire `selected` again and cause a tight update loop.
        if (next !== dom) {
          reInit(litepickerRef.current, props);
          litepickerRef.current.value = next;
        }
      }
    }

    tempValue.current = props.value;
  }, [props.value]);

  return (
    <FormInput
      ref={litepickerRef}
      type="text"
      value={props.value || ''}
      onChange={(e) => {
        if (props.onChange) {
          props.onChange(e);
        }
      }}
      {...computedProps}
    />
  );
}

export default Litepicker;
