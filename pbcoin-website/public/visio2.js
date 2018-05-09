window.onload = function () {

var chart = new CanvasJS.Chart("chartContainer", {
	title: {
		text: "Blocks Mined per Constituency"
	},
	axisY: {
		title: "Blocks Mined",
		suffix: ""
	},
	data: [{
		type: "column",	
		yValueFormatString: "#,### Blocks",
		indexLabel: "{y}",
		dataPoints: [
		]
	}]
});

function updateChart() {

	var xmlhttp = new XMLHttpRequest();
	var url = "http://localhost:8700/chart.json";

	xmlhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
	        var data = JSON.parse(this.responseText);
	        //console.log(data.datapoints.length)
	        var dps = chart.options.data[0].dataPoints;
			for (var i = 0; i < data.datapoints.length; i++) {
				dps[i] = data.datapoints[i]
				console.log(dps[i])
			}
			chart.options.data[0].dataPoints = dps; 
			chart.render();
	    }
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();	
}

updateChart();
setInterval(function() {updateChart()}, 4000);

}