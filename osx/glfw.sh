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
	.


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
