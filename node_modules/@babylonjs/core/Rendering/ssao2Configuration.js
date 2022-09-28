
/**
 * Contains all parameters needed for the prepass to perform
 * screen space subsurface scattering
 */
var SSAO2Configuration = /** @class */ (function () {
    function SSAO2Configuration() {
        /**
         * Is subsurface enabled
         */
        this.enabled = false;
        /**
         * Name of the configuration
         */
        this.name = "ssao2";
        /**
         * Textures that should be present in the MRT for this effect to work
         */
        this.texturesRequired = [6, 5];
    }
    return SSAO2Configuration;
}());
export { SSAO2Configuration };
//# sourceMappingURL=ssao2Configuration.js.map