var Errors = require('../lib/Errors');

module.exports = function(req, res, next) {
    var keyword = req.query.q;
    var len=keyword.length;
    var keyword_set='';
    for(var i=0;i<len;i++){
        keyword_set+=keyword.charAt(i);
        if(i!=len-1){
            keyword_set+=' ';
        }
    }
    req.db.driver.execQuery(
        "SELECT a.id as id, a.name as name, b.meaning as level, a.province as province, a.city as city, a.addr as address, " +
        "a.tel as telephone, a.site as website, a.info as description, a.photo as photo FROM hospital as a, hospital_rating as b " +
        "WHERE a.rating_id = b.id AND a.id IN (SELECT id FROM hospital WHERE MATCH(name) AGAINST(? IN BOOLEAN MODE))",
        [keyword_set],
        function (err, data) {
            if(err) throw err;
            res.json({
                code: 0,
                message: 'success',
                hospitals: data
            });
        });
};