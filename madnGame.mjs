export function createGameObject(numOfPlayers) {
    /*
    infos:
        pawn position: 
            (0-3)   parking fields (the fields were the powns stand at the start of the geme),
            (4-43)  open field (4 is the field the pown starts after a six was rolled on the dice and 43 is the last field, every player can move powns on),
            (44-47) finisching fields (the four that heve to be fiels with powns to win the game)
        
        inputState:
            1   weiting for dice clicked 
    
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

    try {
        switch (action.type) {
            case 1:
                handleInput1(gameObject);
                break;
            default:
                return { ok: false, msg: "wrong action type" }
                break;
        }
    } catch (error) {
        return { ok: false, msg: "invalide action", err: error }
    }

}

function handleInput1(gameObject) {
    //find player with the lowest num, that has not roled the dice yet.
    let lowestPlayerNumWithoutDiceValue = null;
    for (let i = 0; i < gameObject.players.length; i++) {
        let player = gameObject.players[i]
        if (player.num !== null && player.lastDiceValue === null) {
            lowestPlayerNumWithoutDiceValue = player.num;
        }
    }

    //if a player has not yet roled the dice, he have to role the dice
    if (lowestPlayerNumWithoutDiceValue) {
        gameObject.playerInLine = lowestPlayerNumWithoutDiceValue;
        gameObject.temp.dicevelue = roleDice(gameObject.dice);
        gameObject.players[
            getPlayerIndexByNum(gameObject.players, lowestPlayerNumWithoutDiceValue)
        ].lastDiceValue = gameObject.temp.dicevelue;
        return;
    }

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





};

