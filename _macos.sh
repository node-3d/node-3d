echo "Hello MacOS"

cd freeimage
unzip -qq FreeImage3170.zip -d .
cd FreeImage

brew install gcc6 >/dev/null
xcode-select --install
echo SELECTED

make -f Makefile.osx CPP_X86_64='g++-6' CPP_PPC='g++-6' CPP_I386='g++-6' libfreeimage-3.17.0.dylib
ls
