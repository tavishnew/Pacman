.PHONY: all clean build wasm native

# Compiler settings
CXX = em++
CXXFLAGS = -O2 -Wall -std=c++11
LDFLAGS = -s WASM=1 -s ALLOW_MEMORY_GROWTH=1

# Files
SOURCES = main.cpp game.cpp
HEADERS = game.h
OUTPUT = game.wasm

all: wasm

wasm: $(SOURCES) $(HEADERS)
	$(CXX) $(CXXFLAGS) $(LDFLAGS) $(SOURCES) -o $(OUTPUT)
	@echo "✓ Built $(OUTPUT)"

native:
	g++ -O2 -Wall -std=c++11 $(SOURCES) -o pacman_native
	@echo "✓ Built pacman_native"

clean:
	rm -f *.wasm *.wast *.js pacman_native
	@echo "✓ Cleaned"

# Alternative: Compile to JavaScript (no WASM)
js:
	emcc -O2 $(SOURCES) -o game.js -s WASM=0
	@echo "✓ Built game.js (JavaScript version)"

# Quick test
test: wasm
	python3 -m http.server 8000
	@echo "✓ Server running on http://localhost:8000"
