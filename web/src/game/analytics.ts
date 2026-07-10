declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

let gaInitialized = false;

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
  if (!gaInitialized || !window.gtag) return;
  try {
    window.gtag("event", eventName, params);
  } catch (error) {
    console.error(`Failed to track GA event ${eventName}:`, error);
  }
}
