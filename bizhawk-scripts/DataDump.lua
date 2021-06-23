local xAddr = 0xF69A4
local xVelocityAddr = 0xF69C4
local yAddr = 0xF69A8
local yVelocityAddr = 0xF69C8
local zAddr = 0xF69AC
local zVelocityAddr = 0xF69CC
local angleAddr = 0xF69BC
local angleVelocityAddr = 0xF6A24
local u1Addr = 0xF6A28
local u2Addr = 0xF6A2C

local x
local xVelocity
local y
local yVelocity
local z
local zVelocity
local angle
local angleVelocity
local u1
local u2
local data = io.open("data2.csv", "w+")

data:setvbuf("no")
data:write("X,X Velocity,Y,Y Velocity,Z,Z Velocity,Angle,Angle Velocity,U1,U2\n")
function printWatches()
    x = mainmemory.readfloat(xAddr, true)
    xVelocity = mainmemory.readfloat(xVelocityAddr, true)
    y = mainmemory.readfloat(yAddr, true)
    yVelocity = mainmemory.readfloat(yVelocityAddr, true)
    z = mainmemory.readfloat(zAddr, true)
    zVelocity = mainmemory.readfloat(zVelocityAddr, true)
    angle = mainmemory.read_u32_be(angleAddr)
    angleVelocity = mainmemory.readfloat(angleVelocityAddr, true)
    u1 = mainmemory.readfloat(u1Addr, true)
    u2 = mainmemory.readfloat(u2Addr, true)
    data:write(x, ",", xVelocity, ",", y, ",", yVelocity, ",", z, ",", zVelocity, ",", angle, ",", angleVelocity, ",", u1, ",", u2, "\n")
    gui.text(0, 900, "Angle: " .. angle * 180 * 2 ^ -15)
end

event.onframeend(printWatches)