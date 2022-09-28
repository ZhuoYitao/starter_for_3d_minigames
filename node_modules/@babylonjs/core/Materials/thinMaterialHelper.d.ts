import type { Effect } from "./effect";
import type { IClipPlanesHolder } from "../Misc/interfaces/iClipPlanesHolder";
/**
 * "Static Class" containing a few commonly used helper while dealing with material for rendering purpose.
 *
 * It is complementary with MaterialHelper but provides completely independent functions (for tree shaking sake)
 *
 * This works by convention in BabylonJS but is meant to be use only with shader following the in place naming rules and conventions.
 */
export declare class ThinMaterialHelper {
    /**
     * Binds the clip plane information from the holder to the effect.
     * @param effect The effect we are binding the data to
     * @param holder The entity containing the clip plane information
     */
    static BindClipPlane(effect: Effect, holder: IClipPlanesHolder): void;
}
