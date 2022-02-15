const http = require('http'),
	express = require('express'),
	bodyParser = require('body-parser'),             //接收post请求
	app = express(),
	ws = require('nodejs-websocket'); //ws


app.use(bodyParser.json()); //数据JSON类型
app.use(bodyParser.urlencoded({
	extended: false
})); //解析post请求数据


//设置模板引擎目录
app.set('views', __dirname + '/views');

//设置模板引擎是什么
app.set('view engine', 'ejs');



//设置跨域访问
app.all('*', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Credentials", true);
	// 设置服务器支持的所有头信息字段
	res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , token');
	//res.header("Access-Control-Allow-Headers", "token");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	
	if (req.method == 'OPTIONS') {
		res.sendStatus(200)
		//让options请求快速返回
	} else {
		next();
	}
})

//设置静态资源目录
app.use('/public', express.static('public')); //将文件设置成静态

app.get('/', (req, res) => {
	res.render("index")
});

app.use('/api', require('./router/api'));

var httpServer = http.createServer(app);
httpServer.listen(8082, () => {
	console.log(8082)
});

const wsServer = ws.createServer((connect) => {
	//链接上来的时候
	connect.on('text', (str) => {
		let obj = JSON.parse(str);
		//console.log(obj);
		let nowTime = Date.parse(new Date())/1000;
		switch (obj.type) {
			case 'enter':
				connect.nickname = obj.data;
				boardcast(JSON.stringify({
					type: 'enter',
					content: obj.data,
				}));
				
				//在线人数
				boardcast(JSON.stringify({
					type: 'num',
					data:{
						ntype:'liveNum',
						num:getAllChatter().length
					}
				}));
				break;
			case 'img':
				boardcast(JSON.stringify({
					type: 'img',
					nickname: connect.nickname,
					time: nowTime,
					content: obj.data
				}));
				break;
			case 'chat':
				boardcast(JSON.stringify({
					type: 'chat',
					nickname: connect.nickname,
					pic: connect.pic,
					time: nowTime,
					content: obj.data
				}));
				break;
			default:
				break;
		}
	});

	//关闭链接的时候
	connect.on('close', () => {
		//离开房间
		boardcast(JSON.stringify({
			type: 'out',
			content: connect.nickname
		}));
		
		//从在线聊天的人数上面除去
		boardcast(JSON.stringify({
			type: 'num',
			data:{
				ntype:'liveNum',
				num: getAllChatter().length
			}
		}));
	});

	//错误处理
	connect.on('error', (err) => {
		console.log(err);
	})

}).listen(8101, () => {
	console.log(8101)
});


//封装发送消息的函数(向每个链接的用户发送消息)
const boardcast = (str) => {
	//console.log(str);
	wsServer.connections.forEach((connect) => {
		connect.sendText(str)
	})
};

//封装获取所有聊天者的nickname
const getAllChatter = () => {
	let chartterArr = [];
	wsServer.connections.forEach((connect) => {
		chartterArr.push({ name: connect.nickname })
	});
	return chartterArr;
};

