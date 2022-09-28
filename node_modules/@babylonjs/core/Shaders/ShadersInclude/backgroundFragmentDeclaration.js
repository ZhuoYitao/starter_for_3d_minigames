// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "backgroundFragmentDeclaration";
var shader = "uniform vec4 vEyePosition;\nuniform vec4 vPrimaryColor;\n#ifdef USEHIGHLIGHTANDSHADOWCOLORS\nuniform vec4 vPrimaryColorShadow;\n#endif\nuniform float shadowLevel;\nuniform float alpha;\n#ifdef DIFFUSE\nuniform vec2 vDiffuseInfos;\n#endif\n#ifdef REFLECTION\nuniform vec2 vReflectionInfos;\nuniform mat4 reflectionMatrix;\nuniform vec3 vReflectionMicrosurfaceInfos;\n#endif\n#if defined(REFLECTIONFRESNEL) || defined(OPACITYFRESNEL)\nuniform vec3 vBackgroundCenter;\n#endif\n#ifdef REFLECTIONFRESNEL\nuniform vec4 vReflectionControl;\n#endif\n#if defined(REFLECTIONMAP_SPHERICAL) || defined(REFLECTIONMAP_PROJECTION) || defined(REFRACTION)\nuniform mat4 view;\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var backgroundFragmentDeclaration = { name: name, shader: shader };
//# sourceMappingURL=backgroundFragmentDeclaration.js.map