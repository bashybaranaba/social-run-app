import Constants from "expo-constants";
import { Platform } from "react-native";
import {
  GoogleOneTapSignIn, isNoSavedCredentialFoundResponse, isSuccessResponse
} from "react-native-nitro-google-signin";

let configured = false;
export const googleSignInAvailable = !!Constants.expoConfig?.extra?.googleWebClientId;

export async function googleIdToken(): Promise<string | null> {
  const webClientId = Constants.expoConfig?.extra?.googleWebClientId as string | undefined;
  if (!webClientId) throw new Error("Google sign-in is not configured in this app build");
  if (!configured) {
    GoogleOneTapSignIn.configure({ webClientId });
    configured = true;
  }
  if (Platform.OS === "android") await GoogleOneTapSignIn.checkPlayServices();
  let response = await GoogleOneTapSignIn.signIn();
  if (isNoSavedCredentialFoundResponse(response)) response = await GoogleOneTapSignIn.createAccount();
  if (isNoSavedCredentialFoundResponse(response)) response = await GoogleOneTapSignIn.presentExplicitSignIn();
  if (!isSuccessResponse(response)) return null;
  if (!response.data.idToken) throw new Error("Google did not return an identity token");
  return response.data.idToken;
}
