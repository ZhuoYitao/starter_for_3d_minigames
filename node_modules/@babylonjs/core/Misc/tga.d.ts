import type { InternalTexture } from "../Materials/Textures/internalTexture";
/**
 * Gets the header of a TGA file
 * @param data defines the TGA data
 * @returns the header
 */
export declare function GetTGAHeader(data: Uint8Array): any;
/**
 * Uploads TGA content to a Babylon Texture
 * @param texture
 * @param data
 * @hidden
 */
export declare function UploadContent(texture: InternalTexture, data: Uint8Array): void;
/**
 * @param header
 * @param palettes
 * @param pixel_data
 * @param y_start
 * @param y_step
 * @param y_end
 * @param x_start
 * @param x_step
 * @param x_end
 * @hidden
 */
declare function _getImageData8bits(header: any, palettes: Uint8Array, pixel_data: Uint8Array, y_start: number, y_step: number, y_end: number, x_start: number, x_step: number, x_end: number): Uint8Array;
/**
 * @param header
 * @param palettes
 * @param pixel_data
 * @param y_start
 * @param y_step
 * @param y_end
 * @param x_start
 * @param x_step
 * @param x_end
 * @hidden
 */
declare function _getImageData16bits(header: any, palettes: Uint8Array, pixel_data: Uint8Array, y_start: number, y_step: number, y_end: number, x_start: number, x_step: number, x_end: number): Uint8Array;
/**
 * @param header
 * @param palettes
 * @param pixel_data
 * @param y_start
 * @param y_step
 * @param y_end
 * @param x_start
 * @param x_step
 * @param x_end
 * @hidden
 */
declare function _getImageData24bits(header: any, palettes: Uint8Array, pixel_data: Uint8Array, y_start: number, y_step: number, y_end: number, x_start: number, x_step: number, x_end: number): Uint8Array;
/**
 * @param header
 * @param palettes
 * @param pixel_data
 * @param y_start
 * @param y_step
 * @param y_end
 * @param x_start
 * @param x_step
 * @param x_end
 * @hidden
 */
declare function _getImageData32bits(header: any, palettes: Uint8Array, pixel_data: Uint8Array, y_start: number, y_step: number, y_end: number, x_start: number, x_step: number, x_end: number): Uint8Array;
/**
 * @param header
 * @param palettes
 * @param pixel_data
 * @param y_start
 * @param y_step
 * @param y_end
 * @param x_start
 * @param x_step
 * @param x_end
 * @hidden
 */
declare function _getImageDataGrey8bits(header: any, palettes: Uint8Array, pixel_data: Uint8Array, y_start: number, y_step: number, y_end: number, x_start: number, x_step: number, x_end: number): Uint8Array;
/**
 * @param header
 * @param palettes
 * @param pixel_data
 * @param y_start
 * @param y_step
 * @param y_end
 * @param x_start
 * @param x_step
 * @param x_end
 * @hidden
 */
declare function _getImageDataGrey16bits(header: any, palettes: Uint8Array, pixel_data: Uint8Array, y_start: number, y_step: number, y_end: number, x_start: number, x_step: number, x_end: number): Uint8Array;
/**
 * Based on jsTGALoader - Javascript loader for TGA file
 * By Vincent Thibault
 * @see http://blog.robrowser.com/javascript-tga-loader.html
 */
export declare const TGATools: {
    /**
     * Gets the header of a TGA file
     * @param data defines the TGA data
     * @returns the header
     */
    GetTGAHeader: typeof GetTGAHeader;
    /**
     * Uploads TGA content to a Babylon Texture
     * @hidden
     */
    UploadContent: typeof UploadContent;
    /** @hidden */
    _getImageData8bits: typeof _getImageData8bits;
    /** @hidden */
    _getImageData16bits: typeof _getImageData16bits;
    /** @hidden */
    _getImageData24bits: typeof _getImageData24bits;
    /** @hidden */
    _getImageData32bits: typeof _getImageData32bits;
    /** @hidden */
    _getImageDataGrey8bits: typeof _getImageDataGrey8bits;
    /** @hidden */
    _getImageDataGrey16bits: typeof _getImageDataGrey16bits;
};
export {};
