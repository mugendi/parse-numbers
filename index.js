var _=require('lodash')
var readint = require('readint')
var S = require('string')
var numeral = require('numeral')
var romantique = require('romantique');
var Ordinal = require('ordinal')
var isNumeric = require("isnumeric")
var OrdinalWords =require('./data/ordinal-words.json')
var num2String=require('number2string')

module.exports=function(string){
		
		// console.log(string);
		// start with a blank array
		var concat_words=[];
		var concat_raw=[];
		//words to skip
		var skipwords=['and']
		var stopwords=['and']

		var numbers={
			numerals:[],
			formatted:[],
			ordinals:[]
		}

		var measures=[]


		//split into words
		var words = natNumber.prototype.splitWords(string,stopwords);

		//compact words
		words=_.compact(words);
		//add one  token at the end to ensure even last word is looped over
		words.push('NOT NUMBER');
		var word_='';

		var number=null;
	
		var ordinal=Ordinal[natNumber.options.lang_name]
		
		var ordinal_words=OrdinalWords[natNumber.options.lang],
			ordinal_words_=_.keys(ordinal_words);

		//loop thru the words
		words.forEach(function(word,i){

			raw_word=_.clone(word);

			// console.log(word,words[i+1])

			//first deal wit formatted numbers using numeral if we see any numerals
			if(/([^0-9][0-9]|[0-9][^0-9])/.test(word)){
				word_=numeral().unformat(word);

				//include old number (formatted)
				if(_.isNumber(word_) && natNumber.options.include_formatted){
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
			//forward look for units such as 3 pints
			if(QtyPattern.test(fLook)){

				var qty = Qty(fLook); 
				measures=_.union(measures,qty.toAll());
				// console.log(fLook,qty)
			}

			//if we think number is roman, then attempt to deromanize
			if(romantique.roman.validate(word)){

				word_=romantique.roman.toDecimal(word);

				//include old number (formatted)
				if(_.isNumber(word_) && natNumber.options.include_formatted){
					numbers.formatted.push(word);
				}				

				word=word_;
			}

			//if an ordinal word
			if(_.indexOf(ordinal_words_,word)>-1){

				word_=ordinal_words[word];

				//include old number (formatted)
				if(natNumber.options.include_formatted){
					numbers.formatted.push(word);
				}		


				word=word_;
			}
			

			//test for number
			number= readint(word, natNumber.options.lang) 

			//add word to concat untill number match is broken
			if(number>-1){
				//before we add word, ensure its not a numeric but its string representation
				if(/^[0-9]+$/.test(word)){
					word=num2String.toString(word);
				}

				//now add both word & raw word
				concat_words.push(word);
				concat_raw.push(raw_word);
			}
			else{
				//if concatwords then read the number
				if(concat_words.length){
					// console.log(concat_words)

					//join all words
					word_=concat_words.join(' ')

					number= isNumeric(word_) ? numeral().unformat(word_)  //if numeric then do simple parse
							: readint(word_, natNumber.options.lang); //else attempt to read number

					numbers.numerals.push(number);

					//if we need ordinals
					if(
						natNumber.options.include_ordinals //if include_ordinals
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

		
		// console.log(concat_words)
		return {
			numbers:numbers,
			measures:measures
		};
}