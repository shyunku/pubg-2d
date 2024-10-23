import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JsxUtil from "utils/JsxUtil";
import "./Prompt.scss";
import { uuidv4 } from "utils/Common";

const PromptWrapper = () => {
  const [prompts, setPrompts] = useState([]);

  const onClose = useCallback((id) => {
    setPrompts((prompts) => prompts.map((prompt) => (prompt.id === id ? { ...prompt, visible: false } : prompt)));
    setTimeout(() => {
      setPrompts((prompts) => prompts.filter((prompt) => prompt.id !== id));
    }, 500);
  }, []);

  useEffect(() => {
    const listener = (data) => {
      const promptData = data.data;

      const rawContents = promptData?.contents;
      let contents = rawContents;
      if (!Array.isArray(contents)) {
        if (typeof contents === "string") contents = contents.split("\n");
        else contents = [];
      }

      const promptId = uuidv4();

      setPrompts((prompts) => [
        ...prompts,
        {
          title: promptData?.title,
          options: promptData?.options,
          initialInputs: promptData?.options?.inputs ?? null,
          contents: contents,
          onConfirm: promptData?.options?.onConfirm,
          onCancel: promptData?.options?.onCancel,
          onIgnore: promptData?.options?.onIgnore,
          ignorable: promptData?.options?.ignorable ?? false,
          extraBtns: promptData?.options?.extraBtns ?? [],
          id: promptId,
          visible: false,
        },
      ]);

      setTimeout(() => {
        setPrompts((prompts) =>
          prompts.map((prompt, ind) => (prompt.id === promptId ? { ...prompt, visible: true } : prompt))
        );
      }, 100);
    };
    document.addEventListener("custom_prompt", listener);

    return () => {
      document.removeEventListener("custom_prompt", listener);
    };
  }, []);

  return (
    <div className="prompt-wrapper">
      {prompts.map((prompt, ind) => (
        <Prompt
          key={prompt.id}
          depth={ind}
          id={prompt.id}
          title={prompt.title}
          visible={prompt.visible}
          contents={prompt.contents}
          options={prompt.options}
          initialInputs={prompt.initialInputs}
          onConfirm={prompt.onConfirm}
          onCancel={prompt.onCancel}
          onIgnore={prompt.onIgnore}
          extraBtns={prompt.extraBtns}
          ignorable={prompt.ignorable}
          closer={onClose}
        />
      ))}
    </div>
  );
};

const Prompt = ({
  closer = () => {},
  id = null,
  depth = 0,
  title = "",
  visible = true,
  contents = [],
  options = {},
  onConfirm = null,
  onCancel = null,
  onIgnore = null,
  initialInputs = null,
  extraBtns = [],
  ignorable = false,
}) => {
  const inputRefs = useRef([]);
  const inputs = useMemo(() => {
    const inputs = initialInputs;
    if (!inputs) return [];
    if (!Array.isArray(inputs)) return [inputs];
    return inputs;
  }, [initialInputs]);
  const [inputValues, setInputValues] = useState({});

  const finalize = () => {
    closer(id);
  };

  const tryConfirm = async () => {
    const result = await onConfirm?.(inputValues);
    if (result === false) return;
    finalize();
  };

  const tryCancel = () => {
    onCancel?.();
    finalize();
  };

  const tryIgnore = () => {
    onIgnore?.();
    finalize();
  };

  useEffect(() => {
    const inputs = initialInputs;
    if (inputs) {
      const inputValues = {};
      inputs.forEach((input) => {
        inputValues[input.key] = "";
      });
      setInputValues(inputValues);
    }
  }, [initialInputs]);

  useEffect(() => {
    let focuser = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);

    let keydownListener;
    if (visible) {
      keydownListener = (e) => {
        if (e.key === "Escape") {
          console.log("close");
        }
      };

      document.addEventListener("keydown", keydownListener);
    }

    return () => {
      clearTimeout(focuser);
      if (keydownListener) document.removeEventListener("keydown", keydownListener);
    };
  }, [visible]);

  return (
    <div
      className={
        "custom-prompt-wrapper" +
        JsxUtil.classByCondition(visible, "visible") +
        JsxUtil.classByCondition(!ignorable, "not-ignorable")
      }
      style={{ zIndex: `${2000 + depth}` }}
    >
      <div className="back-panel" onClick={ignorable ? tryIgnore : null}></div>
      <div className={"custom-prompt"}>
        <div className="title">{title}</div>
        {contents.length > 0 && (
          <div className="contents">
            {contents.map((c, ind) => (
              <div className="content" key={ind}>
                {c}
              </div>
            ))}
          </div>
        )}
        <div className="inputs">
          {inputs.map((input, ind) => (
            <input
              ref={(ref) => (inputRefs.current[ind] = ref)}
              type={input.type ?? "text"}
              placeholder={input?.placeholder ?? ""}
              key={input.key ?? ind}
              value={inputValues[input.key]}
              onKeyDown={(e) => {
                if (e.key === "Enter" && ind === inputs.length - 1) {
                  tryConfirm();
                }
              }}
              onChange={(e) => setInputValues((iv) => ({ ...iv, [input.key]: e.target.value }))}
            />
          ))}
        </div>
        <div className="buttons">
          {options?.onConfirm && (
            <div className="button confirm" onClick={tryConfirm}>
              {options.confirmText}
            </div>
          )}
          {options?.onCancel && (
            <div className="button" onClick={tryCancel}>
              {options.cancelText}
            </div>
          )}
          {
            // extra buttons
            extraBtns.map((btn, ind) => {
              return (
                <div
                  className="button"
                  key={ind}
                  onClick={(e) => {
                    finalize();
                    btn?.onClick(e);
                  }}
                  style={btn?.styles ?? {}}
                >
                  {btn.text}
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
};

const DEFAULT_OPTIONS = {
  allowEmptyInputs: false,
  ignorable: true,
  inputs: [],
  confirmText: "확인",
  cancelText: "취소",
  onConfirm: () => {},
  onCancel: null,
  onIgnore: () => {},
  extraBtns: [],
};

/**
 *
 * @param {string?} title represents the title of the prompt
 * @param {string?} contents represents the contents of the prompt
 * @param {Object?} options represents the options of the prompt
 * most of the options are defined above, there are some requirements for the options.inputs
 * It's usually an array of objects of Inputs, and each object should have the following properties:
 * @param {function} options.onConfirm is the function that will be called when the confirm button is clicked
 * @param {Object[]} options.inputs is the array of inputs, which will be used to determine the inputs of the prompt
 * @param {string} options.inputs[].key is the key of the input, which will be used to return the value of the input with mapping
 * @param {string} [options.inputs[].type='text'] is the type of the input, which will be used to determine the type of the input
 * @param {string} [options.inputs[].placeholder=''] is the placeholder of the input, which will be used to determine the placeholder of the input
 */
export const floatPrompt = (title, contents, options = DEFAULT_OPTIONS) => {
  const promptEvent = new Event("custom_prompt", { bubbles: true });
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  promptEvent.data = {
    title,
    contents,
    options: mergedOptions,
  };
  document.dispatchEvent(promptEvent);
};

export default PromptWrapper;
