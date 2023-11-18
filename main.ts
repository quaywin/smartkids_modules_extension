
let strip: neopixel.Strip = null
let led1: neopixel.Strip = null
let led2: neopixel.Strip = null
let led3: neopixel.Strip = null
let led4: neopixel.Strip = null

//% groups="['Fan', '4 LED', 'IR']"
namespace BoardShield {

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
    //% group="LED"
    export function connectTinyLedRGB(pin: AnalogPin) {
        strip = neopixel.create(DigitalPin.P14, 4, NeoPixelMode.RGB)
        led1 = strip.range(0, 1)
        led2 = strip.range(1, 1)
        led3 = strip.range(2, 1)
        led4 = strip.range(3, 1)
    }

    //% block
    //% speed.min=1 speed.max=4
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
}