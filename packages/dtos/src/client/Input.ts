import { validateEnum } from "../validateEnum.js";

export enum InputTypes {
    "Move",
    "StartShooting",
    "StopShooting",
}

export class Input {
    angle?: number;
    magnitude?: number;

    constructor(public type: InputTypes, public time: number) { }

    get byteLength() {
        // Movement inputs are 25 bytes long.
        // Other input types are only 9 bytes.
        return this.type === InputTypes.Move ? 25 : 9;
    }

    get valid() {
        return this.time >= 0 || this.time <= 50;
    }

    static deserialize(dataView: DataView): Input {
        const type = validateEnum(InputTypes, dataView.getUint8(0));
        const time = dataView.getFloat64(1);
        const instance = new Input(type, time);
        if (type === InputTypes.Move) {
            instance.angle = dataView.getFloat64(9);
            instance.magnitude = dataView.getFloat64(17);
            // Limit magnitude to 1 to avoid cheaters
            if (instance.magnitude > 1) {
                instance.magnitude = 1;
            }
        }
        return instance;
    }

    serialize(dataView: DataView) {
        dataView.setUint8(0, this.type);
        dataView.setFloat64(1, this.time);
        if (this.type === InputTypes.Move) {
            dataView.setFloat64(9, this.angle!);
            dataView.setFloat64(17, this.magnitude!);
        }
    }
}
