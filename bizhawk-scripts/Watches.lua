local xAddr = 0xF69A4
local xVelocityAddr = 0xF69C4
local yAddr = 0xF69A8
local yVelocityAddr = 0xF69C8
local zAddr = 0xF69AC
local zVelocityAddr = 0xF69CC
local angleAddr = 0xF69BC
local angleVelocityAddr = 0xF6A24
local accCntAddr = 0xF6A2C

local x
local xVelocity
local y
local yVelocity
local z
local zVelocity
local angle
local angleVelocity
local accel

while true do
    x = mainmemory.readfloat(xAddr, true)
    xVelocity = mainmemory.readfloat(xVelocityAddr, true)
    y = mainmemory.readfloat(yAddr, true)
    yVelocity = mainmemory.readfloat(yVelocityAddr, true)
    z = mainmemory.readfloat(zAddr, true)
    zVelocity = mainmemory.readfloat(zVelocityAddr, true)
    angle = mainmemory.read_u32_be(angleAddr)
    angleVelocity = mainmemory.readfloat(angleVelocityAddr, true)
    accel = mainmemory.readfloat(accCntAddr, true)
    gui.text(0, 100, "X: " .. x)
    gui.text(0, 120, "Y: " .. y)
    gui.text(0, 140, "Z: " .. z)
    gui.text(0, 160, "xVelocity: " .. xVelocity)
    gui.text(0, 180, "yVelocity: " .. yVelocity)
    gui.text(0, 200, "zVelocity: " .. zVelocity)
    gui.text(0, 220, "Angle: " .. angle * 180 * 2 ^ -15)
    gui.text(0, 240, "AngleVelocity: " .. angleVelocity)
    gui.text(0, 260, "Acceleration: " .. accel)
    gui.text(0, 280, "PowerCheck: " .. accel ^ 2 / 25)
    emu.frameadvance()
end