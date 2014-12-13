/**
 * Created by renfei on 14/12/6.
 */

// util

function fireRequest(method, path, data, callback) {
    var options = {
        host: 'localhost',
        method: method,
        path: path
    };
    var http = require('http');
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            callback(JSON.parse(chunk));
        });
    });
    if (data !== null)
        req.write(data);
    req.end();
}

Date.prototype.yymmdd = function() {
    var yy = this.getFullYear().toString().substr(2, 2);
    var mm = (this.getMonth() + 1).toString();
    var dd  = this.getDate().toString();
    return yy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]);
};

// Choose a location
// No view, just set cookie and redirect to home page
// get
exports.chooseLocation = function(request, response) {
    var username = request.cookies.username;
    var city = request.query.city;
    response.cookie('city', city);
    response.redirect(302, '/', {
        maxAge: 999999,
        httpOnly: true
    });
};


// List hospitals - Show a list of all hospitals in user's city
// Choose a hospital
// get
exports.redirectToListHospitals = function(request, response) {
    if (typeof request.cookies.province !== 'undefined') {
        var province = request.cookies.province;
        response.redirect(302, '/' + province + '/hospitals');
    } else {
        response.redirect(302, '/beijing/hospitals');
    }
};

// get
exports.listHospitals = function(request, response) {
    var username = request.cookies.username;
    var province = request.params.province;
    // TODO(API Documentation): Change query string parameter to 拼音, name to province (from city)
    var url = '/hospital/hospital/list?province=' + province;

    fireRequest('GET', url, null, function(res) {
        response.render('hospital_list', {
            username: username,
            list: res.hospitals
        });
    });

    /*
     list:
     [
     {
     "id": 1,
     "name": "协和医院"
     },{
     "id": 2,
     "name": "昌平医院"
     }
     ]
     */
};

// Hospital page - Show all departments and doctors
// Choose a department and a doctor
// get
exports.showHospital = function(request, response) {
    var username = request.cookies.username;
    var hospitalId = request.params.hospital_id;
    var detail = null;
    var departments = null;
    var doctors = '{';

    var url1 = '/hospital/hospital/' + hospitalId + '/detail';
    fireRequest('GET', url1, null, function(res) {
        detail = res;
        getDoctors();
    });

    var url2 = '/hospital/department/' + hospitalId;
    fireRequest('GET', url2, null, function(res) {
        departments = res;
        getDoctors();
    });

    var url3 = '/hospital/doctor/list?departmentId=';
    var getDoctors = function() {
        if (detail == null || departments == null)
            return;

        var ix = 0;
        var url4 = url3 + departments.departments_list[i].id;

        var completeReqSeq = function() {
            doctors += '}';
            response.render('hospital', {
                username: username,
                detail: res,
                departments: departments.departments_list,
                doctors: JSON.parse(doctors)
            });
        };

        var handleRes = function(res) {
            doctors += '"department_' + ix + '": [';
            doctors += JSON.stringify(res.doctors);
            doctors += ']';
            ++ix;
            if (ix < departments.count) {
                doctors += ',';
                url4 = url3 +  departments.departments_list[i].id;
                fireRequest('GET', url4, null, handleRes);
            } else {
                completeReqSeq();
            }
        };

        fireRequest('GET', url4, null, handleRes);
    };

    /*

     detail:
     {
     "errcode": 0,
     "errmsg": "success",
     "id": 1,
     "name": "协和医院",
     "level": "三级甲等",
     "province": "北京",
     "city": "北京",
     "address": "xxxx",
     "telephone": "xxxx",
     "website": "www.google.com"
     }

     departments:
     [
     {"id":1,"name":"xxx","phone":"838141","description":"xxxxxx"},
     {"id":2,"name":"xxx","phone":"838143","description":"xxxxxx"}
     ]


     doctors:
     {
     "department_1": [
     {
     "id": 2,
     "name": "李四",
     "hospital": "协和医院",
     "department": "口腔科",
     "title": "副主任医师",
     "description": "擅长治疗xxx",
     "photo_url": "http://www.example.com/383d1adc.png"
     }
     {
     (other doctors)
     }
     ],

     "department_2": [

     ]
     }

     */
};

// Doctor page - Show doctor's detail and available time slots
// Choose a time
// get
exports.showDoctor = function(request, response) {
    var username = request.cookies.username;
    var expertId = request.params.expert_id;
    var hospitalId = request.params.hospital_id;
    var departmentId = request.params.department_id;
    var url = '/hospital/doctor/' + expertId + '/detail';

    fireRequest('GET', url, null, function(res) {
        response.render('doctor', {
            username: username,
            hospitalId: hospitalId,
            departmentId: departmentId,
            detail: res
        });
    });
    // TODO(API Documentation): Add time slots to returned data
    /*
     detail:
     {
     "id": 1,
     "name": "张三",
     "hospital": "协和医院",
     "department": "口腔科",
     "title": "副主任医师",
     "description": "擅长治疗xxx",
     "photo_id": "fa7f282d1a52ddc"
     }
     */
};

// post (need x-www-form-urlencoded data)
exports.confirm = function(request, response) {
    var username = request.cookies.username;
    // TODO(Gongpu Zhu): add userId to cookie (otherwise there is no known way to retrieve user id)
    var userId = request.cookies.userId;
    // information below are from _post
    var department = request.body.department;
    var departmentId = request.body.departmentId;
    var doctor = request.body.doctor;
    var doctorId = request.body.doctorId;
    var date = request.body.resvDate;
    var time = request.body.resvTime;

    response.render('new_reservation', {
        username: username,
        userId: userId,
        department: department,
        departmentId: departmentId,
        doctor: doctor,
        doctorId: doctorId,
        date: date,
        time: time
    });
};

// Submit request
// post (need x-www-form-urlencoded data)
exports.onSubmit = function(request, response) {
    var userId = request.cookies.userId; // from cookie;
    var hospitalId = request.body.hospitalId; // from prev page
    var departmentId = request.body.departmentId; // from prev page
    var doctorId = request.body.doctorId; // from prev page
    // TODO(API Documentation): how to present reservation time?
    var time = request.body.resvTime; // from prev page
    var date = request.body.resvDate; // from prev page

    var url = '/user/reservation/add';
    var data = {
        user_id: userId,
        hospital_id: hospitalId,
        department_id: departmentId,
        doctor_id: doctorId,
        date: date,
        time: time,
        paid_flag: false
    };
    fireRequest('POST', url, JSON.stringify(data), function(res) {
        // TODO(API Documentation): modify add reservation api to return mysqli_insert_id
        var id = res.id;
        response.redirect(302, '/reservation/' + id + '?state=success');
    });
};

// Show reservation detail
// User may take actions like pay, print or close
// Optional message
// get
exports.showReservation = function(request, response) {
    var username = request.cookies.username;
    var resvId = request.params.reservation_id;
    var state = 'normal';
    if (typeof request.query.state != 'undefined') {
        state = request.query.state;
    }
    var url = '/user/reservation/' + resvId + '/detail';
    fireRequest('GET', url, null, function(res) {
        response.render('reservation', {
            username: username,
            detail: res,
            state: state
        });
    });
};

// post
exports.operateReservation = function(request, response) {
    var username = request.cookies.username;
};