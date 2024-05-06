namespace BoardShield {
    let led4: neopixel.Strip = null
    let led3: neopixel.Strip = null
    let led2: neopixel.Strip = null
    let led1: neopixel.Strip = null
    let strip: neopixel.Strip = null

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

    //% block
    //% group="Ultils"
    // export function scanI2C() {
    //     for (let index = 0; index <100; index++) {
    //         const value = pins.i2cReadNumber()
    //     }
    // }

    
}
