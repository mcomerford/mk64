var xAddr = 0x800F69A4
var xVelocityAddr = 0x800F69C4
var yAddr = 0x800F69A8
var yVelocityAddr = 0x800F69C8
var zAddr = 0x800F69AC
var zVelocityAddr = 0x800F69CC
var angleAddr = 0x800F69BC
var angleVelocityAddr = 0x800F6A24
var u1Addr = 0x800F6A28
var accCntAddr = 0x800F6A2C
var powerCheckAddr = 0x8015AABC

var x
var xVelocity
var y
var yVelocity
var z
var zVelocity
var angle
var angleVelocity
var acceleration
var powerCheck

var textHeight = 13
var topTextY = 80

events.ondraw(function () {
    x = mem.float[xAddr]
    xVelocity = mem.float[xVelocityAddr]
    y = mem.float[yAddr]
    yVelocity = mem.float[yVelocityAddr]
    z = mem.float[zAddr]
    zVelocity = mem.float[zVelocityAddr]
    angle = mem.u32[angleAddr] * 180 * Math.pow(2, -15)
    angleVelocity = mem.float[angleVelocityAddr]
    acceleration = mem.float[accCntAddr]
    powerCheck = Math.pow(acceleration, 2) / 25

    var i = 0
    screen.print(0, calculateTextPosition(i++), 'X:              ' + x)
    screen.print(0, calculateTextPosition(i++), 'Y:              ' + y)
    screen.print(0, calculateTextPosition(i++), 'Z:              ' + z)
    screen.print(0, calculateTextPosition(i++), 'X Velocity:     ' + xVelocity)
    screen.print(0, calculateTextPosition(i++), 'Y Velocity:     ' + yVelocity)
    screen.print(0, calculateTextPosition(i++), 'Z Velocity:     ' + zVelocity)
    screen.print(0, calculateTextPosition(i++), 'Angle:          ' + angle)
    screen.print(0, calculateTextPosition(i++), 'Angle Velocity: ' + angleVelocity)
    screen.print(0, calculateTextPosition(i++), 'Acceleration:   ' + acceleration)
    screen.print(0, calculateTextPosition(i++), 'Power Check:    ' + powerCheck)
})

function calculateTextPosition(i) {
    return topTextY + textHeight * i
}