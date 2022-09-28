import { EngineInstrumentation } from "../../Instrumentation/engineInstrumentation.js";
import { PrecisionDate } from "../precisionDate.js";
import { SceneInstrumentation } from "../../Instrumentation/sceneInstrumentation.js";
// Dispose which does nothing.
var defaultDisposeImpl = function () { };
/**
 * Defines the predefined strategies used in the performance viewer.
 */
var PerfCollectionStrategy = /** @class */ (function () {
    function PerfCollectionStrategy() {
    }
    /**
     * Gets the initializer for the strategy used for collection of fps metrics
     * @returns the initializer for the fps strategy
     */
    PerfCollectionStrategy.FpsStrategy = function () {
        return function (scene) {
            var engine = scene.getEngine();
            return {
                id: "FPS",
                getData: function () { return engine.getFps(); },
                dispose: defaultDisposeImpl,
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of cpu utilization metrics.
     * Needs the experimental compute pressure API.
     * @returns the initializer for the cpu utilization strategy
     */
    PerfCollectionStrategy.CpuStrategy = function () {
        return function (scene) {
            var value = 0;
            var computePressureObserver = scene.onComputePressureChanged.add(function (update) {
                value = update.cpuUtilization;
            });
            return {
                id: "CPU utilization",
                getData: function () { return value; },
                dispose: function () { return scene.onComputePressureChanged.remove(computePressureObserver); },
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of total meshes metrics.
     * @returns the initializer for the total meshes strategy
     */
    PerfCollectionStrategy.TotalMeshesStrategy = function () {
        return function (scene) {
            return {
                id: "Total meshes",
                getData: function () { return scene.meshes.length; },
                dispose: defaultDisposeImpl,
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of active meshes metrics.
     * @returns the initializer for the active meshes strategy
     */
    PerfCollectionStrategy.ActiveMeshesStrategy = function () {
        return function (scene) {
            return {
                id: "Active meshes",
                getData: function () { return scene.getActiveMeshes().length; },
                dispose: defaultDisposeImpl,
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of active indices metrics.
     * @returns the initializer for the active indices strategy
     */
    PerfCollectionStrategy.ActiveIndicesStrategy = function () {
        return function (scene) {
            return {
                id: "Active indices",
                getData: function () { return scene.getActiveIndices(); },
                dispose: defaultDisposeImpl,
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of active faces metrics.
     * @returns the initializer for the active faces strategy
     */
    PerfCollectionStrategy.ActiveFacesStrategy = function () {
        return function (scene) {
            return {
                id: "Active faces",
                getData: function () { return scene.getActiveIndices() / 3; },
                dispose: defaultDisposeImpl,
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of active bones metrics.
     * @returns the initializer for the active bones strategy
     */
    PerfCollectionStrategy.ActiveBonesStrategy = function () {
        return function (scene) {
            return {
                id: "Active bones",
                getData: function () { return scene.getActiveBones(); },
                dispose: defaultDisposeImpl,
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of active particles metrics.
     * @returns the initializer for the active particles strategy
     */
    PerfCollectionStrategy.ActiveParticlesStrategy = function () {
        return function (scene) {
            return {
                id: "Active particles",
                getData: function () { return scene.getActiveParticles(); },
                dispose: defaultDisposeImpl,
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of draw calls metrics.
     * @returns the initializer for the draw calls strategy
     */
    PerfCollectionStrategy.DrawCallsStrategy = function () {
        return function (scene) {
            var drawCalls = 0;
            var onBeforeAnimationsObserver = scene.onBeforeAnimationsObservable.add(function () {
                scene.getEngine()._drawCalls.fetchNewFrame();
            });
            var onAfterRenderObserver = scene.onAfterRenderObservable.add(function () {
                drawCalls = scene.getEngine()._drawCalls.current;
            });
            return {
                id: "Draw calls",
                getData: function () { return drawCalls; },
                dispose: function () {
                    scene.onBeforeAnimationsObservable.remove(onBeforeAnimationsObserver);
                    scene.onAfterRenderObservable.remove(onAfterRenderObserver);
                },
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of total lights metrics.
     * @returns the initializer for the total lights strategy
     */
    PerfCollectionStrategy.TotalLightsStrategy = function () {
        return function (scene) {
            return {
                id: "Total lights",
                getData: function () { return scene.lights.length; },
                dispose: defaultDisposeImpl,
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of total vertices metrics.
     * @returns the initializer for the total vertices strategy
     */
    PerfCollectionStrategy.TotalVerticesStrategy = function () {
        return function (scene) {
            return {
                id: "Total vertices",
                getData: function () { return scene.getTotalVertices(); },
                dispose: defaultDisposeImpl,
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of total materials metrics.
     * @returns the initializer for the total materials strategy
     */
    PerfCollectionStrategy.TotalMaterialsStrategy = function () {
        return function (scene) {
            return {
                id: "Total materials",
                getData: function () { return scene.materials.length; },
                dispose: defaultDisposeImpl,
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of total textures metrics.
     * @returns the initializer for the total textures strategy
     */
    PerfCollectionStrategy.TotalTexturesStrategy = function () {
        return function (scene) {
            return {
                id: "Total textures",
                getData: function () { return scene.textures.length; },
                dispose: defaultDisposeImpl,
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of absolute fps metrics.
     * @returns the initializer for the absolute fps strategy
     */
    PerfCollectionStrategy.AbsoluteFpsStrategy = function () {
        return function (scene) {
            var sceneInstrumentation = new SceneInstrumentation(scene);
            sceneInstrumentation.captureFrameTime = true;
            return {
                id: "Absolute FPS",
                getData: function () {
                    return 1000.0 / sceneInstrumentation.frameTimeCounter.lastSecAverage;
                },
                dispose: defaultDisposeImpl,
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of meshes selection time metrics.
     * @returns the initializer for the meshes selection time strategy
     */
    PerfCollectionStrategy.MeshesSelectionStrategy = function () {
        return function (scene) {
            var startTime = PrecisionDate.Now;
            var timeTaken = 0;
            var onBeforeActiveMeshesObserver = scene.onBeforeActiveMeshesEvaluationObservable.add(function () {
                startTime = PrecisionDate.Now;
            });
            var onAfterActiveMeshesObserver = scene.onAfterActiveMeshesEvaluationObservable.add(function () {
                timeTaken = PrecisionDate.Now - startTime;
            });
            return {
                id: "Meshes Selection",
                getData: function () { return timeTaken; },
                dispose: function () {
                    scene.onBeforeActiveMeshesEvaluationObservable.remove(onBeforeActiveMeshesObserver);
                    scene.onAfterActiveMeshesEvaluationObservable.remove(onAfterActiveMeshesObserver);
                },
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of render targets time metrics.
     * @returns the initializer for the render targets time strategy
     */
    PerfCollectionStrategy.RenderTargetsStrategy = function () {
        return function (scene) {
            var startTime = PrecisionDate.Now;
            var timeTaken = 0;
            var onBeforeRenderTargetsObserver = scene.onBeforeRenderTargetsRenderObservable.add(function () {
                startTime = PrecisionDate.Now;
            });
            var onAfterRenderTargetsObserver = scene.onAfterRenderTargetsRenderObservable.add(function () {
                timeTaken = PrecisionDate.Now - startTime;
            });
            return {
                id: "Render Targets",
                getData: function () { return timeTaken; },
                dispose: function () {
                    scene.onBeforeRenderTargetsRenderObservable.remove(onBeforeRenderTargetsObserver);
                    scene.onAfterRenderTargetsRenderObservable.remove(onAfterRenderTargetsObserver);
                },
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of particles time metrics.
     * @returns the initializer for the particles time strategy
     */
    PerfCollectionStrategy.ParticlesStrategy = function () {
        return function (scene) {
            var startTime = PrecisionDate.Now;
            var timeTaken = 0;
            var onBeforeParticlesObserver = scene.onBeforeParticlesRenderingObservable.add(function () {
                startTime = PrecisionDate.Now;
            });
            var onAfterParticlesObserver = scene.onAfterParticlesRenderingObservable.add(function () {
                timeTaken = PrecisionDate.Now - startTime;
            });
            return {
                id: "Particles",
                getData: function () { return timeTaken; },
                dispose: function () {
                    scene.onBeforeParticlesRenderingObservable.remove(onBeforeParticlesObserver);
                    scene.onAfterParticlesRenderingObservable.remove(onAfterParticlesObserver);
                },
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of sprites time metrics.
     * @returns the initializer for the sprites time strategy
     */
    PerfCollectionStrategy.SpritesStrategy = function () {
        return function (scene) {
            var _a, _b;
            var startTime = PrecisionDate.Now;
            var timeTaken = 0;
            var onBeforeSpritesObserver = (_a = scene.onBeforeSpritesRenderingObservable) === null || _a === void 0 ? void 0 : _a.add(function () {
                startTime = PrecisionDate.Now;
            });
            var onAfterSpritesObserver = (_b = scene.onAfterSpritesRenderingObservable) === null || _b === void 0 ? void 0 : _b.add(function () {
                timeTaken = PrecisionDate.Now - startTime;
            });
            return {
                id: "Sprites",
                getData: function () { return timeTaken; },
                dispose: function () {
                    var _a, _b;
                    (_a = scene.onBeforeSpritesRenderingObservable) === null || _a === void 0 ? void 0 : _a.remove(onBeforeSpritesObserver);
                    (_b = scene.onAfterSpritesRenderingObservable) === null || _b === void 0 ? void 0 : _b.remove(onAfterSpritesObserver);
                },
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of animations time metrics.
     * @returns the initializer for the animations time strategy
     */
    PerfCollectionStrategy.AnimationsStrategy = function () {
        return function (scene) {
            var startTime = PrecisionDate.Now;
            var timeTaken = 0;
            var onBeforeAnimationsObserver = scene.onBeforeAnimationsObservable.add(function () {
                startTime = PrecisionDate.Now;
            });
            var onAfterAnimationsObserver = scene.onAfterAnimationsObservable.add(function () {
                timeTaken = PrecisionDate.Now - startTime;
            });
            return {
                id: "Animations",
                getData: function () { return timeTaken; },
                dispose: function () {
                    scene.onBeforeAnimationsObservable.remove(onBeforeAnimationsObserver);
                    scene.onAfterAnimationsObservable.remove(onAfterAnimationsObserver);
                },
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of physics time metrics.
     * @returns the initializer for the physics time strategy
     */
    PerfCollectionStrategy.PhysicsStrategy = function () {
        return function (scene) {
            var _a, _b;
            var startTime = PrecisionDate.Now;
            var timeTaken = 0;
            var onBeforePhysicsObserver = (_a = scene.onBeforePhysicsObservable) === null || _a === void 0 ? void 0 : _a.add(function () {
                startTime = PrecisionDate.Now;
            });
            var onAfterPhysicsObserver = (_b = scene.onAfterPhysicsObservable) === null || _b === void 0 ? void 0 : _b.add(function () {
                timeTaken = PrecisionDate.Now - startTime;
            });
            return {
                id: "Physics",
                getData: function () { return timeTaken; },
                dispose: function () {
                    var _a, _b;
                    (_a = scene.onBeforePhysicsObservable) === null || _a === void 0 ? void 0 : _a.remove(onBeforePhysicsObserver);
                    (_b = scene.onAfterPhysicsObservable) === null || _b === void 0 ? void 0 : _b.remove(onAfterPhysicsObserver);
                },
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of render time metrics.
     * @returns the initializer for the render time strategy
     */
    PerfCollectionStrategy.RenderStrategy = function () {
        return function (scene) {
            var startTime = PrecisionDate.Now;
            var timeTaken = 0;
            var onBeforeDrawPhaseObserver = scene.onBeforeDrawPhaseObservable.add(function () {
                startTime = PrecisionDate.Now;
            });
            var onAfterDrawPhaseObserver = scene.onAfterDrawPhaseObservable.add(function () {
                timeTaken = PrecisionDate.Now - startTime;
            });
            return {
                id: "Render",
                getData: function () { return timeTaken; },
                dispose: function () {
                    scene.onBeforeDrawPhaseObservable.remove(onBeforeDrawPhaseObserver);
                    scene.onAfterDrawPhaseObservable.remove(onAfterDrawPhaseObserver);
                },
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of total frame time metrics.
     * @returns the initializer for the total frame time strategy
     */
    PerfCollectionStrategy.FrameTotalStrategy = function () {
        return function (scene) {
            var startTime = PrecisionDate.Now;
            var timeTaken = 0;
            var onBeforeAnimationsObserver = scene.onBeforeAnimationsObservable.add(function () {
                startTime = PrecisionDate.Now;
            });
            var onAfterRenderObserver = scene.onAfterRenderObservable.add(function () {
                timeTaken = PrecisionDate.Now - startTime;
            });
            return {
                id: "Frame Total",
                getData: function () { return timeTaken; },
                dispose: function () {
                    scene.onBeforeAnimationsObservable.remove(onBeforeAnimationsObserver);
                    scene.onAfterRenderObservable.remove(onAfterRenderObserver);
                },
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of inter-frame time metrics.
     * @returns the initializer for the inter-frame time strategy
     */
    PerfCollectionStrategy.InterFrameStrategy = function () {
        return function (scene) {
            var startTime = PrecisionDate.Now;
            var timeTaken = 0;
            var onBeforeAnimationsObserver = scene.onBeforeAnimationsObservable.add(function () {
                timeTaken = PrecisionDate.Now - startTime;
            });
            var onAfterRenderObserver = scene.onAfterRenderObservable.add(function () {
                startTime = PrecisionDate.Now;
            });
            return {
                id: "Inter-frame",
                getData: function () { return timeTaken; },
                dispose: function () {
                    scene.onBeforeAnimationsObservable.remove(onBeforeAnimationsObserver);
                    scene.onAfterRenderObservable.remove(onAfterRenderObserver);
                },
            };
        };
    };
    /**
     * Gets the initializer for the strategy used for collection of gpu frame time metrics.
     * @returns the initializer for the gpu frame time strategy
     */
    PerfCollectionStrategy.GpuFrameTimeStrategy = function () {
        return function (scene) {
            var engineInstrumentation = new EngineInstrumentation(scene.getEngine());
            engineInstrumentation.captureGPUFrameTime = true;
            return {
                id: "GPU frame time",
                getData: function () { return Math.max(engineInstrumentation.gpuFrameTimeCounter.current * 0.000001, 0); },
                dispose: function () {
                    engineInstrumentation.dispose();
                },
            };
        };
    };
    return PerfCollectionStrategy;
}());
export { PerfCollectionStrategy };
//# sourceMappingURL=performanceViewerCollectionStrategies.js.map