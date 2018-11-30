echo "Hello MacOS"

cd freeimage
unzip -qq FreeImage3170.zip -d .
cd FreeImage

find / -name stdlib.h

make -f Makefile.osx CPP_PPC='g++' INCLUDE_PPC='-isysroot /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk' libfreeimage-3.17.0.dylib

ls
