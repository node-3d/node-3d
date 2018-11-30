echo "Hello MacOS"

cd freeimage
unzip -qq FreeImage3170.zip -d .
cd FreeImage

brew install gcc@4.9

make -f Makefile.osx libfreeimage-3.17.0.dylib CPP_X86_64='g++'
ls
