import QtQuick

Item {
    id: hud
    objectName: "hud"
    anchors.fill: parent
    FontLoader { id: futureFont; source: "assets/kenney/ui/Kenney Future Narrow.ttf" }
    property string phase: "menu"
    property int hp: 100
    property int ammo: 18
    property int kills: 0
    property int room: 0
    property string weapon: "sidearm"
    property string session: "SOLO"

    Rectangle {
        anchors.fill: parent
        color: "transparent"
        border.width: 8
        border.color: "#283f48"
        opacity: 0.45
    }
    Image {
        visible: hud.phase === "combat" || hud.phase === "exit"
        anchors.centerIn: parent
        source: "assets/kenney/ui/crosshair.png"
        width: 30; height: 30
        smooth: false
    }
    Rectangle {
        x: 28; y: 24; width: 325; height: 64
        color: "#a80c1a21"
        border.color: "#6896a3"
        BorderImage {
            anchors.fill: parent
            source: "assets/kenney/ui/panel-glass.png"
            border.left: 8; border.right: 8; border.top: 8; border.bottom: 8
            opacity: 0.25
        }
        Text {
            anchors.fill: parent; anchors.margins: 13
            text: "GSOM   /   SECTOR " + (hud.room + 1) + "\nHP " + hud.hp + "     KILLS " + hud.kills
            color: "#dce9df"; font.family: futureFont.name; font.pixelSize: 18; font.bold: true
        }
    }
    Text {
        x: 32; y: 95
        text: hud.session
        color: "#8fe0cc"; font.family: futureFont.name; font.pixelSize: 16; font.bold: true
    }
    Rectangle {
        x: parent.width - 254; y: parent.height - 90; width: 225; height: 58
        color: "#a80c1a21"; border.color: "#6896a3"
        BorderImage {
            anchors.fill: parent
            source: "assets/kenney/ui/panel-glass-notches.png"
            border.left: 8; border.right: 8; border.top: 8; border.bottom: 8
            opacity: 0.25
        }
        Text {
            anchors.centerIn: parent
            text: hud.weapon.toUpperCase() + "  /  " + (hud.weapon === "sidearm" ? "∞" : hud.ammo)
            color: "#dce9df"; font.family: futureFont.name; font.pixelSize: 20; font.bold: true
        }
    }
    Rectangle {
        visible: hud.phase !== "combat"
        anchors.centerIn: parent
        width: 560; height: 230
        color: "#e90b151b"; border.color: "#8eb8bc"; border.width: 2
        Text {
            anchors.centerIn: parent
            width: parent.width - 48
            horizontalAlignment: Text.AlignHCenter
            wrapMode: Text.WordWrap
            color: "#e2eee9"; font.family: futureFont.name; font.pixelSize: 24
            text: hud.phase === "menu" ? "GSOM / RESEARCH SLICE\n\nPress Enter to begin" :
                  hud.phase === "upgrade" ? "SECTOR CLEARED\n\nChoose: 1 Health  /  2 Damage  /  3 Speed" :
                  hud.phase === "exit" ? "EXIT OPEN\n\nPress E to proceed" :
                  hud.phase === "won" ? "RUN COMPLETE\n\nPress Enter to restart" :
                  "SUBJECT TERMINATED\n\nPress Enter to restart"
        }
    }
    Rectangle {
        x: 0; y: parent.height - 33; width: parent.width; height: 33
        color: "#a60c1a21"
    }
    Text {
        anchors.horizontalCenter: parent.horizontalCenter
        y: parent.height - 27
        text: "WASD MOVE  •  MOUSE AIM  •  FIRE  •  1/2 WEAPONS  •  E EXIT"
        color: "#c2d6d9"; font.family: futureFont.name; font.pixelSize: 16
    }
}
