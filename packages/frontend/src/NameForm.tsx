import { ClientTopic, ServerTopic, SetNickname, setNicknameType } from "dtos";
import _React, { FormEvent } from "react";
import { useIsInGame, useSubscribeToTopic, sendMessage } from "./WebSocketClient";

/**
 * "Choose Your Name" Form
 */
export const NameForm = () => {

    const isInGame = useIsInGame();
    const nicknameAlreadyExists = useSubscribeToTopic(ServerTopic.NicknameAlreadyExists);

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

    // TODO validation
    // const updateButton = () => {
    //     nameForm.go.disabled = nameForm.nickname.value?.trim().length < 1;
    // }
    // nameForm.nickname.onchange = nameForm.nickname.onkeyup = updateButton;

    return (
        <div id="name-modal" style={isInGame ? { display: 'none' } : {}}>
            <h1>Choose Your Name</h1>
            <form id="name-form" action="" onSubmit={onSubmit}>
                <input type="text" name="nickname" maxLength={15} />
                <input type="submit" name="go" value="GO" />
            </form>
        </div>
    )
}