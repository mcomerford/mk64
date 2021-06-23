local X_ADDR = 0xF69A4
local Y_ADDR = 0xF69A8
local Z_ADDR = 0xF69AC
local ANGLE_ADDR = 0xF69BC

local FENCE_X = -688
local MAX_SPEED = 314
local MAX_TURBO_TIME = 80
local TEXT_HEIGHT = 20
local TOP_TEXT_Y = 80
local SIN_TABLE_BASE = 0x2BA370
local COS_TABLE_BASE = 0x2BB370

function calculateNextAccel(currentAccel)
    if ((MAX_SPEED * 0.0 <= currentAccel) and (currentAccel < MAX_SPEED * 0.1)) then
        currentAccel = currentAccel + 2.0
    end
    if ((MAX_SPEED * 0.1 <= currentAccel) and (currentAccel < MAX_SPEED * 0.2)) then
        currentAccel = currentAccel + 2.0
    end
    if ((MAX_SPEED * 0.2 <= currentAccel) and (currentAccel < MAX_SPEED * 0.3)) then
        currentAccel = currentAccel + 2.5
    end
    if ((MAX_SPEED * 0.3 <= currentAccel) and (currentAccel < MAX_SPEED * 0.4)) then
        currentAccel = currentAccel + 2.6
    end
    if ((MAX_SPEED * 0.4 <= currentAccel) and (currentAccel < MAX_SPEED * 0.5)) then
        currentAccel = currentAccel + 2.6
    end
    if ((MAX_SPEED * 0.5 <= currentAccel) and (currentAccel < MAX_SPEED * 0.6)) then
        currentAccel = currentAccel + 2.0
    end
    if ((MAX_SPEED * 0.6 <= currentAccel) and (currentAccel < MAX_SPEED * 0.7)) then
        currentAccel = currentAccel + 1.5
    end
    if ((MAX_SPEED * 0.7 <= currentAccel) and (currentAccel < MAX_SPEED * 0.8)) then
        currentAccel = currentAccel + 0.8
    end
    if ((MAX_SPEED * 0.8 <= currentAccel) and (currentAccel < MAX_SPEED * 0.9)) then
        currentAccel = currentAccel + 0.8
    end
    if ((MAX_SPEED * 0.9 <= currentAccel) and (currentAccel <= MAX_SPEED * 1)) then
        currentAccel = currentAccel + 0.8
    end

    if (currentAccel < 0) then
        currentAccel = 0
    end
    if (currentAccel > MAX_SPEED) then
        currentAccel = MAX_SPEED
    end

    return currentAccel
end

function calculatePower(acceleration, count)
    if (acceleration == 0) then
        return 0
    end
    if (acceleration == 2) then
        return acceleration ^ 2 / 25
    end
    if (acceleration == 4) then
        return (acceleration ^ 2 / 25) + 200
    end

    local turboPower = calculateTurboPower(count)
    turboPower = turboPower - ((turboPower - 400) * 0.5)
    return toSingle((MAX_SPEED ^ 2 / 25) + turboPower)
end

function calculateTurboPower(count)
    local turboPower = 0
    for _ = 0, math.min((count - 2), MAX_TURBO_TIME) do
        turboPower = turboPower - ((turboPower - 400) * 0.5)
    end
    return turboPower
end

