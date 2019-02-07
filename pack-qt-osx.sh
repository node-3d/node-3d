echo Start packing

mkdir qpack

cp "/Users/travis/qt-osx/Qt/Qt Creator.app/Contents/Frameworks/QtCore.framework/QtCore" qpack
cp "/Users/travis/qt-osx/Qt/Qt Creator.app/Contents/Frameworks/QtDBus.framework/QtDBus" qpack
cp "/Users/travis/qt-osx/Qt/Qt Creator.app/Contents/Frameworks/QtNetwork.framework/QtNetwork" qpack
cp "/Users/travis/qt-osx/Qt/Qt Creator.app/Contents/Frameworks/QtGui.framework/QtGui" qpack
cp "/Users/travis/qt-osx/Qt/Qt Creator.app/Contents/Frameworks/QtWidgets.framework/QtWidgets" qpack
cp "/Users/travis/qt-osx/Qt/Qt Creator.app/Contents/Frameworks/QtQml.framework/QtQml" qpack
cp "/Users/travis/qt-osx/Qt/Qt Creator.app/Contents/Frameworks/QtQuick.framework/QtQuick" qpack
cp "/Users/travis/qt-osx/Qt/Qt Creator.app/Contents/Frameworks/QtQuickControls2.framework/QtQuickControls2" qpack
cp "/Users/travis/qt-osx/Qt/Qt Creator.app/Contents/Frameworks/QtQuickTemplates.framework/QtQuickTemplates" qpack
cp "/Users/travis/qt-osx/Qt/Qt Creator.app/Contents/Frameworks/QtQuickWidgets.framework/QtQuickWidgets" qpack

zip -r qpack.zip qpack
