var wrap=document.querySelector('.wrap');
var od=wrap.getElementsByTagName('div');
var fen=document.querySelector('.fen');
var snake=[];		//存放蛇体的坐标
var map=[];			//0:road,1:been,2:snake
var dir=[];			//0:上,1:右,2:下,3:左,空表示未开始运动
var newSnakeDir=null;//添加新蛇体的方向
const len=30;		//行列的长度，不可改变
var str='';			//初始化dom的字符串
var timer=null;		//定时器
var count=0;		//记录分数
const le=2;			//每次添加新的蛇体的数目
var unNewSnake=0;	//未添加蛇体的数目
var buildCount=0;	//寻找新空白处的次数
var diss=200;		//时间间隔

function init(){
	snake=[];
	map=[];
	dir=[];
	str='';
	count=0;
 	diss=200;
 	fen.innerHTML=0;
	//初始化地图数组
	for(var i=0;i<len;i++){
		map[i]=[];
		for(var j=0;j<len;j++){
			map[i][j]=0;
		}
	}
	var been=newBeen();//产生豆豆
	map[been[0]][been[1]]=1;

	var _temp=newSnake();//产生蛇
	map[_temp[0]][_temp[1]]=2;

	for(var i=0;i<len;i++){//初始化地图dom
		for(var j=0;j<len;j++){
			if(map[i][j]==1)
				str+='<div class="been"></div>';
			else 
				if(map[i][j]==2){
					snake.push({i:i,j:j});
					str+='<div class="snake"></div>';
				}
				else str+='<div></div>';
		}
	}
	wrap.innerHTML=str;
}
//绑定键盘事件
EventUtil.addHandler(window,'keydown',function(e){
	e=EventUtil.getEvent(e);
	var code=e.keyCode;
	switch(code){//方向数组为空或者 新方向不与当前方向相同(蛇长为一则可逆向，否则不可逆向)
		case 38:if(dir.length==0||(dir[0]!=0&&(snake.length==1||dir[0]!=2))){
					dir.push(0);
				}break;//上
		case 39:if(dir.length==0||(dir[0]!=1&&(snake.length==1||dir[0]!=3))){
					dir.push(1);
				}break;//右
		case 40:if(dir.length==0||(dir[0]!=2&&(snake.length==1||dir[0]!=0))){
					dir.push(2);
				}break;//下
		case 37:if(dir.length==0||(dir[0]!=3&&(snake.length==1||dir[0]!=1))){
					dir.push(3);
				}break;//左
	}
});
init();
timer=setInterval(move,diss);

