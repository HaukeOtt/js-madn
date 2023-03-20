import * as game from "./madnGame.mjs"
import * as fs from 'fs';

let rawdata = fs.readFileSync('test0.json');
let test0 = JSON.parse(rawdata);

let rawdata1 = fs.readFileSync('dicePettern0.json');
let dicetemplate = JSON.parse(rawdata1);

const PLAYER =  4;

let gameObject = game.createGameObject(PLAYER, dicetemplate);
console.log(gameObject);
console.log(gameObject.players[0]);



for (let i = 0; i < test0.length; i++) {
    try {

    } catch (error) {
        console.log(gameObject);
        throw error;
    }
    const action = test0[i];
    console.log();
    console.log(`\x1b[34m${`do aktion nr.${i}:`}\x1b[0m`);
    console.log(action);
    let result = game.handleAction(gameObject, action);

    let playersinfo = []
    for (let i = 0; i < PLAYER; i++) {
        gameObject.players.forEach(player => {
            if (player.num == i) {
                playersinfo.push(player.pawns);
            }
        });
    }
    console.table(playersinfo);
    console.log({ playerInLine: gameObject.playerInLine,temp: gameObject.temp })

    if (result.ok == false) {
        console.log(`\x1b[31m${"unvalid action:"}\x1b[0m`);
        console.log(result);
        console.log(gameObject);
    } else
        console.log(`\x1b[32m${"result:"}\x1b[0m`);
    console.log(result)
}
console.log();
console.log();
console.log(`\x1b[32m${"end:"}\x1b[0m`)
console.log(gameObject);