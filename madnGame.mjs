export function createGameObject(numOfPlayers, dicetemplate) {
    /*
    infos:
        pawn position: 
            (0-3)   parking fields (the fields were the pawns stand at the start of the geme),
            (4-43)  open field (4 is the field the pawn starts after a six was rolled on the dice and 43 is the last field, every player can move pawns on),
            (44-47) finisching fields (the four that heve to be fiels with pawns to win the game)
        
        inputState:
            0   no input will be accepted right now
            1   next player have to role the dice, to decide the player how starts
            2   player in line has to start the game and role his dice value
            3   player has to select the pawn he want to move
            4   player accapt, that no pawn can be moved

    */
    //setting porpertys
    let numOfPlayslots = 4
    let numOfPawns = 4
    let playerNums = [null, null, null, null]
    let dice = [1, 2, 3, 4, 5, 6]

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
        temp: { dicevelue: null, moveablepawns: null, positionsWhenMoved: null, msg: null },
        players: [],
        dice: dice,
        dicetemplate: dicetemplate,
        winner: -1,
    };

    //setting standart gameObject.players
    for (let i = 0; i < numOfPlayslots; i++) {
        //create standart playerproperties
        gameObject.players[i] = {
            num: playerNums[i], pawns: [], lastDiceValue: null, stats: {
                won: false, lostPawns: 0, kicktPawns: 0, roledDices: 0
            }
        };

        //create standart pawnpositions
        for (let j = 0; j < numOfPawns; j++) {
            gameObject.players[i].pawns[j] = { pos: j }
        }
    }


    // role dice and store
    
    gameObject.temp.dicevelue = roleDice(gameObject.dice, gameObject.dicetemplate);

    const indexOfPlayerInLine = getPlayerIndexByNum(gameObject.players, gameObject.playerInLine);
    gameObject.players[indexOfPlayerInLine].lastDiceValue = gameObject.temp.dicevelue;

    return gameObject;
}

