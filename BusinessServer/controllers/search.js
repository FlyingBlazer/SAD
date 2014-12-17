var Errors = require('../lib/Errors');

exports.search = function(req, res, next) {
    var keyword = req.query.keyword;
    var len=keyword.length;
    var keyword_set='';
    for(var i=0;i<len;i++){
    	keyword_set+=keyword.charAt(i);
    	if(i!=len-1){
    		keyword_set+=' ';
    	}
    }
    req.db.driver.execQuery(
  		"SELECT id as hospital_id,name as name,addr as address,tel as tel FROM hospital WHERE MATCH('name') AGAINST('?' IN BOOLEAN MODE)",
  		[keyword_set],
  		function (err, data) {
  			if(err) return next(err);
        	if(!data) {
            	return next(new Errors.EmptySearchResult("Nothing Is Found!"));
        	}
        	else{
	  			  res.json({
                	errcode: 0,
                	errmsg: 'success',
                	list: data
            	});
  			}
  		});
};