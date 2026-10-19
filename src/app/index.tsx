import { StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import WebViewScreen from "./WebViewScreen";

export default function Index() {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={[styles.container]}>
      <WebViewScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
});
