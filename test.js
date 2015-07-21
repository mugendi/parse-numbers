
var parse_numbers = require ( './index' )

var s="Tommorow will be first of April two thousand and twelve"
var parsed=parse_numbers(s)

console.log(JSON.stringify(parsed,0,4));