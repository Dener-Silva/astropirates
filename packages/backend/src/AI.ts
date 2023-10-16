import { GameUpdate } from "dtos";
import { GameServer } from "./GameServer";

export class AI {
    constructor(private gameServer: GameServer) { }

    onGameUpdate(gameUpdate: GameUpdate) { }
}