function roleDice(dice, dicetemplate) {
    //if exist return dice-value from dicetemplate
    if (dicetemplate) {
        if (dicetemplate[0]) {
            let dicetemplateValue = dicetemplate.shift();
            return dicetemplateValue;
        }
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

function convertePosition(pos, fromPlayerI, toPlayerI) {
    if (pos > 43 || pos < 4) {
        return false;
    }
    let fromPos = pos - 4;
    let absolutePos = (fromPos + 10 * fromPlayerI) % 40;
    let toPos = ((absolutePos - 10 * toPlayerI) % 40 + 40) % 40;
    return toPos + 4;
}

function getNextPlayer(players, playerInLine) {
    let nextPlayerInLine = players.length + 1;
    //get next higher playernum
    players.forEach((player) => {
        if (player.num !== null) {
            if (player.num > playerInLine && player.num < nextPlayerInLine) {
                nextPlayerInLine = player.num;
            }
        }
    });

    //if no bigger found
    if (nextPlayerInLine == players.length + 1) {
        //find smallest playernum
        players.forEach((player) => {
            if (player.num !== null) {
                if (player.num < nextPlayerInLine) {
                    nextPlayerInLine = player.num;
                }
            }
        });
    }
    return nextPlayerInLine;
}

function setPreparationForInput2(gameObject, setNextPlayer) {
    if (setNextPlayer) {
        gameObject.playerInLine = getNextPlayer(gameObject.players, gameObject.playerInLine);
    }
    //role the dice for player in line
    gameObject.temp.dicevelue = roleDice(gameObject.dice, gameObject.dicetemplate);
    gameObject.players[
        getPlayerIndexByNum(gameObject.players, gameObject.playerInLine)
    ].lastDiceValue = gameObject.temp.dicevelue;
};

export function handleAction(gameObject, action) {
    let result = { ok: true };
    switch (action.type) {
        case 1:
            result = handleInput1(gameObject, action);
            break;
        case 2:
            result = handleInput2(gameObject, action);
            break;
        case 3:
            result = handleInput3(gameObject, action);
            break;
        case 4:
            result = handleInput4(gameObject, action);
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

    gameObject.temp.msg = null;
    gameObject.temp.dicevelue = null;
    gameObject.temp.moveablepawns = null;
    gameObject.temp.positionsWhenMoved = null;

    //deactivate inputs while working
    gameObject.inputState = 0;

    const indexOfPlayerInLine = getPlayerIndexByNum(gameObject.players, gameObject.playerInLine);

    //update stats
    gameObject.players[indexOfPlayerInLine].stats.roledDices++;

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

        //input 1: next player have to role the dice, to decide the player how starts
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

    gameObject.playerInLine = playerNumWithHighestDiceValue;
    setPreparationForInput2(gameObject, false);

    //input 2: the player with the higehest dice value has to start the game and role his dice value
    gameObject.inputState = 2;

    return { ok: true };

};

function handleInput2(gameObject, action) {

    if (action.type != gameObject.inputState) {
        return { ok: false, msg: "wrong action type" }
    }

    if (action.playerNum != gameObject.playerInLine) {
        return { ok: false, msg: "wrong player" }
    }

    //deactivate inputs while working
    gameObject.inputState = 0;

    gameObject.temp.msg = null;
    gameObject.temp.moveablepawns = null;
    gameObject.temp.positionsWhenMoved = null;

    let parkingPawns = [];
    const indexOfPlayerInLine = getPlayerIndexByNum(gameObject.players, gameObject.playerInLine);

    //update stats
        gameObject.players[indexOfPlayerInLine].stats.roledDices++;

    // check which pawn is on a parking field
    for (let i = 0; i < gameObject.players[indexOfPlayerInLine].pawns.length; i++) {
        const pawn = gameObject.players[indexOfPlayerInLine].pawns[i];
        if (pawn.pos >= 0 && pawn.pos <= 3) {

            parkingPawns.push(i);
        }
    }

    const pawnOnStartPosition = getPawnFromRelativePosition(gameObject, indexOfPlayerInLine, 4);

    if (parkingPawns.length > 0 && gameObject.players[indexOfPlayerInLine].lastDiceValue == 6) {


        //chack if starting field is free
        if (pawnOnStartPosition == -1) {
            let positionsWhenMoved = [];

            parkingPawns.forEach(element => {
                positionsWhenMoved.push(4);
            });
            //all pawns on the parkingfields can be moved
            gameObject.temp.moveablepawns = parkingPawns;
            gameObject.temp.positionsWhenMoved = positionsWhenMoved;

            //input 3: player has to select the pawn he want to move
            gameObject.inputState = 3;
            return { ok: true };


        }
        let positionWhenMoved =
            gameObject.players[indexOfPlayerInLine].pawns[pawnOnStartPosition].pos +
            gameObject.players[indexOfPlayerInLine].lastDiceValue;

        let pawnOnPositionWhenMoved = getPawnFromRelativePosition(gameObject, indexOfPlayerInLine, positionWhenMoved);

        if (pawnOnPositionWhenMoved == -1) {
            //only the pawn that can blocks the startfield can be moved

            gameObject.temp.moveablepawns = [pawnOnStartPosition];
            gameObject.temp.positionsWhenMoved = [positionWhenMoved];

            //input 3: player has to select the pawn he want to move
            gameObject.inputState = 3;

            return { ok: true };
        }
        else {
            // no pawn can be moved
            gameObject.temp.msg = "es kann keine figur bewegt werden, da die figur die bewegt werden soll sollte, blockiert wird";

            //input 4: player accapt, that no pawn can be moved
            gameObject.inputState = 4;

            return { ok: true };

        }

    }
    else {

        if (pawnOnStartPosition != -1 && parkingPawns.length > 0) {
            let positionWhenMoved =
                gameObject.players[indexOfPlayerInLine].pawns[pawnOnStartPosition].pos +
                gameObject.players[indexOfPlayerInLine].lastDiceValue;

            let pawnOnPositionWhenMoved = getPawnFromRelativePosition(gameObject, indexOfPlayerInLine, positionWhenMoved);

            if (pawnOnPositionWhenMoved == -1) {
                //only the pawn that can blocks the startfield can be moved

                gameObject.temp.moveablepawns = [pawnOnStartPosition];
                gameObject.temp.positionsWhenMoved = [positionWhenMoved];

                //input 3: player has to select the pawn he want to move
                gameObject.inputState = 3;

                return { ok: true };
            }
            else {
                // no pawn can be moved
                gameObject.temp.msg = "es kann keine figur bewegt werden, da die figur die bewegt werden soll sollte, blockiert wird";

                //input 4: player accapt, that no pawn can be moved
                gameObject.inputState = 4;

                return { ok: true };
            }
        }
        let moveablepawns = []
        let positionsWhenMoved = [];
        let reasonForNoActionMoveablepawns = 0;
        for (let index = 0; index < gameObject.players[indexOfPlayerInLine].pawns.length; index++) {
            const pawn = gameObject.players[indexOfPlayerInLine].pawns[index];

            //check if on parkingfield
            if (pawn.pos < 4) {
                if (reasonForNoActionMoveablepawns == 0) {
                    reasonForNoActionMoveablepawns = 1;
                }
                console.log("reasonForNoActionMoveablepawns: " + reasonForNoActionMoveablepawns);
                continue;
            }

            //check if would kick own figure or end of playfield
            let positionWhenMoved = pawn.pos + gameObject.players[indexOfPlayerInLine].lastDiceValue
            let pawnOnPositionWhenMoved = getPawnFromRelativePosition(gameObject, indexOfPlayerInLine, positionWhenMoved);
            if (pawnOnPositionWhenMoved != (-1)) {
                if (reasonForNoActionMoveablepawns != 2) {
                    reasonForNoActionMoveablepawns = 2;

                    console.log("reasonForNoActionMoveablepawns: " + reasonForNoActionMoveablepawns);
                }
                continue;
            }

            moveablepawns.push(index);
            positionsWhenMoved.push(positionWhenMoved)
        }

        //check if no pawn can be moved
        if (moveablepawns.length == 0) {

            //insert message
            let msg = "unbekannter Fehler";
            switch (reasonForNoActionMoveablepawns) {
                case 1:
                    msg = "keine Figur auf dem Spielfeld, die bewegt werden kann";
                    break;
                case 2:
                    msg = "es kann keine Figur bewegt werden, da die Figur die sich bewegt werden kann, blockiert wird";
                    break;
                default:
                    break;
            }

            //input 4: player accapt, that no pawn can be moved
            gameObject.temp.msg = msg;
            gameObject.inputState = 4;
            return { ok: true };
        }

        gameObject.inputState = 3;
        gameObject.temp.moveablepawns = moveablepawns;
        gameObject.temp.positionsWhenMoved = positionsWhenMoved;
        return { ok: true };
    }
}

//handle pawn move
function handleInput3(gameObject, action) {


    if (action.type != gameObject.inputState) {
        return { ok: false, msg: "wrong action type" }
    }

    if (action.playerNum != gameObject.playerInLine) {
        return { ok: false, msg: "wrong player" }
    }



    let pawnToMove = gameObject.temp.moveablepawns[action.value];

    if (typeof pawnToMove == "undefined") {
        return { ok: false, msg: "invalid aktion value", value: action.value };
    }

    //deactivate inputs while working
    gameObject.inputState = 0;

    const indexOfPlayerInLine = getPlayerIndexByNum(gameObject.players, gameObject.playerInLine);

    //move pawn
    let posToMoveTo = gameObject.temp.positionsWhenMoved[action.value];
    gameObject.players[indexOfPlayerInLine]
        .pawns[pawnToMove].pos = posToMoveTo;


    //check if posToMoveTo is in renge of other pawns
    if (posToMoveTo < 44) {


        //kick other pawns from field
        for (let i = 0; i < gameObject.players.length; i++) {
            const player = gameObject.players[i];
            if ((i != indexOfPlayerInLine) && (player.num !== null)) {

                let convertedPos = convertePosition(posToMoveTo, indexOfPlayerInLine, i)
                let pawnIndex = getPawnFromRelativePosition(gameObject, i, convertedPos)
                if (pawnIndex >= 0) {

                    let freePlaces = [0, 1, 2, 3];
                    player.pawns.forEach((pawn) => {
                        //if pawn on free place, remove it from freePlaces
                        let indexInFreePlaces = freePlaces.indexOf(pawn.pos)
                        if (indexInFreePlaces != -1) {

                            freePlaces.splice(indexInFreePlaces, 1);
                        }

                    });
                    player.pawns[pawnIndex].pos = freePlaces[0];

                    //update stats
                    player.stats.lostPawns++
                    gameObject.players[indexOfPlayerInLine].stats.kicktPawns++
                }
            }

        }
    }


    //ckeck if player has won
    let lastfields = [44, 45, 46, 47];
    gameObject.players[indexOfPlayerInLine].pawns.forEach((pawn) => {
        let i = lastfields.indexOf(pawn.pos)
        if (i > -1) {
            lastfields.splice(i, 1);
        }
    })
    if (lastfields.length == 0) {
        gameObject.players[indexOfPlayerInLine].stats.won = true;
        gameObject.winner = gameObject.playerInLine;
        gameObject.inputState = 5;


        gameObject.temp.dicevelue = null;
        gameObject.temp.msg = null;
        gameObject.temp.moveablepawns = null;
        gameObject.temp.positionsWhenMoved = null;
        return { ok: true };
    }

    console.log(`dicevelue:${gameObject.temp.dicevelue}`)
    if (gameObject.temp.dicevelue == 6) {
        setPreparationForInput2(gameObject, false);
    } else {
        setPreparationForInput2(gameObject, true);
    }
    gameObject.inputState = 2;


    gameObject.temp.msg = null;
    gameObject.temp.moveablepawns = null;
    gameObject.temp.positionsWhenMoved = null;
    return { ok: true };
}

//handle accapt, that no pawn can be moved
function handleInput4(gameObject, action) {

    if (action.type != gameObject.inputState) {
        return { ok: false, msg: "wrong action type" }
    }

    if (action.playerNum != gameObject.playerInLine) {
        return { ok: false, msg: "wrong player" }
    }

    setPreparationForInput2(gameObject, true);

    gameObject.inputState = 2;

    return { ok: true }
}

export function getPlayerStats(gameObject){
    
    let playersStats = [];

    gameObject.players.forEach(player => {
        if (player.num !== null) {
            playersStats[player.num] = player.stats;
        }
    });
    
    return playersStats;
}