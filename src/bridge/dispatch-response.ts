import type { WebView } from "react-native-webview";
import type { BridgeResponse } from "./bridge-protocol";

export function dispatchResponse(
    webView: WebView,
    response: BridgeResponse
) {
    // Encode the entire JSON string as a JavaScript string literal.
    const encoded = JSON.stringify(JSON.stringify(response));

    webView.injectJavaScript(`
        (() => {
            const response = JSON.parse(${encoded});
            window.dispatchEvent(
                new CustomEvent("__native_bridge_response__", {
                    detail: response
                })
            );
            return true;
        })();
    `);
}