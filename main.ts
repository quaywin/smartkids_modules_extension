namespace SK_Modules {
    export enum Buttons {
        //% block="No Press"
        No_Press = 0,
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
        //% block="RightDown"
        RightDown = 6
    }

    const PCA9685_ADD = 0x40
    const LED0_ON_L = 0x06

    export enum TopButtons {
        L2 = 3, //21 0 - 255, 20 0-3
        R2 = 3, // 24 0 - 3, 25 0 -255
        L1 = 16, //27
        R1 = 32, // 27
    }

    enum FunctionButtons {
        Share = 2, //29
        Options = 4 // 29
    }

    export enum enServo {
        S1 = 0,
        S2,
        S3,
        S4,
        S5,
        S6,
        S7,
        S8
    }


    export enum ActionButtons {
        //% block="No Press"
        No_Press = 0,
        //% block="X"
        X = 1, //27
        //% block="Circle"
        Circle = 2,  //27
        //% block="Triangle"
        Triangle = 8, //27
        //% block="Square"
        Square = 4 //27
    }

    export enum enMotors {
        M1 = 8,
        M2 = 10,
        M3 = 12,
        M4 = 14
    }

    interface Event {
        button: Buttons,
        callback: () => void
    }

    interface ActionButtonEvent {
        button: ActionButtons,
        callback: () => void
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
    let buttonAction: ActionButtons = 0
    const listEvents: Event[] = []
    const listActionButtonEvents: ActionButtonEvent[] = []

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADD, buf);
    }

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

    function checkButton(button: Buttons | ActionButtons, targetButton: Buttons | ActionButtons, callback: () => void) {
        if (button == targetButton) {
            callback()
        }
    }

    //% block="start Gamepad"
    //% group="Gamepad"
    export function initGamepad() {
        basic.forever(() => {
            const value = pins.i2cReadBuffer(85, 30);
            buttonDirection = value[1];
            buttonAction = value[27];
            // for (let i = 0; i < listEvents.length; i++) {
            //     const event = listEvents[i]
            //     checkButton(event.button, buttonDirection, event.callback)
            // }
            // for (let i = 0; i < listActionButtonEvents.length; i++) {
            //     const actionButtonEvent = listActionButtonEvents[i]
            //     checkButton(actionButtonEvent.button, buttonAction, actionButtonEvent.callback)
            // }
            // basic.pause(10)
        })
    }

    //% blockId=gamepad_press_direction_button
    //% block="press direction button $button"
    //% group="Gamepad"
    //% enumName="Buttons"
    //% enumMemberName="button"
    //% enumInitialMembers="Up, Down, Left, Right"
    export function GamePadDirectionButton(button: Buttons): boolean {
        return buttonDirection == button;
    }

    //% blockId=gamepad_press_action_button
    //% block="press action button $button"
    //% group="Gamepad"
    //% enumName="Buttons"
    //% enumMemberName="button"
    //% enumInitialMembers="X, Square, Circle, Triangle"
    export function GamePadActionButton(button: ActionButtons) {
        return buttonAction == button;
    }

    //% group="Yahboom"
    //% blockId=servo270 block="Servo(270°)|num %num|value %value"
    //% weight=96
    //% blockGap=10
    //% num.min=1 num.max=4 value.min=0 value.max=270
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=20
    export function Servo2(num: enServo, value: number): void {

        // 50hz: 20,000 us
        let newvalue = Math.map(value, 0, 270, 0, 180);
        let us = (newvalue * 1800 / 180 + 600); // 0.6 ~ 2.4
        let pwm = us * 4096 / 20000;
        setPwm(num, 0, pwm);

    }

    //% group="Yahboom"
    //% blockId=Mortor block="Motor|%index|speed(-255~255) %speed"
    //% weight=93
    //% speed.min=-255 speed.max=255
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function MotorRun(index: enMotors, speed: number): void {
        speed = speed * 16; // map 255 to 4096
        if (speed >= 4096) {
            speed = 4095
        }
        if (speed <= -4096) {
            speed = -4095
        }

        let a = index
        let b = index + 1

        if (a > 10) {
            if (speed >= 0) {
                setPwm(a, 0, speed)
                setPwm(b, 0, 0)
            } else {
                setPwm(a, 0, 0)
                setPwm(b, 0, -speed)
            }
        }
        else {
            if (speed >= 0) {
                setPwm(b, 0, speed)
                setPwm(a, 0, 0)
            } else {
                setPwm(b, 0, 0)
                setPwm(a, 0, -speed)
            }
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
