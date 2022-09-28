import { Engine } from "./engine.js";
import { NullEngine } from "./nullEngine.js";
import { WebGPUEngine } from "./webgpuEngine.js";
/**
 * Helper class to create the best engine depending on the current hardware
 */
var EngineFactory = /** @class */ (function () {
    function EngineFactory() {
    }
    /**
     * Creates an engine based on the capabilities of the underlying hardware
     * @param canvas Defines the canvas to use to display the result
     * @param options Defines the options passed to the engine to create the context dependencies
     * @returns a promise that resolves with the created engine
     */
    EngineFactory.CreateAsync = function (canvas, options) {
        return WebGPUEngine.IsSupportedAsync.then(function (supported) {
            if (supported) {
                return WebGPUEngine.CreateAsync(canvas, options);
            }
            else if (Engine.IsSupported) {
                return new Promise(function (resolve) {
                    resolve(new Engine(canvas, undefined, options));
                });
            }
            return new Promise(function (resolve) {
                resolve(new NullEngine(options));
            });
        });
    };
    return EngineFactory;
}());
export { EngineFactory };
//# sourceMappingURL=engineFactory.js.map