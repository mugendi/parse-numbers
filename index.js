var _=require('lodash')
var textToNumber = require('to-number')
var S = require('string')
var numeral = require('numeral')
var romantique = require('romantique');
var Ordinal = require('ordinal')
var isNumeric = require("isnumeric")
var OrdinalWords =require('./data/ordinal-words.json')
// var num2String=require('number2string')
var splitWords = require('split-words');

module.exports=function(string,options){

	options=_.extend({
		lang:'en',
		lang_name:'english',
		include_formatted:true,
		include_ordinals:true,
		replace_text:true
	},options)

		
	// console.log(string);
	// start with a blank array
	var concat_words=[];
	var concat_raw=[];
	//words to skip
	var skipwords=['and','of']
	var stopwords=[]

	var numbers={
		numerals:[],
		formatted:[],
		ordinals:[],
		string:{
			in:string
		}
	}

	var measures=[]


	//split into words
	var words = splitWords(string,stopwords);


	//compact words
	words=_.compact(words);
	//add one  token at the end to ensure even last word is looped over
	words.push('NOT NUMBER');
	var word_='';

	var number=null;

	var ordinal=Ordinal[options.lang_name]
	
	var ordinal_words=OrdinalWords[options.lang],
		ordinal_words_=_.keys(ordinal_words);

	//loop thru the words
	words.forEach(function(word,i){

		raw_word=_.clone(word);

		// console.log(word,words[i+1])
		// console.log(first);

		//first deal wit formatted numbers using numeral if we see any numerals
		if(/([^0-9][0-9]|[0-9][^0-9])/.test(word)){
			word_=numeral().unformat(word);

			//include old number (formatted)
			if(_.isNumber(word_) && options.include_formatted){
				numbers.formatted.push(word);
			}			

			//try to pass measures
			if(QtyPattern.test(word)){
				var qty = Qty(word); 
				measures=_.union(measures,qty.toAll());
			}	

			word=word_;
		}

		var fLook=word+' '+(words[i+1] || '')
		
		//if we think number is roman, then attempt to deromanize
		if(romantique.roman.validate(word)){

			word_=romantique.roman.toDecimal(word);

			//include old number (formatted)
			if(_.isNumber(word_) && options.include_formatted){
				numbers.formatted.push(word);
			}				

			word=word_;
		}

		//if an ordinal word
		if(_.indexOf(ordinal_words_,word)>-1){

			word_=ordinal_words[word];

			//include old number (formatted)
			if(options.include_formatted){
				numbers.formatted.push(word);
			}		

			word=word_;
		}
		
		//

		//test for number
		number= textToNumber(word, options.lang) 
		// console.log(word,number)

		//add word to concat untill number match is broken
		if(number>0 || _.indexOf(skipwords,word.toLowerCase())>-1){
			//before we add word, ensure its not a numeric but its string representation
			//now add both word & raw word
			concat_words.push(word);
			concat_raw.push(raw_word);
		}
		else{

			//if concatwords then read the number
			if(concat_words.length ){
				
				//join all words
				word_=concat_words.join(' ')

				number= isNumeric(word_) ? numeral().unformat(word_)  //if numeric then do simple parse
						: textToNumber(word_, options.lang); //else attempt to read number

				if(options.replace_text){
					// console.log(concat_words,concat_raw,word_,number)
					string=string.replace(concat_raw.join(' '),number);
				}

				numbers.numerals.push(number);

				//if we need ordinals
				if(
					options.include_ordinals //if include_ordinals
					&& number>0  //& number is greater than zero
					&& !/\./.test(number) //& number is not a decimal
					&& ( !/^[0-9]+\s*[a-z]+$/i.test(concat_raw[0]) ) //original Number is not stuff like 5GB (i.e number with units)
				){
					numbers.ordinals.push(ordinal(number))
				}
			}
			//reset concat words
			concat_words=[];
			concat_raw=[];
		}

	})


	numbers.string.out=string;
	
	// console.log(concat_words)
	return numbers;
}