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


if(!srcFile || !desFile){ console.log("Parameters can not be empty. \nExample command: nodediff file1 file2. \nYou can access the \"https://github.com/supersha/nodediff\" for more detail."); process.exit(1); }


function handleDiff(src, des){
	var diffResult = "",
		diff = JsDiff.diffLines(src, des),
		lineNumber = 0,
		bk = [],
		tmpData = [],
		cache = {};

	diff.forEach(function(part){
		var color = part.added ? 'green' :  part.removed ? 'red' : 'grey';

		var arr = part.value.split(/^/m);

		arr.forEach(function(item){
			var line = ++lineNumber;
			tmpData.push({
				modify : part.added || part.removed || false,
				code : !item ? (line + " ")[color] : (line + " " + (part.added ? "+ " : "") + (part.removed ? "- " : "") + item)[color]
			});
		});
	});

	tmpData.forEach(function(item, index){
		var it = null;
		//如果是有added/removed的，则输出上下附近两行的代码
		if(item.modify){
			for(var i = index - 2; i < index + 3; i++){
				it = tmpData[i];

				//处理连续两项都modify的情况
				if(it.modify && i == index + 1){ return; }

				if(it && !it.modify || (i === index)){
					if(cache[it.code]) { continue; }
					bk.push(it.code);
					cache[it.code] = true;
				}
			}
			bk.push("...\n"['grey']);
		}
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


