var restify = require('restify');
var util = require('util');

exports.LoginFail = function LoginFail(message) {
    restify.RestError.call(this, {
        restCode: '1001',
        statusCode: 401,
        message: message,
        constructorOpt: LoginFail
    });
    this.name = 'LoginFail';
};
util.inherits(exports.LoginFail, restify.RestError);

exports.UserNotLogin = function UserNotLogin(message) {
    restify.RestError.call(this, {
        restCode: '1002',
        statusCode: 403,
        message: message,
        constructorOpt: UserNotLogin
    });
    this.name = 'UserNotLogin';
};
util.inherits(exports.UserNotLogin, restify.RestError);

exports.UserAlreadyExisted = function UserAlreadyExisted(message) {
    restify.RestError.call(this, {
        restCode: '1003',
        statusCode: 403,
        message: message,
        constructorOpt: UserAlreadyExisted
    });
    this.name = 'UserAlreadyExisted';
};
util.inherits(exports.UserAlreadyExisted, restify.RestError);

exports.UserNotExist = function UserNotExist(message) {
    restify.RestError.call(this, {
        restCode: '1004',
        statusCode: 404,
        message: message,
        constructorOpt: UserNotExist
    });
    this.name = 'UserNotExist';
};
util.inherits(exports.UserNotExist, restify.RestError);

exports.InvalidUserStatus=function InvalidUserStatus(message) {
    restify.RestError.call(this, {
        restCode: '1005',
        statusCode: 403,
        message: message,
        constructorOpt: InvalidUserStatus
    });
    this.name = 'InvalidUserStatus';
}
util.inherits(exports.InvalidUserStatus, restify.RestError);

exports.HospitalNotExist = function HospitalNotExist(message) {
    restify.RestError.call(this, {
        restCode: '2001',
        statusCode: 404,
        message: message,
        constructorOpt: HospitalNotExist
    });
    this.name = 'HospitalNotExist';
};
util.inherits(exports.HospitalNotExist, restify.RestError);

exports.ListEmpty = function ListEmpty(message) {
    restify.RestError.call(this, {
        restCode: '1101',
        statusCode: 404,
        message: message,
        constructorOpt: ListEmpty
    });
    this.name = 'ListEmpty';
};
util.inherits(exports.ListEmpty, restify.RestError);

exports.ApproveFail = function ApproveFail(message) {
    restify.RestError.call(this, {
        restCode: '1102',
        statusCode: 404,
        message: message,
        constructorOpt: ApproveFail
    });
    this.name = 'ApproveFail';
};
util.inherits(exports.ApproveFail, restify.RestError);

exports.RejectFail = function RejectFail(message) {
    restify.RestError.call(this, {
        restCode: '1103',
        statusCode: 404,
        message: message,
        constructorOpt: RejectFail
    });
    this.name = 'RejectFail';
};
util.inherits(exports.RejectFail, restify.RestError);

exports.FailToGetStatus = function FailToGetStatus(message) {
    restify.RestError.call(this, {
        restCode: '1104',
        statusCode: 404,
        message: message,
        constructorOpt: FailToGetStatus
    });
    this.name = 'FailToGetStatus';
};
util.inherits(exports.FailToGetStatus, restify.RestError);

exports.EmptyReservation = function EmptyReservation(message) {
    restify.RestError.call(this, {
        restCode: '3001',
        statusCode: 404,
        message: message,
        constructorOpt: EmptyReservation
    });
    this.name = 'EmptyReservation';
};
util.inherits(exports.EmptyReservation, restify.RestError);

exports.ReservationUserInvalidFailure = function ReservationUserInvalidFailure(message) {
    restify.RestError.call(this, {
        restCode: '3002',
        statusCode: 404,
        message: message,
        constructorOpt: ReservationUserInvalidFailure
    });
    this.name = 'ReservationUserInvalidFailure';
};
util.inherits(exports.ReservationUserInvalidFailure, restify.RestError);

exports.ReservationErrorFailure = function ReservationErrorFailure(message) {
    restify.RestError.call(this, {
        restCode: '3003',
        statusCode: 404,
        message: message,
        constructorOpt: ReservationErrorFailure
    });
    this.name = 'ReservationErrorFailure';
};
util.inherits(exports.ReservationErrorFailure, restify.RestError);

exports.ReservationPeriodFailure = function ReservationPeriodFailure(message) {
    restify.RestError.call(this, {
        restCode: '3004',
        statusCode: 404,
        message: message,
        constructorOpt: ReservationPeriodFailure
    });
    this.name = 'ReservationPeriodFailure';
}
util.inherits(exports.ReservationPeriodFailure, restify.RestError);

exports.ReservationFullFailure = function ReservationFullFailure(message) {
    restify.RestError.call(this, {
        restCode: '3005',
        statusCode: 404,
        message: message,
        constructorOpt: ReservationFullFailure
    });
    this.name = 'ReservationFullFailure';
};
util.inherits(exports.ReservationFullFailure, restify.RestError);

exports.CancelFailure = function CancelFailure(message) {
    restify.RestError.call(this, {
        restCode: '3006',
        statusCode: 404,
        message: message,
        constructorOpt: CancelFailure
    });
    this.name = 'CancelFailure';
};
util.inherits(exports.CancelFailure, restify.RestError);

exports.PaymentFailure = function PaymentFailure(message) {
    restify.RestError.call(this, {
        restCode: '3007',
        statusCode: 404,
        message: message,
        constructorOpt: PaymentFailure
    });
    this.name = 'PaymentFailure';
};
util.inherits(exports.PaymentFailure, restify.RestError);

exports.DetailFailure = function DetailFailure(message) {
    restify.RestError.call(this, {
        restCode: '3008',
        statusCode: 404,
        message: message,
        constructorOpt: DetailFailure
    });
    this.name = 'DetailFailure';
};
util.inherits(exports.DetailFailure, restify.RestError);

exports.PrintFalure = function PrintFalure(message) {
    restify.RestError.call(this, {
        restCode: '3009',
        statusCode: 404,
        message: message,
        constructorOpt: PrintFalure
    });
    this.name = 'PrintFalure';
};
util.inherits(exports.PrintFalure, restify.RestError);

exports.ConfirmFailure = function ConfirmFailure(message) {
    restify.RestError.call(this, {
        restCode: '3010',
        statusCode: 404,
        message: message,
        constructorOpt: ConfirmFailure
    });
    this.name = 'ConfirmFailure';
};
util.inherits(exports.ConfirmFailure, restify.RestError);


exports.DepartmentNotExist = function DepartmentNotExist(message) {
    restify.RestError.call(this, {
        restCode: '2101',
        statusCode: 404,
        message: message,
        constructorOpt: DepartmentNotExist
    });
    this.name = 'DepartmentNotExist';
};
util.inherits(exports.DepartmentNotExist, restify.RestError);

exports.DoctorNotExist = function DoctorNotExist(message) {
    restify.RestError.call(this, {
        restCode: '2201',
        statusCode: 404,
        message: message,
        constructorOpt: DoctorNotExist
    });
    this.name = 'DoctorNotExist';
};
util.inherits(exports.DoctorNotExist, restify.RestError);