export function createGameObject(numOfPlayers) {
    /*
    infos:
        pawn position: 
            (0-3)   parking fields (the fields were the powns stand at the start of the geme),
            (4-43)  open field (4 is the field the pown starts after a six was rolled on the dice and 43 is the last field, every player can move powns on),
            (44-47) finisching fields (the four that heve to be fiels with powns to win the game)
        
        inputState:
            1   weiting for dice clicked 
            2
            */
    //setting porpertys
    let numOfPlayslots = 4
    let numOfPawns = 4
    let playerNums = [null, null, null, null]
    let dice = [1, 2, 3, 4, 5, 6]

    //setting playernumbers
    switch (numOfPlayers) {
        case 2:
            playerNums = [0, null, 1, null]
            break;
        default:
            for (let i = 0; i < numOfPlayers; i++) {
                playerNums[i] = i;
            }
            break;
    }

    //create standart gameObject
    let gameObject = { playerInLine: 0, inputState: 1, temp: {}, players: [], dice: dice };


    //setting standart gameObject.players
    for (let i = 0; i < numOfPlayslots; i++) {
        //create standart playerproperties
        gameObject.players[i] = { num: playerNums[i], pawns: [], lastDiceValue: null };

        //create standart pawnpositions
        for (let j = 0; j < numOfPawns; j++) {
            gameObject.players[i].pawns[j] = { Pos: j }
        }
    }


    // role dice and store
    gameObject.temp.dicevelue = roleDice(gameObject.dice);
    gameObject.players[getPlayerIndexByNum(gameObject.players, gameObject.playerInLine)].lastDiceValue = gameObject.temp.dicevelue;

    return gameObject;
}

function roleDice(dice) {
    if (!dice) {
        dice = [1, 2, 3, 4, 5, 6];
    }
    return dice[Math.floor(Math.random() * dice.length)];
}

function getPlayerIndexByNum(players, num) {
    for (let i = 0; i < players.length; i++) {
        if (players[i].num == num) {
            return i;
        }

    }
}

export function handleAction(gameObject, action) {
    let result = { ok: true };
    switch (action.type) {
        case 1:
            result = handleInput1(gameObject, action);
            break;
        case 2:
            result = handleInput2(gameObject, action);
            break;
        default:
            result = { ok: false, msg: "action type dose not exist" };
            break;
    }

    return result;

}

function handleInput1(gameObject, action) {

    if (action.type != gameObject.inputState) {
        return { ok: false, msg: "wrong action type" }
    }

    if (action.playerNum != gameObject.playerInLine) {
        return { ok: false, msg: "wrong player" }
    }

    //deactivate inputs while working
    gameObject.inputState = 0;

    //find player with the lowest num, that has not roled the dice yet.
    let lowestPlayerNumWithoutDiceValue = null;
    for (let i = 0; i < gameObject.players.length; i++) {
        let player = gameObject.players[i]
        if (player.num !== null && player.lastDiceValue === null) {
            lowestPlayerNumWithoutDiceValue = player.num;
            break;
        }
    }

    //if a player has not yet roled the dice, he have to role the dice
    if (lowestPlayerNumWithoutDiceValue) {
        gameObject.playerInLine = lowestPlayerNumWithoutDiceValue;
        gameObject.temp.dicevelue = roleDice(gameObject.dice);
        gameObject.players[
            getPlayerIndexByNum(gameObject.players, lowestPlayerNumWithoutDiceValue)
        ].lastDiceValue = gameObject.temp.dicevelue;

        //activate inputs bacause working is done
        gameObject.inputState = 1;

        return { ok: true };
    }

    //get player with the highest lastDiceValue
    let playerNumWithHighestDiceValue = null;
    let highestDiceValue = null;
    for (let i = 0; i < gameObject.players.length; i++) {
        let player = gameObject.players[i]
        if (player.num !== null) {
            if (highestDiceValue === null) {
                highestDiceValue = player.lastDiceValue;
                playerNumWithHighestDiceValue = player.num;
            } else if (player.lastDiceValue >= highestDiceValue) {
                highestDiceValue = player.lastDiceValue;
                playerNumWithHighestDiceValue = player.num;
            }
        }
    }
    //role the dice for player in line
    gameObject.temp.dicevelue = roleDice(gameObject.dice);
    gameObject.players[
        getPlayerIndexByNum(gameObject.players, playerNumWithHighestDiceValue)
    ].lastDiceValue = gameObject.temp.dicevelue;

    //activate inputs bacause working is done
    gameObject.inputState = 2;
    gameObject.playerInLine = playerNumWithHighestDiceValue;

    return { ok: true };

};

function handleInput2(gameObject, action) {

    return { ok: true };
}
