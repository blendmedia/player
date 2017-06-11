
  var degree = Math.PI / 180;
  const glMatrix = {
    EPSILON: 0.000001,
    toRadian(a){
      return a * degree;
    },
  };
  const identity = function (out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  };

  const lookAt = function (out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
      eyex = eye[0],
      eyey = eye[1],
      eyez = eye[2],
      upx = up[0],
      upy = up[1],
      upz = up[2],
      centerx = center[0],
      centery = center[1],
      centerz = center[2];
    if (Math.abs(eyex - centerx) < glMatrix.EPSILON &&
            Math.abs(eyey - centery) < glMatrix.EPSILON &&
            Math.abs(eyez - centerz) < glMatrix.EPSILON) {
      return identity(out);
    }
    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;
    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;
    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
      x0 = 0;
      x1 = 0;
      x2 = 0;
    } else {
      len = 1 / len;
      x0 *= len;
      x1 *= len;
      x2 *= len;
    }
    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;
    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
      y0 = 0;
      y1 = 0;
      y2 = 0;
    } else {
      len = 1 / len;
      y0 *= len;
      y1 *= len;
      y2 *= len;
    }
    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;
    return out;
  };

  const mul = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
      a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
      a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
      a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;
  };

  const rotate = function (out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
      len = Math.sqrt(x * x + y * y + z * z),
      s, c, t,
      a00, a01, a02, a03,
      a10, a11, a12, a13,
      a20, a21, a22, a23,
      b00, b01, b02,
      b10, b11, b12,
      b20, b21, b22;
    if (Math.abs(len) < glMatrix.EPSILON) { return null; }
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;
    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];
        // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;
        // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;
    if (a !== out) { // If the source and destination differ, copy the unchanged last row
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }
    return out;
  };

  const video = document.querySelector("#video");
  let gl, program;

  function player(video) {
    Promise.all([
      fetch("./video.vert").then(r => r.text()),
      fetch("./video.frag").then(r => r.text())
    ]).then(([vertexShaderText, fragmentShaderText]) => {

      let position = { alpha: 0, beta: 0, gamma: 0 };
      window.addEventListener("deviceorientation", function(e){
        const positionEl = document.querySelector(".position");
        const { alpha, beta, gamma } = e;
        if (beta !== null) {
          position = {
            alpha: degree * alpha,
            beta: degree * beta,
            gamma: degree *  gamma
          };
        }
        positionEl.innerHTML = `alpha: ${alpha.toFixed(2)}, beta: ${beta.toFixed(2)}, gamma: ${gamma.toFixed(2)}`;
      });

      let videoTexture = null;



      if (!video.parentNode) {
        console.error("<video> tag must be present in the DOM");
        return false;
      }
      const play = function() {
        return video.play() || Promise.resolve(true);
      };



      function sphere(radius, rows, segments) {
        // Position & color
        const vertex = [];
        // Vertex order
        const indices = [];

        const { PI, sin, cos } = Math;

        for (let r = 0; r <= rows; ++r) {
          for (let s = 0; s < segments; ++s) {
            const rr = r / rows;
            // Ensure last element rese
            const sr = (s / (segments - 1)) ;
            const theta = r * PI / rows; // angle of z axis
            const phi = s * 2 * PI / (segments - 1); // angle of y axis
            const sinTheta = sin(theta);
            const sinPhi = sin(phi);
            const cosTheta = cos(theta);
            const cosPhi = cos(phi);
            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;
            vertex.push(
              x * radius,
              y * radius,
              z * radius
            );
            vertex.push(sr, 1 - rr);
          }
        }
        for (let r = 0; r < rows; ++r) {
          for (let s = 0; s <= segments; ++s) {
            indices.push(
              (r * segments) + (s % segments),
              ((r + 1) * segments) + (s % segments)
            );
          }
        }
        return [
          new Float32Array(vertex),
          new Uint16Array(indices),
        ];
      }

      function initTextures() {
        videoTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, videoTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                              new Uint8Array([0, 0, 0, 255])); // black

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
      }

      function updateTexture() {
        gl.bindTexture(gl.TEXTURE_2D, videoTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                        gl.UNSIGNED_BYTE, video);
        gl.bindTexture(gl.TEXTURE_2D, null);
      }

      const perspective = function (out, fovy, aspect, near, far) {
        var f = 1.0 / Math.tan(fovy / 2),
          nf = 1 / (near - far);
        out[0] = f / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = f;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = (far + near) * nf;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[14] = (2 * far * near) * nf;
        out[15] = 0;
        return out;
      };

      const [boxVertices, boxIndices] = sphere(500, 40, 40);
      var matWorldUniformLocation;
      var matViewUniformLocation;
      var matProjUniformLocation;
      var projMatrix = new Float32Array(16);
      var worldMatrix = new Float32Array(16);
      var identityMatrix = new Float32Array(16);
      identity(identityMatrix);
      var angle = 0;
      var xRotationMatrix = new Float32Array(16);
      var yRotationMatrix = new Float32Array(16);
      var viewMatrix = new Float32Array(16);
      function updateLoop() {
        angle = Math.PI *0.5; //performance.now() / 1000 / 30 * 2 * Math.PI;

                // lookAt(viewMatrix, [x, y, z], [0, 0, 0], [0, 1, 0]);
        // const up = [Math.sin(position.roll), Math.cos(position.roll), 0];

        const pointAt = [
          0,
          1,
          0,
        ];

        // Apply z rotation
        // |cos θ   −sin θ   0| |x|   |x cos θ − y sin θ|   |x'|
        // |sin θ    cos θ   0| |y| = |x sin θ + y cos θ| = |y'|
        // |  0       0      1| |z|   |        z        |   |z'|
        pointAt[0] = (
          pointAt[0]*Math.cos(position.alpha) -
          pointAt[1]*Math.sin(position.alpha)
        );
        pointAt[1] = (
          pointAt[0]*Math.sin(position.alpha) +
          pointAt[1]*Math.cos(position.alpha)
        );

        // Apply x rotation
        // |1     0           0| |x|   |        x        |   |x'|
        // |0   cos θ    −sin θ| |y| = |y cos θ − z sin θ| = |y'|
        // |0   sin θ     cos θ| |z|   |y sin θ + z cos θ|   |z'|
        pointAt[1] = (
          pointAt[1]*Math.cos(position.beta) -
          pointAt[2]*Math.sin(position.beta)
        );
        pointAt[2] = (
          pointAt[1]*Math.sin(position.beta) +
          pointAt[2]*Math.cos(position.beta)
        );

        // Apply y rotation
        // | cos θ    0   sin θ| |x|   | x cos θ + z sin θ|   |x'|
        // |   0      1       0| |y| = |         y        | = |y'|
        // |−sin θ    0   cos θ| |z|   |−x sin θ + z cos θ|   |z'|
        pointAt[0] = (
          pointAt[0]*Math.cos(position.gamma) + pointAt[2]*Math.sin(position.gamma)
        );
        pointAt[2] = (
          -pointAt[0]*Math.sin(position.gamma) + pointAt[2]*Math.cos(position.gamma)
        );

        lookAt(viewMatrix, [0, 0, 0], [0, 0, 1], pointAt);

        rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
        rotate(xRotationMatrix, identityMatrix, 0, [0, 0, 1]);
        mul(worldMatrix, xRotationMatrix, yRotationMatrix);
                // identity(worldMatrix)
        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

        var width = gl.canvas.clientWidth;
        var height = gl.canvas.clientHeight;

        if (gl.canvas.width != width || gl.canvas.height != height) {
          gl.canvas.width = width;
          gl.canvas.height = height;
        }


        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 1, 2000.0);
        gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
        updateTexture();
        gl.bindTexture(gl.TEXTURE_2D, videoTexture);
        gl.activeTexture(gl.TEXTURE0);
        gl.drawElements(gl.TRIANGLE_STRIP, boxIndices.length, gl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(updateLoop);
      }

      function initWebGL(canvas) {
        gl = null;

                // Try to grab the standard context. If it fails, fallback to experimental.
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

                // If we don't have a GL context, give up now
        if (!gl) {
          alert("Unable to initialize WebGL. Your browser may not support it.");
        }

                // gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CW);
        gl.cullFace(gl.BACK);

        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(vertexShader, vertexShaderText);
        gl.shaderSource(fragmentShader, fragmentShaderText);

        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
          console.error("ERROR compiling vertex shader!", gl.getShaderInfoLog(vertexShader));
          return;
        }

        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
          console.error("ERROR compiling fragment shader!", gl.getShaderInfoLog(fragmentShader));
          return;
        }

        program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          console.error("ERROR linking program!", gl.getProgramInfoLog(program));
          return;
        }
        gl.validateProgram(program);
        if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
          console.error("ERROR validating program!", gl.getProgramInfoLog(program));
          return;
        }


        var boxVertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, boxVertices, gl.STATIC_DRAW);

        var boxIndexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, boxIndices, gl.STATIC_DRAW);

        var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
        var texUvAttribLocation = gl.getAttribLocation(program, "vertTexCoord");
        gl.vertexAttribPointer(
                  positionAttribLocation, // Attribute location
                  3, // Number of elements per attribute
                  gl.FLOAT, // Type of elements
                  gl.FALSE,
                  5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
                  0 // Offset from the beginning of a single vertex to this attribute
                );
        gl.vertexAttribPointer(
                  texUvAttribLocation, // Attribute location
                  2, // Number of elements per attribute
                  gl.FLOAT, // Type of elements
                  gl.FALSE,
                  5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
                  3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
                );

        gl.enableVertexAttribArray(positionAttribLocation);
        gl.enableVertexAttribArray(texUvAttribLocation);

                // Tell OpenGL state machine which program should be active.
        gl.useProgram(program);

        matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
        matViewUniformLocation = gl.getUniformLocation(program, "mView");
        matProjUniformLocation = gl.getUniformLocation(program, "mProj");

        var worldMatrix = new Float32Array(16);
        var viewMatrix = new Float32Array(16);

        identity(worldMatrix);
        lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
        perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 1, 2000.0);

        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);


        return gl;
      }

      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const wrapper = document.createElement("div");
      gl = initWebGL(canvas);
              // Set clear color to black, fully opaque
      gl.clearColor(0.4, 0.4, 0.4, 1.0);
              // Enable depth testing
              // gl.enable(gl.DEPTH_TEST);
              // Near things obscure far things
      gl.depthFunc(gl.LEQUAL);
              // Clear the color as well as the depth buffer.
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      initTextures();

      wrapper.className = "BlendPlayer";
      canvas.className = "BlendPlayer__canvas";
      video.classList.add("BlendPlayer__video");
      wrapper.appendChild(canvas);
      video.parentNode.insertBefore(wrapper, video);
      wrapper.appendChild(video);

      const startVideo = () => {
        play().catch(e => console.warn(e)).then(function() {
          setTimeout(function() {
            updateLoop();

          }, 500);
        });
      };
      video.addEventListener("canplaythrough", startVideo, true);

    });
      // Load so


  }

  player(video);

