# $1 is tmp path - ${{ github.workspace }}/../__tmp
# $2 is Qt platform path - /home/opc/6.8.0/gcc_arm64

# Core
cp $2/plugins/platforms/libqminimal.dylib $1/core/plugins/platforms/libqminimal.dylib

mkdir -p $1/core/QtCore.framework
mkdir -p $1/core/QtCore.framework/Versions
mkdir -p $1/core/QtCore.framework/Versions/Current
cp $2/lib/QtCore.framework/Versions/Current/QtCore $1/core/QtCore.framework/Versions/Current/QtCore

mkdir -p $1/core/QtDBus.framework
mkdir -p $1/core/QtDBus.framework/Versions
mkdir -p $1/core/QtDBus.framework/Versions/Current
cp $2/lib/QtDBus.framework/Versions/Current/QtDBus $1/core/QtDBus.framework/Versions/Current/QtDBus

mkdir -p $1/core/QtNetwork.framework
mkdir -p $1/core/QtNetwork.framework/Versions
mkdir -p $1/core/QtNetwork.framework/Versions/Current
cp $2/lib/QtNetwork.framework/Versions/Current/QtNetwork $1/core/QtNetwork.framework/Versions/Current/QtNetwork

mkdir -p $1/core/QtPositioningQuick.framework
mkdir -p $1/core/QtPositioningQuick.framework/Versions
mkdir -p $1/core/QtPositioningQuick.framework/Versions/Current
cp $2/lib/QtPositioningQuick.framework/Versions/Current/QtPositioningQuick $1/core/QtPositioningQuick.framework/Versions/Current/QtPositioningQuick

mkdir -p $1/core/QtPrintSupport.framework
mkdir -p $1/core/QtPrintSupport.framework/Versions
mkdir -p $1/core/QtPrintSupport.framework/Versions/Current
cp $2/lib/QtPrintSupport.framework/Versions/Current/QtPrintSupport $1/core/QtPrintSupport.framework/Versions/Current/QtPrintSupport

# Gui
mkdir -p $1/gui/QtGui.framework
mkdir -p $1/gui/QtGui.framework/Versions
mkdir -p $1/gui/QtGui.framework/Versions/Current
cp $2/lib/QtGui.framework/Versions/Current/QtGui $1/gui/QtGui.framework/Versions/Current/QtGui

mkdir -p $1/gui/QtOpenGL.framework
mkdir -p $1/gui/QtOpenGL.framework/Versions
mkdir -p $1/gui/QtOpenGL.framework/Versions/Current
cp $2/lib/QtOpenGL.framework/Versions/Current/QtOpenGL $1/gui/QtOpenGL.framework/Versions/Current/QtOpenGL

mkdir -p $1/gui/QtSvg.framework
mkdir -p $1/gui/QtSvg.framework/Versions
mkdir -p $1/gui/QtSvg.framework/Versions/Current
cp $2/lib/QtSvg.framework/Versions/Current/QtSvg $1/gui/QtSvg.framework/Versions/Current/QtSvg

mkdir -p $1/gui/QtWidgets.framework
mkdir -p $1/gui/QtWidgets.framework/Versions
mkdir -p $1/gui/QtWidgets.framework/Versions/Current
cp $2/lib/QtWidgets.framework/Versions/Current/QtWidgets $1/gui/QtWidgets.framework/Versions/Current/QtWidgets

cp $2/plugins/iconengines/libqsvgicon.dylib $1/gui/plugins/iconengines/libqsvgicon.dylib
cp $2/plugins/imageformats/libqgif.dylib $1/gui/plugins/imageformats/libqgif.dylib
cp $2/plugins/imageformats/libqico.dylib $1/gui/plugins/imageformats/libqico.dylib
cp $2/plugins/imageformats/libqjpeg.dylib $1/gui/plugins/imageformats/libqjpeg.dylib
cp $2/plugins/imageformats/libqsvg.dylib $1/gui/plugins/imageformats/libqsvg.dylib
cp $2/plugins/platforms/libqcocoa.dylib $1/gui/plugins/platforms/libqcocoa.dylib
cp $2/plugins/platforms/libqoffscreen.dylib $1/gui/plugins/platforms/libqoffscreen.dylib
cp $2/plugins/platformthemes/libqxdgdesktopportal.dylib $1/gui/plugins/platformthemes/libqxdgdesktopportal.dylib

# QML
mkdir -p $1/qml/QtQml.framework
mkdir -p $1/qml/QtQml.framework/Versions
mkdir -p $1/qml/QtQml.framework/Versions/Current
cp $2/lib/QtQml.framework/Versions/Current/QtQml $1/qml/QtQml.framework/Versions/Current/QtGui

mkdir -p $1/qml/QtQuick.framework
mkdir -p $1/qml/QtQuick.framework/Versions
mkdir -p $1/qml/QtQuick.framework/Versions/Current
cp $2/lib/QtQuick.framework/Versions/Current/QtQuick $1/qml/QtQuick.framework/Versions/Current/QtQuick

mkdir -p $1/qml/QtQuickControls2.framework
mkdir -p $1/qml/QtQuickControls2.framework/Versions
mkdir -p $1/qml/QtQuickControls2.framework/Versions/Current
cp $2/lib/QtQuickControls2.framework/Versions/Current/QtQuickControls2 $1/qml/QtQuickControls2.framework/Versions/Current/QtQuickControls2

