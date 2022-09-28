declare module "../../Engines/thinEngine" {
    interface ThinEngine {
        /** @hidden */
        _debugPushGroup(groupName: string, targetObject?: number): void;
        /** @hidden */
        _debugPopGroup(targetObject?: number): void;
        /** @hidden */
        _debugInsertMarker(text: string, targetObject?: number): void;
        /** @hidden */
        _debugFlushPendingCommands(): void;
    }
}
export {};
