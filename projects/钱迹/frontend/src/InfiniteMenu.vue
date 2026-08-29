<template>
  <div class="qianji-infinite-overlay" :class="{ 'is-open': open }" aria-hidden="false">
    <div class="qianji-infinite-backdrop" @click="$emit('close')"></div>
    <section class="qianji-infinite-panel" aria-label="沉浸导航菜单">
      <span class="qianji-map-label">QIANJI MAP</span>
      <button class="qianji-infinite-close" type="button" aria-label="关闭导航" @click="$emit('close')">×</button>
      <div class="qianji-infinite-stage">
        <canvas id="infinite-grid-menu-canvas" ref="canvasRef" aria-label="拖动切换模块，点击中央图标直达"></canvas>

        <template v-if="activeItem">
          <h2 class="face-title" :class="isMoving ? 'inactive' : 'active'">{{ activeItem.title }}</h2>
          <p class="face-description" :class="isMoving ? 'inactive' : 'active'">{{ activeItem.description }}</p>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup>
import { mat4, quat, vec2, vec3 } from "gl-matrix";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  items: {
    type: Array,
    default: () => []
  },
  scale: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(["close", "navigate"]);
const canvasRef = ref(null);
const activeItem = ref(null);
const isMoving = ref(false);
let sketch = null;
let resizeObserver = null;

const discVertShaderSource = `#version 300 es
uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform vec4 uRotationAxisVelocity;

in vec3 aModelPosition;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;

out vec2 vUvs;
out float vAlpha;
flat out int vInstanceId;

void main() {
  vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.);
  vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0., 0., 0., 1.)).xyz;
  float radius = length(centerPos.xyz);

  if (gl_VertexID > 0) {
    vec3 rotationAxis = uRotationAxisVelocity.xyz;
    float rotationVelocity = min(.15, uRotationAxisVelocity.w * 15.);
    vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
    vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
    float strength = dot(stretchDir, relativeVertexPos);
    float invAbsStrength = min(0., abs(strength) - 1.);
    strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.);
    worldPosition.xyz += stretchDir * strength;
  }

  worldPosition.xyz = radius * normalize(worldPosition.xyz);
  gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
  vAlpha = smoothstep(0.5, 1., normalize(worldPosition.xyz).z) * .9 + .1;
  vUvs = aModelUvs;
  vInstanceId = gl_InstanceID;
}
`;

const discFragShaderSource = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;

out vec4 outColor;
in vec2 vUvs;
in float vAlpha;
flat in int vInstanceId;

