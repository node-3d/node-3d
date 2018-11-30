echo "Hello MacOS"

cd freeimage
unzip -qq FreeImage3170.zip -d .
cd FreeImage
export CC=gcc-4.0
export CXX=g++-4.0
echo EXPORTED
brew install gcc4
echo INSTALLED
make -f Makefile.osx libfreeimage-3.17.0.dylib
ls
