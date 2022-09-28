/** @hidden */
export declare class PerformanceConfigurator {
    /** @hidden */
    static MatrixUse64Bits: boolean;
    /** @hidden */
    static MatrixTrackPrecisionChange: boolean;
    /** @hidden */
    static MatrixCurrentType: any;
    /** @hidden */
    static MatrixTrackedMatrices: Array<any> | null;
    /**
     * @param use64bits
     * @hidden
     */
    static SetMatrixPrecision(use64bits: boolean): void;
}
