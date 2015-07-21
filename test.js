
var parse_numbers = require ( './index' )

var s="there will be a meeting next friday. Are you coming? How about next week? June first, twenty twelve"
var parsed=parse_numbers(s)

console.log(parsed);