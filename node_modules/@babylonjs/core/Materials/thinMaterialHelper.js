/**
 * "Static Class" containing a few commonly used helper while dealing with material for rendering purpose.
 *
 * It is complementary with MaterialHelper but provides completely independent functions (for tree shaking sake)
 *
 * This works by convention in BabylonJS but is meant to be use only with shader following the in place naming rules and conventions.
 */
var ThinMaterialHelper = /** @class */ (function () {
    function ThinMaterialHelper() {
    }
    /**
     * Binds the clip plane information from the holder to the effect.
     * @param effect The effect we are binding the data to
     * @param holder The entity containing the clip plane information
     */
    ThinMaterialHelper.BindClipPlane = function (effect, holder) {
        if (holder.clipPlane) {
            var clipPlane = holder.clipPlane;
            effect.setFloat4("vClipPlane", clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.d);
        }
        if (holder.clipPlane2) {
            var clipPlane = holder.clipPlane2;
            effect.setFloat4("vClipPlane2", clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.d);
        }
        if (holder.clipPlane3) {
            var clipPlane = holder.clipPlane3;
            effect.setFloat4("vClipPlane3", clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.d);
        }
        if (holder.clipPlane4) {
            var clipPlane = holder.clipPlane4;
            effect.setFloat4("vClipPlane4", clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.d);
        }
        if (holder.clipPlane5) {
            var clipPlane = holder.clipPlane5;
            effect.setFloat4("vClipPlane5", clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.d);
        }
        if (holder.clipPlane6) {
            var clipPlane = holder.clipPlane6;
            effect.setFloat4("vClipPlane6", clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.d);
        }
    };
    return ThinMaterialHelper;
}());
export { ThinMaterialHelper };
//# sourceMappingURL=thinMaterialHelper.js.map