function makeAlignMatrix(bam)
    sinLookupAddr = SIN_TABLE_BASE + (bit.lshift(bit.rshift(bam, 4), 2))
    cosLookupAddr = COS_TABLE_BASE + (bit.lshift(bit.rshift(bam, 4), 2))
    local sine = mainmemory.readfloat(sinLookupAddr, true)
    local cosine = mainmemory.readfloat(cosLookupAddr, true)
    local ma = {
        { [1] = cosine, [2] = 0, [3] = -sine },
        { [1] = 0, [2] = 1, [3] = 0 },
        { [1] = sine, [2] = 0, [3] = cosine }
    }
    local mb = {
        { [1] = 1, [2] = 0, [3] = 0 },
        { [1] = 0, [2] = 1, [3] = 0 },
        { [1] = 0, [2] = 0, [3] = 1 }
    }

    local mf = { {}, {}, {} }
    mf[1][1] = ma[1][1] * mb[1][1] + ma[1][2] * mb[2][1] + ma[1][3] * mb[3][1]
    mf[2][1] = ma[2][1] * mb[1][1] + ma[2][2] * mb[2][1] + ma[2][3] * mb[3][1]
    mf[3][1] = ma[3][1] * mb[1][1] + ma[3][2] * mb[2][1] + ma[3][3] * mb[3][1]

    mf[1][2] = ma[1][1] * mb[1][2] + ma[1][2] * mb[2][2] + ma[1][3] * mb[3][2]
    mf[2][2] = ma[2][1] * mb[1][2] + ma[2][2] * mb[2][2] + ma[2][3] * mb[3][2]
    mf[3][2] = ma[3][1] * mb[1][2] + ma[3][2] * mb[2][2] + ma[3][3] * mb[3][2]

    mf[1][3] = ma[1][1] * mb[1][3] + ma[1][2] * mb[2][3] + ma[1][3] * mb[3][3]
    mf[2][3] = ma[2][1] * mb[1][3] + ma[2][2] * mb[2][3] + ma[2][3] * mb[3][3]
    mf[3][3] = ma[3][1] * mb[1][3] + ma[3][2] * mb[2][3] + ma[3][3] * mb[3][3]

    return mf
end

function multiplyMatrixByVector(vector, matrix)
    local v1, v2, v3
    v1 = matrix[1][1] * vector[1] + matrix[1][2] * vector[2] + matrix[1][3] * vector[3]
    v2 = matrix[2][1] * vector[1] + matrix[2][2] * vector[2] + matrix[2][3] * vector[3]
    v3 = matrix[3][1] * vector[1] + matrix[3][2] * vector[2] + matrix[3][3] * vector[3]

    vector[1] = toSingle(v1)
    vector[2] = toSingle(v2)
    vector[3] = toSingle(v3)

    return vector
end

function calculateTextPosition(i)
    return TOP_TEXT_Y + TEXT_HEIGHT * i
end

function round(n)
    local result = math.floor(n + 0.5)
    if result >= 256 then
        return math.floor(n)
    end
    return result
end

