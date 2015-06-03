#include <bgfx.c99.h>
#include <stdint.h>

void bgfx_set_state_shim () {
    bgfx_set_state(BGFX_STATE_DEFAULT, 0);
}

void bgfx_set_vertex_buffer_shim (uint16_t idx, uint32_t start, uint32_t count) {
    bgfx_vertex_buffer_handle_t handle = { idx };

    bgfx_set_vertex_buffer(handle, start, count);
}

void bgfx_set_index_buffer_shim (uint16_t idx, uint32_t start, uint32_t count) {
    bgfx_index_buffer_handle_t handle = { idx };

    bgfx_set_index_buffer(handle, start, count);
}

void bgfx_set_program_shim (uint16_t idx) {
    bgfx_program_handle_t handle = { idx };

    bgfx_set_program(handle);
}


uint16_t bgfx_create_vertex_buffer_shim (const bgfx_memory_t* mem, const bgfx_vertex_decl_t* decl, uint16_t flags) {
    bgfx_vertex_buffer_handle_t handle = bgfx_create_vertex_buffer(mem, decl, flags);

    return handle.idx;
}

uint16_t bgfx_create_index_buffer_shim (const bgfx_memory_t* mem, uint16_t flags) {
    bgfx_index_buffer_handle_t handle = bgfx_create_index_buffer(mem, flags);

    return handle.idx;
}

uint16_t bgfx_create_shader_shim (const bgfx_memory_t* mem) {
    bgfx_shader_handle_t handle = bgfx_create_shader(mem);

    return handle.idx;
}

uint16_t bgfx_create_program_shim (uint16_t vsh, uint16_t fsh, bool destroy) {
    bgfx_shader_handle_t vHandle = { vsh };
    bgfx_shader_handle_t fHandle = { fsh };

    bgfx_program_handle_t handle = bgfx_create_program(vHandle, fHandle, destroy);

    return handle.idx;
}


bgfx_vertex_decl_t* bgfx_create_vertex_decl() {
    bgfx_vertex_decl_t* v = malloc(sizeof(bgfx_vertex_decl_t));

    return v;
}
