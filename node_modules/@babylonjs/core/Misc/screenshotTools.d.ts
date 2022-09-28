import type { Camera } from "../Cameras/camera";
import type { IScreenshotSize } from "./interfaces/screenshotSize";
declare type Engine = import("../Engines/engine").Engine;
/**
 * Captures a screenshot of the current rendering
 * @see https://doc.babylonjs.com/how_to/render_scene_on_a_png
 * @param engine defines the rendering engine
 * @param camera defines the source camera
 * @param size This parameter can be set to a single number or to an object with the
 * following (optional) properties: precision, width, height. If a single number is passed,
 * it will be used for both width and height. If an object is passed, the screenshot size
 * will be derived from the parameters. The precision property is a multiplier allowing
 * rendering at a higher or lower resolution
 * @param successCallback defines the callback receives a single parameter which contains the
 * screenshot as a string of base64-encoded characters. This string can be assigned to the
 * src parameter of an <img> to display it
 * @param mimeType defines the MIME type of the screenshot image (default: image/png).
 * Check your browser for supported MIME types
 * @param forceDownload force the system to download the image even if a successCallback is provided
 */
export declare function CreateScreenshot(engine: Engine, camera: Camera, size: IScreenshotSize | number, successCallback?: (data: string) => void, mimeType?: string, forceDownload?: boolean): void;
/**
 * Captures a screenshot of the current rendering
 * @see https://doc.babylonjs.com/how_to/render_scene_on_a_png
 * @param engine defines the rendering engine
 * @param camera defines the source camera
 * @param size This parameter can be set to a single number or to an object with the
 * following (optional) properties: precision, width, height. If a single number is passed,
 * it will be used for both width and height. If an object is passed, the screenshot size
 * will be derived from the parameters. The precision property is a multiplier allowing
 * rendering at a higher or lower resolution
 * @param mimeType defines the MIME type of the screenshot image (default: image/png).
 * Check your browser for supported MIME types
 * @returns screenshot as a string of base64-encoded characters. This string can be assigned
 * to the src parameter of an <img> to display it
 */
export declare function CreateScreenshotAsync(engine: Engine, camera: Camera, size: IScreenshotSize | number, mimeType?: string): Promise<string>;
/**
 * Captures a screenshot of the current rendering for a specific size. This will render the entire canvas but will generate a blink (due to canvas resize)
 * @see https://doc.babylonjs.com/how_to/render_scene_on_a_png
 * @param engine defines the rendering engine
 * @param camera defines the source camera
 * @param width defines the expected width
 * @param height defines the expected height
 * @param mimeType defines the MIME type of the screenshot image (default: image/png).
 * Check your browser for supported MIME types
 * @returns screenshot as a string of base64-encoded characters. This string can be assigned
 * to the src parameter of an <img> to display it
 */
export declare function CreateScreenshotWithResizeAsync(engine: Engine, camera: Camera, width: number, height: number, mimeType?: string): Promise<void>;
/**
 * Generates an image screenshot from the specified camera.
 * @see https://doc.babylonjs.com/how_to/render_scene_on_a_png
 * @param engine The engine to use for rendering
 * @param camera The camera to use for rendering
 * @param size This parameter can be set to a single number or to an object with the
 * following (optional) properties: precision, width, height. If a single number is passed,
 * it will be used for both width and height. If an object is passed, the screenshot size
 * will be derived from the parameters. The precision property is a multiplier allowing
 * rendering at a higher or lower resolution
 * @param successCallback The callback receives a single parameter which contains the
 * screenshot as a string of base64-encoded characters. This string can be assigned to the
 * src parameter of an <img> to display it
 * @param mimeType The MIME type of the screenshot image (default: image/png).
 * Check your browser for supported MIME types
 * @param samples Texture samples (default: 1)
 * @param antialiasing Whether antialiasing should be turned on or not (default: false)
 * @param fileName A name for for the downloaded file.
 * @param renderSprites Whether the sprites should be rendered or not (default: false)
 * @param enableStencilBuffer Whether the stencil buffer should be enabled or not (default: false)
 */
export declare function CreateScreenshotUsingRenderTarget(engine: Engine, camera: Camera, size: IScreenshotSize | number, successCallback?: (data: string) => void, mimeType?: string, samples?: number, antialiasing?: boolean, fileName?: string, renderSprites?: boolean, enableStencilBuffer?: boolean): void;
/**
 * Generates an image screenshot from the specified camera.
 * @see https://doc.babylonjs.com/how_to/render_scene_on_a_png
 * @param engine The engine to use for rendering
 * @param camera The camera to use for rendering
 * @param size This parameter can be set to a single number or to an object with the
 * following (optional) properties: precision, width, height. If a single number is passed,
 * it will be used for both width and height. If an object is passed, the screenshot size
 * will be derived from the parameters. The precision property is a multiplier allowing
 * rendering at a higher or lower resolution
 * @param mimeType The MIME type of the screenshot image (default: image/png).
 * Check your browser for supported MIME types
 * @param samples Texture samples (default: 1)
 * @param antialiasing Whether antialiasing should be turned on or not (default: false)
 * @param fileName A name for for the downloaded file.
 * @param renderSprites Whether the sprites should be rendered or not (default: false)
 * @returns screenshot as a string of base64-encoded characters. This string can be assigned
 * to the src parameter of an <img> to display it
 */
