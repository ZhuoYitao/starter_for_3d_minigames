// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "kernelBlurVertex";
var shader = "sampleCoord{X}=sampleCenter+delta*KERNEL_OFFSET{X};";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var kernelBlurVertex = { name: name, shader: shader };
//# sourceMappingURL=kernelBlurVertex.js.map