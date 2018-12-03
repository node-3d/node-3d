echo 'GLEW Build Started'

cd osx/glew
unzip -qq glew-2.1.0.zip -d .
cd glew-2.1.0

make glew.lib

ls -la lib

cd ../..
# mv glfw/glew-2.1.0/lib/libglew.3.2.dylib glfw.dylib
cd ..

echo 'GLEW Build Finished'
