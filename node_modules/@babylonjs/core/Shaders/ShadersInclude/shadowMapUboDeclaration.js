// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
import "./sceneUboDeclaration.js";
import "./meshUboDeclaration.js";
var name = "shadowMapUboDeclaration";
var shader = "layout(std140,column_major) uniform;\n#include<sceneUboDeclaration>\n#include<meshUboDeclaration>\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var shadowMapUboDeclaration = { name: name, shader: shader };
//# sourceMappingURL=shadowMapUboDeclaration.js.map