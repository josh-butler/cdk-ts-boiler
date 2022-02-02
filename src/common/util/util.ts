// returns linux epoch seconds x days in the future
const expires = (days = 7): number =>
  Math.floor(Date.now() / 1000) + 86400 * days;

export {expires};
