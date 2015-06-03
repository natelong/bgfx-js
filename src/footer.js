
    var NOT_DEFINED;
    var TO_RAD = Math.PI / 180;

    var _canvas = document.createElement('canvas');
    document.body.appendChild(_canvas);

    var _inst = new _bgfx({
        TOTAL_MEMORY: 256*1024*1024,
        canvas:       _canvas
    });

//-------------------------------------------------------------------------
// Utilities
//-------------------------------------------------------------------------

    /**
     * @param {string} str - String to be copied into BGFX's memory
     */
    function memFromString (str) {
        var handle;
        var buf = _inst._malloc(str.length+1);

        _inst.writeStringToMemory(str, buf);
        handle = _inst._bgfx_copy(buf, str.length+1);
        _inst._free(buf);

        return handle;
    }

    /**
     * @param {ArrayBuffer} buffer - ArrayBuffer containing the data to be copied into BGFX's memory
     */
    function memFromArray (buffer) {
        var handle;
        var view = new Uint8Array(buffer);
        var buf  = _inst._malloc(view.byteLength);

        _inst.writeArrayToMemory(view, buf);
        handle = _inst._bgfx_copy(buf, view.byteLength);
        _inst._free(buf);

        return handle
    }

//-------------------------------------------------------------------------
// Vertex Declaration
//-------------------------------------------------------------------------

    /**
     * Vertex attribute declaration object
     *
     * @constructor
     */
    function VertexDecl () {
        this._ptr = _inst._bgfx_create_vertex_decl();
        this.size = 0;
    }

    /**
     * Begin the vertex declaration.
     */
    VertexDecl.prototype.begin = function () {
        // TODO: refactor magic number for BGFX_RENDERER_TYPE_COUNT
        _inst._bgfx_vertex_decl_begin(this._ptr, 7);
    };

    /**
     * Add an attribute to a vertex declaration. Must be called between begin/end.
     *
     * @param {number} attrib - Attribute to be added. One of the bgfx.ATTRIB_* constants
     * @param {number} num    - Number of elements in this attribute
     * @param {number} type   - Type of attribute to be added. On of the bgfx.ATTRIB_TYPE_* constants
     * @param {bool}   norm   - Whether or not the values should be normalized
     * @param {bool}   asInt  - Packaging rule for vertexPack, vertexUnpack, and vertexConvert for AttribType::Uint8 and AttribType::Int16. Unpacking code must be implemented inside vertex shader.
     */
    VertexDecl.prototype.add = function (attrib, num, type, norm, asInt) {
        norm  = norm  !== NOT_DEFINED ? norm  : false;
        asInt = asInt !== NOT_DEFINED ? asInt : false;

        switch (type) {
            case 0x0000: this.size += 1 * num; break;
            case 0x0001:
            case 0x0002: this.size += 2 * num; break;
            case 0x0003: this.size += 4 * num; break;
        }

        _inst._bgfx_vertex_decl_add(this._ptr, attrib, num, type, norm, asInt);
    };

    /**
     * Skip bytes in vertex stream.
     *
     * @param {number} num - Number of bytes to skip
     */
    VertexDecl.prototype.skip = function (num) {
        this.size += num;
        _inst._bgfx_vertex_decl_skip(this._ptr, num);
    };

    /**
     * End the vertex declaration
     */
    VertexDecl.prototype.end = function () {
        _inst._bgfx_vertex_decl_end(this._ptr);
    };

    /**
     * Destroy this instance by freeing the the native data
     */
    VertexDecl.prototype.destroy = function () {
        _inst._free(this._ptr);
        this._ptr = null;
        this.size = 0;
    }