mkdir -p $1/qml/QtQuickTemplates2.framework
mkdir -p $1/qml/QtQuickTemplates2.framework/Versions
mkdir -p $1/qml/QtQuickTemplates2.framework/Versions/Current
cp $2/lib/QtQuickTemplates2.framework/Versions/Current/QtQuickTemplates2 $1/qml/QtQuickTemplates2.framework/Versions/Current/QtQuickTemplates2

mkdir -p $1/qml/QtQuickWidgets.framework
mkdir -p $1/qml/QtQuickWidgets.framework/Versions
mkdir -p $1/qml/QtQuickWidgets.framework/Versions/Current
cp $2/lib/QtQuickWidgets.framework/Versions/Current/QtQuickWidgets $1/qml/QtQuickWidgets.framework/Versions/Current/QtQuickWidgets

mkdir -p $1/qml/Qt6QuickVectorImage.framework
mkdir -p $1/qml/Qt6QuickVectorImage.framework/Versions
mkdir -p $1/qml/Qt6QuickVectorImage.framework/Versions/Current
cp $2/lib/Qt6QuickVectorImage.framework/Versions/Current/Qt6QuickVectorImage $1/qml/Qt6QuickVectorImage.framework/Versions/Current/Qt6QuickVectorImage

mkdir -p $1/qml/Qt6QmlCompiler.framework
mkdir -p $1/qml/Qt6QmlCompiler.framework/Versions
mkdir -p $1/qml/Qt6QmlCompiler.framework/Versions/Current
cp $2/lib/Qt6QmlCompiler.framework/Versions/Current/Qt6QmlCompiler $1/qml/Qt6QmlCompiler.framework/Versions/Current/Qt6QmlCompiler

mkdir -p $1/qml/Qt6QmlCore.framework
mkdir -p $1/qml/Qt6QmlCore.framework/Versions
mkdir -p $1/qml/Qt6QmlCore.framework/Versions/Current
cp $2/lib/Qt6QmlCore.framework/Versions/Current/Qt6QmlCore $1/qml/Qt6QmlCore.framework/Versions/Current/Qt6QmlCore

mkdir -p $1/qml/Qt6QuickControls2Basic.framework
mkdir -p $1/qml/Qt6QuickControls2Basic.framework/Versions
mkdir -p $1/qml/Qt6QuickControls2Basic.framework/Versions/Current
cp $2/lib/Qt6QuickControls2Basic.framework/Versions/Current/Qt6QuickControls2Basic $1/qml/Qt6QuickControls2Basic.framework/Versions/Current/Qt6QuickControls2Basic

mkdir -p $1/qml/Qt6QuickControls2Impl.framework
mkdir -p $1/qml/Qt6QuickControls2Impl.framework/Versions
mkdir -p $1/qml/Qt6QuickControls2Impl.framework/Versions/Current
cp $2/lib/Qt6QuickControls2Impl.framework/Versions/Current/Qt6QuickControls2Impl $1/qml/Qt6QuickControls2Impl.framework/Versions/Current/Qt6QuickControls2Impl

mkdir -p $1/qml/Qt6QuickDialogs2.framework
mkdir -p $1/qml/Qt6QuickDialogs2.framework/Versions
mkdir -p $1/qml/Qt6QuickDialogs2.framework/Versions/Current
cp $2/lib/Qt6QuickDialogs2.framework/Versions/Current/Qt6QuickDialogs2 $1/qml/Qt6QuickDialogs2.framework/Versions/Current/Qt6QuickDialogs2

mkdir -p $1/qml/Qt6QuickDialogs2QuickImpl.framework
mkdir -p $1/qml/Qt6QuickDialogs2QuickImpl.framework/Versions
mkdir -p $1/qml/Qt6QuickDialogs2QuickImpl.framework/Versions/Current
cp $2/lib/Qt6QuickDialogs2QuickImpl.framework/Versions/Current/Qt6QuickDialogs2QuickImpl $1/qml/Qt6QuickDialogs2QuickImpl.framework/Versions/Current/Qt6QuickDialogs2QuickImpl

mkdir -p $1/qml/Qt6QuickDialogs2Utils.framework
mkdir -p $1/qml/Qt6QuickDialogs2Utils.framework/Versions
mkdir -p $1/qml/Qt6QuickDialogs2Utils.framework/Versions/Current
cp $2/lib/Qt6QuickDialogs2Utils.framework/Versions/Current/Qt6QuickDialogs2Utils $1/qml/Qt6QuickDialogs2Utils.framework/Versions/Current/Qt6QuickDialogs2Utils

mkdir -p $1/qml/Qt6QuickEffects.framework
mkdir -p $1/qml/Qt6QuickEffects.framework/Versions
mkdir -p $1/qml/Qt6QuickEffects.framework/Versions/Current
cp $2/lib/Qt6QuickEffects.framework/Versions/Current/Qt6QuickEffects $1/qml/Qt6QuickEffects.framework/Versions/Current/Qt6QuickEffects

mkdir -p $1/qml/Qt6QuickLayouts.framework
mkdir -p $1/qml/Qt6QuickLayouts.framework/Versions
mkdir -p $1/qml/Qt6QuickLayouts.framework/Versions/Current
cp $2/lib/Qt6QuickLayouts.framework/Versions/Current/Qt6QuickLayouts $1/qml/Qt6QuickLayouts.framework/Versions/Current/Qt6QuickLayouts

