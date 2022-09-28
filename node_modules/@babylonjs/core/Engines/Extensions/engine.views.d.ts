import type { Camera } from "../../Cameras/camera";
import type { Nullable } from "../../types";
/**
 * Class used to define an additional view for the engine
 * @see https://doc.babylonjs.com/divingDeeper/scene/multiCanvas
 */
export declare class EngineView {
    /** Defines the canvas where to render the view */
    target: HTMLCanvasElement;
    /** Defines an optional camera used to render the view (will use active camera else) */
    camera?: Camera;
    /** Indicates if the destination view canvas should be cleared before copying the parent canvas. Can help if the scene clear color has alpha < 1 */
    clearBeforeCopy?: boolean;
    /** Indicates if the view is enabled (true by default) */
    enabled: boolean;
    /** Defines a custom function to handle canvas size changes. (the canvas to render into is provided to the callback) */
    customResize?: (canvas: HTMLCanvasElement) => void;
}
declare module "../../Engines/engine" {
    interface Engine {
        /** @hidden */
        _inputElement: Nullable<HTMLElement>;
        /**
         * Gets or sets the  HTML element to use for attaching events
         */
        inputElement: Nullable<HTMLElement>;
        /**
         * Observable to handle when a change to inputElement occurs
         * @hidden
         */
        _onEngineViewChanged?: () => void;
        /**
         * Gets the current engine view
         * @see https://doc.babylonjs.com/how_to/multi_canvases
         */
        activeView: Nullable<EngineView>;
        /** Gets or sets the list of views */
        views: EngineView[];
        /**
         * Register a new child canvas
         * @param canvas defines the canvas to register
         * @param camera defines an optional camera to use with this canvas (it will overwrite the scene.camera for this view)
         * @param clearBeforeCopy Indicates if the destination view canvas should be cleared before copying the parent canvas. Can help if the scene clear color has alpha < 1
         * @returns the associated view
         */
        registerView(canvas: HTMLCanvasElement, camera?: Camera, clearBeforeCopy?: boolean): EngineView;
        /**
         * Remove a registered child canvas
         * @param canvas defines the canvas to remove
         * @returns the current engine
         */
        unRegisterView(canvas: HTMLCanvasElement): Engine;
    }
}
