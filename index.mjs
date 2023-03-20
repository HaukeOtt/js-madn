import * as game from "./madnGame.mjs"
import * as fs from 'fs';

let rawdata = fs.readFileSync('test0.json');
let test0 = JSON.parse(rawdata);

let rawdata1 = fs.readFileSync('dicePettern0.json');
let dicetemplate = JSON.parse(rawdata1);


let gameObject = game.createGameObject(2,dicetemplate);
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
    let result = game.handleAction(gameObject,action);
console.table(gameObject.players[0]);
console.table(gameObject.players[1]);
console.table(gameObject.players[2]);
console.table(gameObject.players[3]);
    
    if(result.ok == false){
        console.log(`\x1b[31m${"unvalid action:"}\x1b[0m`);
        console.log(result);
        console.log(gameObject);
    }else
    console.log(`result:`);
    console.log(result)
}

console.log(gameObject);