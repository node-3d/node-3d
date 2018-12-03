echo 'GLEW Build Started'

cd osx/glew
unzip -qq glew-2.1.0.zip -d .
cd glew-2.1.0

make LDFLAGS.EXTRA='-install_name "@rpath/glew.dylib" -arch x86_64' glew.lib.shared

cd ../..
mv glfw/glew-2.1.0/lib/libGLEW.2.1.0.dylib glew.dylib
cd ..

echo 'GLEW Build Finished'