export declare function CreateScreenshotUsingRenderTargetAsync(engine: Engine, camera: Camera, size: IScreenshotSize | number, mimeType?: string, samples?: number, antialiasing?: boolean, fileName?: string, renderSprites?: boolean): Promise<string>;
/**
 * Class containing a set of static utilities functions for screenshots
 */
export declare const ScreenshotTools: {
    /**
     * Captures a screenshot of the current rendering
     * @see https://doc.babylonjs.com/how_to/render_scene_on_a_png
     * @param engine defines the rendering engine
     * @param camera defines the source camera
     * @param size This parameter can be set to a single number or to an object with the
     * following (optional) properties: precision, width, height. If a single number is passed,
     * it will be used for both width and height. If an object is passed, the screenshot size
     * will be derived from the parameters. The precision property is a multiplier allowing
     * rendering at a higher or lower resolution
     * @param successCallback defines the callback receives a single parameter which contains the
     * screenshot as a string of base64-encoded characters. This string can be assigned to the
     * src parameter of an <img> to display it
     * @param mimeType defines the MIME type of the screenshot image (default: image/png).
     * Check your browser for supported MIME types
     * @param forceDownload force the system to download the image even if a successCallback is provided
     */
    CreateScreenshot: typeof CreateScreenshot;
    /**
     * Captures a screenshot of the current rendering
     * @see https://doc.babylonjs.com/how_to/render_scene_on_a_png
     * @param engine defines the rendering engine
     * @param camera defines the source camera
     * @param size This parameter can be set to a single number or to an object with the
     * following (optional) properties: precision, width, height. If a single number is passed,
     * it will be used for both width and height. If an object is passed, the screenshot size
     * will be derived from the parameters. The precision property is a multiplier allowing
     * rendering at a higher or lower resolution
     * @param mimeType defines the MIME type of the screenshot image (default: image/png).
     * Check your browser for supported MIME types
     * @returns screenshot as a string of base64-encoded characters. This string can be assigned
     * to the src parameter of an <img> to display it
     */
    CreateScreenshotAsync: typeof CreateScreenshotAsync;
    /**
     * Captures a screenshot of the current rendering for a specific size. This will render the entire canvas but will generate a blink (due to canvas resize)
     * @see https://doc.babylonjs.com/how_to/render_scene_on_a_png
     * @param engine defines the rendering engine
     * @param camera defines the source camera
     * @param width defines the expected width
     * @param height defines the expected height
     * @param mimeType defines the MIME type of the screenshot image (default: image/png).
     * Check your browser for supported MIME types
     * @returns screenshot as a string of base64-encoded characters. This string can be assigned
     * to the src parameter of an <img> to display it
     */
    CreateScreenshotWithResizeAsync: typeof CreateScreenshotWithResizeAsync;
    /**
     * Generates an image screenshot from the specified camera.
     * @see https://doc.babylonjs.com/how_to/render_scene_on_a_png
     * @param engine The engine to use for rendering
     * @param camera The camera to use for rendering
     * @param size This parameter can be set to a single number or to an object with the
     * following (optional) properties: precision, width, height. If a single number is passed,
     * it will be used for both width and height. If an object is passed, the screenshot size
     * will be derived from the parameters. The precision property is a multiplier allowing
     * rendering at a higher or lower resolution
     * @param successCallback The callback receives a single parameter which contains the
     * screenshot as a string of base64-encoded characters. This string can be assigned to the
     * src parameter of an <img> to display it
     * @param mimeType The MIME type of the screenshot image (default: image/png).
     * Check your browser for supported MIME types
     * @param samples Texture samples (default: 1)
     * @param antialiasing Whether antialiasing should be turned on or not (default: false)
     * @param fileName A name for for the downloaded file.
     * @param renderSprites Whether the sprites should be rendered or not (default: false)
     * @param enableStencilBuffer Whether the stencil buffer should be enabled or not (default: false)
     */
    CreateScreenshotUsingRenderTarget: typeof CreateScreenshotUsingRenderTarget;
    /**
     * Generates an image screenshot from the specified camera.
     * @see https://doc.babylonjs.com/how_to/render_scene_on_a_png
     * @param engine The engine to use for rendering
     * @param camera The camera to use for rendering
     * @param size This parameter can be set to a single number or to an object with the
     * following (optional) properties: precision, width, height. If a single number is passed,
     * it will be used for both width and height. If an object is passed, the screenshot size
     * will be derived from the parameters. The precision property is a multiplier allowing
     * rendering at a higher or lower resolution
     * @param mimeType The MIME type of the screenshot image (default: image/png).
     * Check your browser for supported MIME types
     * @param samples Texture samples (default: 1)
     * @param antialiasing Whether antialiasing should be turned on or not (default: false)
     * @param fileName A name for for the downloaded file.
     * @param renderSprites Whether the sprites should be rendered or not (default: false)
     * @returns screenshot as a string of base64-encoded characters. This string can be assigned
     * to the src parameter of an <img> to display it
     */
    CreateScreenshotUsingRenderTargetAsync: typeof CreateScreenshotUsingRenderTargetAsync;
};
export {};
