import type { IDrawContext } from "../Engines/IDrawContext";
import type { IMaterialContext } from "../Engines/IMaterialContext";
import type { Nullable } from "../types";
declare type ThinEngine = import("../Engines/thinEngine").ThinEngine;
declare type Effect = import("./effect").Effect;
declare type MaterialDefines = import("./materialDefines").MaterialDefines;
/** @hidden */
export declare class DrawWrapper {
    effect: Nullable<Effect>;
    defines: Nullable<string | MaterialDefines>;
    materialContext?: IMaterialContext;
    drawContext?: IDrawContext;
    static IsWrapper(effect: Effect | DrawWrapper): effect is DrawWrapper;
    static GetEffect(effect: Effect | DrawWrapper): Nullable<Effect>;
    constructor(engine: ThinEngine, createMaterialContext?: boolean);
    setEffect(effect: Nullable<Effect>, defines?: Nullable<string | MaterialDefines>, resetContext?: boolean): void;
    dispose(): void;
}
export {};