//-------------------------------------------------------------------------
// Vector3
//-------------------------------------------------------------------------

    /**
     * Create a new Vector3 object
     * @constructor
     * @param {number} x - A value for x
     * @param {number} y - A value for y
     * @param {number} z - A value for z
     */
    function Vector3 (x, y, z) {
        // TODO: allocate from the asmjs heap so we don't have to copy later
        this.data = new Float32Array(3);

        if(x !== NOT_DEFINED) this.data[0] = x;
        if(y !== NOT_DEFINED) this.data[1] = y;
        if(z !== NOT_DEFINED) this.data[2] = z;
    }

    function vec3Sub (out, a, b) {
        var ad = a.data;
        var bd = b.data;
        var od = out.data;

        od[0] = ad[0] - bd[0];
        od[1] = ad[1] - bd[1];
        od[2] = ad[2] - bd[2];
    }

    function vec3Dot (a, b) {
        var ad = a.data;
        var bd = b.data;

        return ad[0]*bd[0] + ad[1]*bd[1] + ad[2]*bd[2];
    }

    function vec3Cross (out, a, b) {
        var ad = a.data;
        var bd = b.data;
        var od = out.data;

        od[0] = ad[1]*bd[2] - ad[2]*bd[1];
        od[1] = ad[2]*bd[0] - ad[0]*bd[2];
        od[2] = ad[0]*bd[1] - ad[1]*bd[0];
    }

    function vec3Len (vec) {
        return Math.sqrt(vec3Dot(vec, vec));
    }

    function vec3Norm (out, vec) {
        var a = vec.data;
        var b = out.data;

        var len    = vec3Len(vec);
        var invLen = 1 / len;

        b[0] = a[0] * invLen;
        b[1] = a[1] * invLen;
        b[2] = a[2] * invLen;

        return len;
    }

    Vector3.up = new Vector3(0, 1, 0);

//-------------------------------------------------------------------------
// Matrix 4x4
//-------------------------------------------------------------------------

    function Matrix44 () {
        this.data = new Float32Array(16);
    }

    function mtxIdentity (out) {
        var od = out.data;
        od[ 0] = 1;
        od[ 1] = 0;
        od[ 2] = 0;
        od[ 3] = 0;
        od[ 4] = 0;
        od[ 5] = 1;
        od[ 6] = 0;
        od[ 7] = 0;
        od[ 8] = 0;
        od[ 9] = 0;
        od[10] = 1;
        od[11] = 0;
        od[12] = 0;
        od[13] = 0;
        od[14] = 0;
        od[15] = 1;
    }

    function mtxLookAt (out, eye, at, up) {
        up = up || Vector3.up;

        var tmp   = new Vector3();
        var view  = new Vector3();
        var right = new Vector3();

        var od = out.data;
        var rd = right.data;
        var ud = up.data;
        var vd = view.data;

        vec3Sub(tmp, at, eye);
        vec3Norm(view, tmp);
        vec3Cross(tmp, up, view);
        vec3Norm(right, tmp);
        vec3Cross(up, view, right);

        od[ 0] = rd[0];
        od[ 1] = ud[0];
        od[ 2] = vd[0];
        od[ 3] = 0;

        od[ 4] = rd[1];
        od[ 5] = ud[1];
        od[ 6] = vd[1];
        od[ 7] = 0;

        od[ 8] = rd[2];
        od[ 9] = ud[2];
        od[10] = vd[2];
        od[11] = 0;

        od[12] = -vec3Dot(right, eye);
        od[13] = -vec3Dot(up, eye);
        od[14] = -vec3Dot(view, eye);
        od[15] = 1;
    }

    function mtxProjXYWH (out, x, y, width, height, near, far) {
        var diff = far - near;
        var aa   = far / diff;
        var bb   = -near * aa;

        var od = out.data;
        od[ 0] = width;
        od[ 1] = 0;
        od[ 2] = 0;
        od[ 3] = 0;
        od[ 4] = 0;
        od[ 5] = height;
        od[ 6] = 0;
        od[ 7] = 0;
        od[ 8] = x;
        od[ 9] = y;
        od[10] = aa;
        od[11] = 1;
        od[12] = 0;
        od[13] = 0;
        od[14] = bb;
        od[15] = 0;
    }

    function mtxProj (out, fov, aspect, near, far) {
        var height = 1 / Math.tan(fov * TO_RAD * 0.5);
        var width  = height * (1 / aspect);
        mtxProjXYWH(out, 0, 0, width, height, near, far);
    }

    function mtxRotateXY (out, ax, ay) {
        var sx = Math.sin(ax);
        var cx = Math.cos(ax);
        var sy = Math.sin(ay);
        var cy = Math.cos(ay);

        var od = out.data;
        od[ 0] = cy;
        od[ 1] = 0;
        od[ 2] = sy;
        od[ 3] = 0;
        od[ 4] = sx*sy;
        od[ 5] = cx;
        od[ 6] = -sx*cy;
        od[ 7] = 0;
        od[ 8] = -cx*sy;
        od[ 9] = sx;
        od[10] = cx*cy;
        od[11] = 0;
        od[12] = 0;
        od[13] = 0;
        od[14] = 0;
        od[15] = 1;
    }

