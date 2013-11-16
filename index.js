#!/usr/bin/env node

var colors = require('colors'),
	JsDiff = require("diff"),
	fs = require("fs"),
	BufferHelper = require("bufferhelper"),
	http = require("http"),
	iconv = require("iconv-lite"),
	Util = require("./util"),
	async = require("async"),
	args = process.argv.splice(2),
	regUrl = /^https?:\/\//,
	srcFileContent = "",
	desFileContent = "";


var srcFile = args[0],
	desFile = args[1];


if(!srcFile || !desFile){ console.log("参数不足."); process.exit(1); }


function handleDiff(src, des){
	var diffResult = "",
		diff = JsDiff.diffLines(src, des),
		lineNumber = 0,
		bk = [];

	diff.forEach(function(part){
		var color = part.added ? 'green' :  part.removed ? 'red' : 'grey';

		var arr = part.value.split(/^/m);

		arr.forEach(function(item){
			if(!item){ bk.push(((++lineNumber) + " ")[color]); return; }
			bk.push(((++lineNumber) + " " + (part.added ? "+ " : "") + (part.removed ? "- " : "") + item)[color]);
		});
	});

	diffResult = bk.join('');

	return diffResult;
}


async.series([
	function(callback){
		if(regUrl.test(srcFile)){
			Util.httpGet(srcFile, function(response, content){
				srcFileContent = content;
				callback(null, 1);
			});
		}else{
			srcFileContent = fs.readFileSync(srcFile);
			srcFileContent = Util.decodeGBKString(srcFileContent);	
			callback(null, 1);		
		}
	},
	function(callback){
		if(regUrl.test(desFile)){
			Util.httpGet(desFile, function(response, content){
				desFileContent = content;
				callback(null, 2);
			});
		}else{
			desFileContent = fs.readFileSync(desFile);
			desFileContent = Util.decodeGBKString(desFileContent);	
			callback(null, 2);
		}
	},
	function(callback){
		var diffResult = handleDiff(srcFileContent, desFileContent);
		console.log(diffResult);
	}
]);


