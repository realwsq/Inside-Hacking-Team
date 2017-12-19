function wordleChart() {
	var dimension;
	var sentence = "";
	var fill = d3.scale.category20();


	function wordle(div) {
		getSentence();
		console.log(sentence)
		var width = div[0][0].offsetWidth, 
			height = div[0][0].offsetHeight;
		var choppedWords = chopSentenceToWords().sort(function(a,b) {return b.size - a.size}).slice(0, 100);
		var maxSize = choppedWords[0].size;
		var layout = d3.layout.cloud()
			.size([width, height])
			.words(choppedWords)
			.padding(5)
		    .rotate(function() { return ~~(Math.random() * 2) * 90; })
		    .font("Impact")
		    .fontSize(function(d) { return d.size/maxSize*50; })
	    	.on("end", draw);
	    console.log("going to start layout cloud!")
	    layout.start();

	    function draw(words) {
	    	console.log("in draw cloud")
	    	console.log(words)
			div.each(function() {
	        	var div = d3.select(this)
	        	div.selectAll("*").remove();
	            g = div.select("g");

		        if (g.empty()) {
		        	console.log("going to draw cloud!")
	    	        div.append("svg")
					      .attr("width", layout.size()[0])
					      .attr("height", layout.size()[1])
					    .append("g")
					      .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
					    .selectAll("text")
					      .data(words)
					    .enter().append("text")
					      .style("font-size", function(d) { return d.size + "px"; })
					      .style("font-family", "Impact")
					      .style("fill", function(d, i) { return fill(i); })
					      .attr("text-anchor", "middle")
					      .attr("transform", function(d) {
					        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
					      })
					      .text(function(d) { return d.text; });
	        	}

	    	});
		}


	}
	function chopSentenceToWords() {
		var wordsArray = sentence.split(" ");
		var wordsMap = {}
		wordsArray.forEach(function(w) {
			if (w in wordsMap) wordsMap[w]++;
			else wordsMap[w] = 1;
		})
		return Object.keys(wordsMap).map(function(w) {
			return {text: w, size: wordsMap[w]};
		})
	}
	function getSentence() {
		sentence = dimension.top(Infinity).map(function(d) {return d.subject}).join(" ")
		sentence = sentence.replace(/[^a-z]/gi, ' ').replace(/  +/g, ' ')
		sentence = sentence.split(" ").filter(function(w) {
			return w.length > 3
		}).join(" ")
	}

	wordle.dimension = function(_) {
      if (!arguments.length) return dimension;
      dimension = _;
      return wordle;
    };

	return wordle;
}