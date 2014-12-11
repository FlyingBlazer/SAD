var restify = require('restify');
var util = require('util');

module.exports = {
    LoginFail: LoginFail,
    UserNotLogin: UserNotLogin,
    HospitalNotExist: HospitalNotExist,
    UserAlreadyExisted: UserAlreadyExisted,
    UserNotExist: UserNotExist
};

function LoginFail(message) {
    restify.RestError.call(this, {
        restCode: '1001',
        statusCode: 401,
        message: message,
        constructorOpt: LoginFail
    });
    this.name = 'LoginFail';
}
util.inherits(LoginFail, restify.RestError);

function UserNotLogin(message) {
    restify.RestError.call(this, {
        restCode: '1002',
        statusCode: 403,
        message: message,
        constructorOpt: UserNotLogin
    });
    this.name = 'UserNotLogin';
}
util.inherits(UserNotLogin, restify.RestError);

function UserAlreadyExisted(message) {
    restify.RestError.call(this, {
        restCode: '1003',
        statusCode: 403,
        message: message,
        constructorOpt: UserAlreadyExisted
    });
    this.name = 'UserAlreadyExisted';
}
util.inherits(UserAlreadyExisted, restify.RestError);

function UserNotExist(message) {
    restify.RestError.call(this, {
        restCode: '1004',
        statusCode: 404,
        message: message,
        constructorOpt: UserNotExist
    });
    this.name = 'UserNotExist';
}
util.inherits(UserNotExist, restify.RestError);

function InvalidUserStatus(message) {
    restify.RestError.call(this, {
        restCode: '1005',
        statusCode: 403,
        message: message,
        constructorOpt: InvalidUserStatus
    });
    this.name = 'InvalidUserStatus';
}
util.inherits(InvalidUserStatus, restify.RestError);

function HospitalNotExist(message) {
    restify.RestError.call(this, {
        restCode: '2001',
        statusCode: 404,
        message: message,
        constructorOpt: HospitalNotExist
    });
    this.name = 'HospitalNotExist';
}
util.inherits(HospitalNotExist, restify.RestError);

function ListEmpty(message) {
    restify.RestError.call(this, {
        restCode: '1101',
        statusCode: 404,
        message: message,
        constructorOpt: ListEmpty
    });
    this.name = 'ListEmpty';
}
util.inherits(ListEmpty, restify.RestError);

function ApproveFail(message) {
    restify.RestError.call(this, {
        restCode: '1102',
        statusCode: 404,
        message: message,
        constructorOpt: ApproveFail
    });
    this.name = 'ApproveFail';
}
util.inherits(ApproveFail, restify.RestError);

function RejectFail(message) {
    restify.RestError.call(this, {
        restCode: '1103',
        statusCode: 404,
        message: message,
        constructorOpt: RejectFail
    });
    this.name = 'RejectFail';
}
util.inherits(RejectFail, restify.RestError);

function FailToGetStatus(message) {
    restify.RestError.call(this, {
        restCode: '1104',
        statusCode: 404,
        message: message,
        constructorOpt: FailToGetStatus
    });
    this.name = 'FailToGetStatus';
}
util.inherits(FailToGetStatus, restify.RestError);

function EmptyReservation(message) {
    restify.RestError.call(this, {
        restCode: '3001',
        statusCode: 404,
        message: message,
        constructorOpt: EmptyReservation
    });
    this.name = 'EmptyReservation';
}
util.inherits(EmptyReservation, restify.RestError);

function ReservationUserInvalidFailure(message) {
    restify.RestError.call(this, {
        restCode: '3002',
        statusCode: 404,
        message: message,
        constructorOpt: ReservationUserInvalidFailure
    });
    this.name = 'ReservationUserInvalidFailure';
}
util.inherits(ReservationUserInvalidFailure, restify.RestError);

function ReservationErrorFailure(message) {
    restify.RestError.call(this, {
        restCode: '3003',
        statusCode: 404,
        message: message,
        constructorOpt: ReservationErrorFailure
    });
    this.name = 'ReservationErrorFailure';
}
util.inherits(ReservationErrorFailure, restify.RestError);

function ReservationPeriodFailure(message) {
    restify.RestError.call(this, {
        restCode: '3004',
        statusCode: 404,
        message: message,
        constructorOpt: ReservationPeriodFailure
    });
    this.name = 'ReservationPeriodFailure';
}
util.inherits(ReservationPeriodFailure, restify.RestError);

function ReservationFullFailure(message) {
    restify.RestError.call(this, {
        restCode: '3005',
        statusCode: 404,
        message: message,
        constructorOpt: ReservationFullFailure
    });
    this.name = 'ReservationFullFailure';
}
util.inherits(ReservationFullFailure, restify.RestError);

function CancelFailure(message) {
    restify.RestError.call(this, {
        restCode: '3006',
        statusCode: 404,
        message: message,
        constructorOpt: CancelFailure
    });
    this.name = 'CancelFailure';
}
util.inherits(CancelFailure, restify.RestError);

function PaymentFailure(message) {
    restify.RestError.call(this, {
        restCode: '3007',
        statusCode: 404,
        message: message,
        constructorOpt: PaymentFailure
    });
    this.name = 'PaymentFailure';
}
util.inherits(PaymentFailure, restify.RestError);

function DetailFailure(message) {
    restify.RestError.call(this, {
        restCode: '3008',
        statusCode: 404,
        message: message,
        constructorOpt: DetailFailure
    });
    this.name = 'DetailFailure';
}
util.inherits(DetailFailure, restify.RestError);

function PrintFalure(message) {
    restify.RestError.call(this, {
        restCode: '3009',
        statusCode: 404,
        message: message,
        constructorOpt: PrintFalure
    });
    this.name = 'PrintFalure';
}
util.inherits(PrintFalure, restify.RestError);

function ConfirmFailure(message) {
    restify.RestError.call(this, {
        restCode: '3010',
        statusCode: 404,
        message: message,
        constructorOpt: ConfirmFailure
    });
    this.name = 'ConfirmFailure';
}
util.inherits(ConfirmFailure, restify.RestError);