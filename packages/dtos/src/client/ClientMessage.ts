import { FirstName, SecondName, ClientTopic } from "../Enums.js";
import { NeverError } from '../NeverError.js';
import { Input } from "./Input.js";
import { validateEnum } from "../validateEnum.js";

function deserializeInputs(dataView: DataView): Input[] {
    const inputs: Input[] = [];
    for (let i = 0; i < dataView.byteLength;) {
        const input = Input.deserialize(new DataView(dataView.buffer, dataView.byteOffset + i));
        if (input.valid) {
            inputs.push(input);
        }
        i += input.byteLength
    }
    return inputs;
}

export class ClientMessage {
    firstName?: FirstName
    secondName?: SecondName
    inputs?: Input[]

    get byteLength() {
        switch (this.topic) {
            case ClientTopic.SetName: {
                return 3;
            }
            case ClientTopic.Input: {
                return this.inputs!.reduce((acc, input) => acc + input.byteLength, 0) + 1;
            }
            default:
                throw new NeverError(this.topic, "Unknown topic");
        }
    }

    constructor(public topic: ClientTopic) { }

    public static deserialize(dataView: DataView): ClientMessage {
        // Get message topic
        const topic = validateEnum(ClientTopic, dataView.getUint8(0));
        const instance = new ClientMessage(topic);
        switch (topic) {
            case ClientTopic.SetName:
                instance.firstName = validateEnum(FirstName, dataView.getUint8(1));
                instance.secondName = validateEnum(SecondName, dataView.getUint8(2));
                break;
            case ClientTopic.Input:
                instance.inputs = deserializeInputs(new DataView(dataView.buffer, dataView.byteOffset + 1));
                break;
            default:
                throw new NeverError(topic, "Unknown topic");
        }
        return instance;
    }

    serialize(dataView: DataView): void {
        switch (this.topic) {
            case ClientTopic.SetName:
                dataView.setUint8(0, this.topic);
                dataView.setUint8(1, this.firstName!);
                dataView.setUint8(2, this.secondName!);
                break;
            case ClientTopic.Input:
                dataView.setUint8(0, this.topic);
                let i = 1;
                for (const input of this.inputs!) {
                    input.serialize(new DataView(dataView.buffer, dataView.byteOffset + i))
                    i += input.byteLength
                }
                break;
            default:
                throw new NeverError(this.topic, "Unknown topic");
        }
    }
}