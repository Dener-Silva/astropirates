import { Serializable } from "../../test/ByteLengthCustomMatcher.js";
import { deserializeString, getByteLength, serializeString } from "../StringSerialization.js";

export class SetNameResponse implements Serializable {

    constructor(public id: number, public nickname: string, public success: boolean) { }

    get byteLength() {
        return getByteLength(this.nickname) + 3;
    }

    static deserialize(dataView: DataView): SetNameResponse {
        const id = dataView.getUint16(0);
        const [nickname, runLength] = deserializeString(2, dataView);
        const success = Boolean(dataView.getUint8(runLength + 2));
        return new SetNameResponse(id, nickname, success);
    }

    serialize(dataView: DataView) {
        dataView.setUint16(0, this.id);
        const strLength = serializeString(2, this.nickname, dataView)
        dataView.setUint8(strLength + 2, Number(this.success));
    }
}