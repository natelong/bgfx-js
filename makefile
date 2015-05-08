BUILD    = debug
INCLUDES = -I../bgfx/include -I../bx/include -I../bgfx/3rdparty -I../bgfx/3rdparty/khronos
DEFINES  = -DBGFX_SHARED_LIB_BUILD=1
EMOPTS   = -s RESERVED_FUNCTION_POINTERS=20 -s NO_EXIT_RUNTIME=1 --memory-init-file 0 --bind
OUTDIR   = bin
TMPDIR   = tmp
SRCDIR   = src

ifeq ($(BUILD), debug)
	EMOPTS    += -O0 -g2
	LINK_OPTS =  -g4 --llvm-lto 0 -s ASSERTIONS=2 --closure 0 -s DEMANGLE_SUPPORT=1
else
	EMOPTS    += -Os
	LINK_OPTS =  -O3 --llvm-lto 1 --closure 1
endif

all: library
	@echo bgfx_$(BUILD).js complete

bitcode:
	@mkdir -p bin tmp
	$(CXX) $(EMOPTS) $(INCLUDES) $(DEFINES) -c -o $(TMPDIR)/bgfx_$(BUILD).bc ../bgfx/src/amalgamated.cpp
	$(CXX) $(EMOPTS) $(INCLUDES) $(DEFINES) -c -o $(TMPDIR)/glue.bc $(SRCDIR)/glue.cpp

library: bitcode
	@mkdir -p bin
	$(CXX) $(LINK_OPTS) $(INCLUDES) $(DEFINES) $(EMOPTS) -o $(OUTDIR)/bgfx_$(BUILD).raw.js $(TMPDIR)/glue.bc $(TMPDIR)/bgfx_$(BUILD).bc
	cat $(SRCDIR)/header.js > $(OUTDIR)/bgfx_$(BUILD).js
	cat $(OUTDIR)/bgfx_$(BUILD).raw.js >> $(OUTDIR)/bgfx_$(BUILD).js

clean:
	rm -rf bin
