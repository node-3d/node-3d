echo 'GLFW Build Started'

cd osx/glfw
unzip -qq glfw-3.2.1.zip -d .
cd glfw-3.2.1

cmake -DBUILD_SHARED_LIBS=ON -DGLFW_BUILD_EXAMPLES=OFF -DGLFW_BUILD_TESTS=OFF -DGLFW_BUILD_DOCS=OFF .
make

ls

cat Makefile

cd ../..
mv glfw/glfw-3.2.1/src/libglfw.dylib glfw.dylib
cd ..

echo 'GLFW Build Finished'
