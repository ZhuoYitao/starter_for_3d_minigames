// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
import "./mainUVVaryingDeclaration.js";
var name = "pbrFragmentExtraDeclaration";
var shader = "varying vec3 vPositionW;\n#if DEBUGMODE>0\nvarying vec4 vClipSpacePosition;\n#endif\n#include<mainUVVaryingDeclaration>[1..7]\n#ifdef NORMAL\nvarying vec3 vNormalW;\n#if defined(USESPHERICALFROMREFLECTIONMAP) && defined(USESPHERICALINVERTEX)\nvarying vec3 vEnvironmentIrradiance;\n#endif\n#endif\n#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR)\nvarying vec4 vColor;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var pbrFragmentExtraDeclaration = { name: name, shader: shader };
//# sourceMappingURL=pbrFragmentExtraDeclaration.js.map