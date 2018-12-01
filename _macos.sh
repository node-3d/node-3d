echo "Hello MacOS"

cd freeimage
unzip -qq FreeImage3170.zip -d .
cd FreeImage

find / -name stdlib.h

make -f Makefile.osx CPP_X86_64='g++' CC_X86_64='gcc' INCLUDE_X86_64='-isysroot /Applications/Xcode-9.4.1.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk' libfreeimage-3.17.0.dylib-x86_64

ls
