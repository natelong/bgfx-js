
    var NOT_DEFINED;

    var _canvas = document.createElement('canvas');
    document.body.appendChild(_canvas);

    var _inst = new _bgfx({
        TOTAL_MEMORY: 256*1024*1024,
        canvas:       _canvas
    });

    function memFromString(str) {
        var sp  = _inst.Runtime.stackSave();
        var buf = _inst.allocate(_inst.intArrayFromString(str), 'i8', _inst.ALLOC_STACK);
        _inst._bgfx_copy(buf, str.length);
        _inst.Runtime.stackRestore(sp);
    }

//-------------------------------------------------------------------------
// Vertex Declaration
//-------------------------------------------------------------------------

    /**
     * Vertex attribute declaration object
     *
     * @constructor
     */
    function VertexDecl() {
        var ptr = _inst._malloc(4 + 2 + 2 * 10 + 1 * 10);
        this._ptr = ptr;
        this.size = 0;
    }

    /**
     * Begin the vertex declaration.
     */
    VertexDecl.prototype.begin = function() {
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
    VertexDecl.prototype.add = function(attrib, num, type, norm, asInt) {
        norm  = norm  !== NOT_DEFINED ? norm  : false;
        asInt = asInt !== NOT_DEFINED ? asInt : false;

        switch (type) {
            case 0x0001: this.size += 1 * num; break;
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
    VertexDecl.prototype.skip = function(num) {
        this.size += num;
        _inst._bgfx_vertex_decl_skip(this._ptr, num);
    };

    /**
     * End the vertex declaration
     */
    VertexDecl.prototype.end = function() {
        _inst._bgfx_vertex_decl_end(this._ptr);
    };

    /**
     * Destroy this instance by freeing the the native data
     */
    VertexDecl.prototype.destroy = function() {
        _inst._free(this._ptr);
        this._ptr = null;
        this.size = 0;
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

        init: function() {
            _inst._bgfx_init();
        },
        reset: function(width, height, flags) {
            _inst._bgfx_reset(width, height, flags);
        },
        setDebug: function(debug) {
            _inst._bgfx_set_debug(debug);
        },
        setViewClear: function(id, flags, rgba, depth, stencil) {
            _inst._bgfx_set_view_clear(id, flags, rgba, depth, stencil);
        },
        setViewRect: function(id, x, y, width, height) {
            _inst._bgfx_set_view_rect(id, x, y, width, height);
        },
        submit: function(id, depth) {
            _inst._bgfx_submit(id, depth);
        },
        dbgTextClear: function(attr, small) {
            _inst._bgfx_dbg_text_clear(attr, small);
        },
        dbgTextImage: function(x, y, width, height, data, pitch) {
            var sp  = _inst.Runtime.stackSave();
            var buf = _inst.allocate(data, 'i8', _inst.ALLOC_STACK);
            _inst._bgfx_dbg_text_image(x, y, width, height, buf, pitch);
            _inst.Runtime.stackRestore(sp);
        },
        dbgTextPrintf: function(x, y, attr, format) {
            var sp  = _inst.Runtime.stackSave();
            var buf = _inst.allocate(_inst.intArrayFromString(format), 'i8', _inst.ALLOC_STACK);
            format = buf;
            _inst._bgfx_dbg_text_printf.apply(_inst, arguments);
            _inst.Runtime.stackRestore(sp);
        },
        frame: function() {
            _inst._bgfx_frame();
        },

        /**
         * Create a vertex buffer with the given vertices and attribute declaration
         */
        createVertexBuffer: function(verts, decl, flags) {
            flags = flags !== NOT_DEFINED ? flags : 0;

            var datasize = verts.length * 4;
            var dataptr  = _inst._malloc(datasize);
            _inst.writeArrayToMemory(verts, dataptr);

            var memptr   = _inst._malloc(8);
            _inst.setValue(memptr,   dataptr,  'i8*');
            _inst.setValue(memptr+8, datasize, 'i32');

            return _inst._bgfx_create_vertex_buffer(memptr, decl._ptr, flags);
        },

        /**
         * Create an index buffer with the given values
         */
        createIndexBuffer: function(indices) {
            var datasize = indices.length * 2;
            var dataptr  = _inst._malloc(datasize);
            _inst.writeArrayToMemory(indices, dataptr);

            var memptr   = _inst._malloc(8);
            _inst.setValue(memptr,   dataptr,  'i8*');
            _inst.setValue(memptr+8, datasize, 'i32');

            return _inst._bgfx_create_index_buffer(memptr);
        },

        /**
         * Create a shader from the given source
         * @param {string} src - The source of the shader
         * @returns {Shader}
         */
        createShader: function(src) {
            return _inst._bgfx_create_shader(memFromString(str));
        },

        /**
         * Create a program from the given shaders
         * @param {Shader} vsh - Vertex shader to include in the program
         * @param {Shader} fsh - Fragment shader to include in the program
         * @param {boolean} [destroy=true] - Whether or not to destroy the shaders after the program is created
         * @returns {Program}
         */
        createProgram: function(vsh, fsh, destroy) {
            destroy = destroy === NOT_DEFINED ? true : destroy;
            return _inst._bgfx_create_program(vsh, fsh, destroy);
        },

        VertexDecl: VertexDecl
    }

}());