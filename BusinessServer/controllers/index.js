Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

Date.prototype.nextDay = function() {
    this.setTime(this.getTime() + 24*60*60*1000);
    return this;
};

Date.prototype.getDateOffset = function(target) {
    var milliSeconds = target.getTime() - this.getTime();
    return Math.ceil(milliSeconds/1000/60/60/24);
};

module.exports = {
    user: require('./user'),
    hospital: require('./hospital'),
    reservation: require('./reservation')
};