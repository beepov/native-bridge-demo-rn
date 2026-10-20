
import {
    CameraView,
    useCameraPermissions,
} from "expo-camera";
import { useRef, useState } from "react";
import {
    Alert,
    Button,
    Modal,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    WebView,
    type WebViewMessageEvent,
} from "react-native-webview";

import type {
    BridgeRequest,
    BridgeResponse,
    NativeHandler,
} from "@/bridge/bridge-protocol";
import { dispatchResponse } from "@/bridge/dispatch-response";

const WEBSITE_URL =
    "https://2915-203-147-139-46.ngrok-free.app/test";

export default function WebViewScreen() {
    const webViewRef = useRef<WebView>(null);

    const [sheetVisible, setSheetVisible] = useState(false);
    const [cameraVisible, setCameraVisible] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    const handlers: Record<string, NativeHandler> = {
        "identity.getUser": (payload) => {

            const user = {
                id: "1",
                firstName: "Chea",
                lastName: "Socheat",
                email: "cheasocheat.km@gmail.com"
            }

            console.log(`User: `, user);
            return user;
        },
        "app.alert": (payload) => {
            const data = payload as {
                title?: string;
                message?: string;
            } | undefined;

            Alert.alert(
                data?.title ?? "Notification",
                data?.message ?? ""
            );

            return { shown: true };
        },

        "sheet.open": (payload) => {
            setSheetVisible(true);
            const data = payload as { name?: string } | undefined;
            return {
                opened: true,
                name: data?.name ?? null,
            };
        },

        "sheet.close": () => {
            setSheetVisible(false);
            return { closed: true };
        },

        "camera.open": async () => {
            if (!permission?.granted) {
                const result = await requestPermission();

                if (!result.granted) {
                    throw new Error("Camera permission denied");
                }
            }

            setCameraVisible(true);
            return { opened: true };
        },

        "camera.close": () => {
            setCameraVisible(false);
            return { closed: true };
        },
    };

    async function handleMessage(event: WebViewMessageEvent) {
        console.log(`event: `, event.nativeEvent.data);
        let request: BridgeRequest;

        try {
            request = JSON.parse(event.nativeEvent.data);
        } catch {
            return;
        }

        if (
            request?.type !== "request" ||
            typeof request.id !== "string" ||
            typeof request.name !== "string"
        ) {
            return;
        }

        const handler = handlers[request.name];
        let response: BridgeResponse;

        if (!handler) {
            response = {
                id: request.id,
                type: "response",
                success: false,
                error: `Unknown command: ${request.name}`,
            };
        } else {
            try {
                const data = await handler(request.payload);

                response = {
                    id: request.id,
                    type: "response",
                    success: true,
                    data,
                };
            } catch (error) {
                response = {
                    id: request.id,
                    type: "response",
                    success: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Native action failed",
                };
            }
        }

        if (webViewRef.current) {
            dispatchResponse(webViewRef.current, response);
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <WebView
                ref={webViewRef}
                source={{ uri: WEBSITE_URL }}
                onMessage={handleMessage}
            />
            <Modal
                visible={sheetVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setSheetVisible(false)}
            >
                <View style={styles.backdrop}>
                    <View style={styles.sheet}>
                        <Text style={styles.title}>Guest Information</Text>
                        <Button
                            title="Close"
                            onPress={() => setSheetVisible(false)}
                        />
                    </View>
                </View>
            </Modal>

            <Modal
                visible={cameraVisible}
                animationType="slide"
                onRequestClose={() => setCameraVisible(false)}
            >
                <View style={styles.camera}>
                    <CameraView style={StyleSheet.absoluteFill} />

                    <View style={styles.cameraButton}>
                        <Button
                            title="Close Camera"
                            onPress={() => setCameraVisible(false)}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, width: "100%" },
    backdrop: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "#00000066",
    },
    sheet: {
        backgroundColor: "white",
        padding: 24,
        minHeight: 240,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    title: {
        fontSize: 20,
        marginBottom: 24,
    },
    camera: {
        flex: 1,
        backgroundColor: "black",
    },
    cameraButton: {
        position: "absolute",
        bottom: 50,
        alignSelf: "center",
    },
});

// import { StyleSheet, View } from "react-native";
// import { WebView } from "react-native-webview";

// export default function WebViewScreen() {
//     return (
//         <View style={styles.container}>
//             <WebView
//                 source={{ uri: "https://578c-203-147-139-46.ngrok-free.app/test" }}
//                 style={styles.webview}
//             />
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         width: "100%",
//         height: "100%"
//     },
//     webview: {
//         flex: 1,
//     },
// });