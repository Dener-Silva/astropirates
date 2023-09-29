import { ServerTopic } from "../Enums.js";
import { NeverError } from '../NeverError.js';
import { validateEnum } from "../validateEnum.js";
import { SetNameResponse } from "./SetNameResponse.js";
import avro from "avro-js";

export class ServerMessage {

    setNameResponse?: SetNameResponse;

    constructor(public topic: ServerTopic) { }

    get byteLength() {
        switch (this.topic) {
            case ServerTopic.SetNameResponse: {
                return this.setNameResponse!.byteLength + 1;
            }
            case ServerTopic.UpdateGameState: {
                return 1; // TODO
            }
            default:
                throw new NeverError(this.topic, "Unknown topic");
        }
    }

    public static deserialize(dataView: DataView): ServerMessage {
        // Get message topic
        const topic = validateEnum(ServerTopic, dataView.getUint8(0));
        const instance = new ServerMessage(topic);
        switch (topic) {
            case ServerTopic.SetNameResponse:
                instance.setNameResponse = SetNameResponse.deserialize(new DataView(dataView.buffer, 1));
                break;
            case ServerTopic.UpdateGameState:
                // TODO
                break;
            default:
                throw new NeverError(topic, "Unknown topic");
        }
        return instance;
    }

    serialize(dataView: DataView): void {
        dataView.setUint8(0, this.topic);
        switch (this.topic) {
            case ServerTopic.SetNameResponse:
                this.setNameResponse!.serialize(new DataView(dataView.buffer, dataView.byteOffset + 1));
                break;
            case ServerTopic.UpdateGameState:
                break;
            default:
                throw new NeverError(this.topic, "Unknown topic");
        }
    }
}

export type ServerMessageAvro = {
    id: number
    name: string
    success: boolean
}

export const serverMessageSchema = Object.freeze({
    type: "record",
    name: "NameResponse",
    fields: [
        { name: "id", type: "int" },
        { name: "name", type: "string" },
        { name: "success", type: "boolean" }
    ]
});