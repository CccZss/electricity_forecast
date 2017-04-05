var d3 = require("d3");

function LineChart (data){

	var unit = data.unit;
	var userDatas = data.userDatas;
	var xAxisDates = data.xAxisDates;

	var lines=[]; //保存折线图对象
 	var lineNames=[]; //保存系列名称
 	var lineColors=["#F00","#09F","#0F0"];
 	var currentLineNum=0;

 	var title="用电走势图";
  	var subTitle="2013年1月 至 2013年6月";

	var lineChartDom = document.querySelector('#line-chart');

	var margin = {top: 0, right: 85, bottom: 30, left: 35},
  		head_height = 50,
  		width = lineChartDom.clientWidth - margin.left - margin.right,
  		height = width*3/5,
  		clinetW = width + margin.left + margin.right,

  	currentLineNum=userDatas.length;

  	lineNames = getLineName();
	
	var svg = d3.select('#line-chart')
  		.append('svg')


    if(title !== "") {
        svg.append("g")
        .append("text")
        .text(title)
        .attr("class","title")
        .attr("x", clinetW/2 - (d3.select('.title')._groups[0][0].clientWidth)/2)
        .attr("y",head_height); 

        head_height+=30;
    }

  	if(subTitle!="") {
        svg.append("g")
        .append("text")
        .text(subTitle)
        .attr("class","subTitle")
        .attr("x",clinetW/2 - (d3.select('.subTitle')._groups[0][0].clientWidth)/2)
        .attr("y",head_height);
         
        head_height+=20;
    }

    svg.attr('width', width + margin.left + margin.right)
  	   .attr('height', height + margin.top + margin.bottom +  head_height)

  	//放置除了标题之外的所有东西
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + (margin.top + head_height) + ")");

    //添加图例
    var legend = g.append("g");
    addLegend();

	var tips = g.append('g')
		.attr('class', 'tips')

	tips.append('rect')
	  	.attr('class', 'tips-border')
		.attr('width', 180)
		.attr('height', 50)
		.attr('rx', 10)
		.attr('ry', 10);
		 
	var wording1 = tips.append('text')
	  .text('xx')
	  .attr('x', 10)
	  .attr('y', 20)
	 
	var wording2 = tips.append('text')
	  .text('xx')
	  .attr('x', 10)
	  .attr('y', 40)


	var xScale = d3.scaleTime()
	    .domain([new Date(d3.min(xAxisDates)), new Date(d3.max(xAxisDates))])
	    .range([0, width]);

	var yScale = d3.scaleLinear()
	    .domain([0,getMaxdata(userDatas)])
	    .range([height, 0]);

	var xAxis = null;

	if(unit==='month'){
		xAxis = d3.axisBottom(xScale)
		  .ticks(d3.timeMonth)
		  .tickFormat(function(d, i){
		  		return d3.timeFormat("%-m")(d)
		  })
	} else if(unit==='year'){
		xAxis = d3.axisBottom(xScale)
		  .ticks(d3.timeYear)
	}

	var yAxis = d3.axisRight(yScale)
	    .tickSize(width)
	    .tickFormat(function(d) {
	      var s = d3.format(".1f")(d / 1e6);
	      return this.parentNode.nextSibling
	          ? "" + s
	          : "" + s + " 百万伏";
	    });

	var xAxisGroup = g.append("g")
	    .attr("transform", "translate(0," + height + ")")
	    .call(customXAxis);

	var yAxisGroup = g.append("g")
	 .call(customYAxis);

	function customXAxis(g) {
		g.append('text')
		 .text(unit)
		 .attr("stroke", "black")
		 .attr("transform","translate(" + (width + 25) + ", 15)")
	  	g.call(xAxis).select(".domain").remove();
	}

	function customYAxis(g) {
	  g.call(yAxis);
	  g.select(".domain").remove();
	  g.selectAll(".tick line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
	  g.selectAll(".tick text").attr("x", -25).attr("dy", 0);
	}

	var lineObject = null;
	for(var o in userDatas){
		if(lineNames.indexOf(o) < lineNames.length){
	    	lineObject = new LineObject(g, o, userDatas[o], lineColors[lineNames.indexOf(o)],xScale, yScale);
	    	lineObject.init();
	    	lines.push(lineObject);
    	}
    }

    /*  //删除多余的线条，如果有的话
    if(userDatas.length<currentLineNum) {
      	for(i=userDatas.length;i<currentLineNum;i++){
            lineObject=lines[i];
            lineObject.remove();
        }
        lines.splice(userDatas.length,currentLineNum-userDatas.length);
    }*/


	function LineObject(g,userName ,userData, lineColor, xScale, yScale) {
		this.group=null;
        this.path=null;
        this.oldDatas=[];
        this.userName = userName;
        this.userData = userData;
        this.lineColor = lineColor;

        this.init = function() {

	    	var arr = this.userData;
	    	this.group = g;

	    	var line = d3.line()
		  		.x(function(d) { 
		  			return xScale(d.date); 
		  		})
		  		.y(function(d) { 
		  			return yScale(d.value); 
		  		})
		  		.curve(d3.curveCatmullRom.alpha(0.5))

		  	this.path = this.group.append('path')
		  				.attr('userName', this.userName)
		  				.attr('class', 'line')
	  					.attr('d', line(this.userData))
	  					.style("stroke", this.lineColor)
	  					.style("stroke-opacity",0.9);

	  		this.group
	  			.append('g')
				.selectAll('circle')
				.data(this.userData)
				.enter()
				.append('circle')
				.attr('userName',o)
				.attr('class', 'linecircle')
				.attr('cx', line.x())
				.attr('cy', line.y())
				.attr('r', 3.5)
				.attr("fill",lineColor)
				.on('mouseover', function() {
				    d3.select(this).attr('r', 5);

				    var m = d3.mouse(this),
				        cx = m[0] - margin.left,
				    	x0 = xScale.invert(cx),
				   		i = (d3.bisector(function(d) {
				      		return d.date;
				    	}).left)(userData, x0);
				 
				    var d = userData[i];
				 
				    function formatWording(d) {
				      return '日期：' + d3.timeFormat('%Y-%m-%d')(d.date);
				    }
				    wording1.text(formatWording(d));
				    wording2.text('用电量：' + d.value);

				    var x1 = (m[0]+150) > width ? (m[0]-190) : (m[0]+20) 

				 
				    d3.select('.tips')
				      .attr('transform', 'translate(' + x1 + ',' + (m[1]-10) + ')');
				 
				    d3.select('.tips').style('display', 'block');
				})
				.on('mouseout', function() {
				    d3.select(this).transition().duration(500).attr('r', 3.5);
				    d3.select('.tips').style('display', 'none');
				});
        }

        this.remove= function(){
        	this.group.remove();
        }

	}

	this.drawChart = function (data){
		var _duration = 1000;

		uploadData(data);

    /*	g.selectAll('g').remove()
		g.selectAll('circle').remove()
		g.selectAll('path').remove()
		xAxisGroup.remove()
		yAxisGroup.remove()*/

		// legend = g.append("g");

		addLegend();

		var lineObject = null;

		/*for(var o in userDatas){
	    	if(lineNames.indexOf(o) < currentLineNum){
	    		lineObject = lines[index];
	    		// lineObject.movieBegin();
	    	}else{
	    		lineObject = new LineObject(g, o, userDatas[o], lineColors[index],xScale, yScale);
	    		lineObject.init();
	    		lines.push(lineObject);
	    	}
	    }

	    if(lineNames.length < currentLineNum){
	    	for(var i = lineNames.length; i < currentLineNum; i++){
	    		lineObject = lines[i]
	    		lineObject.remove();
	    	}
	    	lines.splice(lineNames.length,currentLineNum-dataset.length);
	    }*/



    	xScale = d3.scaleTime()
		    .domain([new Date(d3.min(xAxisDates)), new Date(d3.max(xAxisDates))])
		    .range([0, width]);

		yScale = d3.scaleLinear()
		    .domain([0,getMaxdata(userDatas)])
		    .range([height, 0]);

		if(unit==='month'){
			xAxis = d3.axisBottom(xScale)
			  .ticks(d3.timeMonth)
			  .tickFormat(function(d, i){
			  		return d3.timeFormat("%-m")(d)
			  })
		} else if(unit==='year'){
			xAxis = d3.axisBottom(xScale)
			  .ticks(d3.timeYear)
		}

		yAxis = d3.axisRight(yScale)
		    .tickSize(width)
		    .tickFormat(function(d) {
		      var s = d3.format(".1f")(d / 1e6);
		      return this.parentNode.nextSibling
		          ? "" + s
		          : "" + s + " 百万伏";
		    });

		g.append("g")
		    .attr("transform", "translate(0," + height + ")")
		    .call(customXAxis);

		g.append("g")
		 .call(customYAxis);

		function customXAxis(g) {
			g.append('text')
			 .text(unit)
			 .attr("stroke", "black")
			 .attr("transform","translate(" + (width + 25) + ", 15)")
		  	g.call(xAxis).select(".domain").remove();
		}

		function customYAxis(g) {
		  g.call(yAxis);
		  g.select(".domain").remove();
		  g.selectAll(".tick line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
		  g.selectAll(".tick text").attr("x", -25).attr("dy", 0);
		}

	    for(var o in userDatas){
			if(lineNames.indexOf(o) < lineNames.length){
		    	lineObject = new LineObject(g, o, userDatas[o], lineColors[lineNames.indexOf(o)],xScale, yScale);
		    	lineObject.init();
		    	lines.push(lineObject);
	    	}
	    }
         
        currentLineNum=lineNames.length;

	}


    function getMaxdata(datas) {
        var maxdata=0;
        for(var o in userDatas){
			for(var i=0; i<userDatas[o].length; i++){
				maxdata=d3.max([maxdata,userDatas[o][i].value]);
			}
		}
        return maxdata;
    }

    function getLineName() {
    	var arr = [];
    	for(var o in userDatas){
    		arr.push(o)
    	}
    	return arr;
    }

    function uploadData(data){
    	oldDatas = userDatas;
    	unit = data.unit;
		userDatas = data.userDatas;
		xAxisDates = data.xAxisDates;
	 	lineNames = getLineName();
	 	lines = [];
    }

    function addLegend() {
        var textGroup=legend.selectAll("text")
        .data(lineNames);
         
        textGroup.exit().remove();
         
        legend.selectAll("text")
        .data(lineNames)
        .enter()
        .append("text")
        .text(function(d){return d;})
        .attr("class","legend")
        .attr("x",0)
        .attr("y", function(d,i) {return i*25;})
        .attr("fill",function(d,i){ return lineColors[i];});
         
        var rectGroup=legend.selectAll("rect")
        .data(lineNames);
         
        rectGroup.exit().remove();
         
        legend.selectAll("rect")
        .data(lineNames)
        .enter()
        .append("rect")
        .attr("userName",function(d){
        	return d;
        })
        .attr("x", -15)
        .attr("y", function(d,i) {
        	if(i===0) return -12;
        	return i*25-12;
        })
        .attr("width",12)
        .attr("height",12)
        .attr("fill",function(d,i){ return lineColors[i];});
         
        legend.attr("transform","translate("+(width+margin.left)+",0)");
    }
	
}

module.exports =  LineChart;

/*function(data){

	var unit = data.typa;
	var userDatas = data.users;
	var timeDatas = data.time;
	var allUserDatas = []
	for( var user in userDatas){
		allUserDatas = allUserDatas.concat(userDatas[user]);
	}

	var lineChartDom = document.querySelector('#line-chart');

	var margin = {top: 20, right: 35, bottom: 30, left: 30},
  		width = lineChartDom.clientWidth - margin.left - margin.right,
  		height = width*3/5;


  	var svg = d3.select('#line-chart')
  		.append('svg')
  		.attr('width', width + margin.left + margin.right)
  		.attr('height', height + margin.top + margin.bottom)

    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var formatNumber = d3.format(".1f");


	var x = d3.scaleTime()
	    .domain([new Date(d3.min(timeDatas)), new Date(d3.max(timeDatas))])
	    .range([0, width]);

	var y = d3.scaleLinear()
	    .domain(d3.extent(allUserDatas))
	    .range([height, 0]);

	var xAxis = d3.axisBottom(x)
		.ticks(d3.timeMonth)
		.tickFormat(function(d, i){
			return d3.timeFormat("%-m")(d)
		})


	var yAxis = d3.axisRight(y)
	    .tickSize(width)
	    .tickFormat(function(d) {
	      var s = formatNumber(d / 1e6);
	      return this.parentNode.nextSibling
	          ? "\xa0" + s
	          : "$" + s + " million";
	    });

	g.append("g")
	    .attr("transform", "translate(0," + height + ")")
	    .call(customXAxis);

	g.append("g")
	 .call(customYAxis);

	function customXAxis(g) {
		g.append('text')
		 .text('月')
		 .attr("stroke", "black")
		 .attr("transform","translate(" + (width + 15) + ", 15)")
	  	g.select(".domain").remove();
	  	g.call(xAxis)
	}

	function customYAxis(g) {
	  g.call(yAxis);
	  g.select(".domain").remove();
	  g.selectAll(".tick line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
	  g.selectAll(".tick text").attr("x", -8).attr("dy", -4);
	}
}*/