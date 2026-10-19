export type BridgeRequest = {
    id: string;
    type: "request";
    name: string;
    payload?: unknown;
};

export type BridgeResponse = {
    id: string;
    type: "response";
    success: boolean;
    data?: unknown;
    error?: string;
};

export type NativeHandler = (
    payload: unknown
) => unknown | Promise<unknown>;