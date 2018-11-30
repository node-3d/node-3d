echo "Hello MacOS"

cd freeimage
unzip FreeImage3170.zip -d .
cd FreeImage
export CC=gcc-4.0
export CXX=g++-4.0
make -f Makefile.osx libfreeimage-3.17.0.dylib
ls
