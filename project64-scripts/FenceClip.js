const X_ADDR = 0x800F69A4
const Y_ADDR = 0x800F69A8
const Z_ADDR = 0x800F69AC
const ANGLE_ADDR = 0x800F69BC

const FENCE_X = -688
const MAX_SPEED = 314
const MAX_TURBO_TIME = 80
const TEXT_HEIGHT = 13
const TOP_TEXT_Y = 80
const SIN_TABLE_BASE = 0x802BA370
const COS_TABLE_BASE = 0x802BB370

events.ondraw(function () {
    var x
    var y
    var z
    var bam
    var angle

    x = mem.float[X_ADDR]
    y = mem.float[Y_ADDR]
    z = mem.float[Z_ADDR]
    bam = mem.u32[ANGLE_ADDR] // binary angular measurement of kart angle
    angle = bam * 180 * Math.pow(2, -15) // angle in degrees

    var accel = 0
    var xVelocity = 0
    var yVelocity = 0
    var zVelocity = 0
    var prevX = 0
    var prevY = 0
    var prevZ = 0
    var speed = 0
    var clip = "No"
    var closest = Infinity
    for (var i = 0; i < 30; i++) {
        accel = calculateNextAccel(accel, MAX_SPEED)
        var power = calculatePower(accel, i)
        var alignMatrix = makeAlignMatrix(bam)
        var velocity = [0, 0, power]
        velocity = multiplyMatrixByVector(velocity, alignMatrix)
        xVelocity = toSingle(xVelocity + ((velocity[0] - (xVelocity * 0.12 * 5800)) / 6000))
        yVelocity = toSingle(yVelocity + velocity[1])
        zVelocity = toSingle(zVelocity + ((velocity[2] - (zVelocity * 0.12 * 5800)) / 6000))
        speed = Math.sqrt(Math.pow(xVelocity, 2) + Math.pow(zVelocity, 2))

        prevX = x
        prevY = y
        prevZ = z
        x = toSingle(x + xVelocity)
        y = toSingle(y + yVelocity)
        z = toSingle(z + zVelocity)

        if (x === FENCE_X) {
            if (speed < 5.5) { // 5.5 = Yoshi kart size
                clip = "No - speed < 5.5"
            } else if (Math.abs(prevX) - 5.5 < Math.abs(FENCE_X)) {
                clip = "No - angle too obtuse"
            } else {
                clip = "Yes"
            }
            closest = x
            break
        } else {
            var nextX = Math.abs(FENCE_X - x);
            if (nextX < closest) {
                closest = nextX
            } else {
                break
            }
        }
    }

    var textCount = 0
    screen.print(0, calculateTextPosition(textCount++), 'x: ' + numberToString(prevX))
    screen.print(0, calculateTextPosition(textCount++), 'y: ' + numberToString(prevY))
    screen.print(0, calculateTextPosition(textCount++), 'z: ' + numberToString(prevZ))
    textCount++
    screen.print(0, calculateTextPosition(textCount++), 'xV: ' + numberToString(xVelocity))
    screen.print(0, calculateTextPosition(textCount++), 'yV: ' + numberToString(yVelocity))
    screen.print(0, calculateTextPosition(textCount++), 'zV: ' + numberToString(zVelocity))
    textCount++
    screen.print(0, calculateTextPosition(textCount++), 'angle: ' + angle)
    screen.print(0, calculateTextPosition(textCount++), 'speed: ' + numberToString(speed))
    textCount++
    screen.print(0, calculateTextPosition(textCount++), 'Clip?: ' + clip)
    screen.print(0, calculateTextPosition(textCount++), 'Closest: ' + closest)
})

function calculateNextAccel(currentAccel) {
    if ((MAX_SPEED * 0.0 <= currentAccel) && (currentAccel < MAX_SPEED * 0.1)) currentAccel = currentAccel + 2.0
    if ((MAX_SPEED * 0.1 <= currentAccel) && (currentAccel < MAX_SPEED * 0.2)) currentAccel = currentAccel + 2.0
    if ((MAX_SPEED * 0.2 <= currentAccel) && (currentAccel < MAX_SPEED * 0.3)) currentAccel = currentAccel + 2.5
    if ((MAX_SPEED * 0.3 <= currentAccel) && (currentAccel < MAX_SPEED * 0.4)) currentAccel = currentAccel + 2.6
    if ((MAX_SPEED * 0.4 <= currentAccel) && (currentAccel < MAX_SPEED * 0.5)) currentAccel = currentAccel + 2.6
    if ((MAX_SPEED * 0.5 <= currentAccel) && (currentAccel < MAX_SPEED * 0.6)) currentAccel = currentAccel + 2.0
    if ((MAX_SPEED * 0.6 <= currentAccel) && (currentAccel < MAX_SPEED * 0.7)) currentAccel = currentAccel + 1.5
    if ((MAX_SPEED * 0.7 <= currentAccel) && (currentAccel < MAX_SPEED * 0.8)) currentAccel = currentAccel + 0.8
    if ((MAX_SPEED * 0.8 <= currentAccel) && (currentAccel < MAX_SPEED * 0.9)) currentAccel = currentAccel + 0.8
    if ((MAX_SPEED * 0.9 <= currentAccel) && (currentAccel <= MAX_SPEED * 1)) currentAccel = currentAccel + 0.8

    if (currentAccel < 0) currentAccel = 0
    if (currentAccel > MAX_SPEED) currentAccel = MAX_SPEED

    return currentAccel
}

