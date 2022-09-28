/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/no-internal-modules */
import * as BABYLON from "../index.js";
import * as DebugImport from "../Debug/index.js";
/**
 * Legacy support, defining window.BABYLON (global variable).
 *
 * This is the entry point for the UMD module.
 * The entry point for a future ESM package should be index.ts
 */
var globalObject = typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : undefined;
if (typeof globalObject !== "undefined") {
    globalObject.BABYLON = globalObject.BABYLON || {};
    var BABYLONGLOBAL = globalObject.BABYLON;
    BABYLONGLOBAL.Debug = BABYLONGLOBAL.Debug || {};
    var keys = [];
    for (var key in DebugImport) {
        BABYLONGLOBAL.Debug[key] = DebugImport[key];
        keys.push(key);
    }
    for (var key in BABYLON) {
        BABYLONGLOBAL[key] = BABYLON[key];
    }
}
export * from "../index.js";
export var Debug = {
    AxesViewer: BABYLON.AxesViewer,
    BoneAxesViewer: BABYLON.BoneAxesViewer,
    PhysicsViewer: BABYLON.PhysicsViewer,
    SkeletonViewer: BABYLON.SkeletonViewer
};
//# sourceMappingURL=legacy.js.map