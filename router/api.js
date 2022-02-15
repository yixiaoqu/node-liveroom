const express = require('express'),
	router = express.Router(),
	multer = require('multer');

const storage = multer.diskStorage({
	//存储的位置
	destination(req, file, cb) {
		cb(null, 'public/upload/')
	},
	//文件名字的确定 multer默认帮我们取一个没有扩展名的文件名，因此需要我们自己定义
	filename(req, file, cb) {
		//console.log(file)
		cb(null, file.originalname)
	}
});
const upload = multer({ storage });

//上传单图
router.post("/upload", upload.single('file'), (req, res) => {
	res.status(200).send({
		code: 0,
		data:{
			imgUrl: "/public/upload/" + req.file.filename
		},
		msg: 'ok'
	})
})


module.exports = router;