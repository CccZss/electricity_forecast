var d3 = require("d3");

function LineChart (data){

	var unit = data.unit;
	var userDatas = data.userDatas;
	var xAxisDates = data.xAxisDates;

	var lines=[]; //保存折线图对象
 	var lineNames=[]; //保存系列名称
 	// var lineColors=["#F00","#09F","#0F0"];
 	var lineColors=["#F00","#09F","#0F0","#FFFF00","#3A0088","#000","#FF0088","#FF0000","#FF8800","#00DDDD","#0000CC","#770077","#FF5511","#FFCC22","#00DD00"]
 	var currentLineNum=0;

 	var title="用电走势图";
  	var subTitle="2013年1月 至 2013年6月";

  	var oldDatas = []

	var lineChartDom = document.querySelector('#line-chart');

	var margin = {top: 0, right: 85, bottom: 30, left: 35},
  		head_height = 50,
  		width = lineChartDom.clientWidth - margin.left - margin.right,
  		height = width*3/5,
  		clinetW = width + margin.left + margin.right,

  	currentLineNum=userDatas.length;

  	lineNames = getLineName(userDatas);
	
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
	    .domain([getMinData(userDatas),getMaxData(userDatas)])
	    .range([height, 0]);

	var xAxis = null;

	if(unit === "month"){
		xAxis = d3.axisBottom(xScale)
		  .ticks(d3.timeMonth)
		  .tickFormat(function(d, i){
		  		return d3.timeFormat("%-m")(d)
		  })
	} else if(unit === "year"){
		xAxis = d3.axisBottom(xScale)
		  .ticks(d3.timeYear)
	} else if(unit === "season"){
		xAxis = d3.axisBottom(xScale)
			.ticks(4)
			.tickFormat(function(d, i){
		  		if(i == 0) return '夏';
		  		else if(i == 1) return '秋';
		  		else return '冬';
		  })
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
	  	g.call(xAxis)
	}

	function customYAxis(g) {
	  g.call(yAxis);
	  g.select(".domain").remove();
	  g.selectAll(".tick line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
	  g.selectAll(".tick text").attr("x", -25).attr("dy", 0);
	}

    /*画线类*/
	function LineObject(g, userName ,userData, lineColor, xScale, yScale) {
		this.group=g;
        this.path=null;
        // this.oldDatas=[];
        this.userName = userName;
        this.userData = userData;
        this.lineColor = lineColor;
        this.xScale = xScale;
        this.yScale = yScale;
        this.lineGrounp = null;
	}
	LineObject.prototype.init = function() {

    	var userData = this.userData;
    	var userName = this.userName
    	var xScale = this.xScale
    	var lineColor = this.lineColor
    	var group = this.group
    	this.lineGrounp = group.append('g')

    	var line = d3.line()
	  		.x(function(d) { 
	  			return xScale(d.date); 
	  		})
	  		.y(function(d) { 
	  			return yScale(d.value); 
	  		})
	  		.curve(d3.curveCatmullRom.alpha(0.5))

	  	this.path = this.lineGrounp.append('path')
	  				.attr('userName', userName)
	  				.attr('class', 'line')
  					.attr('d', line(userData))
  					.style("stroke", lineColor)
  					.style("stroke-opacity",0.9);

  		this.lineGrounp.selectAll('circle')
			.data(userData)
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
    LineObject.prototype.remove = function(){
    	this.path.remove();
    }
    LineObject.prototype.update = function(data){
    	var oldData = this.userData,
    		path = this.path,
    		group = this.group,
    		userName = this.userName,
    		lineColor = this.lineColor;

        var dataLen=data.length;
         
        //横轴数据动画

    	var line = d3.line()
	  		.x(function(d, i) { 
	  			return xScale(d.date); 
	  		})
	  		.y(function(d, i) { 
	  			return yScale(d.value);
	  		})
	  		.curve(d3.curveCatmullRom.alpha(0.5))

	  	path.attr('d', line(data));

	  	var tempData=oldData.slice(0,data.length);
        var circle = this.lineGrounp.selectAll("circle").data(tempData);
        circle.exit().remove();

        this.lineGrounp.selectAll('circle').data(data).enter().append('circle')

        this.lineGrounp.selectAll('circle')
			.data(data)
			.attr('userName',userName)
			.attr('class', 'linecircle')
			.attr('cx', function(d) { 
	  				return xScale(d.date); 
	  		})
			.attr('cy', function(d){
				return yScale(d.value)
			})
			.attr('r', 3.5)
			.attr("fill",lineColor)
			.on('mouseover', function() {
			    d3.select(this).attr('r', 5);

			    var m = d3.mouse(this),
			        cx = m[0] - margin.left,
			    	x0 = xScale.invert(cx),
			   		i = (d3.bisector(function(d) {
			      		return d.date;
			    	}).left)(data, x0);
			 
			    var d = data[i];
			 
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

	var lineObject = null;
	for(var o in userDatas){
		if(lineNames.indexOf(o) < lineNames.length){
	    	lineObject = new LineObject(g, o, userDatas[o], lineColors[lineNames.indexOf(o)],xScale, yScale);
	    	lineObject.init();
	    	lines.push(lineObject);
    	}
    }


	this.updateData = function (data){
		var _duration = 1000;

		uploadData(data);

		var oldDatalen = getObjLength(oldDatas),
			dataLen = getObjLength(userDatas),
			userDataslist = Object.getOwnPropertyNames(userDatas)

		var lineObject = null
		for(var i=0; i<oldDatalen; i++){
			if(i < dataLen){
				//更新线段
				lineObject = lines[i];
				lineObject.update(userDatas[userDataslist[i]])
			}else{
				//删除线段
	            	lineObject=lines[i];
	            	lineObject.lineGrounp.remove();
	        }
		}
        lines.splice(dataLen,oldDatalen-dataLen);
		if(dataLen > oldDatalen){
			//添加线段
			for(var i = oldDatalen; i < dataLen; i++){
				lineObject = new LineObject(g, userDataslist[i], userDatas[userDataslist[i]], lineColors[i],xScale, yScale);
				lineObject.init();
	    		lines.push(lineObject);
			}
		}

	}


    function getMaxData(datas) {
        var maxdata=0;
        for(var o in userDatas){
			for(var i=0; i<userDatas[o].length; i++){
				maxdata=d3.max([maxdata,userDatas[o][i].value]);
			}
		}
		var a = maxdata.toExponential().toString().slice(0,1)
		var b = maxdata.toExponential().toString().slice(-1)
		var c = (Number(a)+1)+"e+"+b;
		
        return Number(c);
    }

    function getMinData(datas){
    	var maxdata = undefined;
        for(var o in userDatas){
			for(var i=0; i<userDatas[o].length; i++){
				maxdata=d3.min([maxdata,userDatas[o][i].value]);
			}
		}
        var a = maxdata.toExponential().toString().slice(0,1)
		var b = maxdata.toExponential().toString().slice(-1)
		var c = a+"e+"+b;
		if(b <= 6){
			c = 0
		}
		
        return Number(c);
    }

    function getLineName(userDatas) {
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
	 	lineNames = getLineName(userDatas);

	 	xScale = d3.scaleTime()
	    .domain([new Date(d3.min(xAxisDates)), new Date(d3.max(xAxisDates))])
	    .range([0, width]);

		yScale = d3.scaleLinear()
	    .domain([getMinData(userDatas),getMaxData(userDatas)])
	    .range([height, 0]);

		if(unit === "month"){
			xAxis = d3.axisBottom(xScale)
			  .ticks(d3.timeMonth)
			  .tickFormat(function(d, i){
			  		return d3.timeFormat("%-m")(d)
			  })
		} else if(unit === "year"){
			xAxis = d3.axisBottom(xScale)
			  .ticks(d3.timeYear)
		} else if(unit === "season"){
			xAxis = d3.axisBottom(xScale)
				.ticks(4)
				.tickFormat(function(d, i){
			  		if(i == 0) return '夏';
			  		else if(i == 1) return '秋';
			  		else if(i == 2) return '冬';
			  })
		}

		yAxis = d3.axisRight(yScale)
	    .tickSize(width)
	    .tickFormat(function(d) {
	      var s = d3.format(".1f")(d / 1e6);
	      return this.parentNode.nextSibling
	          ? "" + s
	          : "" + s + " 百万伏";
	    });

		xAxisGroup._groups[0][0].remove()
		yAxisGroup._groups[0][0].remove()

		xAxisGroup = g.append("g")
		    .attr("transform", "translate(0," + height + ")")
		    .call(customXAxis);

		yAxisGroup = g.append("g")
		 .call(customYAxis);

		addLegend()
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

    function getObjLength(obj){
        return Object.getOwnPropertyNames(obj).length
    }
	
}

module.exports =  LineChart;