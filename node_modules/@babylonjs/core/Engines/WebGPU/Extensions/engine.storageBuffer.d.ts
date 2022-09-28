import type { Nullable } from "../../../types";
declare type StorageBuffer = import("../../../Buffers/storageBuffer").StorageBuffer;
declare module "../../../Materials/effect" {
    interface Effect {
        /**
         * Sets a storage buffer on the engine to be used in the shader.
         * @param name Name of the storage buffer variable.
         * @param buffer Storage buffer to set.
         */
        setStorageBuffer(name: string, buffer: Nullable<StorageBuffer>): void;
    }
}
export {};
