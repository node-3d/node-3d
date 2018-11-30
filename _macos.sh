echo "Hello MacOS"

cd freeimage
unzip FreeImage3170.zip -d .
cd FreeImage
make -f Makefile.osx libfreeimage-3.17.0.dylib
ls
