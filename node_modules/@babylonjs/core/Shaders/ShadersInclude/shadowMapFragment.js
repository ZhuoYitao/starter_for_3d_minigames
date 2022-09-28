// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "shadowMapFragment";
var shader = "float depthSM=vDepthMetricSM;\n#if defined(SM_DEPTHCLAMP) && SM_DEPTHCLAMP==1\n#if SM_USEDISTANCE==1\ndepthSM=(length(vPositionWSM-lightDataSM)+depthValuesSM.x)/depthValuesSM.y+biasAndScaleSM.x;\n#else\n#ifdef USE_REVERSE_DEPTHBUFFER\ndepthSM=(-zSM+depthValuesSM.x)/depthValuesSM.y+biasAndScaleSM.x;\n#else\ndepthSM=(zSM+depthValuesSM.x)/depthValuesSM.y+biasAndScaleSM.x;\n#endif\n#endif\n#ifdef USE_REVERSE_DEPTHBUFFER\ngl_FragDepth=clamp(1.0-depthSM,0.0,1.0);\n#else\ngl_FragDepth=clamp(depthSM,0.0,1.0); \n#endif\n#elif SM_USEDISTANCE==1\ndepthSM=(length(vPositionWSM-lightDataSM)+depthValuesSM.x)/depthValuesSM.y+biasAndScaleSM.x;\n#endif\n#if SM_ESM==1\ndepthSM=clamp(exp(-min(87.,biasAndScaleSM.z*depthSM)),0.,1.);\n#endif\n#if SM_FLOAT==1\ngl_FragColor=vec4(depthSM,1.0,1.0,1.0);\n#else\ngl_FragColor=pack(depthSM);\n#endif\nreturn;";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var shadowMapFragment = { name: name, shader: shader };
//# sourceMappingURL=shadowMapFragment.js.map