function newBeen(){//生成豆豆，返回坐标
	var i=Math.floor(Math.random()*len);
	var j=Math.floor(Math.random()*len);
	while(j==i){ j=Math.floor(Math.random()*len); }
	if(map[i][j]==0){ 
		return [i,j]; 
	}
	else{ return newBeen(); }
}
//生成豆豆，返回坐标，避免一开始的位置太靠近边缘，不过一开始没有方向则没有太大问题
function newSnake(){
	var i=Math.floor(Math.random()*len*4/5+len/10);
	var j=Math.floor(Math.random()*len*4/5+len/10);
	while(j==i){ j=Math.floor(Math.random()*len*4/5+len/10); }
	if(map[i][j]==0){ 
		return [i,j]; 
	}
	else{ return newBeen(); }
}
function move(){
	if(dir.length==0) return;		//方向数组为空则不动
	if(dir.length>1) dir.shift();	//方向数组长度大于一则移除首个元素
	switch(dir[0]){					//根据首个方向选择蛇头下一个位置
		case 0:move_to(snake[0].i-1,snake[0].j);break;
		case 1:move_to(snake[0].i,snake[0].j+1);break;
		case 2:move_to(snake[0].i+1,snake[0].j);break;
		case 3:move_to(snake[0].i,snake[0].j-1);break;
		default:break;
	}
}
function stop(){
		clearInterval(timer);
		// alert('game over');
		// init();
		// timer=setInterval(move,400);
}
function move_to(i,j){		//i,j表示蛇头下一个坐标
	buildCount=0;
	var dir_now=dir[0];		//缓存当前方向
	switch(dir_now){		//遇墙或自己
		case 0:if(i<0||map[i][j]==2){ stop();return; }
		case 1:if(j>=len||map[i][j]==2){ stop();return; }
		case 2:if(i>=len||map[i][j]==2){ stop();return; }
		case 3:if(j<0||map[i][j]==2){ stop();return; }
	}
	if(map[i][j]==1||map[i][j]==0){		//遇到豆豆或空白
		var dou=map[i][j];				//缓存豆豆的坐标
		map[i][j]=2;					//把豆豆变成蛇头
		od[i*len+j].className='snake';
		if(snake.length==1){			//长度只有一，直接把原坐标变为空白
			map[snake[0].i][snake[0].j]=0;
			od[snake[0].i*len+snake[0].j].className='';
		}
		else{
			for(var k=snake.length-1;k>0;k--){		//移动蛇身
				if(k==snake.length-1){			//蛇尾变为空白
					map[snake[k].i][snake[k].j]=0;
					od[(snake[k].i)*len+snake[k].j].className='';
				}
				snake[k].i=snake[k-1].i;		//迭代坐标
				snake[k].j=snake[k-1].j;
			}
		}
		switch(dir_now){
			case 0:snake[0].i--;break;			//更新蛇头坐标
			case 1:snake[0].j++;break;
			case 2:snake[0].i++;break;
			case 3:snake[0].j--;break;
		}
		
		if(dou==1){					//遇到豆豆就增加长度
			clearInterval(timer);   //暂停运动，避免添加新蛇体导致运动判断失误
			if(snake.length!=1){	//判断蛇尾添加新身体的方向
				if(snake[snake.length-2].i-snake[snake.length-1].i!=0){
					(snake[snake.length-2].i-snake[snake.length-1].i==1)?newSnakeDir=2:newSnakeDir=0;
				}
				else{
					(snake[snake.length-2].j-snake[snake.length-1].j==1)?newSnakeDir=1:newSnakeDir=3;
				}
			}
			else newSnakeDir=dir_now;
			count+=le;				//分数加le
			fen.innerHTML=count;
			unNewSnake+=le;			//蛇尾加le
			switch(newSnakeDir){	//分le次添加蛇体
				case 0: for(var i=0;i<le;i++){ newSnakeUp(); } break;
				case 1: for(var i=0;i<le;i++){ newSnakeRight(); } break;
				case 2: for(var i=0;i<le;i++){ newSnakeDown(); } break;
				case 3: for(var i=0;i<le;i++){ newSnakeLeft(); } break;
			}
			var been=newBeen();		//产生豆豆
			map[been[0]][been[1]]=1;
			od[been[0]*len+been[1]].className='been';
			diss-=5;

			move();			//恢复运动
			timer=setInterval(move,diss);	//更新定时器（时间间隔）
		}

		if(unNewSnake>0){	//如果还有未完成的蛇体，那就进行添加
			clearInterval(timer);
			var unNewSnake_temp=unNewSnake;
			switch(newSnakeDir){	//分le次添加蛇体
				case 0: for(var i=0;i<unNewSnake_temp;i++){ newSnakeUp(); } break;
				case 1: for(var i=0;i<unNewSnake_temp;i++){ newSnakeRight(); } break;
				case 2: for(var i=0;i<unNewSnake_temp;i++){ newSnakeDown(); } break;
				case 3: for(var i=0;i<unNewSnake_temp;i++){ newSnakeLeft(); } break;
			}
			move();
			timer=setInterval(move,diss);
		}
	}
}
function newSnakeUp(){		//向上走，则往下判断
	if(buildCount==4)return;	//四个方向都找不到空白，那就放弃
	if(snake[snake.length-1].i+1<len){
		if(map[snake[snake.length-1].i+1][snake[snake.length-1].j]==0){//下一个为空白
			map[snake[snake.length-1].i+1][snake[snake.length-1].j]==2;
			od[(snake[snake.length-1].i+1)*len+snake[snake.length-1].j].className='snake';
			snake.push({i:snake[snake.length-1].i+1,j:snake[snake.length-1].j});
			unNewSnake--;
		}
		else{
			buildCount++;
			newSnakeRight();	//尝试其他方向
		}
	}
}

function newSnakeDown(){		//向下走，则往上判断
	if(buildCount==4)return;
	if(snake[snake.length-1].i-1>=0){
		if(map[snake[snake.length-1].i-1][snake[snake.length-1].j]==0){//下一个为空白
			map[snake[snake.length-1].i-1][snake[snake.length-1].j]==2;
			od[(snake[snake.length-1].i-1)*len+snake[snake.length-1].j].className='snake';
			snake.push({i:snake[snake.length-1].i-1,j:snake[snake.length-1].j});
			unNewSnake--;
		}
		else{
			buildCount++;
			newSnakeLeft();
		}
	}
}

function newSnakeRight(){		//向右走，则往左判断
	if(buildCount==4)return;
	if(snake[snake.length-1].j-1>=0){
		if(map[snake[snake.length-1].i][snake[snake.length-1].j-1]==0){//下一个为空白
			map[snake[snake.length-1].i][snake[snake.length-1].j-1]==2;
			od[snake[snake.length-1].i*len+snake[snake.length-1].j-1].className='snake';
			snake.push({i:snake[snake.length-1].i,j:snake[snake.length-1].j-1});
			unNewSnake--;
		}
		else{
			buildCount++;
			newSnakeDown();
		}
	}
}

function newSnakeLeft(){		//向左走，则往右判断
	if(buildCount==4)return;
	if(snake[snake.length-1].j+1<len){
		if(map[snake[snake.length-1].i][snake[snake.length-1].j+1]==0){//下一个为空白
			map[snake[snake.length-1].i][snake[snake.length-1].j+1]==2;
			od[snake[snake.length-1].i*len+snake[snake.length-1].j+1].className='snake';
			snake.push({i:snake[snake.length-1].i,j:snake[snake.length-1].j+1});
			unNewSnake--;
		}
		else{
			buildCount++;
			newSnakeUp();
		}
	}
}	
