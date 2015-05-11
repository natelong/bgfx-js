
    var _canvas = document.createElement('canvas');
    document.body.appendChild(_canvas);

    var _inst = new _bgfx({
        TOTAL_MEMORY: 256*1024*1024,
        canvas:       _canvas
    });

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
        }
    }

}());