function calculatePower(acceleration, count) {
    if (acceleration === 0) return 0
    if (acceleration === 2) return Math.pow(acceleration, 2) / 25
    if (acceleration === 4) return (Math.pow(acceleration, 2) / 25) + 200

    var turboPower = calculateTurboPower(count)
    turboPower -= (turboPower - 400) * 0.5
    return toSingle((Math.pow(MAX_SPEED, 2) / 25) + turboPower)
}

function calculateTurboPower(count) {
    var turboPower = 0
    for (var i = 0; i < (count - 1) && i < MAX_TURBO_TIME; i++) {
        turboPower -= (turboPower - 400) * 0.5
    }
    return turboPower
}

function makeAlignMatrix(bam) {
    sinLookupAddr = SIN_TABLE_BASE + (bam >> 4 << 2)
    cosLookupAddr = COS_TABLE_BASE + (bam >> 4 << 2)
    var sine = mem.float[sinLookupAddr]
    var cosine = mem.float[cosLookupAddr]
    var ma = [
        [cosine, 0, -sine],
        [0, 1, 0],
        [sine, 0, cosine]
    ]
    var mb = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ]

    var mf = [[], [], []]
    mf[0][0] = ma[0][0] * mb[0][0] + ma[0][1] * mb[1][0] + ma[0][2] * mb[2][0]
    mf[1][0] = ma[1][0] * mb[0][0] + ma[1][1] * mb[1][0] + ma[1][2] * mb[2][0]
    mf[2][0] = ma[2][0] * mb[0][0] + ma[2][1] * mb[1][0] + ma[2][2] * mb[2][0]

    mf[0][1] = ma[0][0] * mb[0][1] + ma[0][1] * mb[1][1] + ma[0][2] * mb[2][1]
    mf[1][1] = ma[1][0] * mb[0][1] + ma[1][1] * mb[1][1] + ma[1][2] * mb[2][1]
    mf[2][1] = ma[2][0] * mb[0][1] + ma[2][1] * mb[1][1] + ma[2][2] * mb[2][1]

    mf[0][2] = ma[0][0] * mb[0][2] + ma[0][1] * mb[1][2] + ma[0][2] * mb[2][2]
    mf[1][2] = ma[1][0] * mb[0][2] + ma[1][1] * mb[1][2] + ma[1][2] * mb[2][2]
    mf[2][2] = ma[2][0] * mb[0][2] + ma[2][1] * mb[1][2] + ma[2][2] * mb[2][2]

    return mf
}

function multiplyMatrixByVector(vector, matrix) {
    var v0, v1, v2
    v0 = matrix[0][0] * vector[0] + matrix[0][1] * vector[1] + matrix[0][2] * vector[2]
    v1 = matrix[1][0] * vector[0] + matrix[1][1] * vector[1] + matrix[1][2] * vector[2]
    v2 = matrix[2][0] * vector[0] + matrix[2][1] * vector[1] + matrix[2][2] * vector[2]

    vector[0] = toSingle(v0)
    vector[1] = toSingle(v1)
    vector[2] = toSingle(v2)

    return vector
}

function toSingle(number) {
    return new Float32Array([number])[0]
}

function calculateTextPosition(i) {
    return TOP_TEXT_Y + TEXT_HEIGHT * i
}

function numberToString(num) {
    var numStr = String(num)

    var e
    if (Math.abs(num) < 1.0) {
        e = parseInt(num.toString().split('e-')[1])
        if (e) {
            var negative = num < 0
            if (negative) num *= -1
            num *= Math.pow(10, e - 1)
            numStr = '0.' + (new Array(e)).join('0') + num.toString().substring(2)
            if (negative) numStr = "-" + numStr
        }
    } else {
        e = parseInt(num.toString().split('+')[1])
        if (e > 20) {
            e -= 20
            num /= Math.pow(10, e)
            numStr = num.toString() + (new Array(e + 1)).join('0')
        }
    }

    return numStr
}