echo "Hello MacOS"

cd freeimage
unzip -qq FreeImage3170.zip -d .
cd FreeImage

find / -name stdlib.h

make -f Makefile.osx CPP_X86_64='g++' CPP_PPC='g++' CPP_I386='g++' libfreeimage-3.17.0.dylib
ls
