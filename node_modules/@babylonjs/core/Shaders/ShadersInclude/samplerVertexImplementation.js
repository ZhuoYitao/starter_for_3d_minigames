// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore.js";
var name = "samplerVertexImplementation";
var shader = "#if defined(_DEFINENAME_) && _DEFINENAME_DIRECTUV==0\nif (v_INFONAME_==0.)\n{\nv_VARYINGNAME_UV=vec2(_MATRIXNAME_Matrix*vec4(uvUpdated,1.0,0.0));\n}\n#ifdef UV2\nelse if (v_INFONAME_==1.)\n{\nv_VARYINGNAME_UV=vec2(_MATRIXNAME_Matrix*vec4(uv2,1.0,0.0));\n}\n#endif\n#ifdef UV3\nelse if (v_INFONAME_==2.)\n{\nv_VARYINGNAME_UV=vec2(_MATRIXNAME_Matrix*vec4(uv3,1.0,0.0));\n}\n#endif\n#ifdef UV4\nelse if (v_INFONAME_==3.)\n{\nv_VARYINGNAME_UV=vec2(_MATRIXNAME_Matrix*vec4(uv4,1.0,0.0));\n}\n#endif\n#ifdef UV5\nelse if (v_INFONAME_==4.)\n{\nv_VARYINGNAME_UV=vec2(_MATRIXNAME_Matrix*vec4(uv5,1.0,0.0));\n}\n#endif\n#ifdef UV6\nelse if (v_INFONAME_==5.)\n{\nv_VARYINGNAME_UV=vec2(_MATRIXNAME_Matrix*vec4(uv6,1.0,0.0));\n}\n#endif\n#endif\n";
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export var samplerVertexImplementation = { name: name, shader: shader };
//# sourceMappingURL=samplerVertexImplementation.js.map