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
cat CMakeFiles/glfw.dir/link.txt

echo '======= src/CMakeFiles/glfw.dir/build.make ========'
cat src/CMakeFiles/glfw.dir/build.make

echo '=======  ========'

make

echo --------------
ls -la src
echo --------------

cd ../..
mv glfw/glfw-3.2.1/src/libglfw.dylib glfw.dylib
ls 
echo --------------
cd ..

echo 'GLFW Build Finished'
