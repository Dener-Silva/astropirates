precision mediump float;

attribute vec3 starPosition;
attribute vec2 uv;

uniform vec2 baseResolution;
uniform vec2 playerPosition;

varying highp vec2 vTextureCoord;

void main() {
    vec2 halfBaseResolution = baseResolution / 2.0;
    
    vec2 vertexPositionOffset = (uv - 0.5) * (20.0 * starPosition.z + 2.0);
    vec2 starPositionParallax = starPosition.xy + playerPosition * starPosition.z;
    // 11px vertical border to hide stars warping
    vec2 starPositionMod = mod(starPositionParallax, baseResolution.xy + 22.0) - 11.0;
    vec2 vertexPosition = vertexPositionOffset + starPositionMod;
    gl_Position = vec4(vertexPosition / halfBaseResolution - 1.0, -starPosition.z, 1.0);
    vTextureCoord = uv;
}