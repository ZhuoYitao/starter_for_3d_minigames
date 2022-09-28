import { Camera } from "../../../Cameras/camera";
import { PostProcessRenderPipeline } from "../../../PostProcesses/RenderPipeline/postProcessRenderPipeline";
import type { Scene } from "../../../scene";
import "../../../PostProcesses/RenderPipeline/postProcessRenderPipelineManagerSceneComponent";
import "../../../Shaders/ssao2.fragment";
import "../../../Shaders/ssaoCombine.fragment";
/**
 * Render pipeline to produce ssao effect
 */
export declare class SSAO2RenderingPipeline extends PostProcessRenderPipeline {
    /**
     * @ignore
     * The PassPostProcess id in the pipeline that contains the original scene color
     */
    SSAOOriginalSceneColorEffect: string;
    /**
     * @ignore
     * The SSAO PostProcess id in the pipeline
     */
    SSAORenderEffect: string;
    /**
     * @ignore
     * The horizontal blur PostProcess id in the pipeline
     */
    SSAOBlurHRenderEffect: string;
    /**
     * @ignore
     * The vertical blur PostProcess id in the pipeline
     */
    SSAOBlurVRenderEffect: string;
    /**
     * @ignore
     * The PostProcess id in the pipeline that combines the SSAO-Blur output with the original scene color (SSAOOriginalSceneColorEffect)
     */
    SSAOCombineRenderEffect: string;
    /**
     * The output strength of the SSAO post-process. Default value is 1.0.
     */
    totalStrength: number;
    /**
     * Maximum depth value to still render AO. A smooth falloff makes the dimming more natural, so there will be no abrupt shading change.
     */
    maxZ: number;
    /**
     * In order to save performances, SSAO radius is clamped on close geometry. This ratio changes by how much
     */
    minZAspect: number;
    private _samples;
    /**
     * Number of samples used for the SSAO calculations. Default value is 8
     */
    set samples(n: number);
    get samples(): number;
    private _textureSamples;
    /**
     * Number of samples to use for antialiasing
     */
    set textureSamples(n: number);
    get textureSamples(): number;
    /**
     * Force rendering the geometry through geometry buffer
     */
    private _forceGeometryBuffer;
    private get _geometryBufferRenderer();
    private get _prePassRenderer();
    /**
     * Ratio object used for SSAO ratio and blur ratio
     */
    private _ratio;
    /**
     * Dynamically generated sphere sampler.
     */
    private _sampleSphere;
    /**
     * Blur filter offsets
     */
    private _samplerOffsets;
    private _expensiveBlur;
    /**
     * If bilateral blur should be used
     */
    set expensiveBlur(b: boolean);
    get expensiveBlur(): boolean;
    /**
     * The radius around the analyzed pixel used by the SSAO post-process. Default value is 2.0
     */
    radius: number;
    /**
     * The base color of the SSAO post-process
     * The final result is "base + ssao" between [0, 1]
     */
    base: number;
    /**
     *  Support test.
     */
    static get IsSupported(): boolean;
    private _scene;
    private _randomTexture;
    private _originalColorPostProcess;
    private _ssaoPostProcess;
    private _blurHPostProcess;
    private _blurVPostProcess;
    private _ssaoCombinePostProcess;
    /**
     * Gets active scene
     */
    get scene(): Scene;
    /**
     * @constructor
     * @param name The rendering pipeline name
     * @param scene The scene linked to this pipeline
     * @param ratio The size of the postprocesses. Can be a number shared between passes or an object for more precision: { ssaoRatio: 0.5, blurRatio: 1.0 }
     * @param cameras The array of cameras that the rendering pipeline will be attached to
     * @param forceGeometryBuffer Set to true if you want to use the legacy geometry buffer renderer
     * @param textureType The texture type used by the different post processes created by SSAO (default: Constants.TEXTURETYPE_UNSIGNED_INT)
     */
    constructor(name: string, scene: Scene, ratio: any, cameras?: Camera[], forceGeometryBuffer?: boolean, textureType?: number);
    /**
     * Get the class name
     * @returns "SSAO2RenderingPipeline"
     */
    getClassName(): string;
    /**
     * Removes the internal pipeline assets and detaches the pipeline from the scene cameras
     * @param disableGeometryBufferRenderer
     */
    dispose(disableGeometryBufferRenderer?: boolean): void;
    private _createBlurPostProcess;
    /** @hidden */
    _rebuild(): void;
    private _bits;
    private _radicalInverse_VdC;
    private _hammersley;
    private _hemisphereSample_uniform;
    private _generateHemisphere;
    private _getDefinesForSSAO;
    private static readonly ORTHO_DEPTH_PROJECTION;
    private static readonly PERSPECTIVE_DEPTH_PROJECTION;
    private _createSSAOPostProcess;
    private _createSSAOCombinePostProcess;
    private _createRandomTexture;
    /**
     * Serialize the rendering pipeline (Used when exporting)
     * @returns the serialized object
     */
    serialize(): any;
    /**
     * Parse the serialized pipeline
     * @param source Source pipeline.
     * @param scene The scene to load the pipeline to.
     * @param rootUrl The URL of the serialized pipeline.
     * @returns An instantiated pipeline from the serialized object.
     */
    static Parse(source: any, scene: Scene, rootUrl: string): SSAO2RenderingPipeline;
}
