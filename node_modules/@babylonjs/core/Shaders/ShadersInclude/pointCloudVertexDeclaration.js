// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "pointCloudVertexDeclaration";
var shader = "#ifdef POINTSIZE\nuniform float pointSize;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pointCloudVertexDeclaration = { name: name, shader: shader };
//# sourceMappingURL=pointCloudVertexDeclaration.js.map