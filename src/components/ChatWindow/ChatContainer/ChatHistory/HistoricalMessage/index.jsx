import React, { memo, forwardRef } from "react";
import { Warning, User } from "@phosphor-icons/react";
import renderMarkdown from "@/utils/chat/markdown";
import { v4 } from "uuid";
import createDOMPurify from "dompurify";
import chataiIcon from "@/assets/chatai-icon.png";
import { formatDate } from "@/utils/date";

const DOMPurify = createDOMPurify(window);
const HistoricalMessage = forwardRef(
  (
    {
      uuid = v4(),
      message,
      role,
      sources = [],
      error = false,
      errorMsg = null,
      sentAt,
      settings,
    },
    ref
  ) => {
    const textSize = !!settings.textSize
      ? `allm-text-[${settings.textSize}px]`
      : "allm-text-sm";
    if (error) console.error(`ANYTHING_LLM_CHAT_WIDGET_ERROR: ${error}`);

    return (
      <div className="allm-py-[5px]">
        {role === "assistant" && (
          <div
            className={`allm-text-[10px] allm-text-gray-400 allm-ml-[54px] allm-mr-6 allm-mb-2 allm-text-left allm-font-sans`}
          >
            {settings.assistantName || "Anything LLM Chat Assistant"}
          </div>
        )}
        <div
          key={uuid}
          ref={ref}
          className={`allm-flex allm-items-start allm-w-full allm-h-fit ${
            role === "user" ? "allm-justify-end" : "allm-justify-start"
          }`}
        >
          {role === "assistant" && (
            <img
              src={settings.assistantIcon || chataiIcon}
              alt="Assistant Icon"
              className="allm-w-9 allm-h-9 allm-flex-shrink-0 allm-ml-2 allm-mt-2"
              id="anything-llm-icon"
            />
          )}
          <div
            style={{
              wordBreak: "break-word",
              backgroundColor:
                role === "user"
                  ? settings.userBgColor
                  : settings.assistantBgColor,
            }}
            className={`allm-py-[11px] allm-px-4 allm-flex allm-flex-col allm-font-sans allm-mx-2 ${
              error
                ? "allm-bg-red-200 allm-rounded-[20px] allm-mr-[37px] allm-ml-[9px]"
                : role === "user"
                ? `${settings.userBgColor} allm-anything-llm-user-message allm-rounded-[20px_20px_0_20px]`
                : `${settings.assistantBgColor} allm-anything-llm-assistant-message allm-rounded-[20px_20px_20px_0]`
            } allm-shadow-[0_4px_14px_rgba(0,0,0,0.15)]`}
          >
            <div className="allm-flex">
              {error ? (
                <div className="allm-p-2 allm-rounded-lg allm-bg-red-50 allm-text-red-500">
                  <span className={`allm-inline-block`}>
                    <Warning className="allm-h-4 allm-w-4 allm-mb-1 allm-inline-block" />{" "}
                    Could not respond to message.
                  </span>
                  <p className="allm-text-xs allm-font-mono allm-mt-2 allm-border-l-2 allm-border-red-500 allm-pl-2 allm-bg-red-300 allm-p-2 allm-rounded-sm">
                    {errorMsg || "Server error"}
                  </p>
                </div>
              ) : (
                <span
                  className={`allm-whitespace-pre-line allm-flex allm-flex-col allm-gap-y-1 ${textSize} allm-leading-[20px]`}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(renderMarkdown(message)),
                  }}
                />
              )}
            </div>
          </div>
          {role === "user" && (
            <div className="allm-w-9 allm-h-9 allm-flex-shrink-0 allm-mr-2 allm-mt-2 allm-flex allm-items-center allm-justify-center allm-bg-blue-500 allm-rounded-full allm-shadow-md">
              <User 
                className="allm-text-white" 
                weight="fill" 
                size={24} 
                alt="User Icon"
              />
            </div>
          )}
        </div>
        {sentAt && (
          <div
            className={`allm-font-sans allm-text-[10px] allm-text-gray-400 allm-ml-[54px] allm-mr-6 allm-mt-2 ${
              role === "user" ? "allm-text-right" : "allm-text-left"
            }`}
          >
            {formatDate(sentAt)}
          </div>
        )}
      </div>
    );
  }
);

export default memo(HistoricalMessage);