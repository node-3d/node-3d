echo 'FreeImage Build Started'

cd osx/freeimage
unzip -qq FreeImage3170.zip -d .
cd FreeImage

make -f Makefile.osx \
	CPP_X86_64='g++ -w' \
	CC_X86_64='gcc -w' \
	COMPILERFLAGS_X86_64='-arch x86_64 -D__ANSI__ -DDISABLE_PERF_MEASUREMENT' \
	LIBRARIES_X86_64='-flat_namespace -Wl,-syslibroot /Applications/Xcode-9.4.1.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk' \
	INCLUDE_X86_64='-isysroot /Applications/Xcode-9.4.1.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk' \
	libfreeimage-3.17.0.dylib-x86_64 \
	>/dev/null

cd ../..
mv freeimage/FreeImage/libfreeimage-3.17.0.dylib-x86_64 freeimage.dylib
cd ..

echo 'FreeImage Build Finished'
