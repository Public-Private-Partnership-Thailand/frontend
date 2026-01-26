import { createRef, useEffect } from "react";
import tippy, {
  PopperElement,
  Props,
  roundArrow,
  animateFill as animateFillPlugin,
} from "tippy.js";
import clsx from "clsx";

interface TippyProps extends React.ComponentPropsWithoutRef<"span"> {
  getRef?: (el: PopperElement | null) => void;
  content: string;
  disable?: boolean;
  as?: React.ElementType;
  options?: Partial<Props>;
}

const init = (el: PopperElement, props: TippyProps) => {
  tippy(el, {
    plugins: [animateFillPlugin],
    content: props.content,
    arrow: roundArrow,
    popperOptions: {
      modifiers: [
        {
          name: "preventOverflow",
          options: {
            rootBoundary: "viewport",
          },
        },
      ],
    },
    animateFill: false,
    animation: "shift-away",
    ...props.options,
  });
};

const Tippy = (props: TippyProps) => {
  const tippyRef = createRef<PopperElement>();
  const Component = props.as || "span";

  const isDisabled = () => {
    if (tippyRef.current && (tippyRef.current as any)._tippy !== undefined) {
      props.disable
        ? (tippyRef.current as any)._tippy.disable()
        : (tippyRef.current as any)._tippy.enable();
    }
  };

  useEffect(() => {
    isDisabled();
  }, [props.disable]);

  useEffect(() => {
    if (props.getRef) {
      props.getRef && props.getRef(tippyRef.current);
    }

    if (tippyRef.current !== null) {
      init(tippyRef.current, props);
    }

    isDisabled();
  }, [props.content]);

  const { content, as, options, getRef, disable, className, ...computedProps } =
    props;
  return (
    <Component
      ref={tippyRef}
      className={clsx(["cursor-pointer", className])}
      {...computedProps}
    >
      {props.children}
    </Component>
  );
};

export default Tippy;

