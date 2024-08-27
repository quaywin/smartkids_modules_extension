namespace SK_Modules {
    export enum Buttons {
        //% block="Up"
        Up = 1,
        //% block="Down"
        Down = 2,
        //% block="Left"
        Left = 8,
        //% block="LeftUp"
        LeftUp = 9,
        //% block="LeftDown"
        LeftDown = 10,
        //% block="Right"
        Right = 4,
        //% block="RightUp"
        RightUp = 5,
        //% block="RightUp"
        RightDown = 6
    }

    let led4: neopixel.Strip = null
    let led3: neopixel.Strip = null
    let led2: neopixel.Strip = null
    let led1: neopixel.Strip = null
    let strip: neopixel.Strip = null

    let i2cAddr: number // 0x3F: PCF8574A, 0x27: PCF8574
    let BK: number      // backlight control
    let RS: number      // command/data

    let buttonDirection: Buttons = 0

    //% block
    //% group="Fan"
    export function turnOnFan(pin: AnalogPin) {
        pins.analogWritePin(pin, 500)
    }

    //% block
    //% group="Fan"
    export function turnOnFanMax(pin: AnalogPin) {
        pins.analogWritePin(pin, 1023)
    }

    //% block
    //% group="Fan"
    export function turnOffFan(pin: AnalogPin) {
        pins.analogWritePin(pin, 0)
    }

    //% block
    //% speed.min=0 speed.max=1023
    //% group="Fan"
    export function setFanSpeed(pin: AnalogPin, speed: number) {
        pins.analogWritePin(pin, speed)
    }

    //% block
    //% number.min=1 number.max=4
    //% group="LED"
    export function connectTinyLedRGB(pin: DigitalPin) {
        strip = neopixel.create(pin, 4, NeoPixelMode.RGB)
        led1 = strip.range(0, 1)
        led2 = strip.range(1, 1)
        led3 = strip.range(2, 1)
        led4 = strip.range(3, 1)
    }

    //% block
    //% number.min=1 number.max=4
    //% number.defl=1
    //% group="LED"
    export function showColorTinyLed(number: number, color: NeoPixelColors) {
        switch (number) {
            case 1:
                led1.showColor(neopixel.colors(color))
                break;
            case 2:
                led2.showColor(neopixel.colors(color))
                break;
            case 3:
                led3.showColor(neopixel.colors(color))
                break;
            case 4:
                led4.showColor(neopixel.colors(color))
                break;
            default:
                break;
        }
    }

    //% block
    //% group="LED"
    export function showAllColorTinyLed(color: NeoPixelColors) {
        led1.showColor(neopixel.colors(color))
        led2.showColor(neopixel.colors(color))
        led3.showColor(neopixel.colors(color))
        led4.showColor(neopixel.colors(color))
    }

    //% block="get I2C"
    //% group="Ultils"
    export function getI2C() {
        let address = 0;
        for (let index = 0; index <100; index++) {
            const value = pins.i2cReadNumber(index, NumberFormat.UInt8LE, false);
            if(value != 0) {
                address = index
            }
        }
        serial.writeLine(address.toString());
        return address;
    }

    //% block="start Gamepad"
    //% group="Gamepad"
    export function initGamepad() {
        const value = pins.i2cReadBuffer(85, 30);
        buttonDirection = value[1];
        console.log(buttonDirection)
    }

    //% blockId=on_press_direction_button
    //% block="on press direction button $button"
    //% group="Gamepad"
    //% enumName="Buttons"
    //% enumMemberName="button"
    //% enumInitialMembers="Up, Down, Left, Right"
    export function onDirectionButton(button: Buttons ,handler: () => void) {
        if(button == buttonDirection){
            handler();
        }
    }

    // set LCD reg
    function setreg(d: number) {
        pins.i2cWriteNumber(i2cAddr, d, NumberFormat.Int8LE)
        basic.pause(1)
    }

    // send data to I2C bus
    function set(d: number) {
        d = d & 0xF0
        d = d + BK + RS
        setreg(d)
        setreg(d + 4)
        setreg(d)
    }

    // send command
    function cmd(d: number) {
        RS = 0
        set(d)
        set(d << 4)
    }

    // send data
    function dat(d: number) {
        RS = 1
        set(d)
        set(d << 4)
    }

    // auto get LCD address
    function AutoAddr() {
        let k = true
        let addr = 0x20
        let d1 = 0, d2 = 0
        while (k && (addr < 0x28)) {
            pins.i2cWriteNumber(addr, -1, NumberFormat.Int32LE)
            d1 = pins.i2cReadNumber(addr, NumberFormat.Int8LE) % 16
            pins.i2cWriteNumber(addr, 0, NumberFormat.Int16LE)
            d2 = pins.i2cReadNumber(addr, NumberFormat.Int8LE)
            if ((d1 == 7) && (d2 == 0)) k = false
            else addr += 1
        }
        if (!k) return addr

        addr = 0x38
        while (k && (addr < 0x40)) {
            pins.i2cWriteNumber(addr, -1, NumberFormat.Int32LE)
            d1 = pins.i2cReadNumber(addr, NumberFormat.Int8LE) % 16
            pins.i2cWriteNumber(addr, 0, NumberFormat.Int16LE)
            d2 = pins.i2cReadNumber(addr, NumberFormat.Int8LE)
            if ((d1 == 7) && (d2 == 0)) k = false
            else addr += 1
        }
        if (!k) return addr
        else return 0

    }

    /**
     * initial LCD, set I2C address. Address is 39/63 for PCF8574/PCF8574A
     * @param Addr is i2c address for LCD, eg: 0, 39, 63. 0 is auto find address
     */
    //% blockId="I2C_LCD1620_SET_ADDRESS" block="LCD initialize with Address %addr"
    //% weight=100 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    //% group="LCD"
    export function LcdInit(Addr: number) {
        if (Addr == 0) i2cAddr = AutoAddr()
        else i2cAddr = Addr
        BK = 8
        RS = 0
        cmd(0x33)       // set 4bit mode
        basic.pause(5)
        set(0x30)
        basic.pause(5)
        set(0x20)
        basic.pause(5)
        cmd(0x28)       // set mode
        cmd(0x0C)
        cmd(0x06)
        cmd(0x01)       // clear
    }

    /**
     * show a number in LCD at given position
     * @param n is number will be show, eg: 10, 100, 200
     * @param x is LCD column position, eg: 0
     * @param y is LCD row position, eg: 0
     */
    //% blockId="I2C_LCD1620_SHOW_NUMBER" block="show number %n|at x %x|y %y"
    //% weight=90 blockGap=8
    //% x.min=0 x.max=15
    //% y.min=0 y.max=1
    //% parts=LCD1602_I2C trackArgs=0
    //% group="LCD"
    export function ShowNumber(n: number, x: number, y: number): void {
        let s = n.toString()
        ShowString(s, x, y)
    }

    /**
     * show a string in LCD at given position
     * @param s is string will be show, eg: "Hello"
     * @param x is LCD column position, [0 - 15], eg: 0
     * @param y is LCD row position, [0 - 1], eg: 0
     */
    //% blockId="I2C_LCD1620_SHOW_STRING" block="show string %s|at x %x|y %y"
    //% weight=90 blockGap=8
    //% x.min=0 x.max=15
    //% y.min=0 y.max=1
    //% parts=LCD1602_I2C trackArgs=0
    //% group="LCD"
    export function ShowString(s: string, x: number, y: number): void {
        let a: number

        if (y > 0)
            a = 0xC0
        else
            a = 0x80
        a += x
        cmd(a)

        for (let i = 0; i < s.length; i++) {
            dat(s.charCodeAt(i))
        }
    }

    /**
     * turn on LCD
     */
    //% blockId="I2C_LCD1620_ON" block="turn on LCD"
    //% weight=81 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    //% group="LCD"
    export function on(): void {
        cmd(0x0C)
    }

    /**
     * turn off LCD
     */
    //% blockId="I2C_LCD1620_OFF" block="turn off LCD"
    //% weight=80 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    //% group="LCD"
    export function off(): void {
        cmd(0x08)
    }

    /**
     * clear all display content
     */
    //% blockId="I2C_LCD1620_CLEAR" block="clear LCD"
    //% weight=85 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    //% group="LCD"
    export function clear(): void {
        cmd(0x01)
    }

    /**
     * turn on LCD backlight
     */
    //% blockId="I2C_LCD1620_BACKLIGHT_ON" block="turn on backlight"
    //% weight=71 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    //% group="LCD"
    export function BacklightOn(): void {
        BK = 8
        cmd(0)
    }

    /**
     * turn off LCD backlight
     */
    //% blockId="I2C_LCD1620_BACKLIGHT_OFF" block="turn off backlight"
    //% weight=70 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    //% group="LCD"
    export function BacklightOff(): void {
        BK = 0
        cmd(0)
    }

    /**
     * shift left
     */
    //% blockId="I2C_LCD1620_SHL" block="Shift Left"
    //% weight=61 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    //% group="LCD"
    export function shl(): void {
        cmd(0x18)
    }

    /**
     * shift right
     */
    //% blockId="I2C_LCD1620_SHR" block="Shift Right"
    //% weight=60 blockGap=8
    //% parts=LCD1602_I2C trackArgs=0
    //% group="LCD"
    export function shr(): void {
        cmd(0x1C)
    }

    getI2C();
}
