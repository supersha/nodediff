#### Nodejs diff文件工具


安装：[sudo] npm install nodediff -g

功能：可以diff本地的两个文件，也可以diff在线两个URL做比对，当然也可以本地文件和在线URL做diff。

暂时只有一条命令：nodediff file1 file2

一般file1为原始文件，file2为新文件

示例：
	nodediff http://www.baidu.com/search/jubao.html your-local-file-path