void main() {
  int itemIndex = vInstanceId % uItemCount;
  int cellsPerRow = uAtlasSize;
  int cellX = itemIndex % cellsPerRow;
  int cellY = itemIndex / cellsPerRow;
  vec2 cellSize = vec2(1.0) / vec2(float(cellsPerRow));
  vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;
  vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
  st = clamp(st, 0.0, 1.0);
  st = st * cellSize + cellOffset;
  outColor = texture(uTex, st);
  outColor.a *= vAlpha;
}
`;

class Face {
  constructor(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }
}

class Vertex {
  constructor(x, y, z) {
    this.position = vec3.fromValues(x, y, z);
    this.normal = vec3.create();
    this.uv = vec2.create();
  }
}

class Geometry {
  constructor() {
    this.vertices = [];
    this.faces = [];
  }

  addVertex(...args) {
    for (let i = 0; i < args.length; i += 3) {
      this.vertices.push(new Vertex(args[i], args[i + 1], args[i + 2]));
    }
    return this;
  }

  addFace(...args) {
    for (let i = 0; i < args.length; i += 3) {
      this.faces.push(new Face(args[i], args[i + 1], args[i + 2]));
    }
    return this;
  }

  get lastVertex() {
    return this.vertices[this.vertices.length - 1];
  }

  subdivide(divisions = 1) {
    let faces = this.faces;
    for (let div = 0; div < divisions; div += 1) {
      const cache = {};
      const nextFaces = new Array(faces.length * 4);
      faces.forEach((face, index) => {
        const mAB = this.getMidPoint(face.a, face.b, cache);
        const mBC = this.getMidPoint(face.b, face.c, cache);
        const mCA = this.getMidPoint(face.c, face.a, cache);
        const offset = index * 4;
        nextFaces[offset] = new Face(face.a, mAB, mCA);
        nextFaces[offset + 1] = new Face(face.b, mBC, mAB);
        nextFaces[offset + 2] = new Face(face.c, mCA, mBC);
        nextFaces[offset + 3] = new Face(mAB, mBC, mCA);
      });
      faces = nextFaces;
    }
    this.faces = faces;
    return this;
  }

  spherize(radius = 1) {
    this.vertices.forEach((vertex) => {
      vec3.normalize(vertex.normal, vertex.position);
      vec3.scale(vertex.position, vertex.normal, radius);
    });
    return this;
  }

  get data() {
    return {
      vertices: new Float32Array(this.vertices.flatMap((vertex) => Array.from(vertex.position))),
      indices: new Uint16Array(this.faces.flatMap((face) => [face.a, face.b, face.c])),
      uvs: new Float32Array(this.vertices.flatMap((vertex) => Array.from(vertex.uv)))
    };
  }

  getMidPoint(indexA, indexB, cache) {
    const cacheKey = indexA < indexB ? `k_${indexB}_${indexA}` : `k_${indexA}_${indexB}`;
    if (Object.prototype.hasOwnProperty.call(cache, cacheKey)) {
      return cache[cacheKey];
    }

    const a = this.vertices[indexA].position;
    const b = this.vertices[indexB].position;
    const index = this.vertices.length;
    cache[cacheKey] = index;
    this.addVertex((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, (a[2] + b[2]) * 0.5);
    return index;
  }
}

class IcosahedronGeometry extends Geometry {
  constructor() {
    super();
    const t = Math.sqrt(5) * 0.5 + 0.5;
    this.addVertex(
      -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0,
      0, -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t,
      t, 0, -1, t, 0, 1, -t, 0, -1, -t, 0, 1
    ).addFace(
      0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
      1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
      3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
      4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1
    );
  }
}

class DiscGeometry extends Geometry {
  constructor(steps = 56, radius = 1) {
    super();
    const alpha = (2 * Math.PI) / Math.max(4, steps);
    this.addVertex(0, 0, 0);
    this.lastVertex.uv[0] = 0.5;
    this.lastVertex.uv[1] = 0.5;

    for (let i = 0; i < steps; i += 1) {
      const x = Math.cos(alpha * i);
      const y = Math.sin(alpha * i);
      this.addVertex(radius * x, radius * y, 0);
      this.lastVertex.uv[0] = x * 0.5 + 0.5;
      this.lastVertex.uv[1] = y * 0.5 + 0.5;
      if (i > 0) {
        this.addFace(0, i, i + 1);
      }
    }
    this.addFace(0, steps, 1);
  }
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  }
  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl, shaderSources, attribLocations) {
  const program = gl.createProgram();
  [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, index) => {
    const shader = createShader(gl, type, shaderSources[index]);
    if (shader) {
      gl.attachShader(program, shader);
    }
  });

  Object.entries(attribLocations).forEach(([attrib, location]) => {
    gl.bindAttribLocation(program, location, attrib);
  });

  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return program;
  }
  console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}

function makeBuffer(gl, data, usage) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, usage);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return buffer;
}

function resizeCanvasToDisplaySize(canvas) {
  const dpr = Math.min(2, window.devicePixelRatio);
  const width = Math.round(canvas.clientWidth * dpr);
  const height = Math.round(canvas.clientHeight * dpr);
  const needsResize = canvas.width !== width || canvas.height !== height;
  if (needsResize) {
    canvas.width = width;
    canvas.height = height;
  }
  return needsResize;
}

class ArcballControl {
  constructor(canvas, updateCallback, activateCallback) {
    this.canvas = canvas;
    this.updateCallback = updateCallback || (() => null);
    this.isPointerDown = false;
    this.orientation = quat.create();
    this.pointerRotation = quat.create();
    this.rotationVelocity = 0;
    this.rotationAxis = vec3.fromValues(1, 0, 0);
    this.snapDirection = vec3.fromValues(0, 0, -1);
    this.snapTargetDirection = null;
    this.pointerPos = vec2.create();
    this.previousPointerPos = vec2.create();
    this.combinedQuat = quat.create();
    this.smoothVelocity = 0;
    this.activateCallback = activateCallback || (() => null);
    this.pointerStart = vec2.create();

    canvas.addEventListener("pointerdown", (event) => {
      vec2.set(this.pointerPos, event.clientX, event.clientY);
      vec2.copy(this.previousPointerPos, this.pointerPos);
      vec2.copy(this.pointerStart, this.pointerPos);
      this.isPointerDown = true;
    });
    canvas.addEventListener("pointerup", (event) => {
      const rect = canvas.getBoundingClientRect();
      const distanceFromStart = vec2.distance(this.pointerStart, [event.clientX, event.clientY]);
      const distanceFromCenter = Math.hypot(
        event.clientX - rect.left - rect.width / 2,
        event.clientY - rect.top - rect.height / 2
      );
      if (distanceFromStart < 8 && distanceFromCenter < Math.min(rect.width, rect.height) * 0.23) {
        this.activateCallback();
      }
      this.isPointerDown = false;
    });
    canvas.addEventListener("pointerleave", () => {
      this.isPointerDown = false;
    });
    canvas.addEventListener("pointermove", (event) => {
      if (this.isPointerDown) {
        vec2.set(this.pointerPos, event.clientX, event.clientY);
      }
    });
    canvas.style.touchAction = "none";
  }

  update(deltaTime, targetFrameDuration = 16) {
    const timeScale = deltaTime / targetFrameDuration + 0.00001;
    let angleFactor = timeScale;
    const snapRotation = quat.create();

    if (this.isPointerDown) {
      const intensity = 0.3 * timeScale;
      const midPointerPos = vec2.sub(vec2.create(), this.pointerPos, this.previousPointerPos);
      vec2.scale(midPointerPos, midPointerPos, intensity);

      if (vec2.sqrLen(midPointerPos) > 0.1) {
        vec2.add(midPointerPos, this.previousPointerPos, midPointerPos);
        const p = this.project(midPointerPos);
        const q = this.project(this.previousPointerPos);
        vec2.copy(this.previousPointerPos, midPointerPos);
        angleFactor *= 5 / timeScale;
        this.quatFromVectors(vec3.normalize(vec3.create(), p), vec3.normalize(vec3.create(), q), this.pointerRotation, angleFactor);
      } else {
        quat.slerp(this.pointerRotation, this.pointerRotation, quat.create(), intensity);
      }
    } else {
      const intensity = 0.1 * timeScale;
      quat.slerp(this.pointerRotation, this.pointerRotation, quat.create(), intensity);
      if (this.snapTargetDirection) {
        const distanceFactor = Math.max(0.1, 1 - vec3.squaredDistance(this.snapTargetDirection, this.snapDirection) * 10);
        angleFactor *= 0.2 * distanceFactor;
        this.quatFromVectors(this.snapTargetDirection, this.snapDirection, snapRotation, angleFactor);
      }
    }

    const combinedQuat = quat.multiply(quat.create(), snapRotation, this.pointerRotation);
    this.orientation = quat.multiply(quat.create(), combinedQuat, this.orientation);
    quat.normalize(this.orientation, this.orientation);

    quat.slerp(this.combinedQuat, this.combinedQuat, combinedQuat, 0.8 * timeScale);
    quat.normalize(this.combinedQuat, this.combinedQuat);
    const radians = Math.acos(this.combinedQuat[3]) * 2;
    const s = Math.sin(radians / 2);
    let rotationVelocity = 0;
    if (s > 0.000001) {
      rotationVelocity = radians / (2 * Math.PI);
      this.rotationAxis[0] = this.combinedQuat[0] / s;
      this.rotationAxis[1] = this.combinedQuat[1] / s;
      this.rotationAxis[2] = this.combinedQuat[2] / s;
    }

    this.smoothVelocity += (rotationVelocity - this.smoothVelocity) * 0.5 * timeScale;
    this.rotationVelocity = this.smoothVelocity / timeScale;
    this.updateCallback(deltaTime);
  }

  quatFromVectors(a, b, out, angleFactor = 1) {
    const axis = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), a, b));
    const d = Math.max(-1, Math.min(1, vec3.dot(a, b)));
    quat.setAxisAngle(out, axis, Math.acos(d) * angleFactor);
  }

  project(pos) {
    const r = 2;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const side = Math.max(width, height) - 1;
    const x = (2 * pos[0] - width - 1) / side;
    const y = (2 * pos[1] - height - 1) / side;
    const xySq = x * x + y * y;
    const rSq = r * r;
    const z = xySq <= rSq / 2 ? Math.sqrt(rSq - xySq) : rSq / Math.sqrt(xySq);
    return vec3.fromValues(-x, y, z);
  }
}

class InfiniteGridMenu {
  constructor(canvas, items, onActiveItemChange, onMovementChange, onInit = null, scale = 1) {
    this.canvas = canvas;
    this.items = items.length ? items : [{ image: "", link: "", title: "", description: "" }];
    this.onActiveItemChange = onActiveItemChange || (() => null);
    this.onMovementChange = onMovementChange || (() => null);
    this.targetFrameDuration = 1000 / 60;
    this.sphereRadius = 2;
    this.time = 0;
    this.frames = 0;
    this.scaleFactor = scale;
    this.movementActive = false;
    this.smoothRotationVelocity = 0;
    this.camera = {
      near: 0.1,
      far: 40,
      fov: Math.PI / 4,
      aspect: 1,
      position: vec3.fromValues(0, 0, 3 * scale),
      up: vec3.fromValues(0, 1, 0),
      matrix: mat4.create(),
      matrices: {
        view: mat4.create(),
        projection: mat4.create()
      }
    };
    this.init(onInit);
  }

  init(onInit) {
    this.gl = this.canvas.getContext("webgl2", { antialias: true, alpha: true });
    if (!this.gl) {
      throw new Error("当前浏览器不支持 WebGL2");
    }

    const gl = this.gl;
    this.program = createProgram(gl, [discVertShaderSource, discFragShaderSource], {
      aModelPosition: 0,
      aModelUvs: 2,
      aInstanceMatrix: 3
    });
    this.locations = {
      aModelPosition: gl.getAttribLocation(this.program, "aModelPosition"),
      aModelUvs: gl.getAttribLocation(this.program, "aModelUvs"),
      aInstanceMatrix: gl.getAttribLocation(this.program, "aInstanceMatrix"),
      uWorldMatrix: gl.getUniformLocation(this.program, "uWorldMatrix"),
      uViewMatrix: gl.getUniformLocation(this.program, "uViewMatrix"),
      uProjectionMatrix: gl.getUniformLocation(this.program, "uProjectionMatrix"),
      uCameraPosition: gl.getUniformLocation(this.program, "uCameraPosition"),
      uRotationAxisVelocity: gl.getUniformLocation(this.program, "uRotationAxisVelocity"),
      uTex: gl.getUniformLocation(this.program, "uTex"),
      uItemCount: gl.getUniformLocation(this.program, "uItemCount"),
      uAtlasSize: gl.getUniformLocation(this.program, "uAtlasSize")
    };

    this.discGeo = new DiscGeometry(56, 1);
    this.discBuffers = this.discGeo.data;
    this.discVAO = gl.createVertexArray();
    gl.bindVertexArray(this.discVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, makeBuffer(gl, this.discBuffers.vertices, gl.STATIC_DRAW));
    gl.enableVertexAttribArray(this.locations.aModelPosition);
    gl.vertexAttribPointer(this.locations.aModelPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, makeBuffer(gl, this.discBuffers.uvs, gl.STATIC_DRAW));
    gl.enableVertexAttribArray(this.locations.aModelUvs);
    gl.vertexAttribPointer(this.locations.aModelUvs, 2, gl.FLOAT, false, 0, 0);
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.discBuffers.indices, gl.STATIC_DRAW);

    this.icoGeo = new IcosahedronGeometry();
    this.icoGeo.subdivide(1).spherize(this.sphereRadius);
    this.instancePositions = this.icoGeo.vertices.map((vertex) => vertex.position);
    this.initDiscInstances(this.instancePositions.length);
    gl.bindVertexArray(null);

    this.worldMatrix = mat4.create();
    this.initTexture();
    this.control = new ArcballControl(
      this.canvas,
      (deltaTime) => this.onControlUpdate(deltaTime),
      () => this.onItemActivate()
    );
    this.updateCameraMatrix();
    this.resize();
    if (onInit) {
      onInit(this);
    }
  }

  initDiscInstances(count) {
    const gl = this.gl;
    this.discInstances = {
      matricesArray: new Float32Array(count * 16),
      matrices: [],
      buffer: gl.createBuffer()
    };
    for (let i = 0; i < count; i += 1) {
      const matrixArray = new Float32Array(this.discInstances.matricesArray.buffer, i * 16 * 4, 16);
      matrixArray.set(mat4.create());
      this.discInstances.matrices.push(matrixArray);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.discInstances.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.discInstances.matricesArray.byteLength, gl.DYNAMIC_DRAW);
    for (let index = 0; index < 4; index += 1) {
      const location = this.locations.aInstanceMatrix + index;
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 4, gl.FLOAT, false, 64, index * 16);
      gl.vertexAttribDivisor(location, 1);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  initTexture() {
    const gl = this.gl;
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const itemCount = Math.max(1, this.items.length);
    this.atlasSize = Math.ceil(Math.sqrt(itemCount));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const cellSize = 512;
    canvas.width = this.atlasSize * cellSize;
    canvas.height = this.atlasSize * cellSize;

    Promise.all(this.items.map((item) => new Promise((resolve) => {
      const image = new Image();
      if (!item.image.startsWith("data:")) {
        image.crossOrigin = "anonymous";
      }
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = item.image;
    }))).then((images) => {
      images.forEach((image, index) => {
        const x = (index % this.atlasSize) * cellSize;
        const y = Math.floor(index / this.atlasSize) * cellSize;
        if (image) {
          context.drawImage(image, x, y, cellSize, cellSize);
        }
      });
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    });
  }

  resize() {
    const gl = this.gl;
    if (resizeCanvasToDisplaySize(gl.canvas)) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
    this.updateProjectionMatrix();
  }

  run(time = 0) {
    if (this.destroyed) {
      return;
    }
    const deltaTime = Math.min(32, time - this.time);
    this.time = time;
    this.frames += deltaTime / this.targetFrameDuration;
    this.animate(deltaTime);
    this.render();
    this.animationFrame = requestAnimationFrame((nextTime) => this.run(nextTime));
  }

  animate(deltaTime) {
    this.control.update(deltaTime, this.targetFrameDuration);
    const scale = 0.25;
    const scaleIntensity = 0.6;
    const positions = this.instancePositions.map((position) => vec3.transformQuat(vec3.create(), position, this.control.orientation));
    positions.forEach((position, index) => {
      const depthScale = (Math.abs(position[2]) / this.sphereRadius) * scaleIntensity + (1 - scaleIntensity);
      const finalScale = depthScale * scale;
      const matrix = mat4.create();
      mat4.multiply(matrix, matrix, mat4.fromTranslation(mat4.create(), vec3.negate(vec3.create(), position)));
      mat4.multiply(matrix, matrix, mat4.targetTo(mat4.create(), [0, 0, 0], position, [0, 1, 0]));
      mat4.multiply(matrix, matrix, mat4.fromScaling(mat4.create(), [finalScale, finalScale, finalScale]));
      mat4.multiply(matrix, matrix, mat4.fromTranslation(mat4.create(), [0, 0, -this.sphereRadius]));
      mat4.copy(this.discInstances.matrices[index], matrix);
    });

    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.discInstances.buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.discInstances.matricesArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    this.smoothRotationVelocity = this.control.rotationVelocity;
  }

  render() {
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(this.locations.uWorldMatrix, false, this.worldMatrix);
    gl.uniformMatrix4fv(this.locations.uViewMatrix, false, this.camera.matrices.view);
    gl.uniformMatrix4fv(this.locations.uProjectionMatrix, false, this.camera.matrices.projection);
    gl.uniform3f(this.locations.uCameraPosition, this.camera.position[0], this.camera.position[1], this.camera.position[2]);
    gl.uniform4f(
      this.locations.uRotationAxisVelocity,
      this.control.rotationAxis[0],
      this.control.rotationAxis[1],
      this.control.rotationAxis[2],
      this.smoothRotationVelocity * 1.1
    );
    gl.uniform1i(this.locations.uItemCount, this.items.length);
    gl.uniform1i(this.locations.uAtlasSize, this.atlasSize);
    gl.uniform1i(this.locations.uTex, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.bindVertexArray(this.discVAO);
    gl.drawElementsInstanced(gl.TRIANGLES, this.discBuffers.indices.length, gl.UNSIGNED_SHORT, 0, this.instancePositions.length);
  }

  updateCameraMatrix() {
    mat4.targetTo(this.camera.matrix, this.camera.position, [0, 0, 0], this.camera.up);
    mat4.invert(this.camera.matrices.view, this.camera.matrix);
  }

  updateProjectionMatrix() {
    const gl = this.gl;
    this.camera.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const height = this.sphereRadius * 0.35;
    const distance = this.camera.position[2];
    this.camera.fov = this.camera.aspect > 1 ? 2 * Math.atan(height / distance) : 2 * Math.atan(height / this.camera.aspect / distance);
    mat4.perspective(this.camera.matrices.projection, this.camera.fov, this.camera.aspect, this.camera.near, this.camera.far);
  }

  onControlUpdate(deltaTime) {
    const timeScale = deltaTime / this.targetFrameDuration + 0.0001;
    let damping = 5 / timeScale;
    let cameraTargetZ = 3 * this.scaleFactor;
    const moving = this.control.isPointerDown || Math.abs(this.smoothRotationVelocity) > 0.01;

    if (moving !== this.movementActive) {
      this.movementActive = moving;
      this.onMovementChange(moving);
    }

    if (!this.control.isPointerDown) {
      const nearestVertexIndex = this.findNearestVertexIndex();
      this.onActiveItemChange(nearestVertexIndex % Math.max(1, this.items.length));
      this.control.snapTargetDirection = vec3.normalize(vec3.create(), this.getVertexWorldPosition(nearestVertexIndex));
    } else {
      cameraTargetZ += this.control.rotationVelocity * 80 + 2.5;
      damping = 7 / timeScale;
    }

    this.camera.position[2] += (cameraTargetZ - this.camera.position[2]) / damping;
    this.updateCameraMatrix();
  }

  onItemActivate() {
    const nearestVertexIndex = this.findNearestVertexIndex();
    this.onActiveItemChange(nearestVertexIndex % Math.max(1, this.items.length), true);
  }

  findNearestVertexIndex() {
    const inverseOrientation = quat.conjugate(quat.create(), this.control.orientation);
    const target = vec3.transformQuat(vec3.create(), this.control.snapDirection, inverseOrientation);
    let maxDistance = -1;
    let nearestVertexIndex = 0;
    this.instancePositions.forEach((position, index) => {
      const distance = vec3.dot(target, position);
      if (distance > maxDistance) {
        maxDistance = distance;
        nearestVertexIndex = index;
      }
    });
    return nearestVertexIndex;
  }

  getVertexWorldPosition(index) {
    return vec3.transformQuat(vec3.create(), this.instancePositions[index], this.control.orientation);
  }

  destroy() {
    this.destroyed = true;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

function initMenu() {
  if (!canvasRef.value || sketch) {
    return;
  }

  sketch = new InfiniteGridMenu(
    canvasRef.value,
    props.items,
    (index, shouldNavigate = false) => {
      activeItem.value = props.items[index % props.items.length];
      if (shouldNavigate && activeItem.value?.link) {
        emit("navigate", activeItem.value.link);
      }
    },
    (moving) => {
      isMoving.value = moving;
    },
    (instance) => instance.run(),
    props.scale
  );
  sketch.resize();
}

onMounted(() => {
  initMenu();
  resizeObserver = new ResizeObserver(() => {
    sketch?.resize();
  });
  if (canvasRef.value) {
    resizeObserver.observe(canvasRef.value);
  }
});

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    requestAnimationFrame(() => sketch?.resize());
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  sketch?.destroy();
});
</script>
