echo "Hello MacOS"

cd freeimage
unzip -qq FreeImage3170.zip -d .
cd FreeImage

find / -name stdlib.h

make -f Makefile.osx CPP_PPC='g++' INCLUDE_PPC='-isysroot /Applications/Xcode-9.4.1.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk' libfreeimage-3.17.0.dylib

ls
