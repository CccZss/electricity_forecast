import './css/main.css';
import './css/normalize.css';  //这个css用来重置浏览器的默认样式
import LineChart from './js/line_chart.js';

/*测试数据*/
	var year = ['2011-01-01','2012-01-01','2013-01-01','2014-01-01','2015-01-01','2016-01-01'];
	var yearUsers = {
		userA : ['27417365.82', '27350277.50', '29039208.60','29738205.01','29428953.10','20371260.20'],
		userB : ['25517365.82', '2650277.50', '28039208.60','26738205.01','30428953.10','25571260.20']
	}

	var month = ['2011-01-01','2011-02-01','2011-03-01','2011-04-01','2011-05-01','2011-06-01','2011-07-01','2011-08-01','2011-09-01','2011-10-01','2011-11-01','2011-12-01'];
	var monthUsers = {
	   	userA : ['2811382.47','1694584.70','1220201.90','2450110.24','2406544.63','2470264.31','2371420.03','2477325.64','2483846.50','2341947.51','2295317.00','2394420.89'],
	   	userB : ['818417.09','658161.06','468977.58','808060.12','802080.39','824348.33','799232.09','875871.27','878438.49','816722.59','773165.36','788942.20'],
		userC : ['147501.72','120218.61','77477.19','161132.12','161733.72','166525.84','155475.88','166305.03','172342.13','158246.86','156226.42','149371.12']
	}

	var season = ['2011-01-01','2011-04-01','2011-07-01','2011-10-01']
	var seasonUsers = {
		userA : ['8176279.31','7326919.18','150292181.98','7031685.40'],
		userB : ['1945555.73','2434488.84','53214115.12','2378830.15'],
		userC : ['345197.52','489391.68','9986824.74','463844.40']	
	}

/**
 * [getChartDatas 把原始的数据转化为折线图类 LineChart 需要的数据]
 * @param  {[type]} xAxisDates [x轴的数据，即时间数组 ：['2011-01-01','2011-02-01','2011-03-01',.....]
 * @param  {[type]} users      [用户数据：
	 *                             { 
		*                             		userA : ['8176279.31','7326919.18'...],  
	 *                             	    userB : ['9176279.31','8326919.18'...],  
	 *                             }
 * @param  {[type]} unit       ['year'/'season'/'month']
 * @return {[type]}            [ChartDatas]
 */
	function getChartDatas(xAxisDates, users ,unit){
		var userDatas = {};
		for(var user in users){
			userDatas[user] = []
			for(var i=0;i<xAxisDates.length;i++){
				userDatas[user].push({
					date: new Date(xAxisDates[i]),
					value: Number(users[user][i])
				})
			}
		}
		return {
			unit: unit,
			xAxisDates: xAxisDates,
			userDatas: userDatas
		}
	}
	var dataOfMonth = getChartDatas(month,monthUsers,'month');
	var dataOfYear = getChartDatas(year,yearUsers,'year');
	var dataOfSeason = getChartDatas(season,seasonUsers,'season');
	var arr = [dataOfSeason,dataOfMonth,dataOfYear];
	var i = 0;


const App = function() {

	var lineChart = new LineChart(dataOfMonth);
	// lineChart.updateData(arr[i])
	
	// 测试用的按钮
	document.querySelector('#line-chart button').addEventListener('click',function(e){
		if(++i === 3) i = 0;
		lineChart.updateData(arr[i])
	},false)
	
}()

