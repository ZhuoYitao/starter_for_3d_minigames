// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "oitFragment";
var shader = "#ifdef ORDER_INDEPENDENT_TRANSPARENCY\nfloat fragDepth=gl_FragCoord.z; \n#ifdef ORDER_INDEPENDENT_TRANSPARENCY_16BITS\nuint halfFloat=packHalf2x16(vec2(fragDepth));\nvec2 full=unpackHalf2x16(halfFloat);\nfragDepth=full.x;\n#endif\nivec2 fragCoord=ivec2(gl_FragCoord.xy);\nvec2 lastDepth=texelFetch(oitDepthSampler,fragCoord,0).rg;\nvec4 lastFrontColor=texelFetch(oitFrontColorSampler,fragCoord,0);\ndepth.rg=vec2(-MAX_DEPTH);\nfrontColor=lastFrontColor;\nbackColor=vec4(0.0);\n#ifdef USE_REVERSE_DEPTHBUFFER\nfloat furthestDepth=-lastDepth.x;\nfloat nearestDepth=lastDepth.y;\n#else\nfloat nearestDepth=-lastDepth.x;\nfloat furthestDepth=lastDepth.y;\n#endif\nfloat alphaMultiplier=1.0-lastFrontColor.a;\n#ifdef USE_REVERSE_DEPTHBUFFER\nif (fragDepth>nearestDepth || fragDepth<furthestDepth) {\n#else\nif (fragDepth<nearestDepth || fragDepth>furthestDepth) {\n#endif\nreturn;\n}\n#ifdef USE_REVERSE_DEPTHBUFFER\nif (fragDepth<nearestDepth && fragDepth>furthestDepth) {\n#else\nif (fragDepth>nearestDepth && fragDepth<furthestDepth) {\n#endif\ndepth.rg=vec2(-fragDepth,fragDepth);\nreturn;\n}\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var oitFragment = { name: name, shader: shader };
//# sourceMappingURL=oitFragment.js.map