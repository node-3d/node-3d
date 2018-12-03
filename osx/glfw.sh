echo 'GLFW Build Started'

cd osx/glfw
unzip -qq glfw-3.2.1.zip -d .
cd glfw-3.2.1

cmake \
	-DBUILD_SHARED_LIBS=ON \
	-DGLFW_BUILD_EXAMPLES=OFF \
	-DGLFW_BUILD_TESTS=OFF \
	-DGLFW_BUILD_DOCS=OFF \
	-DGLFW_VULKAN_STATIC=OFF \
	-DGLFW_USE_CHDIR=OFF \
	-DGLFW_USE_MENUBAR=OFF \
	-DGLFW_USE_RETINA=ON \
	-DMACOSX_RPATH=ON \
	-DCMAKE_SHARED_LINKER_FLAGS='-install_name "@rpath/glfw.dylib"' \
	.

echo '/Applications/Xcode-9.4.1.app/Contents/Developer/Toolchains/\
XcodeDefault.xctoolchain/usr/bin/clang  \
-dynamiclib -Wl,-headerpad_max_install_names \
-install_name "@rpath/glfw.dylib" -compatibility_version 3.0.0 \
-current_version 3.2.0 -o libglfw.3.2.dylib \
CMakeFiles/glfw.dir/context.c.o CMakeFiles/glfw.dir/init.c.o \
CMakeFiles/glfw.dir/input.c.o CMakeFiles/glfw.dir/monitor.c.o \
CMakeFiles/glfw.dir/vulkan.c.o CMakeFiles/glfw.dir/window.c.o \
CMakeFiles/glfw.dir/cocoa_init.m.o CMakeFiles/glfw.dir/cocoa_joystick.m.o \
CMakeFiles/glfw.dir/cocoa_monitor.m.o CMakeFiles/glfw.dir/cocoa_window.m.o \
CMakeFiles/glfw.dir/cocoa_time.c.o CMakeFiles/glfw.dir/posix_tls.c.o \
CMakeFiles/glfw.dir/nsgl_context.m.o \
-framework Cocoa -framework IOKit -framework CoreFoundation -framework CoreVideo' \
> src/CMakeFiles/glfw.dir/link.txt


echo '======= CMakeFiles/glfw.dir/link.txt ========'
cat src/CMakeFiles/glfw.dir/link.txt

echo '======= src/CMakeFiles/glfw.dir/build.make ========'
cat src/CMakeFiles/glfw.dir/build.make

echo '=======  ========'

make

cd ../..
mv glfw/glfw-3.2.1/src/libglfw.3.2.dylib glfw.dylib
cd ..

echo 'GLFW Build Finished'
