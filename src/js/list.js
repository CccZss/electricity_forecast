$(function(){
	function load(){
		var defaultData = {
			"isTotalAmount" : true,
			"timeType" : "month",
			"startTime" : "2011-01-01",
			"endTime" : "2017-01-01"
		}
		$.ajax({
			type : "post",
			contentType : "application/json;charset=uft-8",
			dataType : "json",
			url : "/byUser/month",
			data : JSON.stringify(dafaultData),
			success:function(data){
				if(data.status==true){
					console.log("页面加载成功！");
					var dataOfMonth = getChartDatas(month,monthUsers,'month');
					var lineChart = new LineChart(dataOfMonth);
				}
			}
		})
	}
});