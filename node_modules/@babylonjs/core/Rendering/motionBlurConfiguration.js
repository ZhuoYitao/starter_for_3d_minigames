
/**
 * Contains all parameters needed for the prepass to perform
 * motion blur
 */
var MotionBlurConfiguration = /** @class */ (function () {
    function MotionBlurConfiguration() {
        /**
         * Is motion blur enabled
         */
        this.enabled = false;
        /**
         * Name of the configuration
         */
        this.name = "motionBlur";
        /**
         * Textures that should be present in the MRT for this effect to work
         */
        this.texturesRequired = [2];
    }
    return MotionBlurConfiguration;
}());
export { MotionBlurConfiguration };
//# sourceMappingURL=motionBlurConfiguration.js.map