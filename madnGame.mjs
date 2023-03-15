export function createGameObject(numOfPlayers, dicetemplate) {
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
    let playerOffset = 10;

    //setting playernumbers
    switch (numOfPlayers) {
        case 2:
            //if only 2 players are playing, they are starting on opeside sides
            playerNums = [0, null, 1, null]
            break;
        default:
            for (let i = 0; i < numOfPlayers; i++) {
                playerNums[i] = i;
            }
            break;
    }

    //create standart gameObject
    let gameObject = {
        playerInLine: 0,
        inputState: 1,
        temp: {},
        players: [],
        dice: dice,
        playerOffset: playerOffset,
        dicetemplate: dicetemplate
    };

    //setting standart gameObject.players
    for (let i = 0; i < numOfPlayslots; i++) {
        //create standart playerproperties
        gameObject.players[i] = { num: playerNums[i], pawns: [], lastDiceValue: null };

        //create standart pawnpositions
        for (let j = 0; j < numOfPawns; j++) {
            gameObject.players[i].pawns[j] = { pos: j }
        }
    }


    // role dice and store
    gameObject.temp.dicevelue = roleDice(gameObject.dice, gameObject.dicetemplate);
    gameObject.players[getPlayerIndexByNum(gameObject.players, gameObject.playerInLine)].lastDiceValue = gameObject.temp.dicevelue;

    return gameObject;
}

function roleDice(dice, dicetemplate) {
    //if exist return dice-value from dicetemplate
    if (dicetemplate[0]) {
        let dicetemplateValue = dicetemplate.shift();
        return dicetemplateValue;
    }

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

function getPawnFromRelativePosition(gameObject, playerIndex, pos) {
    // if position is not existing on the playfield 
    if (pos > 47 || pos < 0) {
        return -2
    }
    for (let i = 0; i < gameObject.players[playerIndex].pawns.length; i++) {
        const pawn = gameObject.players[playerIndex].pawns[i];
        if (pawn.pos == pos) {
            return i;
        }
    }
    return -1;
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
        gameObject.temp.dicevelue = roleDice(gameObject.dice, gameObject.dicetemplate);
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
    gameObject.temp.dicevelue = roleDice(gameObject.dice, gameObject.dicetemplate);
    gameObject.players[
        getPlayerIndexByNum(gameObject.players, playerNumWithHighestDiceValue)
    ].lastDiceValue = gameObject.temp.dicevelue;

    //activate inputs bacause working is done
    gameObject.inputState = 2;
    gameObject.playerInLine = playerNumWithHighestDiceValue;

    return { ok: true };

};

function handleInput2(gameObject, action) {

    if (action.type != gameObject.inputState) {
        return { ok: false, msg: "wrong action type" }
    }

    if (action.playerNum != gameObject.playerInLine) {
        return { ok: false, msg: "wrong player" }
    }

    let parkingPawns = []

    for (let i = 0; i < gameObject.players[gameObject.playerInLine].pawns.length; i++) {
        const pawn = gameObject.players[gameObject.playerInLine].pawns[i];
        // check which pown is on a parking field
        if (pawn.pos >= 0 && pawn.pos <= 3) {


            parkingPawns.push(i);
        }
    }

    if (parkingPawns.length > 0 && gameObject.players[gameObject.playerInLine].lastDiceValue == 6) {

        let pownOnStartPosition = getPawnFromRelativePosition(gameObject, gameObject.playerInLine, 4);
        //chack if starting field is free
        if (pownOnStartPosition == -1) {
            let positionsWhenMoved = [];
            parkingPawns.forEach(element => {
                positionsWhenMoved.push(4);
            });
            //all pawns on the parkingfields can be moved
            gameObject.temp = { moveablePowns: parkingPawns, positionsWhenMoved: positionsWhenMoved };
            return { ok: true };


        } else {
            let positionWhenMoved =
                gameObject.players[gameObject.playerInLine].pawns[pownOnStartPosition].pos +
                gameObject.players[gameObject.playerInLine].lastDiceValue;

            let pawnOnPositionWhenMoved = getPawnFromRelativePosition(gameObject, gameObject.playerInLine, positionWhenMoved);

            if (pawnOnPositionWhenMoved == -1) {
                //only the pawn that can blocks the startfield can be moved
                gameObject.temp = { moveablePowns: [pownOnStartPosition], positionsWhenMoved: [positionWhenMoved] };
                return { ok: true };
            }
            else {
                // no pawn can be moved
                gameObject.temp = { msg: "es kann keine figur bewegt werden, da die figur die bewegt werden soll sollte, blockiert wird" };
                return { ok: true };
            }
        }

    }
    else {
        let moveablePowns = []
        let positionsWhenMoved = [];
        for (let index = 0; index < gameObject.players[gameObject.playerInLine].pawns.length; index++) {
            const pown = gameObject.players[gameObject.playerInLine].pawns[index];
            if (pown.pos > 3) {
                continue;
            }

            let pawnOnPositionWhenMoved = getPawnFromRelativePosition(gameObject, gameObject.playerInLine, pown.pos + gameObject.players[gameObject.playerInLine].lastDiceValue);
            if (pawnOnPositionWhenMoved != -1) {
                continue;
            }

            moveablePowns.push(i);
            positionsWhenMoved.push(pown.pos + gameObject.players[gameObject.playerInLine].lastDiceValue)
        }

        gameObject.temp = { moveablePowns: parkingPawns, positionsWhenMoved: positionsWhenMoved };
        return { ok: true };
    }
}

function handleInput2(){
    
}