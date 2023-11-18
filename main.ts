namespace BoardShield {
    export function turn_on_fan(pin: AnalogPin) {
        pins.analogWritePin(pin, 500)
    }

    //% block
    //% group="Fan"
    export function turn_on_max_fan(pin: AnalogPin) {
        pins.analogWritePin(pin, 1023)
    }

    //% block
    //% group="Fan"
    export function turn_off_fan(pin: AnalogPin) {
        pins.analogWritePin(pin, 0)
    }

    //% block
    //% speed.min=0 speed.max=1023
    //% group="Fan"
    export function set_fan_speed(pin: AnalogPin, speed: number) {
        pins.analogWritePin(pin, speed)
    }
}