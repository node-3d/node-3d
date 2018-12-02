echo 'GLFW Build Started'

cd osx/glfw
unzip -qq glfw-3.2.1.zip -d .
cd glfw-3.2.1

cmake -DBUILD_SHARED_LIBS=ON .
make

ls

cd ../..
# mv glfw/glfw-3.2.1/libfreeimage-3.17.0.dylib-x86_64 freeimage.dylib
cd ..

echo 'GLFW Build Finished'
