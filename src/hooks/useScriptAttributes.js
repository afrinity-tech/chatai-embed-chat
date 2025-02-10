import { useEffect, useState } from "react";
import { embedderSettings } from "../main";

const HARDCODED_BEARER_TOKEN = '5VB9RNY-HNMM6FN-MRAVBXG-K4B69J7'; // Replace with your actual token

const DEFAULT_SETTINGS = {
  embedId: null,
  baseApiUrl: null,
  bearerToken: null,
  prompt: null,
  model: null,
  temperature: null,
  chatIcon: "plus",
  brandImageUrl: null,
  greeting: null,
  buttonColor: "#262626",
  userBgColor: "#2C2F35",
  assistantBgColor: "#2563eb",
  noSponsor: null,
  sponsorText: "Powered by AnythingLLM",
  sponsorLink: "https://anythingllm.com",
  position: "bottom-right",
  assistantName: "AnythingLLM Chat Assistant",
  assistantIcon: null,
  windowHeight: null,
  windowWidth: null,
  textSize: null,
  openOnLoad: "off",
  supportEmail: null,
  username: null,
  defaultMessages: [],
};

export default function useGetScriptAttributes() {
  const [settings, setSettings] = useState({
    loaded: false,
    ...DEFAULT_SETTINGS,
  });

  useEffect(() => {
    async function fetchAttribs() {
      if (!document) return false;

      let { baseApiUrl, embedId, bearerToken } = embedderSettings.settings;
      bearerToken = bearerToken || HARDCODED_BEARER_TOKEN;

      if (!baseApiUrl || !embedId || !bearerToken) {
        console.error(
          "[AnythingLLM Embed Module::Abort] - Invalid script tag setup detected. Missing required parameters for boot!"
        );
        setSettings({ ...DEFAULT_SETTINGS, loaded: true });
        return;
      }

      try {

        const apiBase = baseApiUrl.endsWith("/embed")
        ? baseApiUrl.slice(0, -"/embed".length)
        : baseApiUrl;
        const apiUrl = `${apiBase}/v1/embed/${embedId}`; // Still use embedId from the script tag for the API call
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${bearerToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const apiSettings = data.embed;

        // Map API's 'uuid' to our internal 'embedId', and prioritize script tag embedId
        const correctedEmbedId = embedderSettings.settings.embedId || apiSettings.uuid;

       // Explicitly map and merge settings
        const mappedSettings = {
          ...DEFAULT_SETTINGS,
          // Prioritize script-tag defined settings.
          ...embedderSettings.settings,
          // Override with API values where available.
          embedId: correctedEmbedId, // Use the corrected embedId
          prompt: apiSettings.prompt !== undefined ? apiSettings.prompt : embedderSettings.settings.prompt,
          model: apiSettings.model !== undefined ? apiSettings.model : embedderSettings.settings.model,
          temperature: apiSettings.temperature !== undefined ? apiSettings.temperature : embedderSettings.settings.temperature,
          chatIcon: apiSettings.chatIcon !== undefined ? apiSettings.chatIcon : embedderSettings.settings.chatIcon,
          brandImageUrl: apiSettings.brandImageUrl !== undefined ? apiSettings.brandImageUrl : embedderSettings.settings.brandImageUrl,
          greeting: apiSettings.greeting !== undefined ? apiSettings.greeting : embedderSettings.settings.greeting,
          buttonColor: apiSettings.buttonColor !== undefined ? apiSettings.buttonColor : embedderSettings.settings.buttonColor,
          userBgColor: apiSettings.userBgColor !== undefined ? apiSettings.userBgColor : embedderSettings.settings.userBgColor,
          assistantBgColor: apiSettings.assistantBgColor !== undefined ? apiSettings.assistantBgColor : embedderSettings.settings.assistantBgColor,
          noSponsor: apiSettings.noSponsor !== undefined ? apiSettings.noSponsor : embedderSettings.settings.noSponsor,
          sponsorText: apiSettings.sponsorText !== undefined ? apiSettings.sponsorText : embedderSettings.settings.sponsorText,
          sponsorLink: apiSettings.sponsorLink !== undefined ? apiSettings.sponsorLink : embedderSettings.settings.sponsorLink,
          position: apiSettings.position !== undefined ? apiSettings.position : embedderSettings.settings.position,
          assistantName: apiSettings.assistantName !== undefined ? apiSettings.assistantName : embedderSettings.settings.assistantName,
          assistantIcon: apiSettings.assistantIcon !== undefined ? apiSettings.assistantIcon : embedderSettings.settings.assistantIcon,
          windowHeight: apiSettings.windowHeight !== undefined ? apiSettings.windowHeight : embedderSettings.settings.windowHeight,
          windowWidth: apiSettings.windowWidth !== undefined ? apiSettings.windowWidth : embedderSettings.settings.windowWidth,
          textSize: apiSettings.textSize !== undefined ? apiSettings.textSize : embedderSettings.settings.textSize,
          openOnLoad: apiSettings.openOnLoad !== undefined ? apiSettings.openOnLoad : embedderSettings.settings.openOnLoad,
          supportEmail: apiSettings.supportEmail !== undefined ? apiSettings.supportEmail : embedderSettings.settings.supportEmail,
          username: apiSettings.username !== undefined ? apiSettings.username : embedderSettings.settings.username,
          defaultMessages: apiSettings.defaultMessages !== undefined ? apiSettings.defaultMessages : embedderSettings.settings.defaultMessages,
          bearerToken, // Always use the determined bearerToken
        };



        // Apply validations
        const validatedSettings = parseAndValidateEmbedSettings(mappedSettings);
        setSettings({ ...validatedSettings, loaded: true });

      } catch (error) {
        console.error("[AnythingLLM Embed Module::Error] - Failed to fetch embed settings:", error);
        setSettings({
          ...DEFAULT_SETTINGS,
          ...embedderSettings.settings, //Keep script tag
          bearerToken,
          loaded: true,
        });
      }
    }

    fetchAttribs();
  }, [document]);

  return settings;
}



const validations = {
  _fallbacks: {
    defaultMessages: [],
  },

  defaultMessages: function (value = null) {
    if (typeof value !== "string" && !Array.isArray(value)) return this._fallbacks.defaultMessages;

    if (typeof value === "string") {
        try {
            const list = value.split(",");
            if (
                !Array.isArray(list) ||
                list.length === 0 ||
                !list.every((v) => typeof v === 'string' && v.length > 0)
            )
                throw new Error(
                    "Invalid default-messages attribute value. Must be array of strings"
                );
            return list.map((v) => v.trim());
        } catch (e) {
            console.error("AnythingLLMEmbed", e);
            return this._fallbacks.defaultMessages;
        }
    }

    // already an array, do a basic type check
    if (value.every((v) => typeof v === 'string')) return value;

    console.error("AnythingLLMEmbed: defaultMessages must be an array of strings or a single comma-separated string")
    return this._fallbacks.defaultMessages;
  },
};

function parseAndValidateEmbedSettings(settings = {}) {
  const validated = {};
  for (let [key, value] of Object.entries(settings)) {
    if (!validations.hasOwnProperty(key)) {
      validated[key] = value;
      continue;
    }

    const validatedValue = validations[key](value);
    validated[key] = validatedValue;
  }

  return validated;
}