declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

let gaInitialized = false;

const ANALYTICS_SCHEMA: Record<string, Record<string, "string" | "number" | "boolean" | "object">> = {
  discovery: {
    recipe_id: "string",
    recipe_name: "string",
    discovered_items: "object", // Array of strings is an object in typeof
    technique: "string" // It can be undefined, we'll handle optionality
  },
  xp_gain: {
    track_id: "string",
    amount: "number"
  },
  level_up: {
    track_id: "string",
    unlocked_skill: "string"
  },
  milestone_unlocked: {
    milestone_id: "string" // We might want to adjust milestone parameter type based on usage. Let's start with string
  }
};

// Optional parameters (which might be missing)
const OPTIONAL_PARAMS: Record<string, string[]> = {
  discovery: ["technique"]
};

/** Initialize Google Analytics dynamically using VITE_GA_MEASUREMENT_ID environmental variable. */
export function initGoogleAnalytics(): void {
  if (gaInitialized) return;

  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-MEASUREMENT_ID";

  if (!measurementId || measurementId === "G-MEASUREMENT_ID") {
    console.log("Google Analytics measurement ID not configured. Set VITE_GA_MEASUREMENT_ID in your env to track metrics.");
    return;
  }

  try {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      send_page_view: true,
      cookie_flags: "SameSite=None;Secure"
    });

    gaInitialized = true;
    console.log(`Google Analytics initialized with ID: ${measurementId}`);
  } catch (error) {
    console.error("Failed to initialize Google Analytics:", error);
  }
}

/** Track custom gameplay event to Google Analytics. */
export function trackAnalyticsEvent(eventName: string, params: Record<string, any> = {}): void {
  if (import.meta.env.DEV) {
    const schema = ANALYTICS_SCHEMA[eventName];
    const optionalParams = OPTIONAL_PARAMS[eventName] || [];

    if (!schema) {
      console.warn(`[Analytics Warning] Unknown event tracked: '${eventName}'`);
    } else {
      // Check for missing required parameters
      for (const expectedKey of Object.keys(schema)) {
        if (!(expectedKey in params) && !optionalParams.includes(expectedKey)) {
          console.warn(`[Analytics Warning] Missing required parameter '${expectedKey}' for event '${eventName}'`);
        }
      }

      for (const [key, value] of Object.entries(params)) {
        if (value === undefined) continue; // Optional fields are allowed to be undefined

        const expectedType = schema[key];
        if (!expectedType) {
          console.warn(`[Analytics Warning] Unknown parameter '${key}' for event '${eventName}'`);
        } else {
          // Special handling for array
          const actualType = typeof value;
          if (actualType !== expectedType) {
            console.warn(`[Analytics Warning] Type mismatch for parameter '${key}' in event '${eventName}'. Expected ${expectedType}, got ${actualType}`);
          }
        }
      }
    }
  }

  if (!gaInitialized || !window.gtag) return;
  try {
    window.gtag("event", eventName, params);
  } catch (error) {
    console.error(`Failed to track GA event ${eventName}:`, error);
  }
}