//-------------------------------------------------------------------------
// Exposed Interface
//-------------------------------------------------------------------------

    window.bgfx = {
        DEBUG_NONE:            0x0000,
        DEBUG_WIREFRAME:       0x0001,
        DEBUG_IFH:             0x0002,
        DEBUG_STATS:           0x0004,
        DEBUG_TEXT:            0x0008,

        CLEAR_NONE:            0x0000,
        CLEAR_COLOR:           0x0001,
        CLEAR_DEPTH:           0x0002,
        CLEAR_STENCIL:         0x0004,
        CLEAR_DISCARD_COLOR_0: 0x0008,
        CLEAR_DISCARD_COLOR_1: 0x0010,
        CLEAR_DISCARD_COLOR_2: 0x0020,
        CLEAR_DISCARD_COLOR_3: 0x0040,
        CLEAR_DISCARD_COLOR_4: 0x0080,
        CLEAR_DISCARD_COLOR_5: 0x0100,
        CLEAR_DISCARD_COLOR_6: 0x0200,
        CLEAR_DISCARD_COLOR_7: 0x0400,
        CLEAR_DISCARD_DEPTH:   0x0800,
        CLEAR_DISCARD_STENCIL: 0x1000,

        Attrib: {
            POSITION:  0x0000,
            NORMAL:    0x0001,
            TANGENT:   0x0002,
            BITANGENT: 0x0003,
            COLOR0:    0x0004,
            COLOR1:    0x0005,
            INDICES:   0x0006,
            WEIGHT:    0x0007,
            TEXCOORD0: 0x0008,
            TEXCOORD1: 0x0009,
            TEXCOORD2: 0x000a,
            TEXCOORD3: 0x000b,
            TEXCOORD4: 0x000c,
            TEXCOORD5: 0x000d,
            TEXCOORD6: 0x000e,
            TEXCOORD7: 0x000f
        },

        AttribType: {
            UINT8: 0x0000,
            INT16: 0x0001,
            HALF:  0x0002,
            FLOAT: 0x0003,
        },

        init: function () {
            _inst._bgfx_init();
        },

        reset: function (width, height, flags) {
            _inst._bgfx_reset(width, height, flags);
        },

        setDebug: function (debug) {
            _inst._bgfx_set_debug(debug);
        },

        setViewClear: function (id, flags, rgba, depth, stencil) {
            _inst._bgfx_set_view_clear(id, flags, rgba, depth, stencil);
        },

        setViewRect: function (id, x, y, width, height) {
            _inst._bgfx_set_view_rect(id, x, y, width, height);
        },

        /**
         * @param {Float32Array} view - View matrix
         * @param {Float32Array} proj - Projection matrix
         */
        setViewTransform: function (id, view, proj) {
            var viewBuf = _inst._malloc(view.data.byteLength);
            _inst.HEAPU8.set(new Uint8Array(view.data.buffer), viewBuf);

            var projBuf = _inst._malloc(proj.data.byteLength);
            _inst.HEAPU8.set(new Uint8Array(proj.data.buffer), projBuf);

            _inst._bgfx_set_view_transform(id, viewBuf, projBuf);

            _inst._free(viewBuf);
            _inst._free(projBuf);
        },

        /**
         * @param {Float32Array} mtx - Transformation matrix
         */
        setTransform: function (transform) {
            var buf = _inst._malloc(transform.data.byteLength);
            _inst.HEAPU8.set(new Uint8Array(transform.data.buffer), buf);

            _inst._bgfx_set_transform(buf, 1);

            _inst._free(buf);
        },

        setProgram: function (handle) {
            _inst._bgfx_set_program_shim(handle);
        },

        setVertexBuffer: function (handle, start, count) {
            start = (start === NOT_DEFINED) ? 0 : start;
            count = (count === NOT_DEFINED) ? 0xffffffff : count;

            _inst._bgfx_set_vertex_buffer_shim(handle, start, count);
        },

        setIndexBuffer: function (handle, start, count) {
            start = (start === NOT_DEFINED) ? 0 : start;
            count = (count === NOT_DEFINED) ? 0xffffffff : count;

            _inst._bgfx_set_index_buffer_shim(handle, start, count);
        },

        // TODO: Find a better way to set this up, since JS doesn't support 64-bit ints
        setState: function () {
            _inst._bgfx_set_state_shim();
        },

        submit: function (id, depth) {
            id    = (id === NOT_DEFINED) ? 0 : id;
            depth = (depth === NOT_DEFINED) ? 0 : id;

            _inst._bgfx_submit(id, depth);
        },

        dbgTextClear: function (attr, small) {
            _inst._bgfx_dbg_text_clear(attr, small);
        },

        dbgTextImage: function (x, y, width, height, data, pitch) {
            var sp  = _inst.Runtime.stackSave();
            var buf = _inst.allocate(data, 'i8', _inst.ALLOC_STACK);
            _inst._bgfx_dbg_text_image(x, y, width, height, buf, pitch);
            _inst.Runtime.stackRestore(sp);
        },

        dbgTextPrintf: function (x, y, attr, format) {
            var sp  = _inst.Runtime.stackSave();
            var buf = _inst.allocate(_inst.intArrayFromString(format), 'i8', _inst.ALLOC_STACK);
            format = buf;
            _inst._bgfx_dbg_text_printf.apply(_inst, arguments);
            _inst.Runtime.stackRestore(sp);
        },

        frame: function () {
            _inst._bgfx_frame();
        },

        /**
         * Create a vertex buffer with the given vertices and attribute declaration
         * @param   {ArrayBuffer|TypedArray} verts - Vertices to be added to the declaration
         * @returns {number} - A handle to the created vertex buffer
         */
        createVertexBuffer: function (verts, decl, flags) {
            flags = (flags === NOT_DEFINED) ? 0 : flags;

            var memptr = memFromArray(ArrayBuffer.isView(verts) ? verts.buffer : verts);

            return _inst._bgfx_create_vertex_buffer_shim(memptr, decl._ptr, flags);
        },

        /**
         * Create an index buffer with the given values
         * @param   {ArrayBuffer|TypedArray} indices - Indices to be added to the buffer declaration
         * @returns {number} - A handle to the created index buffer
         */
        createIndexBuffer: function (indices) {
            var memptr = memFromArray(ArrayBuffer.isView(indices) ? indices.buffer : indices);

            return _inst._bgfx_create_index_buffer_shim(memptr);
        },

        /**
         * Create a shader from the given source
         * @param   {ArrayBuffer} src - The shader code, built by shaderc
         * @returns {number} - A handle to the created shader
         */
        createShader: function (src) {
            return _inst._bgfx_create_shader_shim(memFromArray(src));
        },

        /**
         * Create a program from the given shaders
         * @param   {Shader} vsh - Vertex shader to include in the program
         * @param   {Shader} fsh - Fragment shader to include in the program
         * @param   {boolean} [destroy=true] - Whether or not to destroy the shaders after the program is created
         * @returns {number} - A handle to the created program
         */
        createProgram: function (vsh, fsh, destroy) {
            destroy = destroy === NOT_DEFINED ? true : destroy;
            return _inst._bgfx_create_program_shim(vsh, fsh, destroy);
        },

        VertexDecl: VertexDecl,

        Vector3:   Vector3,
        vec3Sub:   vec3Sub,
        vec3Dot:   vec3Dot,
        vec3Cross: vec3Cross,
        vec3Len:   vec3Len,
        vec3Norm:  vec3Norm,

        Matrix44:    Matrix44,
        mtxIdentity: mtxIdentity,
        mtxLookAt:   mtxLookAt,
        mtxProjXYWH: mtxProjXYWH,
        mtxProj:     mtxProj,
        mtxRotateXY: mtxRotateXY,
    }

}());
