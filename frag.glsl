#version 300 es
precision highp float;

uniform vec3 uColor;
out vec4 outColor;

uniform sampler2D uScreenTexture;
uniform vec2 uCanvasSize;

in vec3 vNormal;
in vec3 vFragPos; 

in vec2 vTexCoord;
uniform bool uIsHud;
uniform bool uUseTexture;
uniform sampler2D uTexture;

uniform bool uIsInverted;

uniform vec3 uLightAmbient;
uniform float uLightAmbientIntensity;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform float uLightIntensity;

vec4 invert(vec4 texColor, bool isInv) {
    if(!isInv) return texColor;

    vec2 screenUv = gl_FragCoord.xy / uCanvasSize;
    vec4 screenColor = texture(uScreenTexture, screenUv);

    return vec4(1.0 - screenColor.rgb, texColor.a);
}

void main() {
    if(uIsHud && uUseTexture) {
        vec4 color = texture(uTexture, vTexCoord);
        if(color.a < 0.01) discard;

        if(uIsInverted) {
            outColor = invert(color, uIsInverted);
        } else {
            outColor = color;
        }
    } else {
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(-uLightDirection);
        
        vec3 ambient = uLightAmbient * uLightAmbientIntensity;

        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuse = uLightColor * uLightIntensity * diff;

        vec3 lighting = ambient + diffuse;
        
        vec3 finalColor = uColor * lighting;
        outColor = vec4(finalColor, 1.0);
    }
}