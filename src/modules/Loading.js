import { useEffect, useMemo, useState } from "react";
import { ColorRing } from "react-loader-spinner";
import JsxUtil from "utils/JsxUtil";
import { v4 } from "uuid";
import "./Loading.scss";

const loadingColors = Array(5).fill(`rgb(100, 150, 220)`);

export const Loading = () => {
  const [loadings, setLoadings] = useState({});
  const loadingLists = useMemo(() => Object.values(loadings), [loadings]);
  const visible = useMemo(() => loadingLists.length > 0, [loadingLists]);

  useEffect(() => {
    const listener = (e) => {
      const loadingData = e.data;
      const { text, promise, id } = loadingData;
      const loading = { text, promise, id };

      setLoadings((loadings) => ({ ...loadings, [id]: loading }));
      if (promise != null) {
        promise
          .finally(() => {
            setLoadings((loadings) => {
              const newLoadings = { ...loadings };
              delete newLoadings[id];
              return newLoadings;
            });
          })
          .catch(() => {});
      }
    };
    const cancelListener = (e) => {
      const id = e.data;
      setLoadings((loadings) => {
        const newLoadings = { ...loadings };
        delete newLoadings[id];
        return newLoadings;
      });
    };
    document.addEventListener("custom_loading", listener);
    document.addEventListener("custom_loading_cancel", cancelListener);
    return () => {
      document.removeEventListener("custom_loading", listener);
      document.removeEventListener("custom_loading_cancel", cancelListener);
    };
  }, [loadings]);

  return (
    <div className={"custom-loading-wrapper" + JsxUtil.classByCondition(visible, "visible")}>
      {visible && (
        <div className="custom-loading">
          <div className="loading-wrapper">
            <ColorRing colors={loadingColors} />
          </div>
          <div className="loading-text">{loadingLists?.[0]?.text ?? "작업 마무리 중..."}</div>
          {loadingLists.length > 1 && <div className="loading-multiple-tasks">외 {loadingLists.length - 1}개 작업</div>}
        </div>
      )}
    </div>
  );
};

export const floatLoadingAsync = async (text = "loading...", promise) => {
  if (!(promise instanceof Promise)) {
    throw new Error("Promise is required");
  }
  if (text == null || typeof text !== "string" || text.length === 0) {
    throw new Error("Text is not valid");
  }

  const loadingEvent = new Event("custom_loading", { bubbles: true });
  loadingEvent.data = {
    text,
    promise,
    id: v4(),
  };
  document.dispatchEvent(loadingEvent);

  return promise;
};

/**
 *
 * @param {string} text
 * @returns {Function}
 */
export const floatLoading = (text = "loading...") => {
  if (text == null || typeof text !== "string" || text.length === 0) {
    throw new Error("Text is not valid");
  }

  const loadingEvent = new Event("custom_loading", { bubbles: true });
  const cancelEvent = new Event("custom_loading_cancel", { bubbles: true });

  loadingEvent.data = {
    text,
    promise: null,
    id: v4(),
  };
  cancelEvent.data = loadingEvent.data.id;
  document.dispatchEvent(loadingEvent);

  return () => {
    document.dispatchEvent(cancelEvent);
  };
};
