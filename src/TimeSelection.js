/*
	Use with crossFilter 需要靠它筛选出所有满足条件的数据
	Use with d3
	Use with barChart.js
*/
function TimeSelection() {
	var cf;
	var month, weekday, hour;  // three dimensions
	/*
	accessTime = {
		getHour: function
			得到处于哪个小时
			参数表： d - 原始的一条数据 有各个属性
			返回： 数字 - 处于哪个小时[0, 23]
		getWeekday: function
			得到处于一星期中的哪天
			参数表： d - 原始的一条数据 有各个属性
			返回： 数字 - 处于哪天[0, 6] 0-星期天 1-星期一
		getMonth: function
			得到处于哪年的哪个月
			参数表： d - 原始的一条数据 有各个属性
			返回： Date 
		domain: Array[2]
			所有日期落在从哪天到哪天
			例: [new Date(2012, 0, 1), new Date(2015, 12, 31)]
		howManyMonthsInDomain: number
			这段时间中总共有多少个月
			例：4*12
	}
	*/
	var accessTime; 
	var charts = [];
	var chartDOMs;
	var barWidth = 10;
	/*
	howToStackData = {
		group: function
			怎么把数据group起来 即哪些数据属于一块（每个bar中的一小个stack）
			参数表：
				gtime - 时间：横轴  一个bar一个时间
				d - 原始的一条数据 有各个属性
				g - 暂有的group的结果 g[gtime][attr1]为gtime这个bar下attr1这个stack的数量
			返回：
				加入这条记录后的g
			例：function(gtime, d, g) {
				  if (!(gtime in g)) {
				    g[gtime] = {"sent": 0, "received": 0};
				  }
				  if (checkIfInSelected(d, "from address", selectedEmailAccount)) g[gtime].sent++;
				  if (checkIfInSelected(d, "to address", selectedEmailAccount)) g[gtime].received++;
				  return g;
				}
		stackedKey: Array
			每个bar下按哪些key组成stacked bar
			例：
				["sent", "received"]
	}
	*/
	var howToStackData;	
	var notifyOutside = function() {}; // it's a function 每次改变了都会通知外面
	var DOMclass = "timeSelectionChart";

	function initBarCharts() {
		charts = [
			barChart()
				.dimension(hour)
				.group(function(d, g) {
					var gtime = accessTime.getHour(d);
					g = howToStackData.group(gtime, d, g);
				})
				.stackedKey(howToStackData.stackedKey)
				.parseTime(function(d) {return parseInt(d)})
				.x(d3.scale.linear()
					.domain([0, 24])
					.rangeRound([0, barWidth * 24]))
				.barWidth(barWidth),

		    barChart()
				.dimension(weekday)
				.group(function(d, g) {
					var gtime = accessTime.getWeekday(d);
					g = howToStackData.group(gtime, d, g);
				})
				// .round(Math.floor)
				.stackedKey(howToStackData.stackedKey)
				.parseTime(function(d) {return parseInt(d)})
				.x(d3.scale.linear()
					.domain([0, 7])
					.rangeRound([0, barWidth * 7]))
				.barWidth(barWidth),

			barChart()
				.dimension(month)
				.group(function(d, g) {
					var gtime = accessTime.getMonth(d);
					g = howToStackData.group(gtime, d, g);
				})
				.stackedKey(howToStackData.stackedKey)
				// .round(d3.time.month.round)
				.parseTime(function(d) {return new Date(d)})
				.x(d3.time.scale()
					.domain(accessTime.domain)
					.rangeRound([0, barWidth * accessTime.howManyMonthsInDomain]))
				.barWidth(barWidth)
		]
	}
	function initBarChartDOMs() {
		chartDOMs = d3.selectAll("."+DOMclass)
				      .data(charts)
				      .each(function(chart) { 
				        chart
				          // .on("brush", renderAll)
				          .on("brushend", finishedBrush); 
				      });
	}

	function init() {
		// init three dimensions
		month = cf.dimension(function(d) { return accessTime.getMonth(d); })
		hour = cf.dimension(function(d) { return accessTime.getHour(d); })
		weekday = cf.dimension(function(d) { return accessTime.getWeekday(d); })

		initBarCharts();
		initBarChartDOMs();
	}

	function finishedBrush() {
		draw();
		notifyOutside();
	}

	function draw() {
		function render(method) {
			d3.select(this).call(method)
		}
		chartDOMs.each(render);
	}

	var communicateWithOutside = {};
	// set from outside
	communicateWithOutside.crossfilter = function(_) {
		if (!arguments.length) return cf;
		cf = _;
		return communicateWithOutside;
	}
	communicateWithOutside.accessTime = function(_) {
		if (!arguments.length) return accessTime;
		accessTime = _;
		return communicateWithOutside;
	}
	communicateWithOutside.stackData = function(_) {
		if (!arguments.length) return howToStackData;
		howToStackData = _;
		return communicateWithOutside;
	}
	communicateWithOutside.barWidth = function(_) {
		if (!arguments.length) return barWidth;
		barWidth = _;
		return communicateWithOutside;
	}
	communicateWithOutside.DOMclass = function(_) {
		if (!arguments.length) return DOMclass;
		DOMclass = _;
		return communicateWithOutside;
	}
	communicateWithOutside.notifyOutside = function(_) {
		if (!arguments.length) return notifyOutside;
		notifyOutside = _;
		return communicateWithOutside;
	}
	// 让外界调用
	communicateWithOutside.start = function() {
		init();
	}
	communicateWithOutside.draw = draw

	return communicateWithOutside;
}