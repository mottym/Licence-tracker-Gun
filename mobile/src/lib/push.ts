import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerPushTokenForUser(userId: string): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Renewal reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: "#0f172a",
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    process.env.EAS_PROJECT_ID ??
    Constants.easConfig?.projectId;

  let token: string;
  try {
    const result = await Notifications.getExpoPushTokenAsync({ projectId });
    token = result.data;
  } catch (error) {
    console.warn("Could not get Expo push token", error);
    return null;
  }

  const platform = Platform.OS === "android" ? "android" : "ios";
  await supabase
    .from("expo_push_tokens")
    .upsert(
      {
        user_id: userId,
        token,
        platform,
        device_name: Device.deviceName ?? Device.modelName ?? null,
      },
      { onConflict: "user_id,token" },
    );

  return token;
}
