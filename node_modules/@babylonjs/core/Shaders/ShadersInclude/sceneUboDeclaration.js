// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "sceneUboDeclaration";
var shader = "layout(std140,column_major) uniform;\nuniform Scene {\nmat4 viewProjection;\n#ifdef MULTIVIEW\nmat4 viewProjectionR;\n#endif \nmat4 view;\nmat4 projection;\nvec4 vEyePosition;\n};\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var sceneUboDeclaration = { name: name, shader: shader };
//# sourceMappingURL=sceneUboDeclaration.js.map