echo "Hello MacOS"

cd freeimage
unzip -qq FreeImage3170.zip -d .
cd FreeImage

export CC=gcc-4.0
export CXX=g++-4.0

echo EXPORTED
g++ -v
echo VERED1

brew install gcc >/dev/null

echo INSTALLED
g++ -v
echo VERED2

make -f Makefile.osx libfreeimage-3.17.0.dylib
ls
