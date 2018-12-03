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


echo '======= CMakeFiles/Makefile2 ========'
cat CMakeFiles/Makefile2

echo '======= src/CMakeFiles/glfw.dir/build.make ========'
cat src/CMakeFiles/glfw.dir/build.make

echo '======= src/CMakeFiles/glfw.dir/depend.make ========'
cat src/CMakeFiles/glfw.dir/depend.make

echo '=======  ========'

make

ls
echo --------------
ls src
echo --------------

cd ../..
mv glfw/glfw-3.2.1/src/libglfw.dylib glfw.dylib
ls 
echo --------------
cd ..

echo 'GLFW Build Finished'
