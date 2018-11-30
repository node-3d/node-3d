echo "Hello MacOS"

cd freeimage
unzip -qq FreeImage3170.zip -d .
cd FreeImage

brew install gcc6 >/dev/null
CC=gcc-6
CXX=g++-6
gcc -v
gcc-6 -v

make -f Makefile.osx CPP_X86_64='g++' CPP_PPC='g++-6' CPP_I386='g++-6' libfreeimage-3.17.0.dylib
ls
