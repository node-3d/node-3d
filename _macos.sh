echo "Hello MacOS"

cd freeimage
unzip -qq FreeImage3170.zip -d .
cd FreeImage

# find / -name stdlib.h

export INC = "INCLUDE_PPC='-isysroot /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk'"
export INC = "$INC INCLUDE_I386='-isysroot /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk'"
export INC = "$INC INCLUDE_X86_64='-isysroot /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk'"
echo INC

make -f Makefile.osx CPP_PPC='g++' INCLUDE_PPC='-isysroot /Library/Developer/CommandLineTools/SDKs/MacOSX.sdk' libfreeimage-3.17.0.dylib

ls
