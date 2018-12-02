echo "Hello MacOS"

cd freeimage
unzip -qq FreeImage3170.zip -d .
cd FreeImage

SDK="/Applications/Xcode-9.4.1.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk"

make -f Makefile.osx \
	CPP_X86_64='g++ -w' \
	CC_X86_64='gcc -w' \
	COMPILERFLAGS_X86_64='-arch x86_64 -D__ANSI__' \
	LIBRARIES_X86_64='-Wl,-syslibroot ${SDK}' \
	INCLUDE_X86_64='-isysroot ${SDK}' \
	libfreeimage-3.17.0.dylib-x86_64

ls
