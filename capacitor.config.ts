import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native packaging config — the whole cryOS session (phone launcher and,
 * on tablets/foldables in wide mode, the CryLinux desktop) ships as one
 * installable app. Names frozen per CryBel.
 */
const config: CapacitorConfig = {
  appId: "os.cryos.crydroid",
  appName: "cryOS",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      // hand over quickly to the web boot sequence (the real splash)
      launchShowDuration: 300,
      launchAutoHide: true,
      backgroundColor: "#050b14",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