function float2hex (n)
    if n == 0.0 then return 0.0 end

    local sign = 0
    if n < 0.0 then
        sign = 0x80
        n = -n
    end

    local mant, expo = math.frexp(n)
    local hext = {}

    if mant ~= mant then
        hext[#hext+1] = string.char(0xFF, 0x88, 0x00, 0x00)

    elseif mant == math.huge or expo > 0x80 then
        if sign == 0 then
            hext[#hext+1] = string.char(0x7F, 0x80, 0x00, 0x00)
        else
            hext[#hext+1] = string.char(0xFF, 0x80, 0x00, 0x00)
        end

    elseif (mant == 0.0 and expo == 0) or expo < -0x7E then
        hext[#hext+1] = string.char(sign, 0x00, 0x00, 0x00)

    else
        expo = expo + 0x7E
        mant = (mant * 2.0 - 1.0) * math.ldexp(0.5, 24)
        hext[#hext+1] = string.char(sign + math.floor(expo / 0x2),
                (expo % 0x2) * 0x80 + math.floor(mant / 0x10000),
                math.floor(mant / 0x100) % 0x100,
                round(mant % 0x100))
    end

    return tonumber(string.gsub(table.concat(hext),"(.)",
            function (c) return string.format("%02X%s",string.byte(c),"") end), 16)
end

function hex2float (c)
    if c == 0 then return 0.0 end
    c = string.gsub(string.format("%X", c),"(..)",function (x) return string.char(tonumber(x, 16)) end)
    local b1,b2,b3,b4 = string.byte(c, 1, 4)
    local sign = b1 > 0x7F
    local expo = (b1 % 0x80) * 0x2 + math.floor(b2 / 0x80)
    local mant = ((b2 % 0x80) * 0x100 + b3) * 0x100 + b4

    if sign then
        sign = -1
    else
        sign = 1
    end

    local n

    if mant == 0 and expo == 0 then
        n = sign * 0.0
    elseif expo == 0xFF then
        if mant == 0 then
            n = sign * math.huge
        else
            n = 0.0/0.0
        end
    else
        n = sign * math.ldexp(1.0 + mant / 0x800000, expo - 0x7F)
    end

    return n
end

function toSingle(number)
    return hex2float(float2hex(number))
end

while true do
    local x
    local y
    local z
    local bam
    local angle
    x = mainmemory.readfloat(X_ADDR, true)
    y = mainmemory.readfloat(Y_ADDR, true)
    z = mainmemory.readfloat(Z_ADDR, true)
    bam = mainmemory.read_u32_be(ANGLE_ADDR) -- binary angular measurement of kart angle
    angle = bam * 180 * 2 ^ -15 -- angle in degrees

    local accel = 0
    local xVelocity = 0
    local yVelocity = 0
    local zVelocity = 0
    local prevX = 0
    local prevY = 0
    local prevZ = 0
    local speed = 0
    local clip = "No"
    local closest = math.huge
    local velocity
    local power
    local alignMatrix
    for i = 0, 30 do
        accel = calculateNextAccel(accel, MAX_SPEED)
        power = calculatePower(accel, i)
        alignMatrix = makeAlignMatrix(bam)
        velocity = { 0, 0, power }
        velocity = multiplyMatrixByVector(velocity, alignMatrix)
        xVelocity = toSingle(xVelocity + ((velocity[1] - (xVelocity * 0.12 * 5800)) / 6000))
        yVelocity = toSingle(yVelocity + velocity[2])
        zVelocity = toSingle(zVelocity + ((velocity[3] - (zVelocity * 0.12 * 5800)) / 6000))
        speed = math.sqrt(math.pow(xVelocity, 2) + math.pow(zVelocity, 2))

        prevX = x
        prevY = y
        prevZ = z
        x = toSingle(x + xVelocity)
        y = toSingle(y + yVelocity)
        z = toSingle(z + zVelocity)

        if (x == FENCE_X) then
            if (speed < 5.5) then
                -- 5.5 = Yoshi kart size
                clip = "No - speed < 5.5"
            elseif (math.abs(prevX) - 5.5 < math.abs(FENCE_X)) then
                clip = "No - angle too obtuse"
            else
                clip = "Yes"
            end
            closest = x
            break
        else
            local nextX = math.abs(FENCE_X - x)
            if nextX < closest then
                closest = nextX
            else
                break
            end
        end
    end
    gui.text(0, calculateTextPosition(0), "x: " .. string.format("%.15f", prevX))
    gui.text(0, calculateTextPosition(1), "y: " .. string.format("%.15f", prevY))
    gui.text(0, calculateTextPosition(2), "z: " .. string.format("%.15f", prevZ))
    gui.text(0, calculateTextPosition(3), "xVelocity: " .. string.format("%.15f", xVelocity))
    gui.text(0, calculateTextPosition(4), "yVelocity: " .. string.format("%.15f", yVelocity))
    gui.text(0, calculateTextPosition(5), "zVelocity: " .. string.format("%.15f", zVelocity))
    gui.text(0, calculateTextPosition(6), "angle: " .. string.format("%.15f", angle))
    gui.text(0, calculateTextPosition(7), "speed: " .. string.format("%.15f", speed))
    gui.text(0, calculateTextPosition(8), "Clip?: " .. clip)
    gui.text(0, calculateTextPosition(9), "Closest: " .. string.format("%.15f", closest))

    emu.frameadvance()
end