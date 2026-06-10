const androidGoogleMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY ?? "";
const iosGoogleMapsApiKey = process.env.GOOGLE_MAPS_IOS_API_KEY ?? "";

module.exports = {
  expo: {
    name: "Compre & Ganhe 013",
    slug: "compre-ganhe-013",
    scheme: "compre-ganhe-013",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    plugins: ["expo-system-ui"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.gusthenrr.compre-ganhe-013",
      userInterfaceStyle: "automatic",
      config: {
        googleMapsApiKey: iosGoogleMapsApiKey,
      },
    },
    android: {
      package: "com.gusthenrr.compre_ganhe_013",
      userInterfaceStyle: "automatic",
      adaptiveIcon: {
        backgroundColor: "#06234F",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
      config: {
        googleMaps: {
          apiKey: androidGoogleMapsApiKey,
        },
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },
    extra: {
      eas: {
        projectId: "5afd926a-158e-473c-ba16-3acefab09be9",
      },
    },
  },
};
