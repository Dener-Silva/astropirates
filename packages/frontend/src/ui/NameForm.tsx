import { ClientTopic, SetNickname, setNicknameType } from "dtos";
import _React, { ChangeEvent, FormEvent, useState } from "react";
import { useIsInGame, sendMessage, useNicknameAlreadyExists } from "../WebSocketClient";

/**
 * "Choose Your Name" Form
 */
export const NameForm = () => {

    const [valid, setValid] = useState(false);
    const [alreadyExists, setAlreadyExists] = useNicknameAlreadyExists();

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const clientMessage: SetNickname = {
            topic: ClientTopic.SetNickname,
            nickname: formData.get('nickname') as string
        };
        sendMessage(setNicknameType, clientMessage);
    }

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValid(e.target.value.trim().length > 0);
        setAlreadyExists(false);
    }

    return (
        <div id="name-modal">
            <form id="name-form" action="" onSubmit={onSubmit}>
                <label htmlFor="nickname">Choose Your Name</label>
                <input id="nickname" type="text" name="nickname" onChange={onChange} maxLength={15} />
                <input type="submit" name="go" value="GO" disabled={!valid} />
            </form>
            <div className="warning" style={{ visibility: alreadyExists ? 'visible' : 'hidden' }}>
                Nickname is already taken
            </div>
        </div>
    )
}