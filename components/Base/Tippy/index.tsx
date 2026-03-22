import { createRef, useEffect, useLayoutEffect } from "react";
import tippy, {
  PopperElement,
  Instance,
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

function destroyTippyOnElement(el: PopperElement | null) {
  const inst = (el as PopperElement & { _tippy?: Instance })?._tippy;
  if (inst && !inst.state.isDestroyed) {
    inst.destroy();
  }
}

const Tippy = (props: TippyProps) => {
  const tippyRef = createRef<PopperElement>();
  const Component = props.as || "span";

  useEffect(() => {
    if (tippyRef.current && (tippyRef.current as any)._tippy !== undefined) {
      props.disable
        ? (tippyRef.current as any)._tippy.disable()
        : (tippyRef.current as any)._tippy.enable();
    }
  }, [props.disable]);

  useLayoutEffect(() => {
    const el = tippyRef.current;
    if (props.getRef) {
      props.getRef(el);
    }
    if (!el) return;

    destroyTippyOnElement(el);

    const instance = tippy(el, {
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

    if (props.disable) {
      instance.disable();
    }

    return () => {
      destroyTippyOnElement(el);
    };
    // Intentionally omit `props.options` from deps: parents often pass a new object each render;
    // recreating tippy every frame breaks hover. Latest options still apply whenever `content` changes.
  }, [props.content, props.disable]);

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

