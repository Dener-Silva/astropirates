import { FirstName, SecondName } from "dtos";


export class Player {
    constructor(
        private firstName: FirstName,
        private secondName: SecondName
    ) { }
}
