import type { IDisposable } from "../../scene";
import { DeviceType } from "./deviceEnums";
import type { Observable } from "../../Misc/observable";
import { DeviceSource } from "./deviceSource";
import type { Engine } from "../../Engines/engine";
import type { IUIEvent } from "../../Events/deviceInputEvents";
declare type Distribute<T> = T extends DeviceType ? DeviceSource<T> : never;
export declare type DeviceSourceType = Distribute<DeviceType>;
declare module "../../Engines/engine" {
    interface Engine {
        /** @hidden */
        _deviceSourceManager?: InternalDeviceSourceManager;
    }
}
/** @hidden */
export interface IObservableManager {
    onDeviceConnectedObservable: Observable<DeviceSourceType>;
    onDeviceDisconnectedObservable: Observable<DeviceSourceType>;
    _onInputChanged(deviceType: DeviceType, deviceSlot: number, eventData: IUIEvent): void;
    _addDevice(deviceSource: DeviceSource<DeviceType>): void;
    _removeDevice(deviceType: DeviceType, deviceSlot: number): void;
}
/** @hidden */
export declare class InternalDeviceSourceManager implements IDisposable {
    private readonly _devices;
    private readonly _deviceInputSystem;
    private readonly _registeredManagers;
    _refCount: number;
    constructor(engine: Engine);
    readonly registerManager: (manager: IObservableManager) => void;
    readonly unregisterManager: (manager: IObservableManager) => void;
    dispose(): void;
}
export {};
