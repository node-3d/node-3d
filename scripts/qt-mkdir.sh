# $1 is tmp path - ${{ github.workspace }}/../__tmp

rm -rf $1
mkdir -p $1

mkdir -p $1/core
mkdir -p $1/gui
mkdir -p $1/qml

mkdir -p $1/core/plugins
mkdir -p $1/core/plugins/platforms

mkdir -p $1/gui/plugins
mkdir -p $1/gui/plugins/platforms
mkdir -p $1/gui/plugins/iconengines
mkdir -p $1/gui/plugins/imageformats

mkdir -p $1/qml/plugins
mkdir -p $1/qml/plugins/platforms
mkdir -p $1/qml/plugins/qmltooling

mkdir -p $1/qml/qml
mkdir -p $1/qml/qml/QtTest
mkdir -p $1/qml/qml/QtQuick
mkdir -p $1/qml/qml/QtQuick/Window
mkdir -p $1/qml/qml/QtQuick/VectorImage
mkdir -p $1/qml/qml/QtQuick/tooling
mkdir -p $1/qml/qml/QtQuick/Templates
mkdir -p $1/qml/qml/QtQuick/Shapes
mkdir -p $1/qml/qml/QtQuick/Particles
mkdir -p $1/qml/qml/QtQuick/NativeStyle
mkdir -p $1/qml/qml/QtQuick/NativeStyle/util
mkdir -p $1/qml/qml/QtQuick/NativeStyle/controls
mkdir -p $1/qml/qml/QtQuick/LocalStorage
mkdir -p $1/qml/qml/QtQuick/Layouts
mkdir -p $1/qml/qml/QtQuick/Effects
mkdir -p $1/qml/qml/QtQuick/Dialogs
mkdir -p $1/qml/qml/QtQuick/Dialogs/quickimpl
mkdir -p $1/qml/qml/QtQuick/Dialogs/quickimpl/qml
mkdir -p $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/+Universal
mkdir -p $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/+Material
mkdir -p $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/+Imagine
mkdir -p $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/+Fusion
mkdir -p $1/qml/qml/QtQuick/Controls
mkdir -p $1/qml/qml/QtQuick/Controls/Universal
mkdir -p $1/qml/qml/QtQuick/Controls/Universal/impl
mkdir -p $1/qml/qml/QtQuick/Controls/Material
mkdir -p $1/qml/qml/QtQuick/Controls/Material/impl
mkdir -p $1/qml/qml/QtQuick/Controls/impl
mkdir -p $1/qml/qml/QtQuick/Controls/Imagine
mkdir -p $1/qml/qml/QtQuick/Controls/Imagine/impl
mkdir -p $1/qml/qml/QtQuick/Controls/Fusion
mkdir -p $1/qml/qml/QtQuick/Controls/Fusion/impl
mkdir -p $1/qml/qml/QtQuick/Controls/Basic
mkdir -p $1/qml/qml/QtQuick/Controls/Basic/impl
mkdir -p $1/qml/qml/QtQml
mkdir -p $1/qml/qml/QtQml/XmlListModel
mkdir -p $1/qml/qml/QtQml/WorkerScript
mkdir -p $1/qml/qml/QtQml/Models
mkdir -p $1/qml/qml/QtNetwork
mkdir -p $1/qml/qml/QtCore
mkdir -p $1/qml/qml/Qt
mkdir -p $1/qml/qml/Qt/test
mkdir -p $1/qml/qml/Qt/test/controls
mkdir -p $1/qml/qml/Qt/labs
mkdir -p $1/qml/qml/Qt/labs/wavefrontmesh
mkdir -p $1/qml/qml/Qt/labs/sharedimage
mkdir -p $1/qml/qml/Qt/labs/settings
mkdir -p $1/qml/qml/Qt/labs/qmlmodels
mkdir -p $1/qml/qml/Qt/labs/platform
mkdir -p $1/qml/qml/Qt/labs/folderlistmodel
mkdir -p $1/qml/qml/Qt/labs/animation
mkdir -p $1/qml/qml/QmlTime
mkdir -p $1/qml/qml/QML
mkdir -p $1/qml/qml/Assets
mkdir -p $1/qml/qml/Assets/Downloader
