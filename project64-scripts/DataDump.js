var xAddr = 0x800F69A4
var xVelocityAddr = 0x800F69C4
var yAddr = 0x800F69A8
var yVelocityAddr = 0x800F69C8
var zAddr = 0x800F69AC
var zVelocityAddr = 0x800F69CC
var angleAddr = 0x800F69BC
var angleVelocityAddr = 0x800F6A24
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
var accCnt
var powerCheck
var prevPowerCheck

var textHeight = 13
var topTextY = 80

var fd = fs.open('data-turbo.csv', 'w')
fs.write(fd, 'X,X Velocity,Y,Y Velocity,Z,Z Velocity,Angle,Angle Velocity,Acceleration,Power Check\n')

events.onwrite(xAddr, function () {
    x = mem.float[xAddr]
    fs.write(fd, x + ',,,,,,,,,\n')
})

events.onwrite(xVelocityAddr, function () {
    xVelocity = mem.float[xVelocityAddr]
    fs.write(fd, ',' + xVelocity + ',,,,,,,,\n')
})

events.onwrite(yAddr, function () {
    y = mem.float[yAddr]
    fs.write(fd, ',,' + y + ',,,,,,,\n')
})

events.onwrite(yVelocityAddr, function () {
    yVelocity = mem.float[yVelocityAddr]
    fs.write(fd, ',,,' + yVelocity + ',,,,,,\n')
})

events.onwrite(zAddr, function () {
    z = mem.float[zAddr]
    fs.write(fd, ',,,,' + z + ',,,,,\n')
})

events.onwrite(zVelocityAddr, function () {
    zVelocity = mem.float[zVelocityAddr]
    fs.write(fd, ',,,,,' + zVelocity + ',,,,\n')
})

events.onwrite(angleAddr, function () {
    angle = mem.u32[angleAddr]
    fs.write(fd, ',,,,,,' + angle + ',,,\n')
})

events.onwrite(angleVelocityAddr, function () {
    angleVelocity = mem.float[angleVelocityAddr]
    fs.write(fd, ',,,,,,,' + angleVelocity + ',,\n')
})

events.onwrite(accCntAddr, function () {
    accCnt = mem.float[accCntAddr]
    fs.write(fd, ',,,,,,,,' + accCnt + ',\n')
})

events.onwrite(powerCheckAddr, function () {
    powerCheck = mem.float[powerCheckAddr]
    if (!isNaN(powerCheck) && prevPowerCheck === 1 && powerCheck !== 1) {
        fs.write(fd, ',,,,,,,,,' + powerCheck + '\n')
    }
    prevPowerCheck = powerCheck
})

events.ondraw(function () {
    screen.print(0, topTextY + textHeight * 0, 'X:              ' + x)
    screen.print(0, topTextY + textHeight * 1, 'X Velocity:     ' + xVelocity)
    screen.print(0, topTextY + textHeight * 2, 'Y:              ' + y)
    screen.print(0, topTextY + textHeight * 3, 'Y Velocity:     ' + yVelocity)
    screen.print(0, topTextY + textHeight * 4, 'Z:              ' + z)
    screen.print(0, topTextY + textHeight * 5, 'Z Velocity:     ' + zVelocity)
    screen.print(0, topTextY + textHeight * 6, 'Angle:          ' + angle)
    screen.print(0, topTextY + textHeight * 7, 'Angle Velocity: ' + angleVelocity)
    screen.print(0, topTextY + textHeight * 8, 'Acceleration:   ' + accCnt)

    var a = angle * 180 * Math.pow(2, -15)
    screen.print(0, 500, 'Angle: ' + a)
})