mkdir -p $1/qml/Qt6QuickParticles.framework
mkdir -p $1/qml/Qt6QuickParticles.framework/Versions
mkdir -p $1/qml/Qt6QuickParticles.framework/Versions/Current
cp $2/lib/Qt6QuickParticles.framework/Versions/Current/Qt6QuickParticles $1/qml/Qt6QuickParticles.framework/Versions/Current/Qt6QuickParticles

mkdir -p $1/qml/Qt6QuickShapes.framework
mkdir -p $1/qml/Qt6QuickShapes.framework/Versions
mkdir -p $1/qml/Qt6QuickShapes.framework/Versions/Current
cp $2/lib/Qt6QuickShapes.framework/Versions/Current/Qt6QuickShapes $1/qml/Qt6QuickShapes.framework/Versions/Current/Qt6QuickShapes

mkdir -p $1/qml/Qt6QmlWorkerScript.framework
mkdir -p $1/qml/Qt6QmlWorkerScript.framework/Versions
mkdir -p $1/qml/Qt6QmlWorkerScript.framework/Versions/Current
cp $2/lib/Qt6QmlWorkerScript.framework/Versions/Current/Qt6QmlWorkerScript $1/qml/Qt6QmlWorkerScript.framework/Versions/Current/Qt6QmlWorkerScript

mkdir -p $1/qml/Qt6QmlModels.framework
mkdir -p $1/qml/Qt6QmlModels.framework/Versions
mkdir -p $1/qml/Qt6QmlModels.framework/Versions/Current
cp $2/lib/Qt6QmlModels.framework/Versions/Current/Qt6QmlModels $1/qml/Qt6QmlModels.framework/Versions/Current/Qt6QmlModels

cp $2/plugins/qmltooling/libqmldbg_debugger.dylib $1/qml/plugins/qmltooling/libqmldbg_debugger.dylib
cp $2/plugins/qmltooling/libqmldbg_inspector.dylib $1/qml/plugins/qmltooling/libqmldbg_inspector.dylib
cp $2/plugins/qmltooling/libqmldbg_local.dylib $1/qml/plugins/qmltooling/libqmldbg_local.dylib
cp $2/plugins/qmltooling/libqmldbg_messages.dylib $1/qml/plugins/qmltooling/libqmldbg_messages.dylib
cp $2/plugins/qmltooling/libqmldbg_native.dylib $1/qml/plugins/qmltooling/libqmldbg_native.dylib
cp $2/plugins/qmltooling/libqmldbg_nativedebugger.dylib $1/qml/plugins/qmltooling/libqmldbg_nativedebugger.dylib
cp $2/plugins/qmltooling/libqmldbg_preview.dylib $1/qml/plugins/qmltooling/libqmldbg_preview.dylib
cp $2/plugins/qmltooling/libqmldbg_profiler.dylib $1/qml/plugins/qmltooling/libqmldbg_profiler.dylib
cp $2/plugins/qmltooling/libqmldbg_quickprofiler.dylib $1/qml/plugins/qmltooling/libqmldbg_quickprofiler.dylib
cp $2/plugins/qmltooling/libqmldbg_server.dylib $1/qml/plugins/qmltooling/libqmldbg_server.dylib
cp $2/plugins/qmltooling/libqmldbg_tcp.dylib $1/qml/plugins/qmltooling/libqmldbg_tcp.dylib

