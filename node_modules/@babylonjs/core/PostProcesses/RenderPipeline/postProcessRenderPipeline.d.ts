import type { Nullable } from "../../types";
import type { Camera } from "../../Cameras/camera";
import type { Engine } from "../../Engines/engine";
import type { PostProcessRenderEffect } from "./postProcessRenderEffect";
import type { IInspectable } from "../../Misc/iInspectable";
declare type PrePassRenderer = import("../../Rendering/prePassRenderer").PrePassRenderer;
/**
 * PostProcessRenderPipeline
 * @see https://doc.babylonjs.com/how_to/how_to_use_postprocessrenderpipeline
 */
export declare class PostProcessRenderPipeline {
    private _engine;
    private _renderEffects;
    private _renderEffectsForIsolatedPass;
    /**
     * List of inspectable custom properties (used by the Inspector)
     * @see https://doc.babylonjs.com/how_to/debug_layer#extensibility
     */
    inspectableCustomProperties: IInspectable[];
    /**
     * @hidden
     */
    protected _cameras: Camera[];
    /** @hidden */
    _name: string;
    /**
     * Gets pipeline name
     */
    get name(): string;
    /** Gets the list of attached cameras */
    get cameras(): Camera[];
    /**
     * Initializes a PostProcessRenderPipeline
     * @param _engine engine to add the pipeline to
     * @param name name of the pipeline
     */
    constructor(_engine: Engine, name: string);
    /**
     * Gets the class name
     * @returns "PostProcessRenderPipeline"
     */
    getClassName(): string;
    /**
     * If all the render effects in the pipeline are supported
     */
    get isSupported(): boolean;
    /**
     * Adds an effect to the pipeline
     * @param renderEffect the effect to add
     */
    addEffect(renderEffect: PostProcessRenderEffect): void;
    /** @hidden */
    _rebuild(): void;
    /** @hidden */
    _enableEffect(renderEffectName: string, cameras: Camera): void;
    /** @hidden */
    _enableEffect(renderEffectName: string, cameras: Camera[]): void;
    /** @hidden */
    _disableEffect(renderEffectName: string, cameras: Nullable<Camera[]>): void;
    /** @hidden */
    _disableEffect(renderEffectName: string, cameras: Nullable<Camera[]>): void;
    /** @hidden */
    _attachCameras(cameras: Camera, unique: boolean): void;
    /** @hidden */
    _attachCameras(cameras: Camera[], unique: boolean): void;
    /** @hidden */
    _detachCameras(cameras: Camera): void;
    /** @hidden */
    _detachCameras(cameras: Nullable<Camera[]>): void;
    /** @hidden */
    _update(): void;
    /** @hidden */
    _reset(): void;
    protected _enableMSAAOnFirstPostProcess(sampleCount: number): boolean;
    /**
     * Sets the required values to the prepass renderer.
     * @param prePassRenderer defines the prepass renderer to setup.
     * @returns true if the pre pass is needed.
     */
    setPrePassRenderer(prePassRenderer: PrePassRenderer): boolean;
    /**
     * Disposes of the pipeline
     */
    dispose(): void;
}
export {};
