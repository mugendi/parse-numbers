
var parse_numbers = require ( './index' )

var strs=[
	"there are two hundred and fifty two cowna and fourteen goats. Negative twenty 4. She was the fifty second patient. What! Ksh1000! He was ranked 2nd. King Mwati LVIII is dead! And then there is 5GB of data on that hard drive. Are you 78% sure? TestDasherize&Decamelization. Last September there was a goat on the door. She needs 3 pints of blood urgently!",
	// "Tommorow will be first of April two thousand and twelve"
]

strs.forEach(function(s){
	var parsed=parse_numbers(s)

	console.log(JSON.stringify(parsed,0,4));	
})
