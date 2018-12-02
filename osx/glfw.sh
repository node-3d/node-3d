echo 'GLFW Build Started'

cd osx/glfw
unzip -qq glfw-3.2.1.zip -d .
cd glfw-3.2.1

cmake -DBUILD_SHARED_LIBS=ON -DGLFW_BUILD_EXAMPLES=OFF -DGLFW_BUILD_TESTS=OFF -DGLFW_BUILD_DOCS=OFF .
make

ls
ls CMake

cd ../..
# mv glfw/glfw-3.2.1/libfreeimage-3.17.0.dylib-x86_64 freeimage.dylib
cd ..

echo 'GLFW Build Finished'