cp $2/qml/builtins.qmltypes $1/qml/qml/builtins.qmltypes
cp $2/qml/jsroot.qmltypes $1/qml/qml/jsroot.qmltypes
cp $2/qml/QtTest/plugins.qmltypes $1/qml/qml/QtTest/plugins.qmltypes
cp $2/qml/QtTest/qmldir $1/qml/qml/QtTest/qmldir
cp $2/qml/QtTest/libquicktestplugin.dylib $1/qml/qml/QtTest/libquicktestplugin.dylib
cp $2/qml/QtTest/SignalSpy.qml $1/qml/qml/QtTest/SignalSpy.qml
cp $2/qml/QtTest/TestCase.qml $1/qml/qml/QtTest/TestCase.qml
cp $2/qml/QtTest/testlogger.js $1/qml/qml/QtTest/testlogger.js
cp $2/qml/QtTest/TestSchedule.qml $1/qml/qml/QtTest/TestSchedule.qml
cp $2/qml/QtQuick/plugins.qmltypes $1/qml/qml/QtQuick/plugins.qmltypes
cp $2/qml/QtQuick/qmldir $1/qml/qml/QtQuick/qmldir
cp $2/qml/QtQuick/libqtquick2plugin.dylib $1/qml/qml/QtQuick/libqtquick2plugin.dylib
cp $2/qml/QtQuick/Window/qmldir $1/qml/qml/QtQuick/Window/qmldir
cp $2/qml/QtQuick/Window/quickwindow.qmltypes $1/qml/qml/QtQuick/Window/quickwindow.qmltypes
cp $2/qml/QtQuick/Window/libquickwindowplugin.dylib $1/qml/qml/QtQuick/Window/libquickwindowplugin.dylib
cp $2/qml/QtQuick/VectorImage/plugins.qmltypes $1/qml/qml/QtQuick/VectorImage/plugins.qmltypes
cp $2/qml/QtQuick/VectorImage/qmldir $1/qml/qml/QtQuick/VectorImage/qmldir
cp $2/qml/QtQuick/VectorImage/libqquickvectorimageplugin.dylib $1/qml/qml/QtQuick/VectorImage/libqquickvectorimageplugin.dylib
cp $2/qml/QtQuick/tooling/Component.qml $1/qml/qml/QtQuick/tooling/Component.qml
cp $2/qml/QtQuick/tooling/Enum.qml $1/qml/qml/QtQuick/tooling/Enum.qml
cp $2/qml/QtQuick/tooling/Member.qml $1/qml/qml/QtQuick/tooling/Member.qml
cp $2/qml/QtQuick/tooling/Method.qml $1/qml/qml/QtQuick/tooling/Method.qml
cp $2/qml/QtQuick/tooling/Module.qml $1/qml/qml/QtQuick/tooling/Module.qml
cp $2/qml/QtQuick/tooling/Parameter.qml $1/qml/qml/QtQuick/tooling/Parameter.qml
cp $2/qml/QtQuick/tooling/Property.qml $1/qml/qml/QtQuick/tooling/Property.qml
cp $2/qml/QtQuick/tooling/qmldir $1/qml/qml/QtQuick/tooling/qmldir
cp $2/qml/QtQuick/tooling/quicktooling.qmltypes $1/qml/qml/QtQuick/tooling/quicktooling.qmltypes
cp $2/qml/QtQuick/tooling/libquicktoolingplugin.dylib $1/qml/qml/QtQuick/tooling/libquicktoolingplugin.dylib
cp $2/qml/QtQuick/tooling/Signal.qml $1/qml/qml/QtQuick/tooling/Signal.qml
cp $2/qml/QtQuick/Templates/plugins.qmltypes $1/qml/qml/QtQuick/Templates/plugins.qmltypes
cp $2/qml/QtQuick/Templates/qmldir $1/qml/qml/QtQuick/Templates/qmldir
cp $2/qml/QtQuick/Templates/libqtquicktemplates2plugin.dylib $1/qml/qml/QtQuick/Templates/libqtquicktemplates2plugin.dylib
cp $2/qml/QtQuick/Shapes/plugins.qmltypes $1/qml/qml/QtQuick/Shapes/plugins.qmltypes
cp $2/qml/QtQuick/Shapes/qmldir $1/qml/qml/QtQuick/Shapes/qmldir
cp $2/qml/QtQuick/Shapes/libqmlshapesplugin.dylib $1/qml/qml/QtQuick/Shapes/libqmlshapesplugin.dylib
cp $2/qml/QtQuick/Particles/libparticlesplugin.dylib $1/qml/qml/QtQuick/Particles/libparticlesplugin.dylib
cp $2/qml/QtQuick/Particles/plugins.qmltypes $1/qml/qml/QtQuick/Particles/plugins.qmltypes
cp $2/qml/QtQuick/Particles/qmldir $1/qml/qml/QtQuick/Particles/qmldir
cp $2/qml/QtQuick/NativeStyle/plugins.qmltypes $1/qml/qml/QtQuick/NativeStyle/plugins.qmltypes
cp $2/qml/QtQuick/NativeStyle/qmldir $1/qml/qml/QtQuick/NativeStyle/qmldir
cp $2/qml/QtQuick/NativeStyle/libqtquickcontrols2nativestyleplugin.dylib $1/qml/qml/QtQuick/NativeStyle/libqtquickcontrols2nativestyleplugin.dylib
cp $2/qml/QtQuick/NativeStyle/controls/DefaultButton.qml $1/qml/qml/QtQuick/NativeStyle/controls/DefaultButton.qml
cp $2/qml/QtQuick/NativeStyle/controls/DefaultCheckBox.qml $1/qml/qml/QtQuick/NativeStyle/controls/DefaultCheckBox.qml
cp $2/qml/QtQuick/NativeStyle/controls/DefaultComboBox.qml $1/qml/qml/QtQuick/NativeStyle/controls/DefaultComboBox.qml
cp $2/qml/QtQuick/NativeStyle/controls/DefaultDial.qml $1/qml/qml/QtQuick/NativeStyle/controls/DefaultDial.qml
cp $2/qml/QtQuick/NativeStyle/controls/DefaultFrame.qml $1/qml/qml/QtQuick/NativeStyle/controls/DefaultFrame.qml
cp $2/qml/QtQuick/NativeStyle/controls/DefaultGroupBox.qml $1/qml/qml/QtQuick/NativeStyle/controls/DefaultGroupBox.qml
cp $2/qml/QtQuick/NativeStyle/controls/DefaultItemDelegate.qml $1/qml/qml/QtQuick/NativeStyle/controls/DefaultItemDelegate.qml
cp $2/qml/QtQuick/NativeStyle/controls/DefaultItemDelegateIconLabel.qml $1/qml/qml/QtQuick/NativeStyle/controls/DefaultItemDelegateIconLabel.qml
cp $2/qml/QtQuick/NativeStyle/controls/DefaultProgressBar.qml $1/qml/qml/QtQuick/NativeStyle/controls/DefaultProgressBar.qml
cp $2/qml/QtQuick/NativeStyle/controls/DefaultRadioButton.qml $1/qml/qml/QtQuick/NativeStyle/controls/DefaultRadioButton.qml
cp $2/qml/QtQuick/NativeStyle/controls/DefaultRadioDelegate.qml $1/qml/qml/QtQuick/NativeStyle/controls/DefaultRadioDelegate.qml
cp $2/qml/QtQuick/NativeStyle/controls/DefaultScrollBar.qml $1/qml/qml/QtQuick/NativeStyle/controls/DefaultScrollBar.qml
cp $2/qml/QtQuick/NativeStyle/controls/DefaultSlider.qml $1/qml/qml/QtQuick/NativeStyle/controls/DefaultSlider.qml
cp $2/qml/QtQuick/NativeStyle/controls/DefaultSpinBox.qml $1/qml/qml/QtQuick/NativeStyle/controls/DefaultSpinBox.qml
cp $2/qml/QtQuick/NativeStyle/controls/DefaultTextArea.qml $1/qml/qml/QtQuick/NativeStyle/controls/DefaultTextArea.qml
cp $2/qml/QtQuick/NativeStyle/controls/DefaultTextField.qml $1/qml/qml/QtQuick/NativeStyle/controls/DefaultTextField.qml
cp $2/qml/QtQuick/NativeStyle/controls/DefaultTreeViewDelegate.qml $1/qml/qml/QtQuick/NativeStyle/controls/DefaultTreeViewDelegate.qml
cp $2/qml/QtQuick/NativeStyle/controls/qmldir $1/qml/qml/QtQuick/NativeStyle/controls/qmldir
cp $2/qml/QtQuick/LocalStorage/plugins.qmltypes $1/qml/qml/QtQuick/LocalStorage/plugins.qmltypes
cp $2/qml/QtQuick/LocalStorage/qmldir $1/qml/qml/QtQuick/LocalStorage/qmldir
cp $2/qml/QtQuick/LocalStorage/libqmllocalstorageplugin.dylib $1/qml/qml/QtQuick/LocalStorage/libqmllocalstorageplugin.dylib
cp $2/qml/QtQuick/Layouts/plugins.qmltypes $1/qml/qml/QtQuick/Layouts/plugins.qmltypes
cp $2/qml/QtQuick/Layouts/qmldir $1/qml/qml/QtQuick/Layouts/qmldir
cp $2/qml/QtQuick/Layouts/libqquicklayoutsplugin.dylib $1/qml/qml/QtQuick/Layouts/libqquicklayoutsplugin.dylib
cp $2/qml/QtQuick/Effects/libeffectsplugin.dylib $1/qml/qml/QtQuick/Effects/libeffectsplugin.dylib
cp $2/qml/QtQuick/Effects/plugins.qmltypes $1/qml/qml/QtQuick/Effects/plugins.qmltypes
cp $2/qml/QtQuick/Effects/qmldir $1/qml/qml/QtQuick/Effects/qmldir
cp $2/qml/QtQuick/Dialogs/plugins.qmltypes $1/qml/qml/QtQuick/Dialogs/plugins.qmltypes
cp $2/qml/QtQuick/Dialogs/qmldir $1/qml/qml/QtQuick/Dialogs/qmldir
cp $2/qml/QtQuick/Dialogs/libqtquickdialogsplugin.dylib $1/qml/qml/QtQuick/Dialogs/libqtquickdialogsplugin.dylib
cp $2/qml/QtQuick/Dialogs/quickimpl/plugins.qmltypes $1/qml/qml/QtQuick/Dialogs/quickimpl/plugins.qmltypes
cp $2/qml/QtQuick/Dialogs/quickimpl/qmldir $1/qml/qml/QtQuick/Dialogs/quickimpl/qmldir
cp $2/qml/QtQuick/Dialogs/quickimpl/libqtquickdialogs2quickimplplugin.dylib $1/qml/qml/QtQuick/Dialogs/quickimpl/libqtquickdialogs2quickimplplugin.dylib
cp $2/qml/QtQuick/Dialogs/quickimpl/qml/ColorDialog.qml $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/ColorDialog.qml
cp $2/qml/QtQuick/Dialogs/quickimpl/qml/ColorInputs.qml $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/ColorInputs.qml
cp $2/qml/QtQuick/Dialogs/quickimpl/qml/FileDialog.qml $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/FileDialog.qml
cp $2/qml/QtQuick/Dialogs/quickimpl/qml/FileDialogDelegate.qml $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/FileDialogDelegate.qml
cp $2/qml/QtQuick/Dialogs/quickimpl/qml/FileDialogDelegateLabel.qml $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/FileDialogDelegateLabel.qml
cp $2/qml/QtQuick/Dialogs/quickimpl/qml/FolderBreadcrumbBar.qml $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/FolderBreadcrumbBar.qml
cp $2/qml/QtQuick/Dialogs/quickimpl/qml/FolderDialog.qml $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/FolderDialog.qml
cp $2/qml/QtQuick/Dialogs/quickimpl/qml/FolderDialogDelegate.qml $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/FolderDialogDelegate.qml
cp $2/qml/QtQuick/Dialogs/quickimpl/qml/FolderDialogDelegateLabel.qml $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/FolderDialogDelegateLabel.qml
cp $2/qml/QtQuick/Dialogs/quickimpl/qml/FontDialog.qml $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/FontDialog.qml
cp $2/qml/QtQuick/Dialogs/quickimpl/qml/FontDialogContent.qml $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/FontDialogContent.qml
cp $2/qml/QtQuick/Dialogs/quickimpl/qml/HueGradient.qml $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/HueGradient.qml
cp $2/qml/QtQuick/Dialogs/quickimpl/qml/MessageDialog.qml $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/MessageDialog.qml
cp $2/qml/QtQuick/Dialogs/quickimpl/qml/PickerHandle.qml $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/PickerHandle.qml
cp $2/qml/QtQuick/Dialogs/quickimpl/qml/SaturationLightnessPicker.qml $1/qml/qml/QtQuick/Dialogs/quickimpl/qml/SaturationLightnessPicker.qml
cp $2/qml/QtQuick/Controls/plugins.qmltypes $1/qml/qml/QtQuick/Controls/plugins.qmltypes
cp $2/qml/QtQuick/Controls/qmldir $1/qml/qml/QtQuick/Controls/qmldir
cp $2/qml/QtQuick/Controls/libqtquickcontrols2plugin.dylib $1/qml/qml/QtQuick/Controls/libqtquickcontrols2plugin.dylib
cp $2/qml/QtQuick/Controls/impl/plugins.qmltypes $1/qml/qml/QtQuick/Controls/impl/plugins.qmltypes
cp $2/qml/QtQuick/Controls/impl/qmldir $1/qml/qml/QtQuick/Controls/impl/qmldir
cp $2/qml/QtQuick/Controls/impl/libqtquickcontrols2implplugin.dylib $1/qml/qml/QtQuick/Controls/impl/libqtquickcontrols2implplugin.dylib
cp $2/qml/QtQuick/Controls/Basic/AbstractButton.qml $1/qml/qml/QtQuick/Controls/Basic/AbstractButton.qml
cp $2/qml/QtQuick/Controls/Basic/Action.qml $1/qml/qml/QtQuick/Controls/Basic/Action.qml
cp $2/qml/QtQuick/Controls/Basic/ActionGroup.qml $1/qml/qml/QtQuick/Controls/Basic/ActionGroup.qml
cp $2/qml/QtQuick/Controls/Basic/ApplicationWindow.qml $1/qml/qml/QtQuick/Controls/Basic/ApplicationWindow.qml
cp $2/qml/QtQuick/Controls/Basic/BusyIndicator.qml $1/qml/qml/QtQuick/Controls/Basic/BusyIndicator.qml
cp $2/qml/QtQuick/Controls/Basic/Button.qml $1/qml/qml/QtQuick/Controls/Basic/Button.qml
cp $2/qml/QtQuick/Controls/Basic/ButtonGroup.qml $1/qml/qml/QtQuick/Controls/Basic/ButtonGroup.qml
cp $2/qml/QtQuick/Controls/Basic/Calendar.qml $1/qml/qml/QtQuick/Controls/Basic/Calendar.qml
cp $2/qml/QtQuick/Controls/Basic/CalendarModel.qml $1/qml/qml/QtQuick/Controls/Basic/CalendarModel.qml
cp $2/qml/QtQuick/Controls/Basic/CheckBox.qml $1/qml/qml/QtQuick/Controls/Basic/CheckBox.qml
cp $2/qml/QtQuick/Controls/Basic/CheckDelegate.qml $1/qml/qml/QtQuick/Controls/Basic/CheckDelegate.qml
cp $2/qml/QtQuick/Controls/Basic/ComboBox.qml $1/qml/qml/QtQuick/Controls/Basic/ComboBox.qml
cp $2/qml/QtQuick/Controls/Basic/Container.qml $1/qml/qml/QtQuick/Controls/Basic/Container.qml
cp $2/qml/QtQuick/Controls/Basic/Control.qml $1/qml/qml/QtQuick/Controls/Basic/Control.qml
cp $2/qml/QtQuick/Controls/Basic/DayOfWeekRow.qml $1/qml/qml/QtQuick/Controls/Basic/DayOfWeekRow.qml
cp $2/qml/QtQuick/Controls/Basic/DelayButton.qml $1/qml/qml/QtQuick/Controls/Basic/DelayButton.qml
cp $2/qml/QtQuick/Controls/Basic/Dial.qml $1/qml/qml/QtQuick/Controls/Basic/Dial.qml
cp $2/qml/QtQuick/Controls/Basic/Dialog.qml $1/qml/qml/QtQuick/Controls/Basic/Dialog.qml
cp $2/qml/QtQuick/Controls/Basic/DialogButtonBox.qml $1/qml/qml/QtQuick/Controls/Basic/DialogButtonBox.qml
cp $2/qml/QtQuick/Controls/Basic/Drawer.qml $1/qml/qml/QtQuick/Controls/Basic/Drawer.qml
cp $2/qml/QtQuick/Controls/Basic/Frame.qml $1/qml/qml/QtQuick/Controls/Basic/Frame.qml
cp $2/qml/QtQuick/Controls/Basic/GroupBox.qml $1/qml/qml/QtQuick/Controls/Basic/GroupBox.qml
cp $2/qml/QtQuick/Controls/Basic/HorizontalHeaderView.qml $1/qml/qml/QtQuick/Controls/Basic/HorizontalHeaderView.qml
cp $2/qml/QtQuick/Controls/Basic/ItemDelegate.qml $1/qml/qml/QtQuick/Controls/Basic/ItemDelegate.qml
cp $2/qml/QtQuick/Controls/Basic/Label.qml $1/qml/qml/QtQuick/Controls/Basic/Label.qml
cp $2/qml/QtQuick/Controls/Basic/Menu.qml $1/qml/qml/QtQuick/Controls/Basic/Menu.qml
cp $2/qml/QtQuick/Controls/Basic/MenuBar.qml $1/qml/qml/QtQuick/Controls/Basic/MenuBar.qml
cp $2/qml/QtQuick/Controls/Basic/MenuBarItem.qml $1/qml/qml/QtQuick/Controls/Basic/MenuBarItem.qml
cp $2/qml/QtQuick/Controls/Basic/MenuItem.qml $1/qml/qml/QtQuick/Controls/Basic/MenuItem.qml
cp $2/qml/QtQuick/Controls/Basic/MenuSeparator.qml $1/qml/qml/QtQuick/Controls/Basic/MenuSeparator.qml
cp $2/qml/QtQuick/Controls/Basic/MonthGrid.qml $1/qml/qml/QtQuick/Controls/Basic/MonthGrid.qml
cp $2/qml/QtQuick/Controls/Basic/Page.qml $1/qml/qml/QtQuick/Controls/Basic/Page.qml
cp $2/qml/QtQuick/Controls/Basic/PageIndicator.qml $1/qml/qml/QtQuick/Controls/Basic/PageIndicator.qml
cp $2/qml/QtQuick/Controls/Basic/Pane.qml $1/qml/qml/QtQuick/Controls/Basic/Pane.qml
cp $2/qml/QtQuick/Controls/Basic/plugins.qmltypes $1/qml/qml/QtQuick/Controls/Basic/plugins.qmltypes
cp $2/qml/QtQuick/Controls/Basic/Popup.qml $1/qml/qml/QtQuick/Controls/Basic/Popup.qml
cp $2/qml/QtQuick/Controls/Basic/ProgressBar.qml $1/qml/qml/QtQuick/Controls/Basic/ProgressBar.qml
cp $2/qml/QtQuick/Controls/Basic/qmldir $1/qml/qml/QtQuick/Controls/Basic/qmldir
cp $2/qml/QtQuick/Controls/Basic/libqtquickcontrols2basicstyleplugin.dylib $1/qml/qml/QtQuick/Controls/Basic/libqtquickcontrols2basicstyleplugin.dylib
cp $2/qml/QtQuick/Controls/Basic/RadioButton.qml $1/qml/qml/QtQuick/Controls/Basic/RadioButton.qml
cp $2/qml/QtQuick/Controls/Basic/RadioDelegate.qml $1/qml/qml/QtQuick/Controls/Basic/RadioDelegate.qml
cp $2/qml/QtQuick/Controls/Basic/RangeSlider.qml $1/qml/qml/QtQuick/Controls/Basic/RangeSlider.qml
cp $2/qml/QtQuick/Controls/Basic/RoundButton.qml $1/qml/qml/QtQuick/Controls/Basic/RoundButton.qml
cp $2/qml/QtQuick/Controls/Basic/ScrollBar.qml $1/qml/qml/QtQuick/Controls/Basic/ScrollBar.qml
cp $2/qml/QtQuick/Controls/Basic/ScrollIndicator.qml $1/qml/qml/QtQuick/Controls/Basic/ScrollIndicator.qml
cp $2/qml/QtQuick/Controls/Basic/ScrollView.qml $1/qml/qml/QtQuick/Controls/Basic/ScrollView.qml
cp $2/qml/QtQuick/Controls/Basic/SelectionRectangle.qml $1/qml/qml/QtQuick/Controls/Basic/SelectionRectangle.qml
cp $2/qml/QtQuick/Controls/Basic/Slider.qml $1/qml/qml/QtQuick/Controls/Basic/Slider.qml
cp $2/qml/QtQuick/Controls/Basic/SpinBox.qml $1/qml/qml/QtQuick/Controls/Basic/SpinBox.qml
cp $2/qml/QtQuick/Controls/Basic/SplitView.qml $1/qml/qml/QtQuick/Controls/Basic/SplitView.qml
cp $2/qml/QtQuick/Controls/Basic/StackView.qml $1/qml/qml/QtQuick/Controls/Basic/StackView.qml
cp $2/qml/QtQuick/Controls/Basic/SwipeDelegate.qml $1/qml/qml/QtQuick/Controls/Basic/SwipeDelegate.qml
cp $2/qml/QtQuick/Controls/Basic/SwipeView.qml $1/qml/qml/QtQuick/Controls/Basic/SwipeView.qml
cp $2/qml/QtQuick/Controls/Basic/Switch.qml $1/qml/qml/QtQuick/Controls/Basic/Switch.qml
cp $2/qml/QtQuick/Controls/Basic/SwitchDelegate.qml $1/qml/qml/QtQuick/Controls/Basic/SwitchDelegate.qml
cp $2/qml/QtQuick/Controls/Basic/TabBar.qml $1/qml/qml/QtQuick/Controls/Basic/TabBar.qml
cp $2/qml/QtQuick/Controls/Basic/TabButton.qml $1/qml/qml/QtQuick/Controls/Basic/TabButton.qml
cp $2/qml/QtQuick/Controls/Basic/TextArea.qml $1/qml/qml/QtQuick/Controls/Basic/TextArea.qml
cp $2/qml/QtQuick/Controls/Basic/TextField.qml $1/qml/qml/QtQuick/Controls/Basic/TextField.qml
cp $2/qml/QtQuick/Controls/Basic/ToolBar.qml $1/qml/qml/QtQuick/Controls/Basic/ToolBar.qml
cp $2/qml/QtQuick/Controls/Basic/ToolButton.qml $1/qml/qml/QtQuick/Controls/Basic/ToolButton.qml
cp $2/qml/QtQuick/Controls/Basic/ToolSeparator.qml $1/qml/qml/QtQuick/Controls/Basic/ToolSeparator.qml
cp $2/qml/QtQuick/Controls/Basic/ToolTip.qml $1/qml/qml/QtQuick/Controls/Basic/ToolTip.qml
cp $2/qml/QtQuick/Controls/Basic/TreeViewDelegate.qml $1/qml/qml/QtQuick/Controls/Basic/TreeViewDelegate.qml
cp $2/qml/QtQuick/Controls/Basic/Tumbler.qml $1/qml/qml/QtQuick/Controls/Basic/Tumbler.qml
cp $2/qml/QtQuick/Controls/Basic/VerticalHeaderView.qml $1/qml/qml/QtQuick/Controls/Basic/VerticalHeaderView.qml
cp $2/qml/QtQuick/Controls/Basic/WeekNumberColumn.qml $1/qml/qml/QtQuick/Controls/Basic/WeekNumberColumn.qml
cp $2/qml/QtQuick/Controls/Basic/impl/plugins.qmltypes $1/qml/qml/QtQuick/Controls/Basic/impl/plugins.qmltypes
cp $2/qml/QtQuick/Controls/Basic/impl/qmldir $1/qml/qml/QtQuick/Controls/Basic/impl/qmldir
cp $2/qml/QtQuick/Controls/Basic/impl/libqtquickcontrols2basicstyleimplplugin.dylib $1/qml/qml/QtQuick/Controls/Basic/impl/libqtquickcontrols2basicstyleimplplugin.dylib
cp $2/qml/QtQml/plugins.qmltypes $1/qml/qml/QtQml/plugins.qmltypes
cp $2/qml/QtQml/qmldir $1/qml/qml/QtQml/qmldir
cp $2/qml/QtQml/libqmlplugin.dylib $1/qml/qml/QtQml/libqmlplugin.dylib
cp $2/qml/QtQml/XmlListModel/plugins.qmltypes $1/qml/qml/QtQml/XmlListModel/plugins.qmltypes
cp $2/qml/QtQml/XmlListModel/qmldir $1/qml/qml/QtQml/XmlListModel/qmldir
cp $2/qml/QtQml/XmlListModel/libqmlxmllistmodelplugin.dylib $1/qml/qml/QtQml/XmlListModel/libqmlxmllistmodelplugin.dylib
cp $2/qml/QtQml/WorkerScript/plugins.qmltypes $1/qml/qml/QtQml/WorkerScript/plugins.qmltypes
cp $2/qml/QtQml/WorkerScript/qmldir $1/qml/qml/QtQml/WorkerScript/qmldir
cp $2/qml/QtQml/WorkerScript/libworkerscriptplugin.dylib $1/qml/qml/QtQml/WorkerScript/libworkerscriptplugin.dylib
cp $2/qml/QtQml/Models/libmodelsplugin.dylib $1/qml/qml/QtQml/Models/libmodelsplugin.dylib
cp $2/qml/QtQml/Models/plugins.qmltypes $1/qml/qml/QtQml/Models/plugins.qmltypes
cp $2/qml/QtQml/Models/qmldir $1/qml/qml/QtQml/Models/qmldir
cp $2/qml/QtNetwork/plugins.qmltypes $1/qml/qml/QtNetwork/plugins.qmltypes
cp $2/qml/QtNetwork/qmldir $1/qml/qml/QtNetwork/qmldir
cp $2/qml/QtNetwork/libqmlnetworkplugin.dylib $1/qml/qml/QtNetwork/libqmlnetworkplugin.dylib
cp $2/qml/QtCore/plugins.qmltypes $1/qml/qml/QtCore/plugins.qmltypes
cp $2/qml/QtCore/qmldir $1/qml/qml/QtCore/qmldir
cp $2/qml/QtCore/libqtqmlcoreplugin.dylib $1/qml/qml/QtCore/libqtqmlcoreplugin.dylib
cp $2/qml/Qt/test/controls/qmldir $1/qml/qml/Qt/test/controls/qmldir
cp $2/qml/Qt/test/controls/QuickControlsTestUtilsPrivate.qmltypes $1/qml/qml/Qt/test/controls/QuickControlsTestUtilsPrivate.qmltypes
cp $2/qml/Qt/test/controls/libquickcontrolstestutilsprivateplugin.dylib $1/qml/qml/Qt/test/controls/libquickcontrolstestutilsprivateplugin.dylib
cp $2/qml/QmlTime/qmldir $1/qml/qml/QmlTime/qmldir
cp $2/qml/QmlTime/qmltime.qmltypes $1/qml/qml/QmlTime/qmltime.qmltypes
cp $2/qml/QML/plugins.qmltypes $1/qml/qml/QML/plugins.qmltypes
cp $2/qml/QML/qmldir $1/qml/qml/QML/qmldir
cp $2/qml/Assets/Downloader/plugins.qmltypes $1/qml/qml/Assets/Downloader/plugins.qmltypes
cp $2/qml/Assets/Downloader/libqmlassetdownloaderplugin.dylib $1/qml/qml/Assets/Downloader/libqmlassetdownloaderplugin.dylib
cp $2/qml/Assets/Downloader/qmldir $1/qml/qml/Assets/Downloader/qmldir
