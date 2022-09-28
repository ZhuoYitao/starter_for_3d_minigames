
/**
 * Class used to represent data loading progression
 */
var SceneLoaderFlags = /** @class */ (function () {
    function SceneLoaderFlags() {
    }
    Object.defineProperty(SceneLoaderFlags, "ForceFullSceneLoadingForIncremental", {
        /**
         * Gets or sets a boolean indicating if entire scene must be loaded even if scene contains incremental data
         */
        get: function () {
            return SceneLoaderFlags._ForceFullSceneLoadingForIncremental;
        },
        set: function (value) {
            SceneLoaderFlags._ForceFullSceneLoadingForIncremental = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SceneLoaderFlags, "ShowLoadingScreen", {
        /**
         * Gets or sets a boolean indicating if loading screen must be displayed while loading a scene
         */
        get: function () {
            return SceneLoaderFlags._ShowLoadingScreen;
        },
        set: function (value) {
            SceneLoaderFlags._ShowLoadingScreen = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SceneLoaderFlags, "loggingLevel", {
        /**
         * Defines the current logging level (while loading the scene)
         * @ignorenaming
         */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        get: function () {
            return SceneLoaderFlags._LoggingLevel;
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        set: function (value) {
            SceneLoaderFlags._LoggingLevel = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SceneLoaderFlags, "CleanBoneMatrixWeights", {
        /**
         * Gets or set a boolean indicating if matrix weights must be cleaned upon loading
         */
        get: function () {
            return SceneLoaderFlags._CleanBoneMatrixWeights;
        },
        set: function (value) {
            SceneLoaderFlags._CleanBoneMatrixWeights = value;
        },
        enumerable: false,
        configurable: true
    });
    // Flags
    SceneLoaderFlags._ForceFullSceneLoadingForIncremental = false;
    SceneLoaderFlags._ShowLoadingScreen = true;
    SceneLoaderFlags._CleanBoneMatrixWeights = false;
    SceneLoaderFlags._LoggingLevel = 0;
    return SceneLoaderFlags;
}());
export { SceneLoaderFlags };
//# sourceMappingURL=sceneLoaderFlags.js.map