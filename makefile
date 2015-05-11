BUILD  = debug
OUTDIR = bin
TMPDIR = tmp
SRCDIR = src

INCLUDES  = -I../bgfx/include -I../bx/include -I../bgfx/3rdparty -I../bgfx/3rdparty/khronos
DEFINES   =
LINK_OPTS =
EMOPTS    = \
	-s RESERVED_FUNCTION_POINTERS=20 \
	-s NO_EXIT_RUNTIME=1 \
	-s MODULARIZE=1 \
	-s EXPORT_NAME=\"_bgfx\" \
	-s EXPORTED_FUNCTIONS=@exportFunctions.js \
	--memory-init-file 0

ifeq ($(BUILD), debug)
	LINK_OPTS = -O0 -g4 --llvm-lto 0 -s ASSERTIONS=2 --closure 0 -s DEMANGLE_SUPPORT=1
else ifeq ($(BUILD), release)
	LINK_OPTS = -O3 --llvm-lto 1 --closure 0
endif

all: library
	@echo $(OUTDIR)/bgfx_$(BUILD).js complete

library:
	@mkdir -p $(OUTDIR) $(TMPDIR)
	$(CXX) $(LINK_OPTS) $(INCLUDES) $(DEFINES) $(EMOPTS) -o $(TMPDIR)/bgfx_$(BUILD).raw.js ../bgfx/src/amalgamated.cpp
	@cat $(SRCDIR)/header.js            >  $(OUTDIR)/bgfx_$(BUILD).js
	@cat $(TMPDIR)/bgfx_$(BUILD).raw.js >> $(OUTDIR)/bgfx_$(BUILD).js
	@cat $(SRCDIR)/footer.js            >> $(OUTDIR)/bgfx_$(BUILD).js

clean:
	rm -rf $(OUTDIR) $(TMPDIR)
