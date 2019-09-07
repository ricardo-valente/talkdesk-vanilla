module.exports = {
	newDate: function(){
		var dt = new Date(),
			day = dt.getDate(),
			month = dt.getMonth() + 1,
			year = dt.getFullYear(),
			hour = dt.getHours(),
			minutes = dt.getMinutes(),
			seconds = dt.getSeconds();

		if (day.toString().length === 1) {
			day = '0' + day;
		}
		if (month.toString().length === 1) {
			month = '0' + month;
		}
		if (hour.toString().length === 1) {
			hour = '0' + hour;
		}
		if (minutes.toString().length === 1) {
			minutes = '0' + minutes;
		}
		if (seconds.toString().length === 1) {
			seconds = '0' + seconds;
		}

		return year + '' + month + '' + day + '-' + hour + '' + minutes + '' + seconds;
	},

	createBanner: function(){
		return ['/**',
			' * <%= pkg.name %>',
			' * @Web <%= pkg.homepage %>',
			' * @Author <%= pkg.author %> - <%= pkg.email %>',
			' * Updated on: ' + this.newDate(),
			' */',
			''].join('\n');
	}
};
