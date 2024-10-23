import { useEffect, useMemo, useState } from "react";
import { VscCheck, VscComment, VscDebug, VscError, VscInfo, VscWarning } from "react-icons/vsc";
import { v4 } from "uuid";
import "./Toast.scss";

const TOAST_TYPE = {
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
  SUCCESS: "success",
};

const POSITION = {
  TOP_LEFT: "top-left",
  TOP_CENTER: "top-center",
  TOP_RIGHT: "top-right",
  BOTTOM_RIGHT: "bottom-right",
  BOTTOM_CENTER: "bottom-center",
  BOTTOM_LEFT: "bottom-left",
};

export const Toaster = ({ position = POSITION.TOP_RIGHT, expiresIn = 3000 }) => {
  const [activeToasts, setActiveToasts] = useState([]);
  const fadeOutDuration = useMemo(() => 300, []);
  const horizontalAlign = useMemo(() => {
    let splited = position.split("-");
    if (splited.length !== 2) splited = POSITION.TOP_CENTER.split("-");
    switch (splited[1]) {
      case "left":
        return "flex-start";
      case "center":
        return "center";
      case "right":
        return "flex-end";
      default:
        return "center";
    }
  }, [position]);
  const verticalDirection = useMemo(() => (position.split("-")[0] == "top" ? 1 : -1), [position]);

  const styles = useMemo(() => {
    const splited = position.split("-");
    if (splited.length != 2) splited = POSITION.TOP_CENTER.split("-");
    const [vertical, horizontal] = splited;
    let style = {
      position: "fixed",
      alignItems: horizontalAlign,
      pointerEvents: "none",
      [vertical]: "50px",
    };
    switch (horizontal) {
      case "left":
        style.left = "50px";
        break;
      case "center":
        style.left = "50%";
        style.transform = "translateX(-50%)";
        break;
      case "right":
        style.right = "50px";
        break;
    }
    return style;
  }, [position, horizontalAlign]);

  useEffect(() => {
    const listener = (e) => {
      const toastData = e.data;
      const toastId = toastData.id;
      const maintainDuration = toastData?.options?.duration ?? expiresIn;

      setActiveToasts((prev) => {
        const toast = {
          ...toastData,
          createdAt: Date.now(),
          duration: expiresIn,
        };
        return [...prev, toast];
      });
      setTimeout(() => {
        const toastToBeFadeOut = document.getElementById(toastId);
        if (toastToBeFadeOut) {
          toastToBeFadeOut.classList.add("fade-out");
          setTimeout(() => {
            setActiveToasts((prev) => prev.filter((t) => t.id !== toastId));
          }, fadeOutDuration);
        }
      }, maintainDuration);
    };
    const updateListener = (e) => {
      const updateData = e.data;
      setActiveToasts((prev) => {
        console.log(prev, updateData);
        return [
          ...prev.map((t) => {
            if (t.id === updateData.id) {
              t.message = updateData.message;
              console.log("update", t);
            }
            return t;
          }),
        ];
      });
    };
    const closeListener = (e) => {
      const closeData = e.data;
      setActiveToasts((prev) => prev.filter((t) => t.id !== closeData));
    };

    document.addEventListener("custom_toast", listener);
    document.addEventListener("custom_toast_update", updateListener);
    document.addEventListener("custom_toast_close", closeListener);
    return () => {
      document.removeEventListener("custom_toast", listener);
      document.removeEventListener("custom_toast_update", updateListener);
      document.removeEventListener("custom_toast_close", closeListener);
    };
  }, [activeToasts, expiresIn, fadeOutDuration]);

  return (
    <div className="custom-toast" style={styles}>
      {activeToasts
        ?.sort((a, b) => b.createdAt - a.createdAt)
        .map((toast, index) => {
          return (
            <ToastItem
              id={toast.id}
              type={toast.type}
              message={toast.message}
              key={toast.id}
              index={index * verticalDirection}
            />
          );
        })}
    </div>
  );
};

const ToastItem = ({ type, message = "", index = 0, ...rest }) => {
  return (
    <div className={"toast-item " + type} style={{ top: index * 45 }} {...rest}>
      <div className="icon-wrapper">
        {{
          [TOAST_TYPE.DEBUG]: <VscDebug />,
          [TOAST_TYPE.INFO]: <VscInfo />,
          [TOAST_TYPE.WARN]: <VscWarning />,
          [TOAST_TYPE.ERROR]: <VscError />,
          [TOAST_TYPE.SUCCESS]: <VscCheck />,
        }[type] ?? <VscComment />}
      </div>
      <div className="message">{message}</div>
    </div>
  );
};

const DEFAULT_OPTIONS = { duration: null };

const debug = (message, options = DEFAULT_OPTIONS) => {
  return addToastItem(TOAST_TYPE.DEBUG, message, null, options);
};

const info = (message, options = DEFAULT_OPTIONS) => {
  return addToastItem(TOAST_TYPE.INFO, message, null, options);
};

const warn = (message, options = DEFAULT_OPTIONS) => {
  return addToastItem(TOAST_TYPE.WARN, message, null, options);
};

const error = (message, options = DEFAULT_OPTIONS) => {
  return addToastItem(TOAST_TYPE.ERROR, message, null, options);
};

const success = (message, options = DEFAULT_OPTIONS) => {
  return addToastItem(TOAST_TYPE.SUCCESS, message, null, options);
};

const promise = async (promise, successText = null, errorText = null, options = DEFAULT_OPTIONS) => {
  return addToastItem(TOAST_TYPE.SUCCESS, null, { promise, successText, errorText }, options);
};

const addToastItem = (type, message, extra = null, options) => {
  const toastEvent = new Event("custom_toast", { bubbles: true });
  toastEvent.data = {
    type,
    message,
    extra,
    options,
    id: `toast-${v4()}`,
  };
  document.dispatchEvent(toastEvent);

  const closeEvent = new Event("custom_toast_close", { bubbles: true });
  closeEvent.data = toastEvent.data.id;

  return {
    close: () => document.dispatchEvent(closeEvent),
    update: (text) => {
      const updateEvent = new Event("custom_toast_update", { bubbles: true });
      updateEvent.data = { id: toastEvent.data.id, message: text };
      document.dispatchEvent(updateEvent);
    },
  };
};

export default {
  Toaster,
  debug,
  info,
  warn,
  error,
  success,
  promise,
};
