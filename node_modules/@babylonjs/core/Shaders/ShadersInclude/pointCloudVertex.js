// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pointCloudVertex";
var shader = "#if defined(POINTSIZE) && !defined(WEBGPU)\ngl_PointSize=pointSize;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pointCloudVertex = { name: name, shader: shader };
//# sourceMappingURL=pointCloudVertex.js.map