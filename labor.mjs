function convertePosition(pos, fromPlayerI, toPlayerI) {
    if (pos > 43 || pos < 4) {
        return false;
    }
    let fromPos = pos - 4;
    let absolutePos = (fromPos + 10 * fromPlayerI) % 40;
    let toPos = ((absolutePos - 10 * toPlayerI) % 40 + 40) % 40;
    return toPos + 4;
}
conole.log(convertePosition(24,0,2));