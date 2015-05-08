#include <bgfx.h>
#include <emscripten/bind.h>
#include <stdint.h>
#include <string>

using namespace emscripten;

namespace {
    void bgfx_init() {
        bgfx::init();
    }

    void bgfx_dbgTextPrintf(uint16_t x, uint16_t y, uint8_t attr, std::string format) {
        bgfx::dbgTextPrintf(x, y, attr, format.c_str());
    }

    void bgfx_dbgTextImage(uint16_t x, uint16_t y, uint16_t width, uint16_t height, std::string data, uint16_t pitch) {
        bgfx::dbgTextImage(x, y, width, height, data.c_str(), pitch);
    }
}

EMSCRIPTEN_BINDINGS(bgfx) {
    function("init",          &::bgfx_init);

    function("reset",         &bgfx::reset);
    function("setDebug",      &bgfx::setDebug);
    function<void, uint8_t, uint16_t, uint32_t, float, uint8_t>("setViewClear",  &bgfx::setViewClear);
    function("setViewRect",   &bgfx::setViewRect);
    function("submit",        &bgfx::submit);
    function("dbgTextClear",  &bgfx::dbgTextClear);
    function("dbgTextImage",  &::bgfx_dbgTextImage);
    function("dbgTextPrintf", &::bgfx_dbgTextPrintf);
    function("frame",         &bgfx::frame);
    function("shutdown",      &bgfx::shutdown);

    constant("DEBUG_TEXT",            BGFX_DEBUG_TEXT);
    constant("CLEAR_NONE",            BGFX_CLEAR_NONE);
    constant("CLEAR_COLOR",           BGFX_CLEAR_COLOR);
    constant("CLEAR_DEPTH",           BGFX_CLEAR_DEPTH);
    constant("CLEAR_STENCIL",         BGFX_CLEAR_STENCIL);
    constant("CLEAR_DISCARD_COLOR_0", BGFX_CLEAR_DISCARD_COLOR_0);
    constant("CLEAR_DISCARD_COLOR_1", BGFX_CLEAR_DISCARD_COLOR_1);
    constant("CLEAR_DISCARD_COLOR_2", BGFX_CLEAR_DISCARD_COLOR_2);
    constant("CLEAR_DISCARD_COLOR_3", BGFX_CLEAR_DISCARD_COLOR_3);
    constant("CLEAR_DISCARD_COLOR_4", BGFX_CLEAR_DISCARD_COLOR_4);
    constant("CLEAR_DISCARD_COLOR_5", BGFX_CLEAR_DISCARD_COLOR_5);
    constant("CLEAR_DISCARD_COLOR_6", BGFX_CLEAR_DISCARD_COLOR_6);
    constant("CLEAR_DISCARD_COLOR_7", BGFX_CLEAR_DISCARD_COLOR_7);
    constant("CLEAR_DISCARD_DEPTH",   BGFX_CLEAR_DISCARD_DEPTH);
    constant("CLEAR_DISCARD_STENCIL", BGFX_CLEAR_DISCARD_STENCIL);
}