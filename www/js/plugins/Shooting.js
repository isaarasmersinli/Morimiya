/*:
 * Plugin Command:
 *  input_hp      # 
 * 	イベント体力設定。
 */
 
	function requiredMag(shot, magCap) {
		return (shot * 60) / magCap;
	}

	function Scene_Achievement() {
		this.initialize.apply(this, arguments);
	}

 	function Scene_Tips() {
		this.initialize.apply(this, arguments);
	}

	var Game_System_initialize = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function() {
		Game_System_initialize.call(this);
		this._data = {};
		this._data.gunRecord = [];
		this._data.meleeRecord = [];
		this._data.bombRecord = [];
	};

 (function() {

	var magazine = 0;
	var magazine2 = 0;
	var bloodMap = [];
	var Crosshair = [];
	var playerMoveRoute = [];
	var reinforcedMapList = [];

	//フリーズバグ修正
	Graphics.render = function(stage) {
		if (this._skipCount < 0) {
			this._skipCount = 0;
		}
		if (this._skipCount === 0) {
			var startTime = Date.now();
			if (stage) {
				this._renderer.render(stage);
				if (this._renderer.gl && this._renderer.gl.flush) {
					this._renderer.gl.flush();
				}
			}
			var endTime = Date.now();
			var elapsed = endTime - startTime;
			this._skipCount = Math.min(Math.floor(elapsed / 15), this._maxSkip);
			this._rendered = true;
		} else {
			this._skipCount--;
			this._rendered = false;
		}
		this.frameCount++;
	};

 	var audioResume = function(){
        if (WebAudio._context.state === "suspended") WebAudio._context.resume();
    };
    this.document.addEventListener("click", audioResume);
    this.document.addEventListener("touchend", audioResume);
    this.document.addEventListener("keydown", audioResume);
	   
 	//タイトルに開発情報を表記
	var STC = Scene_Title.prototype.create;
	Scene_Title.prototype.create = function() {
		STC.call(this); 
		this.version();
	};
	Scene_Title.prototype.version = function() {
		var version = new Sprite();
		this.addChild(version);
		version.bitmap = new Bitmap(Graphics.boxWidth, 100);
		version.bitmap.fontSize = 20;
		version.bitmap.drawText("Ver 1.2b Created by エリック@eric806359", 0, 0, version.width, version.height, "left");
		version.x = 5;
		version.y = 555;
	}

	//エラーメッセージ
	Graphics._makeErrorHtml = function(name, message) {
		return ('<font color="yellow"><b>' + name + "<br>" + message + '</b></font><br>' +
				'<font color="white">' + "予期せぬエラーが発生したため ゲームを終了しました。<br>ご迷惑をおかけし 申し訳ございません。" + '</font><br>');
	};
	
	//操作の追加
	Input.keyMapper = {
		9: 'tab',       // tab
		13: 'ok',       // enter
		16: 'shift',    // shift
		18: 'control',  // alt
		27: 'escape',   // escape
		32: 'shoot',    // space
		33: 'pageup',   // pageup
		34: 'pagedown', // pagedown
		37: 'left',     // left arrow
		38: 'up',       // up arrow
		39: 'right',    // right arrow
		40: 'down',     // down arrow
		45: 'escape',   // insert
		49: '1',     	// 1
		50: '2',     	// 2
		51: '3',     	// 3
		65: 'left',     // A
		67: 'fireMode',	// C
		68: 'right',    // D
		69: 'ads',      // E
		70: 'target',   // F
		71: 'grenade',  // G
		81: 'change',   // Q
		82: 'reload',   // R
		83: 'down',     // S
		86: 'knife', 	// V
		87: 'up',       // W
		88: 'back',   	// X
		90: 'ok',       // Z
		96: 'escape',   // numpad 0
		98: 'down',     // numpad 2
		100: 'left',    // numpad 4
		102: 'right',   // numpad 6
		104: 'up',      // numpad 8
		120: 'debug',	// F9

		17: 'debugMenu',	// control
		48: 'debugMode',	// 0
		56: 'BotMode',		// 8
		57: 'cheatMode'		// 9
	};
	Input.gamepadMapper = {
		0: 'cancel',    // A
		1: 'ok',        // B
		2: 'reload',    // X
		3: 'change',    // Y
		4: 'ads',       // LB
		5: 'shoot',     // RB
		6: 'back',     	// LT
		7: 'knife',   	// RT
		8: '1',   		// back
		9: '2',   		// start
		10: '3',    	// L stick push
		11: 'grenade',  // R stick push
		12: 'up',       // D-pad up
		13: 'down',     // D-pad down
		14: 'left',     // D-pad left
		15: 'right',    // D-pad right
	};

	//射撃モード
	var SelectiveFire = [];

	SelectiveFire[1] = [1]		// G17
	SelectiveFire[2] = [1] 		// C1911
	SelectiveFire[3] = [4] 		// Tec9
	SelectiveFire[4] = [1] 		// AR14
	SelectiveFire[5] = [1] 		// Type56
	SelectiveFire[6] = [1] 		// SR22
	SelectiveFire[7] = [1] 		// S870K
	SelectiveFire[8] = [1] 		// S12
	SelectiveFire[9] = [4] 		// BM15 Mod
	SelectiveFire[10] = [1] 	// BS3
	SelectiveFire[11] = [1] 	// BM15
	SelectiveFire[12] = [1] 	// C900
	SelectiveFire[13] = [1] 	// Toy9
	SelectiveFire[14] = [1] 	// Toy26
	SelectiveFire[15] = [1] 	// VSG12
	SelectiveFire[16] = [1,2,4] // CZ11
	SelectiveFire[17] = [1] 	// KS25
	SelectiveFire[18] = [1] 	// M22
	SelectiveFire[19] = [1]		// HSG12
	SelectiveFire[20] = [1, 4] 	// U22
	SelectiveFire[21] = [1, 4] 	// IM10
	SelectiveFire[22] = [1] 	// D50
	SelectiveFire[23] = [1] 	// G91
	SelectiveFire[24] = [1, 4] 	// AS3M
	SelectiveFire[25] = [1, 4] 	// S12 Mod
	SelectiveFire[26] = [1] 	// M23
	SelectiveFire[27] = [1] 	// SPK
	SelectiveFire[28] = [1] 	// Type54
	SelectiveFire[29] = [1, 4] 	// A180
	SelectiveFire[30] = [1] 	// HP45
	SelectiveFire[31] = [1] 	// S870BM
	SelectiveFire[32] = [1, 3] 	// BM16
	
	//台詞保存用
	speakTexts = {};

	//被弾汎用
	speakTexts.getShot = [
		"ぎゃあっ！",
		"うあっ！",
		"うぐっ！",
		"ああっ！",
		"うっ！",
		"あっ！",
		"ぐっ！"
	];
	//負傷汎用
	speakTexts.injured = [
		"うーっ…",
		"ううっ…",
		"うぐっ…",
		"うぐうっ…",
		"うぐうっ…ううっ…",
		"はぁ…はぁ…",
		"はーっ…はーっ…",
		"うあっ…ああっ…",
		"ああっ…",
		"ぐううっ…"
	];

	//女子生徒
	speakTexts.femaleStudent = {};
	speakTexts.femaleStudent.shout = [
		"助けて！",
		"お願い、やめて！",
		"殺さないで！",
		"いやあ！誰か！",
		"どうしてこんなことするの！？",
		"ああっ、神様！",
		"いやだっ！",
		"いやあっ！",
		"きゃあああっ！",
		"いやあああっ！",
		"来ないで！",
		"こっちに来ないで！"
	];
	speakTexts.femaleStudent.reactToGun = [
		"撃たないで！"
	];
	speakTexts.femaleStudent.injured = [
		"ううっ…痛いよう…",
		"ひぐっ…",
		"死にたくない…",
		"やだ…こんなの…",
		"どうして…どうして…",
		"痛いっ、痛いいっ…",
		"血が…止まらないようっ…",
		"誰かっ…助けてぇ…",
		"お母さんっ…お母さんっ",
		"お父さん…助けて…",
		"わたし…なにもしてないのに…",
		"神様…助けて…"
	];
	
	//男子生徒
	speakTexts.maleStudent = {};
	speakTexts.maleStudent.shout = [
		"助けてくれ！",
		"頼むから、やめてくれよ！",
		"誰か！",
		"やめろっ！",
		"やめろよっ！",
		"やめろって！",
		"ざけんな！",
		"ざっけんなよお！",
		"おいっふざけんなよ！",
		"ふざけんなよおっ！！",
		"なんでこんなことすんだよ！？",
		"なんでだよ畜生！",
		"いやだっ！",
		"くそっ！",
		"あああっ！",
		"嘘だろおいっ！",
		"誰か警察呼べよっ！",
		"逃げろっ！",
		"みんな逃げろっ！",
		"冗談だろおいっ！",
		"こっちに来るな！",
		"なんなんだよっ！",
		"マジかよっ！？"
	];
	speakTexts.maleStudent.reactToGun = [
		"撃つな！",
		"撃たないでくれ！"
	];
	speakTexts.maleStudent.fight = [
		"ふざけやがって！",
		"ざけんじゃねぇぞ！",
		"ナメんなよ！",
		"ナメんじゃねぇ！",
		"お前なんか怖くないぞ！",
		"好い気になんなよ！",
		"調子に乗んじゃねえ！",
		"みんな今のうちに逃げろ！",
		"うおおおおっ！",
		"うあああっ！",
		"くそったれ！",
		"てめぇ！",
		"おいてめぇ！"
	];
	speakTexts.maleStudent.injured = [
		"うぐっ…いてえっ…",
		"死にたくないっ…",
		"嘘だろ…こんなのって…",
		"嫌だ…なんで…",
		"ざけんなよおっ…",
		"俺が…何かしたのかよおっ…",
		"なんで…だよっ…"
	];

	//男性教師
	speakTexts.teacher = {};
	speakTexts.teacher.shout = [
		"止めろッ！",
		"もう止めるんだ！",
		"何やってんだお前！",
		"みんな今すぐ逃げろ！"
	];
    speakTexts.teacher.reactToGun = [
		"銃を捨てろ！",
		"今すぐ銃を捨てろッ！",
		"銃を床に置けっ！",
		"銃を置くんだっ！！",
		"撃つのはもう止めろ！",
		"これ以上撃つんじゃない！"
	];
	speakTexts.teacher.reactToKnife = [
		"武器を捨てろ！",
		"今すぐ武器を捨てろッ！",
		"武器を床に置けっ！",
		"武器を置くんだっ！！"
	];
	speakTexts.teacher.injured = [
		"やめてくれ…",
		"もう…やめてくれ…",
		"頼むから…やめてくれ…",
		"お願いだから…やめてくれ…",
		"こんなことは…やめなさい",
		"もうやめよう…こんなことは…",
		"キミの両親が…悲しむぞ…",
		"どうして…こんなことを…"
	];
	speakTexts.teacher.injuredByGun = [
		"銃を…捨てなさい…",
		"銃を…捨てるんだ…",
		"これ以上…撃つんじゃない…",
		"やめてくれ…撃たないでくれ…",
		"お願いだから…撃たないでくれ…"
	];
	speakTexts.teacher.injuredByKnife = [
		"武器を…捨てなさい…",
		"武器を…捨てるんだ…"
	];

	//女性教師
	speakTexts.femaleTeacher = {};
	speakTexts.femaleTeacher.shout = [
		"不審者発見！ 不審者発見！",
		"増援願います！",
		"不審者を発見！",
		"不審者がいます！",
		"不審者発見しました！",
		"ここに不審者がいます！"
	];
	speakTexts.femaleTeacher.injured = [
		"いやだ…こんなの…",
		"うそでしょ…",
		"救急車…救急車を",
		"血が…血が止まらない…",
		"死にたくない…",
		"誰か…助けて…",
		"お願いだから…もう止めて…",
		"お願いだから…殺さないで…",
		"どうして…こんなことするの…"
	];

	//男性警官
	speakTexts.maleOfficer = {};
	speakTexts.maleOfficer.reactToGun = [
		"銃を捨てろ！",
		"その銃を捨てろ！",
		"今すぐ銃を捨てろ！",
		"今すぐにその銃を捨てろ！",
		"警察だ！ 銃を捨てろ！",
		"警察だ！ 今すぐ銃を捨てろ！"
	];
	speakTexts.maleOfficer.reactToKnife = [
		"武器を捨てろ！",
		"その武器を捨てろ！",
		"今すぐ武器を捨てろ！",
		"今すぐにその武器を捨てろ！",
		"警察だ！ 武器を捨てろ！",
		"警察だ！ 今すぐ武器を捨てろ！"
	];
	speakTexts.maleOfficer.injured = [
		"至急…至急…、西１から…本部…",
		"警察官が…負傷…繰り返す…",
		"ああっ…くそっ…",
		"こんなことは…やめるんだ…",
		"こんなことは…やめなさい…",
		"今すぐに…銃を捨てろ…",
		"銃を…捨てるんだ…",
		"銃を…今すぐ…捨てろ…",
	];

	//女性警官
	speakTexts.femaleOfficer = {};
	speakTexts.femaleOfficer.reactToGun = [
		"銃を捨てなさい！",
		"その銃を捨てなさい！",
		"今すぐ銃を捨てなさい！",
		"今すぐにその銃を捨てなさい！"
	];
	speakTexts.femaleOfficer.reactToKnife = [
		"武器を捨てなさい！",
		"その武器を捨てなさい！",
		"今すぐ武器を捨てなさい！",
		"今すぐにその武器を捨てなさい！"
	];
	speakTexts.femaleOfficer.injured = [
		"銃を…捨てなさい…",
		"今すぐ…銃を…捨てなさい…",
		"どうして…こんなことを…",
		"お願いだから…もうやめなさい…"
	];
	
	//プレイヤー
	speakTexts.shooter = {};
	speakTexts.shooter.shout = [
		"死ね！",
		"殺す！",
		"殺してやる！",
		"ぶっ殺す！",
		"ぶっ殺してやる！",
		"殺す 殺す 殺す！",
		"全員殺す！",
		"全員殺してやる！",
		"皆殺しにしてやる！",
		"くたばれ！",
		"次は誰！？",
		"自業自得！",
		"こうでもしないと黙らないくせに！",
		"これでやっと黙ってくれる！",
		"みんな敵 一人残らず！",
		"報いを受けろ！",
		"学校はもう終わり！",
		"学校もみんなも大嫌いだ！",
		"みんな目障りだ！",
		"みんな死ぬんだ！",
		"みんな死ねばいいんだ！",
		"みんな苦しめばいいんだ！",
		"どうせみんな死ぬんだ！",
		"私の苦しみを知らなかったとは言わせない！",
		"私はもう 逃げも隠れもしない！",
		"私が大人しく自殺するとでも！？",
		"私がずっと黙っているとでも！",
		"私が自殺しなくて残念ね！",
		"私の怒りを思い知れ！",
		"私の苦しみを思い知れ！",
		"私の痛みを思い知れ！",
		"私の憎しみを思い知れ！",
		"逃げられるものなら逃げてみれば！",
		"何もかも終わらせる！",
		"これで終わり！",
		"これで終わりだ！",
		"これで思い知った！？",
		"これで分かったでしょ！",
		"これで私の姿が見えるでしょ！",
		"これが生きるってこと！",
		"これが生きるってことでしょ！",
		"これでやっと みんな死んでくれる！",
		"これも自己責任でしょ！",
		"これでも人生は素晴らしい！？",
		"こんな学校 私がぶっ潰してやる！",
		"こんなことをするようには見えなかった！？",
		"こうなるって分からなかった！？",
		"この私を生んだ連中を恨めばいい！",
		"みんな家族を失えばいい！",
		"家族なんてみんな引き裂いてやる！",
		"いつもの見て見ぬフリは！？",
		"見て見ぬフリをしてみたら！",
		"今日はいつもの 見て見ぬフリはしないの！？",
		"苦しめ！",
		"もっと苦しめ！",
		"苦しんで死ね！",
		"苦しんで死ねばいいんだ！",
		"苦しむのはもう 私だけじゃない！",
		"もう私だけじゃない！",
		"殺されるのも含めて人生でしょ！",
		"生まれるからこんな目に遭う！",
		"生まれなきゃこんな目にも遭わない！",
		"一人で死んでくれると思った！？",
		"一人で死ね！？ みんなが死ねばいい！",
		"また一人静かになった！"
	];
	speakTexts.shooter.useGun = [
		"弾丸より早く 逃げてみれば！",
		"撃たれて死ぬのも人生でしょ！",
		"友達だったら 撃たれずに済んだのにね！"
	];
	speakTexts.shooter.useBomb = [
		"吹っ飛べ！",
		"吹き飛べ！",
		"潰れろ！",
		"これでハッキリ聞こえたでしょ！"
	];
	speakTexts.shooter.killedYandere = [
		"その包丁は いつも持ち歩いてるワケ！？",
		"この私に近寄るな！",
		"この私に近付くな！"
	];
	speakTexts.shooter.killedEnemy = [
		"自分から殺されに来るなんて！",
		"そんなもので 私を止められるとでも！",
		"この私を止められるとでも！？",
		"この私を止められる思うな！"
	];

	//東城
	speakTexts.yuumi = {};
	speakTexts.yuumi.shout = [
		"鬼ごっこだ！",
		"ワタシが鬼！",
		"捕まえた！",
		"まだまだー！",
		"いっぱい刺すからね！",
		"もっともっと捕まえてやるー！",
		"刺す刺す刺す！",
		"殺す殺す殺す！",
		"死ね死ね死ね！",
		"逃げないと捕まえちゃうよ！",
		"逃げないと殺しちゃうよ！",
		"ほらほら早く逃げないと！",
		"もっと必死になって逃げたら！",
		"死んじゃえ！",
		"みんな死んじゃえ！",
		"死んじゃえ死んじゃえ！",
		"あはは！",
		"あははは！",
		"あははははは！"
	];
	speakTexts.yuumi.killedYandere = [
		"私の勝ち！ 勝ち勝ち勝ち！",
		"私のナイフの方が強力ってこと！",
		"私のナイフに勝てるとでも！",
		"鬼はワタシ、あなたじゃない！",
		"あはは！ 気違いに刃物だ！",
		"あはは！ この子、頭おかしい！",
		"あはは！ 自殺願望でもあるの！",
		"なんで包丁持ってるの！",
		"包丁で私に勝てるとでも！",
		"死ね死ね死ね死ね死ね死ね！",
		"殺す殺す殺す殺す殺す殺す！",
		"あーあ もう死んじゃったの！",
		"そんなオモチャで勝てるとでも！"
	];

	//ヤンデレ
	speakTexts.yandere = {};
	speakTexts.yandere.shout = [
		"先輩は私が守る",
		"先輩は私が守るんだ",
		"先輩は私が守らなきゃ",
		"先輩は私が守らないと",
		"先輩は私が守ってあげないと",
		"先輩に近付くな",
		"先輩に近寄るな",
		"先輩に近付く女は殺さなきゃ"
	];
	speakTexts.yandere.injured = [
		"こんな…女なんかに…！",
		"先輩を…守らないと…！",
		"この薄汚い女を…殺さないと…！",
		"先輩…先輩…",
		"先輩…今のうちに逃げて…！",
		"殺す…殺してやるっ…！",
		"私が…私が守らないと…！",
		"先輩を…傷付けたりしたら…絶対に…！",
		"絶対に…私が守るんだ…！",
		"この…クズ女…！",
		"殺す…！"
	];

	//校長先生
	speakTexts.principal = {};
	speakTexts.principal.shout = [
		"おいコラお前！",
		"ぶち殺すぞコラ！",
		"撃ち殺すぞコラ！",
		"舐めとんちゃうぞコラ！",
		"ふざけとんなよコラ！",
		"脳天ぶちかますぞ！",
		"逃げるとでも思ったんか！",
		"隠れるとでも思ったんか！",
		"逃げも隠れもせえへんぞ！"
	];
	speakTexts.principal.reactToGun = [
		"はよ銃捨てんか！",
		"銃捨てんと撃つぞお前！",
		"銃捨てんと撃ち殺すぞ！"
	];
	speakTexts.principal.injured = [
		"くそっ…！",
		"くそったれ…！"
	];

	//校内放送
	var announcement = [];
	announcement.push("これより集会の準備を始めます。生徒は先生の指示に従い、教室で待機してください。繰り返します―――これより集会の準備を始めます。生徒は先生の指示に従い、教室で待機してください。");
	announcement.push("集会を開始します。全校生徒は先生の指示に従い移動を開始してください。繰り返します―――集会を開始します。全校生徒は先生の指示に従い移動を開始してください。");
	announcement.push("緊急放送！  緊急放送！  校内に武器を持った不審者が侵入中！  校内に武器を持った不審者が侵入中！  全校生徒と先生は、命を守るため、直ちに校外へ避難してください！  これは訓練ではありません！");

	//ゲームマニュアル選択欄
	var tips = [
		"操作方法",
		"照準モード",
		"スタミナ",
		"銃の切り替え",
		"近接武器",
		"投擲物",
		"ショットガン",
		"負傷と重傷",
		"増援",
		"職員室",
		"生徒の反撃",
		"致命傷",
		"東城優美",
		"ハードモード",
		"主な変更点",
		"残弾",
		"死体撃ち",
		"防弾装備"
	];
	//操作方法テキスト
	var tipsKeyTexts = [
		"移動", 		//WASD
		"走る", 		//Shift
		"射撃", 		//Space
		"後退", 		//X
		"主武装", 		//1
		"副武装", 		//2
		"近接武器", 	//3
		"武器交換", 	//Q
		"照準", 		//E
		"リロード", 	//R
		"目標変更", 	//F
		"投擲物", 		//G
		"射撃モード", 	//C
		"近接攻撃", 	//V
	];

	// \\Fs[n] = fontSize
	// \\C[n] = fontColor
	// standardFontSize = 28

	//ゲームマニュアル
	var tipsTexts = ["", ""];
	tipsTexts[2] = "\\Fs[22]" +
	"Eキーで \\C[6]照準モード\\C[0] に切り替えることができます。\n\n照準モード中は \\C[6]命中率が100％まで回復する\\C[0] ため、\n正確にターゲットを攻撃することができます。\n\n"+
	"Shiftキーを押しているあいだは\n照準モードを維持したまま 歩行することが可能です。"
	tipsTexts[3] = "\\Fs[22]" +
	"プレイヤーが走ったり ダメージを受けた際に\n表示される緑のゲージは \\C[6]スタミナ\\C[0] を表しています。\n\n"+
	"スタミナは自然に回復しますが、枯渇してしまうと\n完全に回復するまで 走ることができなくなります。\n\n"+
	"スタミナが枯渇した状態で攻撃を受けると、\n確保されて \\C[6]ゲームオーバー\\C[0] になってしまいます。"
	tipsTexts[4] = "\\Fs[22]" +
	"プレイヤーは \\C[2]メインウェポン（主武装）\\C[0]と\n\\C[1]サイドアーム（副武装）\\C[0]の二つの銃を持っており、\nQキーで それぞれの銃を切り替えることができます。\n\n"+
	"銃の切り替えは リロードよりも素早く済むため、\n" +
	"敵対的なターゲットに 大きな隙を与えることなく\n射撃を継続することができます。";
	tipsTexts[5] = "\\Fs[22]" +
	"３キーで \\C[6]近接武器\\C[0] に切り替えることができます。\n\n" +
	"近接武器は遠方へ攻撃ができない代わりに、\n目前のターゲットに対して 確実にダメージを与える\nことができます。\n\n" +
	"ただし、攻撃のたびに \\C[6]スタミナを消費\\C[0] し、\nターゲットへ与えるダメージは スタミナが低いほど\n低下してしまいます。";
	tipsTexts[6] = "\\Fs[22]" +
	"Gキーで \\C[6]投擲物\\C[0] を投げることができます。\n押し続ける時間が長いほど、遠方へ投擲します。\n\n"+
	"投擲物は一定時間後に爆発し、爆風が障害物に\n阻まれない限り \\C[6]致死範囲内\\C[0] のターゲットは死亡、\n\\C[6]負傷範囲内\\C[0] のターゲットはダメージを受けます。\n\n" +
	"\\C[6]プレイヤーにとっても致命的\\C[0] なので、\n爆発に巻き込まれないよう 十分に注意しましょう。";
	tipsTexts[7] = "\\Fs[22]" +
	"\\C[6]ショットガン\\C[0] は、散弾による \\C[6]命中率ボーナス(+25%)\\C[0]\nを持つ、高い命中率と 大きな殺傷力を持つ銃です。\n\n"+
	"一方で、ターゲットとの距離が離れるほど\n散弾の拡散により \\C[6]ダメージが低下\\C[0] してしまうので、\nなるべく至近距離から 発砲する必要があります。"
	tipsTexts[8] = "\\Fs[22]" +
	"ダメージを受けたターゲットは、ダメージの大きさ\nに応じて \\C[6]負傷状態または重傷状態\\C[0] になります。\n\n" +
	"負傷したターゲットは 移動速度が低下し、重傷の\nターゲットは 行動不能になります。\n\n" +
	"重傷者はゲーム終了後に \\C[6]一定確率で死亡\\C[0] して\n死者としてカウントされます。";
	tipsTexts[9] = "\\Fs[22]" +
	"プレイヤーを取り押さえようと、教員たちが後から\n\\C[6]増援\\C[0] として突入することがあります。\n\n" +
	"状況によっては あっという間に取り囲まれて\nしまうため、\\C[6]最優先で対応\\C[0] する必要があります。\n\n" +
	"教員が吹き鳴らすホイッスルには 増援の到着を\n早める効果があるので、増援の突入に警戒しましょう。";
	tipsTexts[10] = "\\Fs[22]" +
	"校内の教師や生徒の数は 時間の経過とともに\n\\C[6]少しずつ避難\\C[0] して減っていきます。\n\n" +
	"職員室を攻撃して 教師たちを全員無力化することで、\n\\C[6]序盤の避難をわずかに遅らせる\\C[0] ことができます。"
	tipsTexts[11] = "\\Fs[22]" +
	"教員たちだけでなく、生徒たちも \\C[6]反撃\\C[0] を試みます。\n\n"+
	"反撃を試みる確率は 生徒の勇敢さに大きく左右され\nますが、\\C[6]プレイヤーが至近距離である リロード中\nである 生徒に背を向けている\\C[0] といった状況では\n反撃の確率が より高まります。\n\n"+
	"反撃のほとんどが \\C[6]男子生徒\\C[0] によるものなので、\n男子生徒を優先的に無力化すれば、不意の反撃を\n防ぐことができます。";
	tipsTexts[12] = "\\Fs[22]" +
	"プレイヤーが 銃や刃物などのダメージを受けると\n回復不能な \\C[6]致命的ダメージ\\C[0] を負ってしまいます。\n\n" +
	"受けた致命的ダメージは スタミナに赤色のゲージ\nで表示され、スタミナの最大値がその分だけ\n減ってしまいます。\n\n" +
	"ゲージ全体まで致命的なダメージを受けると\n死亡して \\C[6]ゲームオーバー\\C[0] になってしまいます。";
	tipsTexts[13] = "\\Fs[22]" +
	"\\C[6]東城優美\\C[0] はナイフを武器とするキャラクターです。\n\\C[4]スキル「廊下で鬼ごっこ！」\\C[0]を取得後、設定画面で\n東城優美モードをONにすることで 使用することが\nできます。\n\n" +
	"東城優美は 銃と投擲物を使うことができませんが、\n移動速度とスタミナ回復速度が非常に高く、\n\\C[6]最高性能の近接武器である\\C[6]「優美のナイフ」\\C[0]を\n使用することができます。\n\n" +
	"また、スタミナ最大時に Qキーを押すことで\nダッシュして攻撃する \\C[6]突撃攻撃\\C[0] を行うことができ、\n防弾装備を持った一部のターゲットを除いて\n\\C[6]一撃で殺害\\C[0] することができます。";
	tipsTexts[14] = "\\Fs[22]" +
	"\\C[6]ハードモード\\C[0] は、難易度がより高くなる要素の\n追加・変更などが加えられた \\C[6]高難易度\\C[0] のゲーム\nモードです。\n\n" +
	"設定画面で ハードモードをONにすることで\nこの難易度に挑戦することができます。";
	tipsTexts[15] = "\\Fs[22]" +
	"・命中率がダメージとクリティカル率に影響\n　（50％の場合、ダメージとクリティカル率は半減）\n\n・マップ移動でスタミナと命中率が回復しない\n\n" +
	"・射撃反動が増加\n　加えて 移動中の射撃に反動ペナルティ\n\n"+
	"・生徒の反撃率が上昇\n　プレイヤーへのダメージが増加\n　警察官などの特殊なエネミーが追加\n\n・所有弾数が有限\n\n・死体撃ちが発生";
	tipsTexts[16] = "\\Fs[22]" +
	"ハードモードでは、弾倉や散弾の数には限りがあり、\n弾倉内に装填されている残弾は \\C[6]リロード後も保存\\C[0]\nされるようになります。\n\n" +
	"リロードは予備の弾倉のうち、最も残弾が残った\n弾倉と交換されるようになります。";
	tipsTexts[17] = "\\Fs[22]" +
	"ハードモードでは、死亡したターゲットへ射撃が\n命中してしまう \\C[6]死体撃ち\\C[0] が発生するようになり、\n重傷と死亡の区別がより難しくなります。\n\n" +
	"射線上に複数のターゲットが存在する時は、\n生死に関係なく、最も近いターゲットへと自動的に\n狙いが定められるようになります。\n\n異なるターゲットを狙いたい場合は、\nFキーで \\C[6]ターゲットを切り替える\\C[0] ことができます。";
	tipsTexts[18] = "\\Fs[22]" +
	"一部のターゲットは、ボディアーマーや防弾盾\nといった \\C[6]防弾装備\\C[0] を持っていることがあります。\n\n" +
	"これらのターゲットは 銃撃ダメージをある程度耐える\nことができ、近接攻撃は無効化してしまいます。"

	//実績
	var achievementTexts = []; 
	var AddAchievementTexts = function (name, requirement, description, rewardType, reward, rewardId, difficulty, order){
		var texts = {
			name : name,
			requirement : requirement,
			description : description,
			rewardType : rewardType,
			reward : reward,
			rewardId : rewardId,
			difficulty : difficulty,
			order : order
		};
		achievementTexts.push(texts);
	};
	
	//テンプレート
	AddAchievementTexts(
		"実績名",
		"条件",
		"文章",
		"報酬タイプ", // 1 = SP 2 = 銃 3 = スキル
		"報酬",
		"報酬ID",
		1, //難易度
		0, //実績並び順
	);

	AddAchievementTexts(
		"だけど本音は",
		"学校警備員を射殺する",
		"『一人で死ね』でしょ？",
		1,
		1000,
		0,
		1,
		1
	);

	AddAchievementTexts(
		"もっとがんばりましょう",
		"取り押さえられる",
		"私は勉強が得意ではなかったけれど、\n人殺しも同じぐらい 得意とは言えなかった。",
		1,
		1000,
		0,
		1,
		2
	);

	AddAchievementTexts(
		"今日のために",
		"攻撃を完遂する",
		"みんなは今日のために死ぬけど、\n私は今日のために 生まれてきたんだ。",
		1,
		5000,
		0,
		2,
		3
	);

	AddAchievementTexts(
		"模範生",
		"射撃訓練を12秒以内にクリアする",
		"みんなを殺すためなら、\n私はどんな努力だって惜しまない。",
		3,
		"スキルの獲得",
		15,
		2,
		4
	);

	AddAchievementTexts(
		"銃社会？ なにそれ？",
		"学校を東城優美で攻撃する",
		"銃がなければ、ナイフを使えばいいじゃない。",
		1,
		5000,
		0,
		2,
		5
	);

	AddAchievementTexts(
		"化学の時間",
		"スキル ローンウルフ を取得する",
		"化学なんて 私には無縁なものだと思ってた。\n除光液から爆薬を製造するまでは。",
		1,
		1000,
		0,
		1,
		6
	);

	AddAchievementTexts(
		"ワタシの他に神はなし",
		"投擲物で自爆する",
		"神様なんていない。天国も地獄もない。\n自爆して得られるものなんて、私の人生と同じ 虚無だけだ。",
		1,
		1000,
		0,
		1,
		7
	);

	AddAchievementTexts(
		"病愛はセンパイを救う",
		"ヤンデレに殺害される",
		"愛するセンパイを守るためなら、\n銃を持った大量殺人犯だって止められる。",
		1,
		1000,
		0,
		1,
		8
	);

	AddAchievementTexts(
		"ヘイトレッド",
		"ヤンデレを殺害する",
		"愛することも、愛されることもない。\n私ができることはただ、憎み、憎まれることだけだ。",
		1,
		5000,
		0,
		2,
		9
	);

	AddAchievementTexts(
		"ぐちゃっ！",
		"ヤンデレを東城優美で殺害する",
		"うわっ、返り血浴びちゃった！ \nメンヘラサイコがうつっちゃう！ あはっはははっ！",
		1,
		10000,
		0,
		3,
		10
	);

	AddAchievementTexts(
		"モンスタースチューデント",
		"職員室の教師を一人残らず殺害する",
		"得意科目なんて一つもないけど。\n先生を射殺するという科目があれば、間違いなく私の得意科目だ。",
		1,
		5000,
		0,
		2,
		11
	);

	AddAchievementTexts(
		"弾丸より速く走ってみろ",
		"体育館で一度に１０人以上を殺害する",
		"どんなに足が速くたって、遅くたって。\n音速の銃弾を前には、みんな平等。",
		1,
		5000,
		0,
		2,
		12
	);

	AddAchievementTexts(
		"生きる理由",
		"図書室で一度に１０人以上を殺害する",
		"みんなが苦しむ姿を もっと見たいから。",
		1,
		5000,
		0,
		2,
		13
	);

	AddAchievementTexts(
		"昼食の時間",
		"食堂で一度に１０人以上を殺害する",
		"みんなにとって、私がいかに不必要な存在かを\n教えてくれる時間。",
		1,
		5000,
		0,
		2,
		14
	);

	AddAchievementTexts(
		"二匹の子ブタ",
		"警察官に射殺される",
		"銃を持った 二匹の子ブタたちは\nわるーい一匹オオカミを 射殺しましたとさ。おしまい。",
		1,
		1000,
		0,
		1,
		15
	);

	AddAchievementTexts(
		"全ての警官が",
		"警察官を射殺する",
		"全ての警官が ろくでなしだとは思わない。\n全ての警官が 役立たずの無能な ろくでなしだ。",
		1,
		10000,
		0,
		3,
		16
	);

	AddAchievementTexts(
		"武装教師",
		"校長先生に射殺される",
		"銃を持った生徒を止められるのは、銃を持った先生だけだ。",
		1,
		1000,
		0,
		1,
		17
	);

	AddAchievementTexts(
		"死んだ私の手から",
		"校長先生を射殺する",
		"校長の愛校心なんて、朝会のスピーチと同じぐらい\nちっぽけで無力だ。",
		1,
		10000,
		0,
		3,
		18
	);

	AddAchievementTexts(
		"世界新記録",
		"ノーマルモードで７０人を殺害する",
		"私ならもっと殺せる。私はそれを信じた。\nそしてそれは正しかった。",
		2,
		"銃の獲得",
		9, //BM15 Mod
		3,
		19
	);

	AddAchievementTexts(
		"ゴイング・ポスタル",
		"ショットガンで６０人を殺害する",
		"怒り狂い、大暴れ。学校、職場、公共施設。\n今日も、そして、これからも。",
		2,
		"銃の獲得",
		25, //S12 Mod
		3,
		20
	);

	AddAchievementTexts(
		"優等生",
		"ハードモードで３０人を殺害する",
		"テストで満点を取るのは凄いけど、\n学校で３０人を殺した私はもっと凄い。",
		2,
		"銃の獲得",
		16, //CZ11
		3,
		21
	);
	
	AddAchievementTexts(
		"簡単だった",
		"ハードモードで６０人を殺害する",
		"この人生で『簡単だった』と思えたことは、\n銃を手に入れた時ぐらいだ。",
		2,
		"銃の獲得",
		24, //AS3M
		4,
		22
	);

	AddAchievementTexts(
		"爆殺魔",
		"投擲物で合計５０人を殺害する",
		"神様のためでも 革命のためでもない。\n他の誰でもない この私のために。",
		1,
		5000,
		0,
		2,
		23
	);

	AddAchievementTexts(
		"ともだち百人",
		"合計１００人を殺害する",
		"間違いなく、ともだちを百人作るよりは 簡単だった。",
		1,
		5000,
		0,
		2,
		24
	);
	
	AddAchievementTexts(
		"千の風",
		"合計１０００人を殺害する",
		"私が死んでも みんなの喜びは続かない。\n誰かが みんなのことを憎むとき。そして 私の存在を知ったとき。\n私は生き返るのだから。",
		2,
		"銃の獲得",
		29, //A180 Mod
		4,
		25
	);

	//チュートリアル目標
	var tutorialTextA = [
		"目標 1/6: 空き缶を撃つ",
		"目標 2/6: サイドアームを装備する",
		"目標 3/6: 的に向かって10回撃つ",
		"目標 4/6: パイプ爆弾を3回使う",
		"目標 5/6: 近接武器を装備する",
		"目標 6/6: 近接武器を仕舞う"
	];
	var tutorialTextB = [
		"E で狙い Space で発砲する",
		"Q で サイドアーム に切り替える",
		"E で狙い Space で発砲する",
		"G で距離を調節して投げる",
		"3 で 近接武器 に切り替える",
		"1または2 で銃に切り替える"
	];

	//現在のマップの脱出座標を返す
	Game_Map.prototype.mapExit = function() {
		var exit = [];
		switch (this._mapId) {
			//屋外
			case 2:
				exit[0] = [20, 3];
				exit[1] = [44, 56];
				break;
			//小人数教室A
			case 3:
				exit[0] = [4, 12];
				exit[1] = [14, 12];
				break;
			//1年2組
			case 5:
				exit[0] = [14, 5];
				exit[1] = [14, 15];
				break;
			//2年1組
			case 6:
				exit[0] = [4, 12];
				exit[1] = [14, 12];
				break;
			//生徒相談室
			case 7:
				exit[0] = [4, 12];
				exit[1] = [14, 12];
				break;
			//非常階段
			case 8:
				exit[0] = [7, 6];
				exit[1] = [12, 9];
				break;
			//3F南側廊下
			case 11:
				exit[0] = [52, 8];
				exit[1] = [56, 2];
				break;
			//1F東側廊下
			case 12:
				exit[0] = [10, 2];
				exit[1] = [10, 50];
				break;
			//2F東側廊下
			case 13:
				exit[0] = [10, 2];
				exit[1] = [10, 50];
				break;
			//3F東側廊下
			case 14:
				exit[0] = [10, 2];
				exit[1] = [10, 50];
				break;
			//事務室
			case 15:
				exit[0] = [13, 10];
				break;
			//職員室
			case 16:
				exit[0] = [4, 11];
				exit[1] = [13, 11];
				break;
			//保健室
			case 17:
				exit[0] = [4, 10];
				exit[1] = [13, 10];
				break;
			//会議室
			case 18:
				exit[0] = [4, 11];
				exit[1] = [13, 11];
				break;
			//校長室
			case 19:
				exit[0] = [13, 11];
				break;
			//放送室・生徒会室
			case 20:
				exit[0] = [4, 11];
				exit[1] = [13, 11];
				break;
			//1Fトイレ
			case 21:
				exit[0] = [15, 8];
				break;
			//2Fトイレ
			case 22:
				exit[0] = [15, 8];
				break;
			//３年１組
			case 23:
				exit[0] = [14, 5];
				exit[1] = [14, 15];
				break;
			//１年３組
			case 24:
				exit[0] = [14, 5];
				exit[1] = [14, 15];
				break;
			//１年１組
			case 25:
				exit[0] = [14, 5];
				exit[1] = [14, 15];
				break;
			//２年２組
			case 27:
				exit[0] = [4, 12];
				exit[1] = [14, 12];
				break;
			//２年３組
			case 28:
				exit[0] = [4, 12];
				exit[1] = [14, 12];
				break;
			//２年空き教室
			case 29:
				exit[0] = [4, 12];
				exit[1] = [14, 12];
				break;
			//食堂
			case 30:
				exit[0] = [23, 3];
				exit[1] = [23, 18];
				break;
			//図書室
			case 31:
				exit[0] = [23, 17];
				break;
			//家庭科室
			case 32:
				exit[0] = [14, 5];
				exit[1] = [14, 15];
				break;
			//技術室
			case 33:
				exit[0] = [4, 11];
				exit[1] = [14, 11];
				break;
			//更衣室
			case 34:
				exit[0] = [9, 3];
				exit[1] = [9, 12];
				break;
			//プール
			case 35:
				exit[0] = [10, 22];
				break;
			//美術室
			case 36:
				exit[0] = [4, 12];
				exit[1] = [14, 12];
				break;
			//音楽室
			case 37:
				exit[0] = [14, 5];
				exit[1] = [14, 15];
				break;
			//コンピュータ室
			case 38:
				exit[0] = [14, 5];
				exit[1] = [14, 15];
				break;
			//理科室
			case 39:
				exit[0] = [14, 5];
				exit[1] = [14, 15];
				break;
			//３年空き教室
			case 40:
				exit[0] = [14, 5];
				exit[1] = [14, 15];
				break;
			//体育館
			case 44:
				exit[0] = [10, 22];
				break;
			//教材室
			case 46:
				exit[0] = [4, 12];
				exit[1] = [14, 12];
				break;
			//多目的室
			case 47:
				exit[0] = [23, 17];
				break;
			//少人数教室Ｂ
			case 48:
				exit[0] = [4, 12];
				exit[1] = [14, 12];
				break;
			//１年空き教室
			case 51:
				exit[0] = [14, 5];
				exit[1] = [14, 15];
				break;
			//3Fトイレ
			case 54:
				exit[0] = [15, 8];
				break;
			//３年２組
			case 55:
				exit[0] = [14, 5];
				exit[1] = [14, 15];
				break;
			//３年３組
			case 56:
				exit[0] = [14, 5];
				exit[1] = [14, 15];
				break;
			//1F玄関
			case 59:
				exit[0] = [0, 13];
				exit[1] = [51, 2];
				exit[2] = [51, 22];
				exit[3] = [57, 12];
				break;
			//1F階段
			case 60:
				exit[0] = [0, 12];
				exit[1] = [34, 5];
				exit[2] = [42, 2];
				exit[3] = [48, 13];
				break;
			//2F南側廊下
			case 61:
				exit[0] = [2, 12];
				exit[1] = [58, 12];
				break;
			//2F階段
			case 62:
				exit[0] = [0, 12];
				exit[1] = [34, 5];
				exit[2] = [38, 8];
				exit[3] = [42, 2];
				break;
			//屋上
			case 63:
				exit[0] = [, ];
				break;
		}
		return exit;
	}

	//最も近い脱出地点を返す
	Game_Character.prototype.nearestExit = function() {
		var exits = $gameMap.mapExit();
		if (exits.length > 1) {

			var distance = [];
			var exit = [];
			var x = this._x;
			var y = this._y;
			var ex = 0;
			var ey = 0;

			//距離を計算
			for (var i = 0; exits.length > i; i++) {
				exit = exits[i];
				ex = exit[0];
				ey = exit[1];
				distance[i] = $gameMap.distance(x, y, ex, ey);
			}
			//最小値の座標を返す
			return exits[distance.indexOf(Math.min(...distance))];
			
		}else{
			return exits[0];
		}
	}
	Game_Character.prototype.nearestExitX = function() {
		var exit = this.nearestExit();
		return exit[0];
	}
	Game_Character.prototype.nearestExitY = function() {
		var exit = this.nearestExit();
		return exit[1];
	}

	//タイトル画面編集

	var titleTimer = 0;
	var titleShooterOpacity = 0;
	var title2Opacity = 0;

	Scene_Title.prototype.initialize = function() {
		Scene_Base.prototype.initialize.call(this);
	};
	Scene_Title.prototype.createBackground = function() {
		this._backSprite1 = new Sprite(ImageManager.loadTitle1($dataSystem.title1Name));
		this._backSprite2 = new Sprite(ImageManager.loadTitle2($dataSystem.title2Name));
		this.addChild(this._backSprite1);
		this.addChild(this._backSprite2);

		this._backSprite3 = new Sprite(ImageManager.loadTitle1("titleShooter"));
		this._backSprite4 = new Sprite(ImageManager.loadTitle1("title2"));
		this._backSprite5 = new Sprite(ImageManager.loadTitle1("titleName"));

		this._backSprite3.opacity = titleShooterOpacity;
		this._backSprite4.opacity = title2Opacity;
		this._backSprite5.opacity = 0;

		this.addChild(this._backSprite3);
		this.addChild(this._backSprite4);
		this.addChild(this._backSprite5);
	};
	Scene_Title.prototype.createForeground = function() {
		this._gameTitleSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
		this.addChild(this._gameTitleSprite);
		if ($dataSystem.optDrawTitle) {
			this.drawGameTitle();
		}
	};
	Scene_Title.prototype.update = function() {
		if (!this.isBusy()) {
			this._commandWindow.open();
		}
		Scene_Base.prototype.update.call(this);
		if (this._backSprite5.opacity < 255) { //タイトルネーム
			this._backSprite5.opacity += 4;
		}
		if (titleTimer < 600) {
			if (titleTimer >= 60) { //キャラクター
				if (this._backSprite3.opacity < 255) {
					titleShooterOpacity += 1.5;
					this._backSprite3.opacity = titleShooterOpacity;
				}
			}
			if (titleTimer > 180 && title2Opacity < 255) { //背景B
				title2Opacity += 1;
				this._backSprite4.opacity = title2Opacity;
			}
			titleTimer++;
		}
	};

	Window_TitleCommand.prototype.initialize = function() {
		Window_Command.prototype.initialize.call(this, 0, 0);
		this.updatePlacement();
		this.openness = 0;
		this.selectLast();
		this.opacity = 0;
	};
	Window_TitleCommand.prototype.standardBackOpacity = function(code, textState) {
        return 100;
    };
	Window_TitleCommand.prototype.windowWidth = function() {
		return 500;
	};
	Window_TitleCommand.prototype.lineHeight = function() {
		return 50;
	};
	Window_TitleCommand.prototype.standardFontSize = function() {
		return 40;
	};
	Window_TitleCommand.prototype.maxCols = function() {
		return 3;
	};
	Window_TitleCommand.prototype.updatePlacement = function() {
		this.x = (Graphics.boxWidth - this.width - 14);
		this.y = Graphics.boxHeight - this.height - 44;
	};
	Window_TitleCommand.prototype.loadWindowskin = function() {
		this.windowskin = ImageManager.loadSystem('Window');
	};

	//ウィンドウ透明度を変更。
	Window_Base.prototype.standardBackOpacity = function(code, textState) {
		return 255;
	};

	//ウィンドウカーソル点滅の変更
	Window.prototype._updateCursor = function() {
		var blinkCount = this._animationCount % 80;
		var cursorOpacity = this.contentsOpacity;
		if (this.active) {
			if (blinkCount < 40) {
				cursorOpacity -= blinkCount * 4;
			} else {
				cursorOpacity -= (80 - blinkCount) * 4;
			}
		}
		this._windowCursorSprite.alpha = cursorOpacity / 255;
		this._windowCursorSprite.visible = this.isOpen();
	};

	//文字表示速度の設定
	Window_Message.prototype.updateShowFast = function() {
		if (this.isTriggered()) {
			this._showFast = true;
		}else{
			this.startWait(1);
		}
	};
	Window_Message.prototype.updateWait = function() {
		if (this._waitCount > 0) {
			if (this.isTriggered()) {
				this._waitCount = 0;
				return false;
			}else{
				this._waitCount--;
				return true;
			}
		} else {
			return false;
		}
	};

	Game_Event.prototype.initialize = function(mapId, eventId) {
		Game_Character.prototype.initialize.call(this);
		this._mapId = mapId;
		this._eventId = eventId;
		this._downTimer = 0;
		this._stuckTimes = 0;
		this._stuckX = 0;
		this._stuckY = 0;
		this._repeatMove = 0;
		this._shootingWait = 0;
		this._getShotTimer = 0;
		this._getShotTimer = 0;
		this._actionWait = 0;
		this.locate(this.event().x, this.event().y);
		this.refresh();
	};
	Game_Event.prototype.update = function() {
		Game_Character.prototype.update.call(this);
		this.checkEventTriggerAuto();
		this.updateParallel();
		if (this._getShotTimer > 0) this._getShotTimer--;
	};

	//マップ移動ルートの保存
	Game_Map.prototype.savePlayerMoveRoute = function() {
		playerMoveRoute.push(this._mapId);
	}
	//マップ移動ルートの初期化
	Game_Map.prototype.resetPlayerMoveRoute = function() {
		playerMoveRoute = [2];
	}
	//マップ移動ルートを返す
	Game_Map.prototype.playerMoveRoute = function() {
		return playerMoveRoute;
	}
	//増援済みマップリストのリセット
	Game_Map.prototype.resetReinforcedMapList = function() {
		reinforcedMapList = [];
	}
	//入室済みのマップか否か
	Game_Map.prototype.alreadyEntered = function(mapId = this._mapId) {
		for (var i = 0; i < playerMoveRoute.length; i++) {
			if (playerMoveRoute[i] == mapId) return true;
		}
		return false;
	}

	//増援処理
	Game_Map.prototype.reinforcement = function() {
		if ($gameVariables._data[13] <= 0) { //増援タイマー

			var reinforcement = this.canReinforcement();

			//プレイヤーがリージョン位置に存在しない、増援がメタ数以下、かつ増援が未登場の時
			if (reinforcement != false) {

				//増援タイマーをリセット
				var randomTimer = 20 + Math.floor(Math.random() * 11);
				var multiplier = $gameVariables._data[75];
				var num = $gameSwitches.value(40) ? 5 : 10;
				$gameVariables._data[13] = randomTimer + (num * multiplier);
				$gameVariables._data[75] += 1;

				//増援スキップをリセット
				$gameVariables._data[76].reinforcedNumber = 0;

				//増援内容を設定
				this.makeReinforcementsList(reinforcement);

				//増援直後タイマーを作動
				$gameVariables._data[76].timerAfterEntering = 60;
				$gameSwitches.setValue(56,true);

				$gameVariables._data[12] = 4;
				reinforcedMapList.push(this._mapId);
				AudioManager.playSe({"name":"Police_rushed","volume":90,"pitch":100,"pan":0});

			}else{
				var randomTimer = 1 + Math.floor(Math.random() * 11);
				$gameVariables._data[13] = randomTimer;
			}
		
		}else{
			if ($gameMap.existFemaleTeacher()) {
				$gameVariables._data[13] -= $gameSwitches.value(40) ? 3 : 2;
			}else{
				$gameVariables._data[13] -= 1;
			}
		}
	}

	//増援可能な状態か
	Game_Map.prototype.canReinforcement = function() {

		//リージョン
		if ($gamePlayer.regionId() == 2 || $gamePlayer.regionId() == 3) {
			return false;
		}

		//増援済み
		if (reinforcedMapList.indexOf(this._mapId) != -1) {
			return false;
		}

		//警察官またはその他
		if (this.canPoliceReinforcement()) {
			return "police";
		}else if (Number($dataMap.meta.reinforcement) != 0) {
			return "none";
		}

		return false;

	}

	//警察官登場可能か
	Game_Map.prototype.canPoliceReinforcement = function() {

		//ゲーム難易度
		if (!$gameSwitches.value(40)) {
			return false;
		}

		//ステータス
		if ($gameVariables._data[76].maleOfficer.status >= 2 || $gameVariables._data[76].femaleOfficer.status >= 2) {
			return false;
		}

		//マップ
		if (!this.isSpaciousMap() && this._mapId != 59 && this._mapId != 60 && this._mapId != 61 && this._mapId != 62) {
			return false;
		}

		//制限時間
		var time = Math.floor($gameTimer._frames / 60);
		if (time >= 120) {
			return false;
		}

		return true;

	}

	//食堂・図書室・多目的室・体育館・プールかどうか
	Game_Map.prototype.isSpaciousMap = function() {
		switch ($gameMap._mapId) {
			case 30: //食堂
			case 31: //図書室
			case 35: //プール
			case 44: //体育館
			case 47: //多目的室
				return true;
		}
		return false;
	}

	//増援リストを作る
	Game_Map.prototype.makeReinforcementsList = function(type) {

		var canEnterNumber = Number($dataMap.meta.reinforcement);
		var reinforcementsList = [];

		if (type == "police" && $gameSwitches.value(40)) {

			reinforcementsList[0] = "policeman";
			reinforcementsList[1] = "w_policeman";
			$gameVariables._data[76].maleOfficer.status = 2;
			$gameVariables._data[76].femaleOfficer.status = 2;

		} else if (Math.floor(Math.random() * 2) && $gameVariables._data[76].yandere.status == 0 && $gameSwitches.value(40)) { //50％の確率
			
			reinforcementsList[0] = "yandere";
			$gameVariables._data[76].yandere.status = 2;
		
		} else if ($gameVariables._data[76].principal.status == 0 && $gameSwitches.value(40)) { //ヤンデレ後は必ず登場
			
			reinforcementsList[0] = "principal";
			if (canEnterNumber >= 2) reinforcementsList[1] = "shield";
			$gameVariables._data[76].principal.status = 2;

		} else if (canEnterNumber >= 2 && $gameSwitches.value(40)) { 

			reinforcementsList[0] = "shield";
			reinforcementsList[1] = "teacher";
			if (canEnterNumber >= 3) reinforcementsList[2] = "teacher";
			if (canEnterNumber >= 4 && $gameVariables._data[2] >= 30) reinforcementsList[3] = "teacher"; //30人以上殺害時は可能なら4人増援
		
		} else {

			var MaxReinforcements = $gameVariables._data[2] >= 10 ? 2 : 1; //10人以上殺害時は2人増援
			for (var i = 0; i < canEnterNumber; i++) {
				reinforcementsList[i] = "teacher";
				if (reinforcementsList.length == MaxReinforcements) break;
			}

		}

		$gameVariables._data[76].reinforcementsList = reinforcementsList;

	}

	//エネミーデータの初期化 0:非出現 1:通常出現 2:増援出現 3:重傷 4:死亡
	Game_Map.prototype.initializeEnemyData = function() {

		$gameVariables._data[76] = {
			timerAfterEntering : 0,
			reinforcementsList : [],
			reinforcedNumber : 0
		};

		//ヤンデレ
		$gameVariables._data[76].yandere = {
			hp : 200,
			status : 0,
			speed : 0
		};

		//男性警官
		$gameVariables._data[76].maleOfficer = {
			hp : 100,
			status : 0,
			shield : 50,
			isShooting : false,
			id : 0
		};

		//女性警官
		$gameVariables._data[76].femaleOfficer = {
			hp : 100,
			status : 0,
			shield : 50,
			isShooting : false,
			id : 0
		};

		//校長
		$gameVariables._data[76].principal = {
			hp : 100,
			status : 0,
			isShooting : false,
			keepDistance : 2,
			keepCounter : 0,
			countStart : false,
			mapId : 0
		};

	}
	//エネミーデータの変更
	Game_Map.prototype.setEnemyData = function(name, hp, shield) {

		var status = 0;

		if (hp <= 0) {
			status = 4;
		}else if (hp < 50) {
			status = 3;
		}

		switch (name) {
			case "yandere":
				$gameVariables._data[76].yandere.hp = hp;
				if (status != 0) $gameVariables._data[76].yandere.status = status;
				break;
			case "policeman":
				$gameVariables._data[76].maleOfficer.hp = hp;
				$gameVariables._data[76].maleOfficer.shield = shield;
				if (status != 0) $gameVariables._data[76].maleOfficer.status = status;
				break;
			case "w_policeman":
				$gameVariables._data[76].femaleOfficer.hp = hp;
				$gameVariables._data[76].femaleOfficer.shield = shield;
				if (status != 0) $gameVariables._data[76].femaleOfficer.status = status;
				break;
			case "principal":
				$gameVariables._data[76].principal.hp = hp;
				if (status != 0) $gameVariables._data[76].principal.status = status;
				break;
		}

	}

	//増援イベントの初期化
	Game_Event.prototype.initializeReinforcement = function() {

		//初期化済み（ロード）の場合
		if (this.isInitialized()) {

			this._characterName = $gameVariables._data[1][this._mapId][this._eventId].name;
			this._characterIndex = $gameVariables._data[1][this._mapId][this._eventId].index;
			this._priorityType = 1;
			this._originalPattern = 1;
			this._through = false;

		//初期化
		}else{

			var listLength = $gameVariables._data[76].reinforcementsList.length;
			var canEnterNumber = Number($dataMap.meta.reinforcement);
			var skip = $gameVariables._data[76].reinforcedNumber;

			//増援位置をずらすためのスキップ
			if (listLength < canEnterNumber - skip && Math.floor(Math.random() * 2)) {
				$gameVariables._data[76].reinforcedNumber += 1;
				return;
			}

			if ($gameVariables._data[76].reinforcementsList[0]) {

				var name = $gameVariables._data[76].reinforcementsList[0];
				$gameVariables._data[76].reinforcementsList.shift();
				$gameVariables._data[76].reinforcedNumber += 1;

				var index = name == "teacher" ? Math.floor(Math.random() * 3) : 0;
				$gameMap._events[this._eventId].initializeStatus(name, index);

			}

		}

	}
	//イベントステータスを初期化（増援イベントを含む）
	Game_Event.prototype.initializeStatus = function(reinforcementName, index) {

		var name = reinforcementName ? reinforcementName : this._characterName;
		var mapId = this._mapId;
		var eventId = this._eventId;

		if (!$gameVariables._data[1]) $gameVariables._data[1] = [];
		if (!$gameVariables._data[1][mapId]) $gameVariables._data[1][mapId] = [];
		if (!$gameVariables._data[1][mapId][eventId]) {

			var hp = 100;
			var shield = 0;
			var status = "run";
			var courage = Math.floor(Math.random() * 101);
			var speed = 3.8 + (Math.floor(Math.random() * 11) / 100);
			if ($gameSwitches.value(40)) speed += 0.1;
			this._isNPC = true;

			//エネミーのステータス設定
			switch (name) {
				case "yandere":
					hp = 200;
					speed = $gameSwitches.value(40) ? 4.8 : 4.6;
					status = "fight";
					break;
				case "policeman":
					shield = 50;
					speed = 4.1;
					status = "fight";
					break;
				case "w_policeman":
					shield = 50;
					speed = 4;
					status = "fight";
					break;
				case "principal":
					speed = 3.8;
					status = "fight";
					break;
				case "shield":
					speed = 3.7;
					shield = 50;
					status = "fight";
					break;
				case "teacher":
					if (!$gameSwitches.value(40)) speed = 3.8;
					status = "fight";
					break;
			}

			$gameVariables._data[1][mapId][eventId] = {
				id : eventId,
				name : name,
				targetId : 0,
				status : status,
				nextStatus : "none",
				feared : false,
				hp : hp,
				wound : 0,
				lastDamage : 0,
				downTimer : 0,
				courage : courage,
				speed : speed,
				shield : shield
			};

			//増援イベントの場合の初期化
			if (reinforcementName) {
				$gameVariables._data[1][mapId][eventId].isReinforcment = true;
				$gameVariables._data[1][mapId][eventId].index = index;
				this._characterName = reinforcementName;
				this._characterIndex = index;
				this._priorityType = 1;
				this._originalPattern = 1;
				this._through = false;
			} else {
				$gameVariables._data[1][mapId][eventId].isReinforcment = false;
				$gameVariables._data[1][mapId][eventId].index = this._characterIndex;
			}

		}

	};

	//イベントが初期化されているかどうか
	Game_Event.prototype.isInitialized = function() {
		if ($gameVariables._data[1]) {
			if ($gameVariables._data[1][this._mapId]) {
				if ($gameVariables._data[1][this._mapId][this._eventId]) return true;
			}
		}
		return false;
	}
	//プレイヤーの脅威度
	Game_Event.prototype.riskLevel = function() {

		var risk = 0;
		var courage = $gameVariables._data[1][$gameMap._mapId][this._eventId].courage; 
		var distance = $gameMap.distance($gamePlayer._x, $gamePlayer._y, this._x, this._y);

		if (distance == 1) { //プレイヤーと接触状態ならリスク100
			risk = 100;
		}else if (this.isBehindPlayer()) {
			risk = 100 - (distance * (courage / 5)); //距離に応じて半減、勇敢100なら無条件でリスク0。
		}else{
			if ($gamePlayer._direction == 2 || $gamePlayer._direction == 8) { //射線からの距離を計る
				var distanceAimLine = Math.abs($gamePlayer._x - this._x);
			}else{
				var distanceAimLine = Math.abs($gamePlayer._y - this._y);
			}
			if (distanceAimLine == 0) { //射線内は勇敢に関係なくリスク100
				risk = 100;
			}else if (distanceAimLine == 1) { //射線からの距離1の場合、距離に応じてリスクが低下
				risk = 100 - (distance * (courage / 20));
			}else{ //それ以外は射線とプレイヤーからの距離に応じてリスクが低下
				risk = 100 - (distanceAimLine * (courage / 10)) - (distance * (courage / 10));
			}
		}

		if (risk < 0) risk = 0;
		return Math.floor(risk);
	}
	//初期ステータス（逃げる）から別のステータスへの以降、できなければ継続
	Game_Event.prototype.selectAction = function() {

		var id = this._eventId;
		var status = $gameVariables._data[1][this._mapId][id].status;

		if (status != "run") {
			return;
		}

		var courage = $gameVariables._data[1][this._mapId][id].courage;
		var riskLevel = this.riskLevel();
		var px = $gamePlayer._x;
		var py = $gamePlayer._y;
		var ex = this._x;
		var ey = this._y;

		var distance = $gameMap.distance(px, py, ex, ey);
		var probability = 0;
		var playerIsReloading = $gameSwitches.value(3);

		//開始１分以内、かつ射撃済みでないなら 50% の確率で行動を停止（停止中）
		if (false && !$gameSwitches.value(64) && !this.feared && Math.floor(Math.random() * 2) == 0) {
			var time = Math.floor($gameTimer._frames / 60);
			if (time > 240) { 
				$gameVariables._data[1][this._mapId][id].status = "caution";
				return;
			}
		}
		if (!this.feared) this.feared = true;

		//脱出できる場所にイベントが存在する時、避難する。
		if ($gameMap.regionId(ex, ey) == 2){
			$gameVariables._data[1][this._mapId][id].status = "escaped";
			return;
		}

		//反撃。リスク50以上
		if (this._characterName == "male_students" && this.isNearPlayer() && this._characterIndex != 2 && riskLevel >= 50) {

			probability = Math.round(courage / 10); //勇敢さにより反撃率は最大10%
			if (!$gameSwitches.value(40)) probability = probability / 2; //ノーマルモードなら5%
			
			var num = 1; //反撃率乗数
			if (distance <= 2) num += 1; //距離2以内
			if (playerIsReloading) num += 1; //リロード中
			if (this.isBehindPlayer()) num += 1; //プレイヤーの背後
			probability = probability * num;

			if (Math.floor(Math.random() * 101) < probability){ //反撃実行
				$gameVariables._data[1][this._mapId][id].status = "fight";
				return;
			}

		}

		//臆病なほど、リスクが高いほど隠れる
		probability = 50 - Math.round(courage / 2);
		if (riskLevel >= 50) probability = 50;
		if (this.isCanHide() && Math.floor(Math.random() * 101) <= probability && this._characterIndex != 2) {
			$gameVariables._data[1][this._mapId][id].status = "hide";
			return;
		}

		//死んだふり。リスク50以下
		if (this._characterIndex != 2 && this._characterName != "w_teacher" && riskLevel < 50){ //体操着生徒と女性教師は死んだふりをしない

			var deadEvents = [];

			$gameVariables._data[1][this._mapId].forEach((event) => {
				if (event) {
					if (event.hp <= 0) {
						deadEvents.push(event);
					}
				}
			});

			if (deadEvents) {

				var nearestDeadEventId = 0;
				var distance2 = distance;
				var x = 0;
				var y = 0;

				//プレイヤーより近い、かつ、最も近い死亡したイベントを探す
				for (var i = 0; i < deadEvents.length; i++) {
					
					x = $gameMap._events[deadEvents[i].id]._x;
					y = $gameMap._events[deadEvents[i].id]._y;

					if ($gameMap.distance(ex, ey, x, y) < distance2 && deadEvents[i].status == "dead"){
						nearestDeadEventId = deadEvents[i].id;
						distance2 = $gameMap.distance(ex, ey, x, y);
					}

				}
				//1％ の確率で死んだふり
				if (nearestDeadEventId && Math.floor(Math.random() * 101) < 1) {
					$gameVariables._data[1][this._mapId][id].status = "playDead";
					$gameVariables._data[1][this._mapId][id].nextStatus = "playDead";
					$gameVariables._data[1][this._mapId][id].targetId = nearestDeadEventId;
					return;
				}

			}

		}

		//リスクに関係なく、最大10％の確率で他のイベントに追従し、行動を合わせる。臆病なほど確率が高い。
		probability = 10 - Math.round(courage / 10);
		if (Math.floor(Math.random() * 101) <= probability && this._characterIndex != 2){

			var nearEvents = [];
			var x = 0;
			var y = 0;

			//プレイヤーより近い、かつ、避難済み・反撃・死んだふり、フォロー状態でないイベントに追従
			for (var i = 0; i < $gameVariables._data[1][this._mapId].length; i++) {

				var event = $gameVariables._data[1][this._mapId][i];

				if (!event) continue;
				if (event.hp != 100 || event.status == "escaped" || event.status == "fight" || event.status == "playDead" || event.status == "follow") continue;

				x = $gameMap._events[event.id]._x;
				y = $gameMap._events[event.id]._y;

				if ($gameMap.distance(ex, ey, x, y) < distance && $gameMap.distance(ex, ey, x, y) <= this.searchLimit()) nearEvents.push(event.id);

			}

			var targetId = nearEvents[Math.floor(Math.random() * nearEvents.length)];

			if (targetId) {
				$gameVariables._data[1][this._mapId][id].status = "follow";
				$gameVariables._data[1][this._mapId][id].targetId = targetId;
				return;
			}

		}

		//脱出。リスク80以下
		var exit = $gameMap._events[id].nearestExit();
		if (exit && riskLevel < 80) {

			var exitDistance = $gameMap.distance(ex, ey, exit[0], exit[1]);

			//避難可能距離 24 未満でないなら実行しない
			//確率は勇敢度に応じて最大10％
			//プレイヤーの背後なら２倍　出口までの距離がプレイヤーの距離より近いなら更に４倍
			//最期に脱出ルートまでの距離の値の４分の１を引く（２４なら６、１２なら３）

			if (exitDistance <= this.searchLimit()) {

				var probability = courage / 10;
				if (this.isBehindPlayer()) probability * 2;
				if (exitDistance < distance) probability * 4;
				probability = probability - (exitDistance / 4);

			}else{ 
				return;
			}

			if (Math.floor(Math.random() * 101) <= probability) {

				if (exit) {
	
					var exitDistance = $gameMap.distance(ex, ey, exit[0], exit[1]);
	
					if (exitDistance < this.searchLimit()) {
						$gameVariables._data[1][this._mapId][id].status = "escape";
						return;
					}
	
				}
	
			}
		}

	} //selectAction()

	//現在のステータスに合わせたグラフィックへの変更と行動の実行、また別ステータスへの以降または継続
	Game_Event.prototype.executeAction = function() {

		var id = this._eventId;
		var targetId = $gameVariables._data[1][this._mapId][id].targetId;
		var status = $gameVariables._data[1][this._mapId][id].status;
		var nextStatus = $gameVariables._data[1][this._mapId][id].nextStatus;
		var hp = $gameVariables._data[1][this._mapId][id].hp;
		var courage = $gameVariables._data[1][this._mapId][id].courage;
		var riskLevel = this.riskLevel();

		var px = $gamePlayer._x;
		var py = $gamePlayer._y;
		var ex = this._x;
		var ey = this._y;

		this.setDamageStatus(); //体力に応じてステータスを変更

		//プレイヤーと重なってしまった場合、移動する
		if (ex == px && ey == py && hp > 0) {
			this.forceMoveRoute({"list":[{"code":9},{"code":0}],"repeat":false,"skippable":true,"wait":false});
			return;
		}

		switch (status) {
		case "dead":
			this.changeEventStatus(status);
			this.setDamagedImage();
			this.forceMoveRoute({"list":[{"code":0}],"repeat":false,"skippable":true,"wait":false});
			break;
		case "seriousWound":
			this.changeEventStatus(status);
			this.setDamagedImage();
			if (hp >= 25 && Math.floor(Math.random() * 8) == 0) { //はいずり
				this.forceMoveRoute({"list":[{"code":9},{"code":0}],"repeat":false,"skippable":true,"wait":false});
			}else{
				this.forceMoveRoute({"list":[{"code":0}],"repeat":false,"skippable":true,"wait":false});
			}
			break;
		case "escaped":
			this.changeEventStatus(status);
			this.forceMoveRoute({"list":[{"code":0}],"repeat":false,"skippable":true,"wait":false});
			break;
		case "fight":
			this.changeEventStatus(status);
			if (this._characterName == "male_students") { //反撃グラに変更
				this.setImage("male_students", 3); 
			}
			if (this._getShotTimer > 0 && this._characterName == "male_students") { //被弾時に一定の確率で反撃を中断する（遠いほど確率が高まる）
				this._getShotTimer = 0;
				var probability = $gameSwitches.value(40) ? $gameMap.distance(px, py, ex, ey) * 10 : $gameMap.distance(px, py, ex, ey) * 20;
				if (probability >= Math.floor(Math.random() * 101)) {
					this.setRunImage();
					$gameVariables._data[1][this._mapId][id].status = "run";
					break;	
				}
			}
			if (Math.floor(Math.random() * 101) <= Math.abs((courage - 100) / 10) && this._characterName == "male_students") { //勇敢でない生徒ほど反撃を中断する。最大10％
				this.setRunImage();
				$gameVariables._data[1][this._mapId][id].status = "run";
				break;	
			}
			this.forceMoveRoute({"list":[{"code":45, "parameters":["this.moveStraight(this.findDirectionTo($gamePlayer.x, $gamePlayer.y))"]},{"code":0}],"repeat":true,"skippable":true,"wait":false});
			this.attackPlayer();
			break;
		case "hide":
			this.changeEventStatus(status);
			if (this.isInTargetList() && !this.isCover()) { //射線内かつ障害物がない時は逃げる
				this.setRunImage();
				$gameVariables._data[1][this._mapId][id].status = "run";
				break;	
			}
			//近くに run escape fight ステータスのイベントが存在するなら、移動を妨害しないよう run に切り替える
			var nearEvents = this.checkNearEvents();
			if (nearEvents.length > 0) {
				var nearEventStatus = "";
				for (var i = 0; i < nearEvents.length; i++) {
					nearEventStatus = $gameVariables._data[1][this._mapId][nearEvents[i]].status;
					if (nearEventStatus == "run" || nearEventStatus == "escape" || nearEventStatus == "fight") {
						this.setRunImage();
						$gameVariables._data[1][this._mapId][id].status = "run";
						return;					
					}
				}
			}
			//近くにプレイヤー、10％の確率、もしくはリスク50以下で解除
			if (this.isNearPlayer() || Math.floor(Math.random() * 10) == 0 || riskLevel < 50) {
				this.setRunImage();
				$gameVariables._data[1][this._mapId][id].status = "run";
				break;
			}
			this.setHideImage();
			this.forceMoveRoute({"list":[{"code":25},{"code":0}],"repeat":false,"skippable":true,"wait":false});
			break;
		case "playDead":
			if (nextStatus == "down") { //ダウンタイマー動作中なら死んだふりを実行しない
				this.changeEventStatus("run");
				this.setRunImage();
				$gameVariables._data[1][this._mapId][id].status = "run";
			}else if (nextStatus == "playDead") {
				this.changeEventStatus("run");
				var target = $gameMap._events[targetId];
				var distance = $gameMap.distance(ex, ey, target._x, target._y);
				if (this.isInTargetList() || this.isStuck()) { //射線内もしくはスタック状態なら逃走を優先
					this.setRunImage();
					$gameVariables._data[1][this._mapId][id].status = "run";
					$gameVariables._data[1][this._mapId][id].nextStatus = "none";
					break;		
				}
				if (distance <= 2) { //死亡イベントが距離２未満なら、死んだふりを実行。重傷時は重傷状態に移行

					if (hp >= 50) {
						this.setPlayDeadImage();
						this.forceMoveRoute({
							"list":[{"code":0}],
							"repeat":false,"skippable":true,"wait":false
						});
						$gameVariables._data[1][this._mapId][id].nextStatus = "none";
					}else{
						this.setDamagedImage();
						this.forceMoveRoute({
							"list":[{"code":0}],
							"repeat":false,"skippable":true,"wait":false
						});
						$gameVariables._data[1][this._mapId][id].status = "seriousWound";
						$gameVariables._data[1][this._mapId][id].nextStatus = "none";
					}

				}else{
					this.forceMoveRoute({
						"list":[{"code":45, "parameters":["this.moveStraight(this.findDirectionTo($gameMap._events[this._eventId].targetX(), $gameMap._events[this._eventId].targetY()))"]},{"code":0}],
						"repeat":true,"skippable":true,"wait":false
					});
				}

			}else if (nextStatus == "none") {
				this.changeEventStatus("playDead");
				var exit = $gameMap._events[id].nearestExit();
				var distance = $gameMap.distance(px, py, ex, ey);
				var exitDistance = $gameMap.distance(ex, ey, exit[0], exit[1]);
				//プレイヤーより近い出口が距離 24 未満の時、10%の確率で脱出を試みる
				if (exitDistance < distance && exitDistance <= this.searchLimit() && Math.floor(Math.random() * 10) == 0) {
					this.setRunImage();
					$gameVariables._data[1][this._mapId][id].status = "escape";
					break;
				}
				//死んだふりを実行する
				this.setPlayDeadImage();
				this.forceMoveRoute({
					"list":[{"code":0}],
					"repeat":false,"skippable":true,"wait":false
				});
			}
			break;
		case "follow":
			this.changeEventStatus(status);
			if (this.isNearPlayer() || this.isStuck()) { //射線内もしくはスタック状態なら逃走を優先
				$gameVariables._data[1][this._mapId][id].status = "run";
				break;
			}
			var target = $gameMap._events[targetId];
			var distance = $gameMap.distance(ex, ey, target._x, target._y);
			var targetStatus = $gameVariables._data[1][this._mapId][targetId].status;
			if (this.isCanFollowTarget(targetId)) {
				if (targetStatus == "fight") {
					$gameVariables._data[1][this._mapId][id].status = "fight";
					break;
				}else if (targetStatus == "hide" && distance <= 2) {
					$gameVariables._data[1][this._mapId][id].status = "hide";
					break;
				}
				if (Math.floor(Math.random() * 2) == 0) { //スタック対策のため 50% の確率でランダム移動
					this.forceMoveRoute({
						"list":[{"code":9},{"code":0}],
						"repeat":true,"skippable":true,"wait":false
					});
				}else{
					this.forceMoveRoute({ //追従する
						"list":[{"code":45, "parameters":["this.moveStraight(this.findDirectionTo($gameMap._events[this._eventId].targetX(), $gameMap._events[this._eventId].targetY()))"]},{"code":0}],
						"repeat":true,"skippable":true,"wait":false
					});
				}
			}else{
				$gameVariables._data[1][this._mapId][id].status = "run";
			}
			break;
		case "escape":
			this.changeEventStatus(status);
			if ($gameMap.regionId(ex, ey) == 2) { //脱出地点なら脱出とする
				$gameVariables._data[1][this._mapId][id].status = "escaped";
				break;
			}else if (this.isNearPlayer() || this.isStuck() || $gameMap._mapId == 2) { //近くにプレイヤー、もしくはスタック、屋外マップで逃走に切り替える
				$gameVariables._data[1][this._mapId][id].status = "run";
				break;
			}
			this.forceMoveRoute({
				"list":[{"code":45, "parameters":["this.moveStraight(this.findDirectionTo($gameMap._events[this._eventId].nearestExitX(), $gameMap._events[this._eventId].nearestExitY()))"]},{"code":0}],
				"repeat":true,"skippable":true,"wait":false
			});
			break;
		case "run":
			this.changeEventStatus(status);
			var distance = $gameMap.distance($gamePlayer._x, $gamePlayer._y, this._x, this._y);
			var code = 0; var rand = 0;
			//画面外は静止する
			if (distance >= 20) {
				this.forceMoveRoute({
					"list":[{"code":0}],
					"repeat":true,"skippable":true,"wait":false
				});
				break;
			}
			//スタック中かつリピート移動でないなら、最大３秒間ランダム移動を繰り返す
			if (this.isStuck() && this._repeatMove == 0) {
				this._stuckTimes = 0;
				this._repeatMove = Math.floor(Math.random() * 18);
			}
			//リージョンによる強制移動
			switch ($gameMap.regionId(ex, ey)) {
				case 12:
				case 22:
					code = 1; break;
				case 14:
				case 24:
					code = 2; break;
				case 16:
				case 26:
					code = 3; break;
				case 18:
				case 28:
					code = 4; break;
			}
			if (code > 0 && riskLevel < 50) {
				if (code >= 22) { //遠距離限定の強制移動
					if (distance >= 16) { //遠距離 50％
						rand = 2;
					}else{ //0％
						rand = 1;
					}
				}else{ //中・遠距離限定の強制移動
					if (distance <= 2) { //0％
						rand = 1;
					}else if (distance <= 4) { //近距離 25％
						rand = 4;
					}else{ //中距離以降 50％
						rand = 2;
					}
				}
				if (Math.floor(Math.random() * rand) == 1) {
					this.forceMoveRoute({
						"list":[{"code":code},{"code":0}],
						"repeat":true,"skippable":true,"wait":false
					});
					break;
				}
			}
			if (this._repeatMove > 0) { //ランダム移動中
				if (distance <= 3) { //プレイヤーが近いためランダム移動解除
					this._repeatMove = 0;
					this.forceMoveRoute({
						"list":[{"code":11},{"code":45, "parameters":["if (Math.floor(Math.random() * 3) == 0) this.moveRandom();"]},{"code":0}],
						"repeat":true,"skippable":true,"wait":false
					});
				}else{ //ランダム移動を実行
					this._repeatMove -= 1;
					this.forceMoveRoute({"list":[{"code":9},{"code":0}],"repeat":true,"skippable":true,"wait":false});		
				}
			}else{ //逃走
				this._repeatMove = 0;
				this.forceMoveRoute({
					"list":[{"code":11},{"code":45, "parameters":["if (Math.floor(Math.random() * 3) == 0) this.moveRandom();"]},{"code":0}],
					"repeat":true,"skippable":true,"wait":false
				});
			}
			break;
		case "caution": //動作停止中
			this.changeEventStatus(status);
			var distance = $gameMap.distance($gamePlayer._x, $gamePlayer._y, this._x, this._y);
			if (this.isInTargetList() || distance <= 2 || $gameSwitches.value(64)) { //射線内、プレイヤーが目の前、発砲済み
				this.setRunImage();
				$gameVariables._data[1][this._mapId][id].status = "run";
				this.feared = true;
				break;
			}
			var nearEvents = this.checkNearEvents();
			if (nearEvents.length > 0) { //近くに移動中のイベントが存在する時
				var nearEventStatus = "";
				for (var i = 0; i < nearEvents.length; i++) {
					nearEventStatus = $gameVariables._data[1][this._mapId][nearEvents[i]].status;
					if (nearEventStatus == "run" || nearEventStatus == "escape" || nearEventStatus == "fight") {
						this.setRunImage();
						$gameVariables._data[1][this._mapId][id].status = "run";
						this.feared = true;
						return;					
					}
				}
			}
			var distance = $gameMap.distance($gamePlayer._x, $gamePlayer._y, this._x, this._y);
			if (distance <= 4) {
				this.forceMoveRoute({"list":[{"code":11},{"code":11},{"code":0}],"repeat":true,"skippable":true,"wait":false});
				if (Math.floor(Math.random() * 2) == 0) {
					this.setRunImage();
					$gameVariables._data[1][this._mapId][id].status = "run";
					this.feared = true;
				}
			}else{
				this.forceMoveRoute({"list":[{"code":25},{"code":0}],"repeat":false,"skippable":true,"wait":false});
			}
			break;
		}
	}

	//増援用
	Game_Event.prototype.executeEnemyAction = function() {

		var status = $gameVariables._data[1][this._mapId][this._eventId].status;
		var hp = $gameVariables._data[1][this._mapId][this._eventId].hp;
		
		var px = $gamePlayer._x;
		var py = $gamePlayer._y;
		var ex = this._x;
		var ey = this._y;

		this.setDamageStatus();

		//プレイヤーと重なってしまった場合、移動する
		if (ex == px && ey == py && hp > 0) {
			this.forceMoveRoute({"list":[{"code":9},{"code":0}],"repeat":false,"skippable":true,"wait":false});
			return;
		}

		//死亡・重傷・戦闘ステータスの処理
		switch (status) {
			case "dead":
				this.setDamagedImage();
				this.changeEventStatus("dead");
				this.forceMoveRoute({
					"list":[{"code":0}],
					"repeat":false,"skippable":true,"wait":false
				});
				break;
			case "seriousWound":
				this.setDamagedImage();
				this.changeEventStatus("seriousWound");
				if (this._characterName == "yandere") { //ヤンデレ用の挙動
					if (Math.floor(Math.random() * 4) == 0) {
						this.forceMoveRoute({
							"list":[{"code":10},{"code":0}],
							"repeat":false,"skippable":true,"wait":false
						});
					}else{
						this.forceMoveRoute({
							"list":[{"code":0}],
							"repeat":false,"skippable":true,"wait":false
						});
					}
				}else if (hp >= 25 && Math.floor(Math.random() * 8) == 0) {
					this.forceMoveRoute({
						"list":[{"code":9},{"code":0}],
						"repeat":false,"skippable":true,"wait":false
					});
				}else{
					this.forceMoveRoute({
						"list":[{"code":0}],
						"repeat":false,"skippable":true,"wait":false
					});
				}
				break;
			case "fight":
				this.changeEventStatus("fight");
				if (this._characterName == "policeman" || this._characterName == "w_policeman") { //警察官
					this.executePoliceAction();
					return;
				}else if (this._characterName == "principal") { //校長
					this.executePrincipalAction();
					return;
				}else if (this._characterName == "yandere") {
					var distance = $gameMap.distance($gamePlayer._x, $gamePlayer._y, this._x, this._y);
					if ($gameVariables._data[76].yandere.speed < 1 && distance < 20) { //ヤンデレ加速用（遠方では加速しない）
						$gameVariables._data[76].yandere.speed += 0.08;
					}
				}
				this.forceMoveRoute({
					"list":[{"code":45, "parameters":["this.moveStraight(this.findDirectionTo($gamePlayer.x, $gamePlayer.y))"]},{"code":0}],
					"repeat":true,"skippable":true,"wait":false
				});
				this.attackPlayer();
				break;
		}

	}

	//警察官行動用。
	Game_Event.prototype.executePoliceAction = function() {

		var policeA = this._characterName == "policeman" ? $gameVariables._data[76].maleOfficer : $gameVariables._data[76].femaleOfficer;
		var policeB = this._characterName == "policeman" ? $gameVariables._data[76].femaleOfficer : $gameVariables._data[76].maleOfficer;
		var namePoliceB = this._characterName == "policeman" ? "w_policeman" : "policeman";
		var existPoliceB = false;
		policeA.id = this._eventId;
	
		if ($gameMap._events[policeB.id]) { //相棒が存在するかどうか
			if ($gameMap._events[policeB.id]._characterName == namePoliceB) existPoliceB = true;
		}
		
		var distance = $gameMap.distance($gamePlayer.x, $gamePlayer.y, this._x, this._y);

		if (policeA.isShooting){

			if (!this.withinRange(4)) { //射線上にプレイヤーが居ないなら射撃状態を解除
				if (policeA.isShooting) policeA.isShooting = false;
			}else if (distance == 1) { //プレイヤーが目の前なら一歩後退
				this.forceMoveRoute({
					"list":[{"code":25},{"code":13},{"code":0}],
					"repeat":false,"skippable":true,"wait":false
				});
				this.shootPlayer();
			}else{ //プレイヤーの方角を向きつつ射撃
				this.forceMoveRoute({
					"list":[{"code":25},{"code":0}],
					"repeat":false,"skippable":true,"wait":false
				});
				this.shootPlayer();
			}

		}else if (this.withinRange(4)) { //射線上にプレイヤーが居れば射撃状態に移行

			if (!policeA.isShooting) {
				policeA.isShooting = true;
			}

			this.forceMoveRoute({
				"list":[{"code":25},{"code":0}],
				"repeat":false,"skippable":true,"wait":false
			});
			this.shootPlayer();

		}else if (existPoliceB && policeB.isShooting && policeB.hp >= 50) { //相棒が射撃状態の時

			this.forceMoveRoute({
				"list":[{"code":25},{"code":0}],
				"repeat":false,"skippable":true,"wait":false
			});

			var direction = this.findDirectionTo($gamePlayer.x,$gamePlayer.y);
			var num = 0;

			if ($gamePlayer.x == $gameMap._events[policeB.id]._x){
				//Y座標で交戦。
				if ($gamePlayer.x != this._x){
					num = direction == 4 ? -1 : 1;
					if ($gamePlayer.x != this._x + num) {
						this.forceMoveDirection(direction);
					}
				}
			}else{
				//X座標で交戦。
				if ($gamePlayer.y != this._y){ 
					num = direction == 2 ? 1 : -1;
					if ($gamePlayer.y != this._y + num) {
						this.forceMoveDirection(direction);
					}
				}
			}

		}else if (existPoliceB && policeB.hp < 50){ //相棒が行動不能状態の時、座標不一致ならランダムで合わせる

			var rand = Math.floor(Math.random() * 3);
			if ($gamePlayer.x != this._x && $gamePlayer.y != this._y && rand == 0) {
				var distanceX = Math.abs($gamePlayer.x - this._x);
				var distanceY = Math.abs($gamePlayer.y - this._y);
				if (distanceX < distanceY){
					var d = $gamePlayer.x < this._x ? 4 : 6;
				}else{
					var d = $gamePlayer.y < this._y ? 8 : 2;
				}
				this.forceMoveDirection(d);
			}else{
				this.forceMoveRoute({
					"list":[{"code":45, "parameters":["this.moveStraight(this.findDirectionTo($gamePlayer.x, $gamePlayer.y))"]},{"code":0}],
					"repeat":true,"skippable":true,"wait":false
				});
			}

		}else{ //双方が非射撃状態、行動不能でもない時、プレイヤーに近付く

			this.forceMoveRoute({
				"list":[{"code":45, "parameters":["this.moveStraight(this.findDirectionTo($gamePlayer.x, $gamePlayer.y))"]},{"code":0}],
				"repeat":true,"skippable":true,"wait":false
			});

		}
	}

	//イベント射撃用
	Game_Event.prototype.shootPlayer = function() {

		//入室直後の攻撃保護、増援直後の攻撃保護、デバッグモード中なら処理を中断
		if ($gameSwitches.value(42) || $gameSwitches.value(56) || $gameSwitches._data[36]) {
			return;
		}

		if (this._shootingWait > 0) { //射撃ウェイト中
			this._shootingWait -= 1;
		}else{ //射撃実行

			var soundName = "gunshot02";
			var soundVolume = 100;
			var soundPitch = 100;

			var Maxfirerate = 1;
			var Minfirerate = 0;
			var dmg = 0;

			switch (this._characterName) {
			case "policeman":;
			case "w_policeman": 

				soundName = "gunshot02"
				soundVolume = 150;
				soundPitch = 120;
				Maxfirerate = 1; 
				Minfirerate = 0; 
				dmg = 10;
				break;

			case "principal": 

				soundName = "gunshot09"
				soundVolume = 100;
				soundPitch = 100;
				Maxfirerate = 1; 
				Minfirerate = 0.4; 
				dmg = 40;
				break;
				
			}

			//射撃アニメーション
			var num = 0;
			switch (this._direction) {
				case 2: num = 3; break;
				case 4: num = 13; break;
				case 6: num = 14; break;
				case 8: num = 6; break;
			}
			this.requestAnimation(num);

			//射撃音
			AudioManager.playSe({"name":soundName,"volume":soundVolume,"pitch":soundPitch,"pan":0});

			//命中判定
			var distance = $gameMap.distance($gamePlayer.x, $gamePlayer.y, this._x, this._y);
			var acc = 90 - (distance * 10);
			if (acc > Math.floor(Math.random() * 101)){
		
				$gamePlayer.requestAnimation(2);

				//ダメージウェイト、チートモードでない時はダメージを受ける
				if (!$gameSwitches.value(46) && !$gameSwitches.value(58)) {
					if (this._characterName == "principal") { //校長エンドフラグ
						$gameVariables._data[43] = 4;
					}else{ //警察官エンドフラグ
						$gameVariables._data[82] = this._characterName == "policeman" ? 1 : 2;
						$gameVariables._data[43] = 3;
					}
					$gameSwitches.setValue(34,true); //死亡エンドフラグ
					$gameSwitches.setValue(47,true); //ダメージウェイト

					$gameVariables._data[62] += dmg + Math.floor(Math.random() * 11);
					$gameSwitches.setValue(24,true); //ダメージ処理
				}
				
			}

			//射撃レート
			if (distance == 1) { //プレイヤーが目の前
				this._shootingWait = Minfirerate;
			}else if (distance <= 3) { //ほぼ目の前
				this._shootingWait = Minfirerate + Math.floor(Math.random() * 2);
			}else{ //遠方
				this._shootingWait = Maxfirerate; 
			}

		}
	}

	//校長移動用。
	Game_Event.prototype.executePrincipalAction = function() {

		var distance = $gameMap.distance($gamePlayer.x, $gamePlayer.y, this._x, this._y);
		var principal = $gameVariables._data[76].principal;

		if (principal.isShooting){

			if (!this.withinRange(5)) { //射線上にプレイヤーが居ないなら射撃状態を解除
				if (principal.isShooting) principal.isShooting = false;
			}else if (distance == 1) { //プレイヤーが目の前なら後退
				this.forceMoveRoute({
					"list":[{"code":25},{"code":13},{"code":0}],
					"repeat":false,"skippable":true,"wait":false
				});
				this.shootPlayer();
			}else{
				this.forceMoveRoute({
					"list":[{"code":25},{"code":0}],
					"repeat":false,"skippable":true,"wait":false
				});
				this.shootPlayer();
			}

		}else if (this.withinRange(5)) { //射線上にプレイヤーが居れば射撃状態に移行

			if (!principal.isShooting) {
				AudioManager.playSe({"name":"kacha","volume":50,"pitch":100,"pan":0});
				principal.isShooting = true;
				this._shootingWait = 1;
			}
			this.forceMoveRoute({
				"list":[{"code":25},{"code":0}],
				"repeat":false,"skippable":true,"wait":false
			});
			this.shootPlayer();

		}else{  //プレイヤーに近付く、座標も合わせる

			if ($gamePlayer.x != this._x && $gamePlayer.y != this._y && Math.floor(Math.random() * 3) == 0) {
				var distanceX = Math.abs($gamePlayer.x - this._x);
				var distanceY = Math.abs($gamePlayer.y - this._y);
				if (distanceX < distanceY){
					var d = $gamePlayer.x < this._x ? 4 : 6;
				}else{
					var d = $gamePlayer.y < this._y ? 8 : 2;
				}
				this.forceMoveDirection(d);
			}else{
				this.forceMoveRoute({
					"list":[{"code":45, "parameters":["this.moveStraight(this.findDirectionTo($gamePlayer.x, $gamePlayer.y))"]},{"code":0}],
					"repeat":true,"skippable":true,"wait":false
				});
			}

		}
	}

	//プレイヤーがイベントの射線上か否か。
	Game_Event.prototype.withinRange = function(range) {

		var distance = $gameMap.distance($gamePlayer.x, $gamePlayer.y, this._x, this._y);
		var direction = 0;

		var distanceX = $gamePlayer._realX - this._realX;
		var distanceY = $gamePlayer._realY - this._realY;

		if (distance <= range) {
			if (distanceX >= -0.2 && distanceX <= 0.2){
				direction = this.deltaYFrom($gamePlayer._y) > 0 ? 8 : 2;
			}else if (distanceY >= -0.2 && distanceY <= 0.2){
				direction = this.deltaXFrom($gamePlayer._x) > 0 ? 4 : 6;
			}
		}else{
			return false;
		}

		if (direction != this._direction) return false;

		if (direction){

			var dx = 0; var dy = 0;
			var x = this._x; var y = this._y;

			switch (direction) {
				case 2: dy = 1; break;
				case 4: dx = -1; break;
				case 6: dx = 1; break;
				case 8: dy = -1; break;
			}
			for (var i = 1; i < distance; i++){

				x += dx; y += dy;

				if (this.isCollidedWithCharacters(x, y)){
					return false;
				}else if ($gameMap.regionId(x, y) == 1){
					return false;
				}

			}
			return true;

		}else{
			return false;
		}
	}

	//クロウラーの登場確率
	Game_Event.prototype.crawlerProbability = function() {
		var probability = Math.floor(($gameTimer._frames / 60) / 3);
		if (probability > Math.floor(Math.random() * 101)) {
			return true;
		}
		return false;
	}
	//クロウラー出現可能か
	Game_Event.prototype.canCrawl = function() {
		var distance = $gameMap.distance($gamePlayer.x, $gamePlayer.y, this._x, this._y);
		if (distance <= 3) {
			return false;
		}else if ($gameMap.eventsXy(this._x, this._y).length > 1) {
			return false;
		}else{
			return true;
		}
	}

	//プレイヤーから遠ざかる移動の改良。
	Game_Character.prototype.moveAwayFromCharacter = function(character) {
		var sx = this.deltaXFrom(character.x);
		var sy = this.deltaYFrom(character.y);
		if (Math.abs(sx) > Math.abs(sy)) {
			this.moveStraight(sx > 0 ? 6 : 4);
			if (!this.isMovementSucceeded() && sy !== 0) {
				this.moveStraight(sy > 0 ? 2 : 8);
			}
		} else if (sy !== 0) {
			this.moveStraight(sy > 0 ? 2 : 8);
			if (!this.isMovementSucceeded() && sx !== 0) {
				this.moveStraight(sx > 0 ? 6 : 4);
			}
		}
		if (!this.isMovementSucceeded()) this.moveRandom();
	};

	//方角に応じた移動ルートを実行
	Game_Event.prototype.forceMoveDirection = function(d) {
		this.forceMoveRoute({
			"list":[{"code":d / 2}],
			"repeat":false,"skippable":true,"wait":false
		});
	}

	//イベント動作停止処理
	Game_Map.prototype.stopEvents = function() {

		$gameSwitches.setValue(52,false); 

		if (!$gameVariables._data[1][this._mapId]) return;
		
		for (var i = 0; i < $gameVariables._data[1][this._mapId].length; i++) {
			if (!$gameVariables._data[1][this._mapId][i]) continue;

			this._events[i].forceMoveRoute({
				"list":[{"code":0}],
				"repeat":false,"skippable":true,"wait":false
			});

		}

	}

	//体力に応じて変化するステータスの設定
	Game_Event.prototype.setDamageStatus = function() {

		var name = $gameVariables._data[1][this._mapId][this._eventId].name;
		var status = $gameVariables._data[1][this._mapId][this._eventId].status;
		var nextStatus = $gameVariables._data[1][this._mapId][this._eventId].nextStatus;
		var hp = $gameVariables._data[1][this._mapId][this._eventId].hp;
		var speed = $gameVariables._data[1][this._mapId][this._eventId].speed;
		var downTimer = $gameVariables._data[1][this._mapId][this._eventId].downTimer;

		if (hp <= 0) {
			if (status != "dead"){
				$gameVariables._data[1][this._mapId][this._eventId].status = "dead";
				$gameVariables._data[1][this._mapId][this._eventId].nextStatus = "none";
				$gameVariables._data[1][this._mapId][this._eventId].downTimer = 0;
				//this.playDownSE();
			}
		}else if (hp < 50) {

			if (status != "seriousWound" && status != "escaped") {
				if (nextStatus != "down") {
					this.setDownTimer();
				}else if (downTimer > 0) {
					$gameVariables._data[1][this._mapId][this._eventId].downTimer -= 1;
				}else if (downTimer <= 0) {
					$gameVariables._data[1][this._mapId][this._eventId].status = "seriousWound";
					this._moveSpeed = 1.8;
					//this.playDownSE();
				}
			} else if (status == "seriousWound" && this._moveSpeed != 1.8) {
				this._moveSpeed = 1.8;
			}

		}else{

			this._moveSpeed = speed;
			var maxHp = name == "yandere" ? 200 : 100;
			this._moveSpeed -= 1 * (1 - (hp / maxHp)); //体力50で0.5速度低下。
			if ($gameSwitches.value(40) && name == "yandere") { //ヤンデレ加速用
				this._moveSpeed = this._moveSpeed - 1 + $gameVariables._data[76].yandere.speed;
			}

		}
	}

	//イベントがプレイヤーの射線上に存在するか否か
	Game_Event.prototype.isInTargetList = function() {
		if ($gamePlayer.targetList) {
			for (var i = 0; i < $gamePlayer.targetList.length; i++) {
				if (this._eventId == $gamePlayer.targetList[i]._eventId) return true;
			}
		}
		return false;
	}

	//ダウン音（停止中）
	Game_Event.prototype.playDownSE = function() {
		var distance = $gameMap.distance($gamePlayer.x, $gamePlayer.y, this._x, this._y);
		if (distance < 10) {
			var volume = 50 - (distance * 5);
			var randomPitch = Math.floor( Math.random() * 21 ) + 95; 
			var pan = (this._x - $gamePlayer.x) * 10;
			AudioManager.playSe({"name":"damage","volume":volume,"pitch":randomPitch,"pan":pan});	
		}
	}

	//ダウンタイマーの設定
	Game_Event.prototype.setDownTimer = function() {
		var lastDamage = $gameVariables._data[1][this._mapId][this._eventId].lastDamage;
		if (lastDamage > 0) {
			$gameVariables._data[1][this._mapId][this._eventId].downTimer = Math.floor((100 / lastDamage)  * 2);
			$gameVariables._data[1][this._mapId][this._eventId].nextStatus = "down";
		}else{
			$gameVariables._data[1][this._mapId][this._eventId].status == "seriousWound";
		}
	}

	//状態に応じて 足踏み 向き固定 すり抜け などを設定する
	Game_Event.prototype.changeEventStatus = function(status) {
		switch (status) {
		case "dead":
			this._moveFrequency = 5;
			this._stepAnime = false;
			this._directionFix = true;
			this._through = true;
			this._transparent = 0;
			this._priorityType = 0;
			break;
		case "escaped":
			this._moveFrequency = 5;
			this._stepAnime = false;
			this._directionFix = true;
			this._through = true;
			this._transparent = 255;
			this._priorityType = 0;
			break;
		case "seriousWound":
			this._moveFrequency = 5;
			this._stepAnime = false;
			this._directionFix = false;
			this._through = false;
			this._transparent = 0;
			this._priorityType = 1;
			break;
		case "playDead":
			this._moveFrequency = 5;
			this._stepAnime = false;
			this._directionFix = true;
			this._through = false;
			this._transparent = 0;
			this._priorityType = 1;
			break;
		case "fight":
		case "hide":
			this._moveFrequency = 5;
			this._stepAnime = true;
			this._directionFix = false;
			this._through = false;
			this._transparent = 0;
			this._priorityType = 1;
			break;
		case "run":
		case "follow":
		case "escape":
			this._moveFrequency = 5;
			this._stepAnime = false;
			this._directionFix = false;
			this._through = false;	
			this._transparent = 0;
			this._priorityType = 1;
			break;
		case "caution":
			this._moveFrequency = 4;
			this._stepAnime = false;
			this._directionFix = false;
			this._through = false;	
			this._transparent = 0;
			this._priorityType = 1;
		}
	}

	//探索限界を 12 から 24 に変更
	Game_Character.prototype.searchLimit = function() {
		return 24;
	};

	Game_Event.prototype.targetX = function() {
		var targetId = $gameVariables._data[1][this._mapId][this._eventId].targetId;
		if (targetId) {
			return $gameMap._events[targetId]._x;
		}
	}
	Game_Event.prototype.targetY = function() {
		var targetId = $gameVariables._data[1][this._mapId][this._eventId].targetId;
		if (targetId) {
			return $gameMap._events[targetId]._y;
		}
	}

	//イベントがスタックしているかどうか確認する
	Game_Event.prototype.isStuck = function() {
		if (this._stuckTimes >= 6) {
			this._stuckTimes = 0;
			return true;
		}
		if (this._stuckX == this._x && this._stuckY == this._y) {
			this._stuckTimes++;
		}else{
			this._stuckX = this._x;
			this._stuckY = this._y;
		}
		return false;
	}

	//ランダム移動の改良
	Game_Character.prototype.moveRandom = function() {

		var directions = [];
		var d = 0;

		for (var i = 2; i <= 8; i += 2) {
			if (this.canPass(this.x, this.y, i)) directions.push(i);
		}
		if (directions.length > 0) {
			var random = Math.floor(Math.random() * directions.length);
			d = directions[random];
		}
		if (d) {
			this.moveStraight(d);
		}

	};

	//isThoughよりisMapPassableを優先する。
	Game_CharacterBase.prototype.canPass = function(x, y, d) {
		var x2 = $gameMap.roundXWithDirection(x, d);
		var y2 = $gameMap.roundYWithDirection(y, d);
		if (!$gameMap.isValid(x2, y2)) {
			return false;
		}
		if (!this.isMapPassable(x, y, d)) {
			return false;
		}
		if (this.isThrough() || this.isDebugThrough()) {
			return true;
		}
		if (this.isCollidedWithCharacters(x2, y2)) {
			return false;
		}
		return true;
	};

	//通行可能な方角を返す
	Game_Character.prototype.canPassDirection = function() {
		for (var d = 2; d <= 8; d += 2) {
			if (this.canPass(this.x, this.y, d)) return d;
		}
		return false;
	}
	//プレイヤーの方角を返す
	Game_Character.prototype.directionToPlayer = function() {
		var d = 2;
		var sx = this.deltaXFrom($gamePlayer.x);
		var sy = this.deltaYFrom($gamePlayer.y);
		if (Math.abs(sx) > Math.abs(sy)) {
			d = sx > 0 ? 4 : 6;
		} else if (sy !== 0) {
			d = sy > 0 ? 8 : 2;
		}
		return d;
	};
	//イベントが遮蔽物に隠れている状態か
	Game_Character.prototype.isCover = function() {
		var d = this.directionToPlayer();
		var x = $gameMap.xWithDirection(this._x, d);
		var y = $gameMap.yWithDirection(this._y, d);
		if ($gameMap.regionId(x, y) == 4) {
			var status = $gameVariables._data[1][this._mapId][this._eventId].status;
			if (status == "hide" || status == "seriousWound" || status == "dead") {
				return true;
			}
		}
		return false;
	};

	//イベントが行動可能かどうか
	Game_Event.prototype.isCanAction = function() {
		var status = $gameVariables._data[1][this._mapId][this._eventId].status;
		if (status == "dead" || status == "seriousWound" || status == "escaped") {
			return false;
		}
		return true;
	}
	//逃走を実行する範囲内にプレイヤーが存在するか
	Game_Event.prototype.isNearPlayer = function() {
		var courage = $gameVariables._data[1][this._mapId][this._eventId].courage;
		var distance = $gameMap.distance($gamePlayer._x, $gamePlayer._y, this._x, this._y);
		var runawayDistance = 7 - (Math.round(courage / 25));
		return distance < runawayDistance;
	}
	//隠れられる状態か
	Game_Event.prototype.isCanHide = function() {

		if (!this.isNearPlayer()) {

			var fx = this.deltaXFrom($gamePlayer._x);
			var fy = this.deltaYFrom($gamePlayer._y);
			var d = 2;

			//プレイヤーの存在する方角
			if (Math.abs(fx) > Math.abs(fy)) {
				d = fx > 0 ? 4 : 6;
			}else{
				d = fy > 0 ? 8 : 2;
			}

			var dx = $gameMap.xWithDirection(this._x, d);
			var dy = $gameMap.yWithDirection(this._y, d);

			//プレイヤーの方角に壁もしくは障害物がある場合、実行可能
			if ($gameMap.regionId(dx, dy) == 1 || $gameMap.regionId(dx, dy) == 4) return true;

		}
		return false;
	}
	//ターゲットが追従できる状態か否か
	Game_Event.prototype.isCanFollowTarget = function(targetId) {
		var targetStatus = $gameVariables._data[1][this._mapId][targetId].status;
		var name = $gameMap._events[targetId]._characterName;
		var distance = $gameMap.distance(this._x, this._y, $gameMap._events[targetId]._x, $gameMap._events[targetId]._y);
		var value = false;
		if (name == "male_students" || name == "female_students " && distance <= 24) {
			switch (targetStatus) {
				case "run": 
					value = true;
					break;
				case "escape": 
					value = true;
					break;
				case "hide": 
					value = true;
					break;
				case "fight": 
					if (this._characterName == "male_students") value = true;
					break;
			}
		}
		return value;
	}
	//イベントがプレイヤーの背後か否か
	Game_Event.prototype.isBehindPlayer = function() {

		var fx = this.deltaXFrom($gamePlayer._x);
		var fy = this.deltaYFrom($gamePlayer._y);
		var d = 2;

		//プレイヤーの存在する方角をもとに、こちらを向いている方角を求める
		if (Math.abs(fx) > Math.abs(fy)) {
			d = fx > 0 ? 6 : 4;
		}else{
			d = fy > 0 ? 2 : 8;
		}

		return $gamePlayer._direction != d;

	}

	Game_CharacterBase.prototype.setImage = function(characterName, characterIndex) {
		this._tileId = 0;
		this._characterName = characterName;
		this._characterIndex = characterIndex;
		this._isObjectCharacter = ImageManager.isObjectCharacter(characterName);
	};

	//HPに応じたグラフィックに切り替える
	Game_Event.prototype.setDamagedImage = function() {

		var hp = $gameVariables._data[1][this._mapId][this._eventId].hp;
		var name = this._characterName;
		var index = 0;

		if (name == "yandere" && hp == 200) {
			return;
		}else if(hp == 100) {
			return;
		}

		switch (name) {
		case "female_students ": 
			var uniform = [0,1,3,5];
			for (var i = 0; i < uniform.length; i++) {
				if (this._characterIndex == uniform[i]) { //制服
					if (hp < 50) {	
						index = this._characterIndex != 4 ? 4 : 0;
					}
					break;
				}
			}
			if (this._characterIndex == 2) { //体操服
				if (hp < 50) {
					index = this._characterIndex != 6 ? 6 : 0;
				}
			}
			break;
		case "male_students": 
			var uniform = [0,1,3,5];
			for (var i = 0; i < uniform.length; i++) {
				if (hp < 50 && this._characterIndex == uniform[i]) {
					index = this._characterIndex != 4 ? 4 : 0;
					break;
				}
			}
			if(this._characterIndex == 2) {
				if (hp < 50) {
					index = this._characterIndex != 6 ? 6 : 0;
				}
			}
			break;
		case "teacher": 
			if (this._characterIndex == 0) {
				if (hp < 50) {
					index = this._characterIndex != 4 ? 4 : 0;
				}
			}else if (this._characterIndex == 1) {
				if (hp < 50) {
					index = this._characterIndex != 5 ? 5 : 0;
				}
			}else if (this._characterIndex == 2) {
				if (hp < 50) {
					index = this._characterIndex != 6 ? 6 : 0;
				}
			}
			break;
		case "w_teacher": 
		case "shield": 
		case "yandere":
		case "policeman": 
		case "w_policeman": 
		case "principal": 
			if (this._characterIndex == 0) {
				if (hp < 50) {
					index = this._characterIndex != 4 ? 4 : 0;
				}
			}
			break;
		}

		if (index != 0) {
			this.setImage(name, index);
		}

	}
	//逃走イメージに切り替える
	Game_Event.prototype.setRunImage = function() {
		var index = 0;
		switch (this._characterName) {
		case "female_students ":
			index = 0;
			break;
		case "male_students": 
			index = 0;
			break;
		}
		this.setImage(this._characterName, index);
	}
	//死んだふりグラフィックに切り替える
	Game_Event.prototype.setPlayDeadImage = function() {
		var index = 0;
		switch (this._characterName) {
		case "female_students ":
			index = 5;
			break;
		case "male_students": 
			index = 5;
			break;
		}
		this.setImage(this._characterName, index);
	}
	//身を隠すグラフィックに切り替える
	Game_Event.prototype.setHideImage = function() {
		var index = 0;
		switch (this._characterName) {
		case "female_students ":
			index = 1;
			break;
		case "male_students": 
			index = 1;
			break;
		}
		this.setImage(this._characterName, index);
	}

	//可能ならプレイヤーに近接攻撃
	Game_Event.prototype.attackPlayer = function() {

		//入室直後の攻撃保護、ダメージウェイト、優美のスキル発動中、増援直後の攻撃保護、チートモード
		if ($gameSwitches.value(42) || $gameSwitches.value(46) || $gameSwitches.value(49) || $gameSwitches.value(56) || $gameSwitches.value(58)) {
			return;
		}

		var x = this._x; 
		var y = this._y; 
		var code = 0;

		switch(this._direction){
			case 2: y += 1; code = 1; break; 
			case 4: x -= 1; code = 2; break;
			case 6: x += 1; code = 3; break; 
			case 8: y -= 1; code = 4;
		}

		//イベント前方にプレイヤーが存在し、ダメージ処理中でない時
		if (x == $gamePlayer._x && y == $gamePlayer._y && !$gameSwitches.value(24)){
			if (this._characterName == "yandere"){
				if ($gameSwitches.value(40)) {
					$gameVariables._data[62] += 30;
				}else{
					$gameVariables._data[62] += 20;
				}
				$gameVariables._data[43] = 1; 
				$gameSwitches.setValue(34,true); 
			}
			$gameSwitches.setValue(24,true);
			x = $gameMap.xWithDirection(x, this._direction);
			y = $gameMap.yWithDirection(y, this._direction);
			if ($gameMap.regionId(x, y) != 1 && $gameMap.regionId(x, y) != 2 && $gameMap.regionId(x, y) != 4 && $gameMap.regionId(x, y) != 5) { //壁や出口でないなら押し出す
				$gamePlayer.forceMoveRoute({"list":[{"code":35},{"code":code},{"code":36},{"code":0}],"repeat":false,"skippable":true,"wait":false});
			}
		}
	};

	//上下左右に死亡または重傷でない他のイベントが存在するか
	Game_Event.prototype.checkNearEvents = function() {

		var list = [];
		var x = 0;
		var y = 0;

		for (var d = 2; d <= 8; d += 2) {

			x = $gameMap.xWithDirection(this._x, d);
			y = $gameMap.yWithDirection(this._y, d);

			if ($gameMap.eventsXy(x, y).length > 0) {

				var events = $gameMap.eventsXy(x, y);
				for (var i = 0; i < events.length; i++) {
					if (events[i].isInitialized()) {
						if ($gameVariables._data[1][this._mapId][events[i]._eventId].hp >= 50) {
							list.push(events[i]._eventId);
						} 
					}
				}

			}
			
		}
		return list;

	}

	//BOTモード（公開時は不使用）
	Game_Player.prototype.botMode = function() {

		var list = $gameVariables._data[1][$gameMap._mapId];
		var targetId = 0;
		var enemyList = [];
		var nearEventId = 0;
		var nearEnemyId = 0;
		var nearEventDistance = 0;
		var nearEnemyDistance = 0;
		var distance = 0;
		var canShootTarget = false;

		if (!this.botInitialized) {
			this.botTargetId = 0;
			this.botSetAcc = 50;
			this.botDashing = false;
			this.botStatus = "none";
			this.botTimer = {};
			this.botTimer.attacked = 0;
			this.botTimer.running = 0;
			this.botTimer.keepStatus = 0;
			this.botTimer.keepAiming = 0;
			this.botTimer.keepShooting = 0;
			this.botTimer.restoreStamina = 0;
			this.botInitialized = true;
		}

		if (magazine == 0 && $gamePlayer.canShootOrReload()) {
			this.botStatus = "reload";
			$gamePlayer.reload();
			return;
		}

		for (var i = 0; i < list.length; i++) {
			if (!list[i]) continue;
			if (list[i].hp > 0) {
				distance = $gameMap.distance(this._x, this._y, $gameMap._events[i]._x, $gameMap._events[i]._y);
				//敵対ターゲットならリストに追加して継続。
				if (list[i].status == "fight") {
					enemyList.push(i);
					continue;
				}else if (list[i].status == "escaped") {
					continue;
				}
				//そうでない時、最も近いイベントを探す。
				if (!nearEventId) {
					nearEventId = i;
					nearEventDistance = distance;
				}else if (distance < nearEventDistance) {
					nearEventId = i;
					nearEventDistance = distance;
				}
			}
		}

		//敵対ターゲットが存在するなら、最も近いものを探してターゲットにする。
		if (enemyList.length > 0) {
			for (var i = 0; i < enemyList.length; i++) {
				distance = $gameMap.distance(this._x, this._y, $gameMap._events[enemyList[i]]._x, $gameMap._events[enemyList[i]]._y);
				if (!nearEnemyId) { //0なら無条件
					nearEnemyId = enemyList[i];
					this.nearEnemyId = enemyList[i];
					nearEnemyDistance = distance;
				}else if (distance < nearEnemyDistance) { //idがあるなら、距離がより近い場合に上書き
					nearEnemyId = enemyList[i];
					this.nearEnemyId = enemyList[i];
					nearEnemyDistance = distance;
				}
			}
			if (nearEnemyDistance <= 4) {
				targetId = nearEnemyId;
			}else{
				targetId = nearEventId;
			}
		}else{
			targetId = nearEventId;
		}

		//射撃可能なターゲットが存在しない（全滅）時、処理を中断する。
		if (!targetId) {
			if (this.botStatus == "none") {
				this.moveMap();
			}else{
				this.botStatus = "none";
				this.botDashing = false;
				$gameSwitches.setValue(54,false); 
				if ($gameSwitches.value(20)) $gamePlayer.ads();
			}
			return;
		}

		distance = $gameMap.distance(this._x, this._y, $gameMap._events[targetId]._x, $gameMap._events[targetId]._y);

		//ターゲットが射線に存在するか
		if (this.targetList.length > 0 && distance < 8) {
			for (var i = 0; i < this.targetList.length; i++) {
				if (this.targetList[i]._eventId == targetId) {
					this.targetId = targetId;
					this.targetListIndex = i;
					canShootTarget = true;
					break;
				}
			}
		}

		//ターゲットを射撃可能なら射撃、射線内でなければターゲットに近付く。
		if (canShootTarget) {

			this.botDashing = false;

			//目の前に敵対ターゲットが存在する時は後退しつつ非ADS射撃
			if (nearEnemyId != 0 && nearEnemyDistance == 1 && this.botTimer.keepShooting <= 0) {

				this.forceMoveRoute({
					"list":[{"code":45, "parameters":["this.moveBackward()"]},{"code":0}],
					"repeat":false,"skippable":true,"wait":false
				});
				$gameSwitches.setValue(54,true); 
				return;

			}else{
				$gameSwitches.setValue(54,false); 
			}

			//照準
			if (!$gameSwitches.value(20)) {
				$gamePlayer.ads();
				this.botStatus = "ads";
				this.botSetAcc = 50 + Math.floor(Math.random() * 31);
				return;
			}

			//一定時間銃撃を繰り返す
			if (magazine > 0 && this.accuracy() >= this.botSetAcc && $gamePlayer.canShootOrReload()) {
				$gameSwitches.setValue(54,true); 
			}else{
				$gameSwitches.setValue(54,false); 
			}

		}else{

			this.botStatus = "move";

			if (this.botTimer.keepShooting <= 0) {
				$gameSwitches.setValue(54,false); 
				if ($gameSwitches.value(20)) $gamePlayer.ads();
			}

			this.botTargetId = targetId;
			if ($gamePlayer._directionFix) $gamePlayer._directionFix = false;
			distance = $gameMap.distance(this._x, this._y, $gameMap._events[targetId]._x, $gameMap._events[targetId]._y);

			if (distance <= 2 && list[targetId].status != "seriousWound" && list[targetId].status != "playDead" && list[targetId].status != "fight") {
				this.forceMoveRoute({
					"list":[{"code":45, "parameters":["if (Math.floor(Math.random() * 3) == 0) this.moveRandom()"]},
							{"code":45, "parameters":["this.moveStraight(this.findDirectionTo($gameMap._events[$gamePlayer.botTargetId]._x, $gameMap._events[$gamePlayer.botTargetId]._y))"]},{"code":0}],
					"repeat":false,"skippable":true,"wait":false
				});
			}else{
				this.forceMoveRoute({
					"list":[{"code":45, "parameters":["this.moveStraight(this.findDirectionTo($gameMap._events[$gamePlayer.botTargetId]._x, $gameMap._events[$gamePlayer.botTargetId]._y))"]},{"code":0}],
					"repeat":false,"skippable":true,"wait":false
				});
			}

			if (distance > 2 && $gameVariables._data[4] > 50 && nearEnemyId == 0 && !$gameSwitches.value(3)) {
				if (this.botTimer.restoreStamina <= 0) {
					this.botDashing = true;
				}
			}else{
				if ($gameVariables._data[4] < 50) {
					this.botTimer.restoreStamina = Math.floor(Math.random() * 51);
				}
				this.botDashing = false;
			}
		}
	}
	Game_Player.prototype.countBotTimer = function() {
		if (this.botTimer.attacked > 0) this.botTimer.attacked--;
		if (this.botTimer.running > 0) this.botTimer.running--;
		if (this.botTimer.keepStatus > 0) this.botTimer.keepStatus--;
		if (this.botTimer.keepAiming > 0) this.botTimer.keepAiming--;
		if (this.botTimer.keepShooting > 0) this.botTimer.keepShooting--;
		if (this.botTimer.restoreStamina > 0) this.botTimer.restoreStamina--;
	}
	//新しいマップのデータを返す
	Game_Player.prototype.findNewMap = function() {

		var array = [];

		for (var eventId = 1; eventId <= $dataMap.events.length; eventId++){ //イベント

			if (!$dataMap.events[eventId]) continue;

			for (var index = 0; index <= $dataMap.events[eventId].pages[0].list.length; index++){ //実行内容

				if (!$dataMap.events[eventId].pages[0].list[index]){
					continue;
				} else if ($dataMap.events[eventId].pages[0].list[index].code == 201) { //コードが移動処理である場合

					var mapId = $dataMap.events[eventId].pages[0].list[index].parameters[1];
					if ($gameMap.alreadyEntered(mapId)) { //入室済みなら除外する
						continue;
					}
					var data = {};
					data.newMap = $dataMap.events[eventId].pages[0].list[index].parameters;
					data.x = $gameMap._events[eventId]._x;
					data.y = $gameMap._events[eventId]._y;
					array.push(data);
					continue;

				}

			}

		}

		if (array.length > 1) { //複数なら最短を選ぶ

			var distance;
			var nearestDistance;
			var index;

			for (var i = 0; i < array.length; i++){ 

				distance = $gameMap.distance($gamePlayer._x, $gamePlayer._y, array[i].x, array[i].y);

				if (nearestDistance === undefined || nearestDistance > distance) {
					nearestDistance = distance;
					index = i;
				}

			}

			if (index === undefined) {
				return array;
			} else {
				var newArray = [];
				newArray[0] = array[index];
				return newArray;
			}

		}else{
			return array;
		}

	}
	//脱出地点もしくは移動可能なマップへ移動する
	Game_Player.prototype.moveMap = function() {

		if (this._destinationMapId) { //既に移動中である

			//可能ならダッシュする
			if ($gameVariables._data[4] > 50 && !$gameSwitches.value(3)) {
				if (this.botTimer.restoreStamina <= 0) {
					this.botDashing = true;
				}
			}else{
				if ($gameVariables._data[4] < 50) {
					this.botTimer.restoreStamina = Math.floor(Math.random() * 51);
				}
				this.botDashing = false;
			}

			this.forceMoveRoute({
				"list":[{"code":45, "parameters":["this.moveStraight(this.findDirectionTo($gamePlayer._destinationX, $gamePlayer._destinationY))"]},{"code":0}],
				"repeat":false,"skippable":true,"wait":false
			});
			return;

		}

		var data = this.findNewMap();
		var x = 0;
		var y = 0;

		if (data.length >= 1) { //未入室のマップがある

			if (!data[0]) return;

			var mapId = data[0].newMap[1];
			x = data[0].x;
			y = data[0].y;

			this._destinationMapId = mapId;

		}else{

			if ($gameMap.mapExit()) { //未入室のマップがない時、脱出地点へ向かう

				var exit = $gamePlayer.nearestExit();
				x = exit[0];
				y = exit[1];

				this._destinationMapId = 100;

			}else{ //行動不能
				return;
			}

		}

		this._destinationX = x;
		this._destinationY = y;

	}

	//リージョン１と４を障害物とし、それ以外を通行可能にする。
	Game_Map.prototype.isPassable = function(x, y, d) {
		    if (this.regionId(x, y) == 1) {
				return false;
			}else if (this.regionId(x, y) == 4 || this.regionId(x, y) == 5){
				return this.checkPassage(x, y, (1 << (d / 2 - 1)) & 0x0f);
			}
			return true;
	};
	//プレイヤー用
	Game_Player.prototype.isMapPassable = function(x, y, d) {
		if (this._through == true) {
			return true;
		}
		var vehicle = this.vehicle();
		if (vehicle) {
			return vehicle.isMapPassable(x, y, d);
		} else {
			return Game_Character.prototype.isMapPassable.call(this, x, y, d);
		}
	};

	//武器の戦績の初期化
	Game_System.prototype.weaponRecordInitialize = function(id, weaponType) {
		var data = {};
		data.useCount = 0;
		data.shotCount = 0;
		data.killCount = 0;
		switch (weaponType) {
			case 1: $gameSystem._data.gunRecord[id] = data; return;
			case 2: $gameSystem._data.meleeRecord[id] = data; return;
			case 3: $gameSystem._data.bombRecord[id] = data; return;
		}
	}
	//武器の戦績を記録
	Game_System.prototype.weaponRecord = function(id, weaponType, countType) {
		switch (weaponType) {
			case 1: //銃
				if (!$gameSystem._data.gunRecord[id]) {
					this.weaponRecordInitialize(id, 1);
				}
				switch (countType) {
					case 1: $gameSystem._data.gunRecord[id].useCount += 1; return;
					case 2: $gameSystem._data.gunRecord[id].shotCount += 1; return;
					case 3: 
						$gameSystem._data.gunRecord[id].killCount += 1; 
						return;
				}
				break;
			case 2: //近接武器
				if (!$gameSystem._data.meleeRecord[id]) {
					this.weaponRecordInitialize(id, 2);
				}
				switch (countType) {
					case 1: $gameSystem._data.meleeRecord[id].useCount += 1; return;
					case 2: $gameSystem._data.meleeRecord[id].shotCount += 1; return;
					case 3: 
						$gameSystem._data.meleeRecord[id].killCount += 1; 
						return;
				}
				break;
			case 3: //投擲物
				if (!$gameSystem._data.bombRecord[id]) {
					this.weaponRecordInitialize(id, 3);
				}
				switch (countType) {
					case 1: $gameSystem._data.bombRecord[id].useCount += 1; return;
					case 2: $gameSystem._data.bombRecord[id].shotCount += 1; return;
					case 3: 
						$gameSystem._data.bombRecord[id].killCount += 1; 
						return;
				}
				break;
		}
	}

	//重傷者データの初期化
	Game_System.prototype.seriousWoundDataInitialize = function() {
		$gameVariables._data[3] = 0;
		this._data.seriousWound = [];
	}
	//重傷者を追加
	Game_System.prototype.addSeriousWound = function(eventId, weaponType, weaponId) {
		var data = {
			mapId : $gameMap._mapId,
			eventId : eventId,
			eventType : $gameMap._events[eventId].type(),
			weaponId : weaponId,
			weaponType : weaponType
		};
		this._data.seriousWound.push(data);
		//this.seriousWoundLog(data, "Add");
	}
	//重傷者データをコンソールに表示（公開時は不使用）
	Game_System.prototype.seriousWoundLog = function(data, text = "") {
		console.log(text + " MapID " + data.mapId + " EvID " + data.eventId + " weaponType " + data.weaponType + " weaponId " + data.weaponId);
	}
	//重傷者を殺害（ゲーム中）
	Game_System.prototype.killSeriousWounded = function(eventId) {
		for (var i = 0; i < this._data.seriousWound.length; i++) {
			if (this._data.seriousWound[i].mapId == $gameMap._mapId && this._data.seriousWound[i].eventId == eventId) {
				//this.seriousWoundLog(this._data.seriousWound[i], "kill");
				this._data.seriousWound.splice(i, 1);
			}
		}
	}
	//内搬送後死亡を実行（ゲーム終了時）
	Game_System.prototype.killSeriousWoundedRandomly = function(probability = 50) {

		$gameVariables._data[3] = this._data.seriousWound.length; //ゲーム終了時の重傷者数を記録
		$gameVariables._data[58] = 0;

		var random;
		var num = 0;

		for (var i = 0; i < this._data.seriousWound.length; i++) {

			num++;

			random = Math.floor(Math.random() * 101);
			if (random < probability) { //死亡

				var event = this._data.seriousWound[i];
				$gameVariables._data[58] += 1;

				if (event.weaponType == 1 && Number($dataWeapons[event.weaponId].meta.isShotgun) == 1) { //ショットガンキル
					$gameVariables._data[83] += 1; 
				}

				Game_Event.prototype.gainGold(event.eventType);
				this.weaponRecord(event.weaponId, event.weaponType, 3);

			}
		}

		$gameVariables._data[2] += $gameVariables._data[58];
		$gameVariables._data[33] += $gameVariables._data[58];

	}

	//ヤンデレが通常出現可能か
	Game_Map.prototype.canYandereSpawn = function(spawnPoint) {
		return spawnPoint == $gameVariables._data[42] && !$gameSwitches.value(40);
	}
	//ヤンデレ位置をランダムに決定
	Game_Map.prototype.setYandere = function() {
		$gameVariables._data[42] = Math.floor(Math.random() * 12 + 1);
	};
	//ヤンデレ位置を返す（教室湧きは廃止）
	Game_Map.prototype.yanderePosition = function() {
		var position = [
			"未定義","体育館前","防災倉庫前","保健室前","職員室前","2F南側廊下",
			"2F南側階段","3F南側廊下","多目的室","食堂","プール",
			"図書室","体育館","1-1","1-2","1-3",
			"2-1","2-2","2-3","3-1","3-2",
			"3-3"
		];
		return position[$gameVariables._data[42]];
	};

	//警察官位置を返す（増援に変更したため現在は不使用）
	Game_Map.prototype.policePosition = function() {
		var position = [
			"未定義","保健室前","職員室前","2F南側廊下","2F南側階段"
		];
		return position[$gameVariables._data[60]];
	};

	//イベント位置の保存と読み込み
	Scene_Map.prototype.saveEvents = function() {
		if (!$gameVariables._data[19][$gameMap._mapId]) $gameVariables._data[19][$gameMap._mapId] = [];
		for (var i = 1; i <= $gameMap._events.length; i++){
			if ($gameMap._events[i] && $gameMap._events[i].isInitialized()){
				if (!$gameVariables._data[19][$gameMap._mapId][i]) $gameVariables._data[19][$gameMap._mapId][i] = [];
				$gameVariables._data[19][$gameMap._mapId][i] = [$gameMap._events[i]._x, $gameMap._events[i]._y, $gameMap._events[i]._direction];
			}
		}
	};
	Scene_Map.prototype.loadEvents = function() {
		if ($gameVariables._data[19][$gameMap._mapId]) {
			for (var i = 1; i <= $gameMap._events.length; i++){
				if ($gameMap._events[i] && $gameMap._events[i].isInitialized()) {
					if ($gameVariables._data[19][$gameMap._mapId][i]) {
						$gameMap._events[i]._x = $gameVariables._data[19][$gameMap._mapId][i][0];
						$gameMap._events[i]._y = $gameVariables._data[19][$gameMap._mapId][i][1];
						$gameMap._events[i]._realX = $gameVariables._data[19][$gameMap._mapId][i][0];
						$gameMap._events[i]._realY = $gameVariables._data[19][$gameMap._mapId][i][1];
						$gameMap._events[i]._direction = $gameVariables._data[19][$gameMap._mapId][i][2];
					}
				}
			}
		}
			
		if ($gameVariables._data[6].indexOf($gameMap._mapId) < 0) {
			$gameSwitches.setValue(8,true);
			$gameVariables._data[6].push($gameMap._mapId);
		}
	};

	//時間経過による避難が可能なイベントか否か
	Game_Map.prototype.canEvacuation = function(name) {
		if (name == "female_students " || name == "male_students" || name == "w_teacher" || name == "teacher" || name == "shield") {
			return true;
		}else{
			return false;
		}
	}
	//時間による避難
	Game_Map.prototype.evacuation = function() {

		if (playerMoveRoute[playerMoveRoute.length - 3] == this._mapId) { //再入室なら避難しない
			return;
		}
		
		var canEscape = [];

		for (var i = 0; i < $gameVariables._data[1][this._mapId].length; i++) {
			if ($gameVariables._data[1][this._mapId][i]) {
				var event = $gameVariables._data[1][this._mapId][i];
				if (event.hp >= 50 && event.status != "escaped" && this.canEvacuation(this._events[i]._characterName)) {
					canEscape.push(i);
				}
			}
		}

		if (canEscape.length <= 0) return;

		var time = Math.floor($gameTimer._frames / 60);
		var escapeNumber = 0;

		if (time > 240) {

		} else if (time > 180) { // 最大１人の避難、職員室一掃なら避難しない

			if ($gameVariables._data[78] != 4 && $gameMap._mapId != 16) { //職員室一掃
				escapeNumber = Math.floor(Math.random() * 2);
			}

		} else if (time > 120) { // 少なくとも１人、最大２人、職員室一掃なら避難しない

			if ($gameVariables._data[78] != 4 && $gameMap._mapId != 16) {
				escapeNumber = 1 + Math.floor(Math.random() * 2);
			}else{
				escapeNumber = Math.floor(Math.random() * 2);
			}

		} else if (time > 60) { // 少なくとも２人　目に見えて減少

			escapeNumber = 2;

		} else if (time > 30) { // 少なくとも２人、最大３人　最大避難でほとんどのマップで劇的な減少

			escapeNumber = 2 + Math.floor(Math.random() * 2);

		}else{ //  少なくとも３人、最大４人　最大避難で小人数教室などでは生徒が０になる

			escapeNumber = 3 + Math.floor(Math.random() * 2);

		}

		for (var i = 0; i < canEscape.length; i++) {

			if (escapeNumber <= 0) return;

			var id = canEscape[i];

			$gameVariables._data[1][$gameMap._mapId][id].status = "escaped";
			this._events[id].changeEventStatus("escaped");

			escapeNumber -= 1;

		}
		
	};

	//プレイヤーが東城優美か否か
	Game_Player.prototype.isYuumi = function() {
		switch ($gameMap._mapId) {
			case 45:
			case 49:
			case 52:
				return false; //自宅では東城優美モードを解除
			default:
				return $gameSwitches.value(29);
		}
	}

	//被害者のタイプに基づいてポイントを獲得
	Game_Event.prototype.gainGold = function(type = this.type()) {
		var gold = 0;
		switch (type){
			case 1: gold = 400; $gameVariables._data[28]++; break;
			case 2: gold = 300; $gameVariables._data[29]++; break;
			case 3: gold = 200; $gameVariables._data[30]++; break;
			case 4: 
				gold = 100; 
				$gameVariables._data[31]++; 
				if ($gameMap._mapId == 16) { //職員室攻撃時の処理
					$gameVariables._data[78]++;
					if ($gameVariables._data[78] == 4) {
						$gameSystem.unlockAchievement(11);
						$gameVariables._data[75] += 1; //増援時間を伸ばす		
					}
				}
				break;
			case 5: //ヤンデレ
				gold = 5000; 
				$gameVariables._data[76].yandere.status = 4;
				$gameSwitches.setValue(35,true); 
				if ($gamePlayer.isYuumi()) {
					$gameSystem.unlockAchievement(10);
				}else{
					$gameSystem.unlockAchievement(9);
				}
				break;
			case 6: //男性警官
				gold = 5000; 
				$gameVariables._data[76].maleOfficer.status = 4;
				$gameSwitches.setValue(50,true); 
				$gameVariables._data[61]++; 
				$gameSystem.unlockAchievement(16);
				break;
			case 7: //女性警官
				gold = 5000; 
				$gameVariables._data[76].femaleOfficer.status = 4;
				$gameSwitches.setValue(51,true); 
				$gameVariables._data[61]++; 
				$gameSystem.unlockAchievement(16);
				break;
			case 8: //校長
				gold = 5000; 
				$gameVariables._data[76].principal.status = 4;
				$gameSwitches.setValue(51,true); 
				$gameVariables._data[61]++; 
				$gameSystem.unlockAchievement(18);
				break;
		}
		switch ($gameMap._mapId) {
			case 30: //食堂キル
				$gameVariables._data[89]++; 
				if ($gameVariables._data[89] >= 10) $gameSystem.unlockAchievement(14);
				break;
			case 31: //図書室キル
				$gameVariables._data[90]++; 
				if ($gameVariables._data[90] >= 10) $gameSystem.unlockAchievement(13);
				break;
			case 44: //体育館キル
				$gameVariables._data[88]++; 
				if ($gameVariables._data[88] >= 10) $gameSystem.unlockAchievement(12);
				break;
		}
		if ($gameVariables._data[33] >= 100) { //ともだち百人
			$gameSystem.unlockAchievement(24); 
		}
		$gameVariables._data[17] += gold;
		return gold;
	}
	
	//被害者のタイプを返す。
	Game_Event.prototype.type = function() {
		var type = 0;
		switch (this._characterName) {
			case "female_students ": type = 1; break;
			case "male_students": type = 2; break;
			case "w_teacher": type = 3; break;
			case "teacher": type = 4; break;
			case "shield": type = 4; break;
			case "yandere": type = 5; break;
			case "policeman": type = 6; break;
			case "w_policeman": type = 7; break;
			case "principal": type = 8; break;
		}
		return type;
	};

	//ダメージ音の再生
	Game_Event.prototype.playDamageSE = function(damageType, critical = false) {

		var name = "";
		var volume = critical ? 120 - Math.floor(Math.random() * 11) : 105 - Math.floor(Math.random() * 11);
		var pitch = critical ? 90 - Math.floor(Math.random() * 11) : 105 - Math.floor(Math.random() * 11);

		switch (damageType) {
		case "gun":
			name = "damage3";
			volume = 100 - ($gameMap.distance($gamePlayer._x, $gamePlayer._y, this._x, this._y) * 10);
			if (volume < 50) volume = 50;
			break;
		case "knife":
			name = "damage3";
			if (!$gamePlayer.isYuumi() && $gameParty.leader()._equips[3]._itemId == 13) {
				volume = 100;
			}else{
				volume = 50;
			}
			break;
		case "knifeSkill":
			name = "stab";
			volume = 50;
			break;
		case "bomb":
			name = "damage3";
			volume = 50;
			break;
		}

		if (name) {
			AudioManager.playSe({"name":name,"volume":volume,"pitch":pitch,"pan":0});
		}

	}

	//命中率
	Game_Player.prototype.accuracy = function() {

		var weapon = $dataWeapons[$gameParty.leader()._equips[0]._itemId];
		var acc = 0;

		if (this.isYuumi() || $gameSwitches.value(61)) { //近接武器なら命中率は100％
			acc = 100;
		}else{
			acc = Math.floor(($gameVariables._data[4] + $gameVariables._data[8]) / 2);
			if (Number(weapon.meta.isShotgun)) acc += 25; //ショットガン命中率加算
			if (!$gameSwitches.value(20)) {
				acc -= 50;
			}else{
				acc -= $gameVariables._data[35]; //ADS命中率減算
			}
		}
		if ($gamePlayer.isCQC() && acc < 50) { //CQCなら下限値50
			acc = 50;
		}
		if (acc < 0) acc = 0; //命中率がマイナスなら0にする

		return  acc;
	}

	//クリティカル率
	Game_Player.prototype.criticalRate = function(melee) {
		var criticalRate = 5;
		if (melee && $gameActors.actor(1).hasSkill(24)) { //切り裂き魔
			criticalRate = 10;
		}else if (!melee && $gameActors.actor(1).hasSkill(14)) { //シャープシューター
			criticalRate = 10;
		}
		if ($gameSwitches.value(40)) { //命中率によるクリティカル率の低下
			criticalRate = Math.floor(criticalRate * $gamePlayer.accuracy() / 100);
		}
		return criticalRate;
	}

	//射撃時の命中率と乱数結果の保存（デバッグ時のみ）
	Game_System.prototype.recordShootingResult = function(acc, rand, hit, critical, dmg, hp) {
		if (this._shootingResult === undefined) {
			this._shootingResult = [];
			return;
		}
		var result = "命中率 " + acc + " 乱数結果 " + rand + " 命中 " + hit + " クリティカル " + critical + " ダメージ " + dmg + " 体力 " + hp;
		if (this._shootingResult.length >= 10) {
			this._shootingResult.splice(0, 1);
		}
		this._shootingResult.push(result);
	}

	//命中判定ループ処理。
	function hitDecision(meleeAttack = false){

		//ターゲットリストにイベントが存在する時
		if ($gamePlayer.targetList.length > 0) {

			var attackType = $gamePlayer.attackType(meleeAttack);
			var gun = $dataWeapons[$gameParty.leader()._equips[0]._itemId];

			var event = $gamePlayer.targetId ? $gameMap._events[$gamePlayer.targetId] : $gameMap._events[$gamePlayer.targetList[0]._eventId];
			var name = event._characterName;
			var id = event._eventId;
			var ex = $gameMap._events[id]._x; 
			var ey = $gameMap._events[id]._y;
			var maxHp = name == "yandere" ? 200 : 100;
			var eventHp = $gameVariables._data[1][$gameMap._mapId][id].hp;
			var _eventHp = eventHp;
			var shield = false;

			var dmg = 0;
			var armorDmg = 0;
			var marksmanDmg = 0;
			var criticalHit = false;
			var acc = $gamePlayer.accuracy();
			var isHit = false;
			var rand = 0;
			var shootingRand = 0;
			var result = 0;

			var weaponType;
			var weaponId;

			switch (attackType) {
			case 1: //優美のナイフ
				weaponType = 2;
				weaponId = 14;
				break;
			case 2: //スパイク銃剣
				weaponType = 2;
				weaponId = 15;
				break;
			case 3: //近接武器
				weaponType = 2;
				weaponId = $gameParty.leader()._equips[3]._itemId;
				break;
			case 4: //銃
				weaponType = 1;
				weaponId = $gameParty.leader()._equips[0]._itemId;
				break;
			}

			//防弾チェック
			if ($gameVariables._data[1][$gameMap._mapId][id].shield > 0) {
				if (name == "shield" || name == "policeman" || name == "w_policeman") {
					shield = true;
				}
			}
			
			if (eventHp >= 1){ //体力あり

				if ($gamePlayer.isCQC() && eventHp < 50 && $gameActors.actor(1).hasSkill(12) && Math.floor(Math.random() * 2) == 0) {

					//ペインキラー発動、重傷者かつゼロ距離なら、50％の確立で殺害。

					$gameVariables._data[1][$gameMap._mapId][id].hp = 0;
					$gameVariables._data[1][$gameMap._mapId][id].lastDamage = 0;
					Scene_Map.prototype.createSplatterBlood(ex, ey);
					$gameMap._events[id].requestAnimation(8);
					$gameSystem.killSeriousWounded(id);

					if (meleeAttack) {
						event.playDamageSE("knife", true);
					}else{
						$gameVariables._data[27]++; //ペインキラー命中加算
						event.playDamageSE("gun", true);
					}

					result = 2; //ペインキラーにより死亡
					isHit = true;
					
				}else{ 
					
					//通常ダメージ

					rand = Math.floor(Math.random() * 101);
					shootingRand = rand;

					if (meleeAttack || acc >= rand) { //命中時

						isHit = true;

						switch (attackType) { //基本ダメージ値
						case 1:
							dmg = $dataArmors[14].params[2];
							break;
						case 2:
							dmg = $dataArmors[15].params[2];
							break;
						case 3:
							dmg = $dataArmors[$gameParty.leader()._equips[3]._itemId].params[2];
							break;
						case 4:
							dmg = gun.params[2];
							$gameVariables._data[27]++; //命中加算
							if (acc == 100 && $gameActors.actor(1).hasSkill(20) && gun.meta.type == 4) { //マークスマンスキル
								marksmanDmg = Math.round(dmg * 0.15);
								dmg = dmg + marksmanDmg;
							}
							break;
						}

						//防弾へのダメージ
						if (shield){

							var num = 0;
							
							//ダメージ有効率
							if (meleeAttack){
								num = 0;
							}else if(Number(gun.meta.isShotgun) || dmg < 60){
								num = 0.4;
							}else if(dmg < 110){ //5.56mm, 7.62x39mm etc
								num = 0.8;
							}else{ //D50, G91
								num = 1;
							}

							armorDmg = num == 1 ? 100 : Math.round(dmg * num);
							$gameVariables._data[1][$gameMap._mapId][id].shield -= armorDmg;

							if ($gameVariables._data[1][$gameMap._mapId][id].shield > 0){
								$gameMap._events[id].requestAnimation(15);
							}else{
								shield = false;
							}

						}
						if (!shield) {

							$gameMap._events[id]._getShotTimer = 60; //被弾タイマーの作動

							//ダメージ計算
							if (attackType == 4){ //銃撃

								if (Number(gun.meta.isShotgun)) { //ショットガンダメージ距離減衰
									var distance = $gameMap.distance($gamePlayer._x, $gamePlayer._y, event._x, event._y) - 1;
									var decrease = distance * 5;
									if (decrease > 50) decrease = 50;
									dmg -= decrease;
								}

							}else{ //近接攻撃

								if ($gameVariables._data[4] >= 50) { //スタミナ値に応じてダメージが減少、最大で半減
									dmg = Math.floor(dmg * ($gameVariables._data[4] / 100) );
								}else{
									dmg = Math.floor(dmg / 2);
								}
						
							}

							//クリティカルヒットによるダメージ倍増
							rand = Math.floor(Math.random() * 101);
							if (rand <= $gamePlayer.criticalRate(meleeAttack) && !shield) {
								dmg = dmg * 2;
								criticalHit = true;
							}

							//命中率によるダメージ減算
							if ($gameSwitches.value(40) && acc < 100 && attackType == 4) {
								dmg = Math.floor(dmg * (acc / 100));
							}

							//モンスタースチューデントによる教師ダメージ増加
							if ($gameActors.actor(1).hasSkill(13) && (name == "teacher" || name == "w_teacher" || name == "principal")){
								dmg = Math.round(dmg * 1.25);
							}

							//ダメージ確定
							$gameVariables._data[1][$gameMap._mapId][id].hp -= dmg;
							$gameVariables._data[1][$gameMap._mapId][id].lastDamage = dmg;
							eventHp -= dmg;

							//被弾エフェクト
							if (criticalHit) {
								$gameMap._events[id].requestAnimation(8);
							}else{
								$gameMap._events[id].requestAnimation(2);
							}

							//ダメージの大きさによる出血
							var level = Math.floor(dmg / 10); 
							if (!Scene_Map.prototype.isBlood(ex, ey)) {
								if (dmg >= 50){
									Scene_Map.prototype.createBlood(ex, ey, 0, 2);
								}else{
									Scene_Map.prototype.createBlood(ex, ey, 0, 1);
								}
							}
							Scene_Map.prototype.createSplatterBlood(ex, ey, level);

							//被弾音の再生 x2
							if (meleeAttack) {
								event.playDamageSE("knife", criticalHit);
							}else{
								event.playDamageSE("gun", criticalHit);
							}

							if (_eventHp == maxHp) { //最大体力から被弾

								if (eventHp >= 50) { //負傷
									$gameVariables._data[56] += 1;
								}else if (eventHp > 0) { //重傷
									$gameSystem.addSeriousWound(id, weaponType, weaponId);
								}else{ //死亡
									result = 3;
								}

								if (name != "yandere" && Math.floor(Math.random() * 2) == 0) { //被弾時のセリフ
									$gameMap._events[id].speakHitText();
								}

							}else if (_eventHp != maxHp && _eventHp >= 50){ //負傷から被弾

								if (eventHp < 50 && eventHp > 0){ //重傷
									$gameSystem.addSeriousWound(id, weaponType, weaponId);
									$gameVariables._data[56] -= 1;
								}else if (eventHp <= 0) { //死亡
									$gameVariables._data[56] -= 1;
									result = 3;
								}

							}else if (_eventHp < 50 && _eventHp > 0){ //重傷から被弾

								if (eventHp <= 0){
									$gameSystem.killSeriousWounded(id);
									result = 3;
								}

							}

						}

					} //命中時の処理ここまで
					
					if ($gameSwitches.value(36)){ //デバッグ時に射撃結果を保存する
						$gameSystem.recordShootingResult(acc, shootingRand, isHit, criticalHit, dmg, $gameVariables._data[1][$gameMap._mapId][id].hp);
					}
				
				} //ペインキラーまたは通常ダメージ

			}else if($gameSwitches.value(40)){ //死体撃ち

				//命中判定
				if ($gamePlayer.isYuumi() || meleeAttack || $gamePlayer.accuracy() >= Math.floor(Math.random() * 101)) {
					$gameMap._events[id].requestAnimation(2);
					if ($gamePlayer.isYuumi() || meleeAttack) {
						event.playDamageSE("knife");
					}else{
						$gameVariables._data[27]++; //死体撃ち命中加算
						event.playDamageSE("gun");
					}
				}
				
			} //生存ターゲットへの攻撃、または死体撃ち

		} //ターゲットリストが存在する時

		//殺害時の処理
		if (result > 0) {

			if (!Scene_Map.prototype.isBlood(ex, ey)) Scene_Map.prototype.createBlood(ex, ey, 0, 3);

			$gameVariables._data[2]++; //殺害数加算
			$gameVariables._data[33]++; //合計殺害数加算
			if (attackType == 4 && Number(gun.meta.isShotgun) == 1) { //散弾キル加算
				$gameVariables._data[83]++;
			}

			$gameMap._events[id].gainGold();

			//殺害を記録
			switch (attackType) {
			case 1:
				$gameSystem.weaponRecord(weaponId, 2, 3);
				break;
			case 2:
				$gameSystem.weaponRecord(weaponId, 2, 3);
				break;
			case 3:
				$gameSystem.weaponRecord(weaponId, 2, 3);
				break;
			case 4:
				$gameSystem.weaponRecord(weaponId, 1, 3);
				break;
			}

			$gamePlayer.speakTimer(); //発言カウントを更新
			$gamePlayer.speakKillText(name); //殺害時の台詞

		}

		//エネミーステータスを変更
		if (name == "yandere" || name == "policeman" || name == "w_policeman" || name == "principal") {
			var hp = $gameVariables._data[1][$gameMap._mapId][id].hp;
			var shield = $gameVariables._data[1][$gameMap._mapId][id].shield;
			$gameMap.setEnemyData(name, hp, shield);
		}

	};

	//攻撃タイプを返す
	Game_Player.prototype.attackType = function(meleeAttack = false) {
		var type;
		if ($gamePlayer.isYuumi()) {
			type = 1;
		}else if ($gamePlayer.isBayonetAttacking()) {
			type = 2;
		}else if (meleeAttack) {
			type = 3;
		}else{
			type = 4;
		}
		return type;
	}
	
	//CQC時の必中用カウント（停止中）
	Game_Player.prototype.CQCshootCount = function() {
		if (this.shootCount === undefined || !this.isCQC()) {
			this.shootCount = 0;
		}else{
			this.shootCount++;
			if (this.shootCount >= 4) {
				this.shootCount = 1;
			}
		}
	}

	//射撃練習用。
	function TrainingHitDecision(){

		if ($gamePlayer.targetList.length > 0) {

			if ($gamePlayer.targetId) {
				var event = $gameMap._events[$gamePlayer.targetId];
			}else{
				var event = $gameMap._events[$gamePlayer.targetList[0]._eventId];
			}

			var id = event._eventId;
			var eventHp = $gameVariables._data[1][$gameMap._mapId][id].hp;
			$gameVariables._data[1][$gameMap._mapId][id].lastDamage = 0;

			if (eventHp >= 1){
				
				var key_a = [$gameMap._mapId, id, "A"];
				var recoil = Math.round(($gameVariables._data[4] + $gameVariables._data[8]) / 2);
				recoil = Math.round(recoil -= $gameVariables._data[35]);
				var rand = Math.floor(Math.random() * 101);

				if (recoil >= rand){

					$gameVariables._data[27]++; //命中回数

					if (event._characterName == "!$target") { //連続射撃チュートリアル用
						AudioManager.playSe({"name":"hitTarget","volume":50,"pitch":120 + Math.floor(Math.random() * 11),"pan":0});
						$gameSelfSwitches.setValue([$gameMap._mapId, event._eventId, "A"], true);
						return;
					}

					if ($gameVariables._data[23] == 1) { //非ADSでチュートリアルを進行
						var ads = $gameSwitches.value(20);
						if (!ads) $gameSwitches.setValue(48,true);
					}

					$gameSelfSwitches.setValue(key_a, true);
					$gameVariables._data[2] += 1;
					$gameVariables._data[1][$gameMap._mapId][id].hp = 0;

				}

			}
		}

	};

	//チュートリアル時のキー動作制限
	Game_Player.prototype.tutorialCheck = function(type) {
		if ($gameMap._mapId == 53) {
			var progress = $gameVariables._data[23];
			switch (type) {
				case 1: //ナイフ装備
					return progress >= 13;
				case 2: //即時近接攻撃
					return false;
				case 3: //リロード
					return true;
				case 4: //武器チェンジ
					return progress >= 3;
				case 5: //投擲
					return progress == 10;
				case 6: //メインウェポンへ切り替え
					return progress >= 7;
				case 7: //サイドアームへ切り替え
					return progress >= 7;
			}
		}else{
			return true;
		}
	}

	//チュートリアル目標の描画
	Scene_Map.prototype.makeTutorialSprite = function() {
		var sprite = new Sprite();
		var id = this.tutorialTextId();
		sprite.bitmap = new Bitmap(Graphics.boxWidth, 100);
		sprite.bitmap.fontSize = 20;
		sprite.bitmap.drawText(tutorialTextA[id], -20, 0, sprite.width, sprite.height, "right");
		sprite.bitmap.drawText(tutorialTextB[id], -20, 28, sprite.width, sprite.height, "right");
		sprite.x = 0;
		sprite.y = 0;
		sprite.visible = false;
		if (this.tutorialSprite) {
			this.removeChild(this.tutorialSprite);
		}
		this.tutorialSprite = sprite;
		this.addChild(this.tutorialSprite);
	}

	//チュートリアル進行度に応じてテキストのidを返す
	Scene_Map.prototype.tutorialTextId = function() {
		var id = 0;
		switch ($gameVariables._data[23]) {
			case 1: // 空き缶
				id = 0; break;
			case 4: // サイドアーム
				id = 1; break;
			case 7: // 的当て
				id = 2; break;
			case 10: // パイプ爆弾
				id = 3; break;
			case 13: // 近接武器
				id = 4; break;
			case 15: // 近接武器戻し
				id = 5; break;
		}
		return id;
	}

	// マガジン変数参照＆減算
	remaining = function(){
		return magazine;
	}
	decrease = function(num){
		magazine -= num;
	}
	resetMagazine = function(){
		magazine = 0;
		magazine2 = 0;
	}

	//マガジン数＆散弾数を設定
	Scene_Map.prototype.magazineInitialize = function() {

		magazine = 0;
		magazine2 = 0;
		$gameVariables._data[50] = []; 
		$gameVariables._data[51] = [];
		$gameVariables._data[63] = 0;
		$gameVariables._data[64] = 0;
		var num = 0;
		var mag = 0; 
		var rnd = 0; 
	
		//東城使用時に残弾を1発だけ追加
		if ($gamePlayer.isYuumi()) {
			magazine = 1;
			return;
		}

		for (var i = 0; i < 2; i++){

			var weapon = $dataWeapons[$gameParty.leader()._equips[i]._itemId];

			if (weapon.meta["isPump"] == "0"){

				num = i ? 51 : 50;
				mag = Number(weapon.meta.magazine) + 1; 
				rnd = Number(weapon.meta.rnd);

				for (var i2 = 0; i2 < mag; i2++){
					$gameVariables._data[num][i2] = rnd;
				}

			}else{ 
				num = i ? 64 : 63;
				$gameVariables._data[num] = Number(weapon.meta.magazine);
			}

		}

	};

	//グレネードを投げられるか
	Game_Player.prototype.canThrowGrenade = function() {

		 //チュートリアル用
		if ($gameMap._mapId == 53 && 
			$gameVariables._data[23] == 10 &&
			!$gameSwitches.value(3) &&
			!$gameSwitches.value(10) &&
			!$gameSwitches.value(12) && 
			!$gameSwitches.value(13) && 
			!$gameSwitches.value(20) && 
			!$gamePlayer.isDashing()) {

			return true;

		}

		if($gameVariables._data[41] > 0 && 
		   !$gameSwitches.value(3) && 
		   !$gameSwitches.value(10) && 
		   !$gameSwitches.value(12) && 
		   !$gameSwitches.value(13) && 
		   !$gameSwitches.value(20) && 
		   !$gameSwitches.value(25) && 
		   !$gamePlayer.isDashing()){

			return true;

		}

		return false;

	}
	
	//攻撃もしくはリロード可能か
	Game_Player.prototype.canShootOrReload = function() {
		// 2 射撃可能 3 リロード中 4 射撃ウェイト中 10 武器入れ替え中 25 トレーニング中 59 即時近接攻撃 62 近接武器取り出し中
		var schoolOrTraining = $gameSwitches.value(2) || $gameSwitches.value(25);
		if (schoolOrTraining && 
			!SceneManager.isSceneChanging() && 
			!$gameSwitches.value(3) && 
			!$gameSwitches.value(4) && 
			!$gameSwitches.value(10) &&
			!$gameSwitches.value(59) &&
			!$gameSwitches.value(62) &&
			!$gamePlayer.isDashing() &&
			$gameVariables._data[70] != 1) {

			return true;

		}
		return false;
	}

	//近接攻撃の開始
	Game_Player.prototype.startMeleeAttack = function() {
		var schoolOrTraining = $gameSwitches.value(2) || $gameSwitches.value(25);
		if (schoolOrTraining && 
			!SceneManager.isSceneChanging() && 
			!$gameSwitches.value(4) && 
			!$gameSwitches.value(10) &&
			!$gameSwitches.value(59) &&
			!$gameSwitches.value(62) &&
			!$gamePlayer.isDashing() &&
			$gameVariables._data[70] != 1 &&
			$gameVariables._data[4] > 0) {

			if ($gameSwitches.value(3)) $gameSwitches.setValue(3,false);
			$gameSwitches.setValue(59,true);

		}
	}
	//近接攻撃
	Game_Player.prototype.meleeAttack = function() {
		var pitch;
		if (this.isBayonetAttacking()) {
			var id = 15;
			pitch = 100;
		}else{
			var id = this.isYuumi() ? 14 : $gameParty.leader()._equips[3]._itemId;
			pitch = id == 13 ? 80 : 150;
		}
		AudioManager.playSe({"name":"sword5","volume":100,"pitch":pitch,"pan":0});
		if (!$gameVariables._data[80]) { //近接攻撃回数の加算
			$gameVariables._data[80] = 1;
		}else{
			$gameVariables._data[80] += 1;
		}
		$gameSystem.weaponRecord(id, 2, 2);
		hitDecision(true);
		if ($gameVariables._data[4] > 0) { //スタミナの消費
			var useStamina = Number($dataArmors[id].meta.useStamina);
			$gameVariables._data[4] -= useStamina;
		}
	}
	//銃剣攻撃が可能か
	Game_Player.prototype.canBayonetAttack = function() {
		return !this.isYuumi() && $gameParty.leader()._equips[0]._itemId == 5 && !$gameSwitches.value(59);
	}
	//銃剣攻撃中か
	Game_Player.prototype.isBayonetAttacking = function() {
		return !this.isYuumi() && $gameParty.leader()._equips[0]._itemId == 5 && $gameSwitches.value(59);
	}

	//マガジンの装弾状況をチェックする
	Game_Player.prototype.magazineStatus = function() {
		var weapon = $dataWeapons[$gameParty.leader()._equips[0]._itemId];
		var magCapacity = Number(weapon.meta.rnd);
		var chamber = weapon.meta["isPump"] == 0 && weapon.meta["isOB"] == "0" ? 1 : 0;
		if (chamber) { 
			if (magCapacity + chamber == magazine) { //フル装填 +1
				return 3;
			}else if (magCapacity == magazine) { //フル装填
				return 2;
			}else{ //非フル装填
				return 1;
			}
		}else{
			if (magCapacity == magazine) { //フル装填
				return 2;
			}else{ //非フル装填
				return 1;
			}
		}
	}

	//リロードが実行できるなら実行する
	Game_Player.prototype.reload = function() {
		if (!this.canShootOrReload()) return;

		var weapon = $dataWeapons[$gameParty.leader()._equips[0]._itemId];
		var execute = false;
		var chamber = 0;

		//マガジン式かつクローズドボルトならチャンバーの一発を含めて計算する
		if (weapon.meta["isPump"] == 0 && weapon.meta["isOB"] == "0"){
			chamber = 1;
		}
		
		//最大装弾数でないならリロードを試みる
		if(Number(weapon.meta.rnd) + chamber != magazine) {

			//ハードモードでないなら無条件でリロードを実行
			if (!$gameSwitches.value(40)) {
				if ($gameSwitches.value(20)) $gamePlayer.ads(); //ADSを解除
				$gameSwitches.setValue(3,true);
				return;
			}

			if (weapon.meta["isPump"] == "0"){
				//マガジン式。50はメイン、51はサブのマガジンリスト。
				var num = weapon.wtypeId == 1 ? 50 : 51;
				if (Math.max(...$gameVariables._data[num]) != 0 && Math.max(...$gameVariables._data[num]) >= magazine) {
					execute = true;
				}
			}else{
				var num = weapon.wtypeId == 1 ? 63 : 64;
				if (weapon.meta["isPump"] == "1"){
					//ポンプアクション
					if ($gameVariables._data[num] > 0) {
						execute = true;
					}
				}else{
					//二連式
					if ($gameVariables._data[num] - magazine > 0) {
						execute = true;
					}
				}
			}

			if (execute) {
				if ($gameSwitches.value(20)) $gamePlayer.ads(); //ADSを解除
				$gameSwitches.setValue(3,true);
			}

		}
	}

	//マガジンの残弾を、武器の装弾数にする。
	Scene_Map.prototype.reloading = function() {

		var weapon = $dataWeapons[$gameParty.leader()._equips[0]._itemId];

		//射撃訓練用
		if ($gameMap._mapId == 52) {
			magazine > 0 ? magazine = 11 : magazine = 10;
			return;
		}

		//シミュレーションモードかつマガジン式
		if ($gameSwitches.value(40) && weapon.meta["isPump"] == "0"){

			var wtype = weapon.wtypeId;
			var num = wtype == 1 ? 50 : 51;
			var max = Math.max(...$gameVariables._data[num]);
			var i = 0;

			if (max){

				$gameVariables._data[num].forEach(function (value, index, array) { if (value == max) i = index;});
				if (magazine > 0 && weapon.meta["isOB"] != "1") {
					magazine -= 1;
					$gameVariables._data[num][i] += 1;
				}
				var temp = magazine;
				magazine = $gameVariables._data[num][i];
				$gameVariables._data[num][i] = temp;

			}

		}else{

			if (weapon.meta["isPump"] == "0" && magazine > 0 && weapon.meta["isOB"] != "1"){
				magazine = Number(weapon.meta.rnd) + 1;
			}else{
				magazine = Number(weapon.meta.rnd);
			}

		}
		
	};

	//サブマガジンの残弾を、武器の装弾数にする（スタート時のみ使用）
	Scene_Map.prototype.reloading2 = function() {
	    magazine2 = $dataWeapons[$gameParty.leader()._equips[1]._itemId].meta.rnd;
	};

	//ショットガン用に一発だけ装填。
	Scene_Map.prototype.shotgun_reload = function() {
		
		var weapon = $dataWeapons[$gameParty.leader()._equips[0]._itemId];
		var num = weapon.wtypeId == 1 ? 63 : 64;
		var sub = 0;

		//ポンプアクションなら一発装填、二連式なら撃った分だけ装填。
		if (weapon.meta["isPump"] == "1"){
			sub = 1;
		}else{
			sub = remaining() == 0 ? 2 : 1;
		}
		if ($gameSwitches.value(40)) $gameVariables._data[num] -= sub;
		magazine += sub;

	};

	//射撃モードを返す
	Game_Player.prototype.checkFireMode = function() {
		if ($gameVariables._data[77]) {
			var weaponId = $gameParty.leader()._equips[0]._itemId;
			var weaponType = $dataWeapons[weaponId].wtypeId - 1;
			var fireMode = SelectiveFire[weaponId];
			var index = $gameVariables._data[77][weaponType];
			return fireMode[index];
		}
	}
	//射撃モードを初期化する
	Game_Player.prototype.resetFireMode = function() {
		if (!this.isYuumi()) {

			var weapon1 = $gameParty.leader()._equips[0]._itemId;
			var weapon2 = $gameParty.leader()._equips[1]._itemId;

			if ($dataWeapons[$gameParty.leader()._equips[0]._itemId].wtypeId != 1) {
				weapon1 = $gameParty.leader()._equips[1]._itemId;
				weapon2 = $gameParty.leader()._equips[0]._itemId;
			}

			var fireMode1 = SelectiveFire[weapon1];
			var fireMode2 = SelectiveFire[weapon2];

			if (!$gameVariables._data[77]) $gameVariables._data[77] = [];
			
			$gameVariables._data[77][0] = fireMode1.length - 1;
			$gameVariables._data[77][1] = fireMode2.length - 1;

		}else{
			return;
		}
	}
	//射撃モードを変更する
	Game_Player.prototype.changeFireMode = function() {

		var schoolOrTraining = $gameSwitches.value(2) || $gameSwitches.value(25);

		if (!schoolOrTraining || 
			SceneManager.isSceneChanging() ||
			$gameSwitches.value(3) || 
			$gameSwitches.value(4) || 
			$gameSwitches.value(10) || 
			$gameVariables._data[70] == 1) {
			return;
		}

		var weaponId = $gameParty.leader()._equips[0]._itemId;
		var weaponType = $dataWeapons[weaponId].wtypeId - 1;
		var fireMode = SelectiveFire[weaponId];

		if (fireMode.length < 2) {
			return;
		}

		if (!$gameVariables._data[77]) this.resetFireMode();

		var oldFireMode = $gameVariables._data[77][weaponType];

		if (oldFireMode + 1 >= fireMode.length) {
			$gameVariables._data[77][weaponType] = 0;
		}else{
			$gameVariables._data[77][weaponType] = oldFireMode + 1;
		}

		AudioManager.playSe({"name":"Selector","volume":40,"pitch":100,"pan":0});

	}

	Game_Player.prototype.isDashButtonPressed = function() {
		var shift = Input.isPressed('shift');
		var cancel = Input.isPressed('cancel');
		if (ConfigManager.alwaysDash) {
			if (shift || cancel) {
				return false;
			}else{
				return true;
			}
		} else {
			if (shift || cancel) {
				return true;
			}else{
				return false;
			}
		}
	};
	//ADS時はダッシュ扱いしない
	Game_Player.prototype.isDashing = function() {
		if ($gameSwitches.value(20) || !this.isKeepMoving()) { //ADS中
			return false;
		}
		if (this.moveBack || this.stopBack) {
			return false;
		}
		return this._dashing;
	};	
	Game_Player.prototype.isMoving = function() {
		if (this._realX !== this._x || this._realY !== this._y) {
			this.movingCoolDown = 10;
			return true;
		}else{
			return false;
		}
	};
	Game_Player.prototype.isKeepMoving = function() {
		if (this.isMoving()) {
			return true;
		}else if (this.movingCoolDown > 0) {
			return true;
		}else{
			return false;
		}
	};
	Game_Player.prototype.updateDashing = function() {
		if (this.moveBack || this.stopBack || $gamePlayer.realMoveSpeed() == 3.8) {
			this._dashing = false;
			return;
		}
		if (this.botDashing && $gameSwitches.value(53)) { //BOTダッシュ
			this._dashing = true;
			return;
		}
		if ($gameSwitches.value(49)) { //優美スキル
			this._dashing = true;
			return;
		}
		if (this.isMoving()) {
			return;
		}
		if (this.canMove() && !this.isInVehicle() && !$gameMap.isDashDisabled() && !$gameSwitches.value(6)) {
			this._dashing = this.isDashButtonPressed() || $gameTemp.isDestinationValid();
		} else {
			this._dashing = false;
		}
	};

	// プレイヤー変数追加
	var GPI = Game_Player.prototype.initMembers;
	Game_Player.prototype.initMembers = function() {
		GPI.call(this);
		this._walkSE = 0;
		this.targetList = [];
		this.targetId = 0;
		this.moveBack = false;
		this.stopBack = false;
		this.movingCoolDown = 0;
		this.reloadProgress = 0;
	};

	Game_Player.prototype.moveByInput = function() {

		//後方移動キーを押している、または離した時の処理
		if (Input.isPressed('back')) {
			if (!this.moveBack && !this.isDashing()) {
				this.moveBack = true;
			}
		}else{
			if (this.moveBack && this.isKeepMoving()) {
				this.moveBack = false;
			}
		}

		//通常移動が行われた、またはマップ移動時に後ずさりをキャンセル
		if (this.getInputDirection() > 0 || this._transferring) {
			this.moveBack = false;
		}

		if (!this.isMoving() && this.canMove()) {
			if (this.moveBack && !this.stopBack) {
				this.moveBackward();
				return;
			}
			var direction = this.getInputDirection();
			if (direction > 0) {
				$gameTemp.clearDestination();
			} else if ($gameTemp.isDestinationValid()){
				var x = $gameTemp.destinationX();
				var y = $gameTemp.destinationY();
				direction = this.findDirectionTo(x, y);
			}
			if (direction > 0) {
				this.executeMove(direction);
			}
		}
		
	};

	//移動速度を設定する
	Game_Player.prototype.setMoveSpeed = function() {

		if ($gameVariables._data[92]) {
			this._moveSpeed = $gameVariables._data[92];
			return;
		}

		var ads = $gameSwitches.value(20);
		var spd = this.isYuumi() ? 4.3 : 4;
		if (this.isYuumi() && $gameSwitches.value(49)) { //突撃スキル発動中
			spd = 5;
		}else{
			if (ads) { //ADS中
				spd = $gameActors.actor(1).hasSkill(23) ? 3.8 : 3.2;
			}
			if (this.moveBack) { //後ずさり中
				spd -= (ads ? 0.4 : 0.2);
			}
		}
		this._moveSpeed = spd;

	}

	//スタミナ回復
	Game_Player.prototype.staminaRecovery = function() {
		if ($gameVariables._data[4] < 100 - $gameVariables._data[62]){
			var rec = 1;
			if ($gameSwitches.value(40)) {
				rec = $gamePlayer.isYuumi() ? 0.9 : 0.6;
			}
			if ($gameVariables._data[4] + rec > 100){
			  $gameVariables._data[4] = 100;
			}else{
			  $gameVariables._data[4] += rec;
			}
		}
	}

	Game_Player.prototype.moveStraight = function(d, back = false) {

		this.moveBack = back;
		var ads = $gameSwitches.value(20);
		
		if (ads && !back) {
			//ゲーム中でないなら強制的にadsをfalseにする。
			if (!$gameSwitches.value(5)) {
				ads = false;
				return;
			}
			//ダッシュキーを押していないなら向きを変える
			if (!this.isDashButtonPressed()) {
				this.setDirection(d);
				return;
			}
		}

		//歩行音再生
		if (this.canPass(this.x, this.y, d)) {
			this._followers.updateMove();
			$gameSwitches.setValue(15,true);
		}

		//ダメージを受けているならランダムで出血
		if (!Scene_Map.prototype.isBlood(this.x, this.y) && $gameVariables._data[62] > 0) {
			var probability = $gameVariables._data[62] / 4;
			var bleeding = probability > Math.floor(Math.random() * 100);
			if (bleeding) {
				Scene_Map.prototype.createBlood(this.x, this.y, 0, 1);
			}
		}

		this.setMoveSpeed();
		Game_Character.prototype.moveStraight.call(this, d);
	};

	Game_Player.prototype.moveBackward = function() {
		var lastDirectionFix = this.isDirectionFixed();
		this.setDirectionFix(true);
		this.moveStraight(this.reverseDir(this.direction()), true);
		this.setDirectionFix(lastDirectionFix);
	};

	Game_Player.prototype.update = function(sceneActive) {
		var lastScrolledX = this.scrolledX();
		var lastScrolledY = this.scrolledY();
		var wasMoving = this.isMoving();
		this.updateDashing();
		if (sceneActive) {
			this.moveByInput();
		}
		Game_Character.prototype.update.call(this);
		this.updateScroll(lastScrolledX, lastScrolledY);
		this.updateVehicle();
		if (!this.isMoving()) {
			this.updateNonmoving(wasMoving);
		}
		this._followers.update();
		if (this.movingCoolDown > 0) {
			this.movingCoolDown -= 1;
		}
	};
	
	//キャラクターグラフィック変更。
	Scene_Map.prototype.playerPicChange = function() {
		var wtype = $dataWeapons[$gameParty.leader()._equips[0]._itemId].wtypeId == 1 ? 2 : 1;
		var ads = $gameSwitches.value(20) ? 5 : 0
		if($gamePlayer.isYuumi()){ //東城優美
			$gameActors._data[1].setCharacterImage("yuumi", 0);
		}else if ($gameSwitches.value(61)) { //近接武器
			$gameActors._data[1].setCharacterImage("shooter", 5);
		}else{ //銃
			if ($gameParty.leader()._equips[0]._itemId) {

			}
			$gameActors._data[1].setCharacterImage("shooter", ads + wtype);
		}
		$gamePlayer.refresh();
	}

	//キーが押された時の動作
	var _Scene_Map_updateScene = Scene_Map.prototype.updateScene;
    Scene_Map.prototype.updateScene = function() {
		_Scene_Map_updateScene.call(this);

		//デバッグ用（公開時は不使用）
		if (false) {
			if (Input.isTriggered('debugMenu')) $gameSwitches.setValue(39, !$gameSwitches.value(39));
			if (Input.isTriggered('debugMode')) $gameSwitches.setValue(36, !$gameSwitches.value(36));
			if (Input.isTriggered('BotMode')) $gameSwitches.setValue(53, !$gameSwitches.value(53));
			if (Input.isTriggered('cheatMode')) {
				if (false) { //脱出地点デバッグ用
					var exit = $gamePlayer.nearestExit();
					$gamePlayer._moveSpeed = 7;
					$gamePlayer._x = exit[0];
					$gamePlayer._y = exit[1];
				}
				$gameSwitches.setValue(58, !$gameSwitches.value(58)); //チートモード
			}
		}
		//シーン切り替え中でない、かつ襲撃中かトレーニング中である。
        if (!SceneManager.isSceneChanging() && ($gameSwitches.value(2) || $gameSwitches.value(25))) {

			if (Input.isTriggered('shoot') || Input.isPressed('shoot')) $gamePlayer.shoot(); //射撃
			
			if (!$gamePlayer.isYuumi()) {

				if (!$gameSwitches.value(61) && !$gameSwitches.value(61)) { //ナイフ装備中、または使用中でない時

					if (Input.isTriggered('3') && !$gameSwitches.value(10) && $gamePlayer.tutorialCheck(1) && $gameMap._mapId != 52) { //ナイフを装備する
						$gameSwitches.setValue(62,true);
						if ($gameSwitches.value(3)) $gameSwitches.setValue(3,false);
					}
					if (Input.isTriggered('knife') && $gamePlayer.tutorialCheck(2) && $gameMap._mapId != 52) { //即時近接攻撃
						$gamePlayer.startMeleeAttack();
					}
					if (Input.isPressed('reload') && $gamePlayer.tutorialCheck(3)) {  //リロード
						$gamePlayer.reload();
					}
					if (Input.isTriggered('change') && $gamePlayer.tutorialCheck(4)) { //武器チェンジ
						$gamePlayer.weaponsChanging();
					}
					if (Input.isTriggered('ads')) { //ADS
						 $gamePlayer.ads();
					}
					if (Input.isTriggered('fireMode')) { //射撃モード変更
						$gamePlayer.changeFireMode();
					}
					if ($gamePlayer.canThrowGrenade() && $gamePlayer.tutorialCheck(5)) { //グレネード投擲
						if (Input.isPressed('grenade')){
							if (!$gameVariables._data[70]) $gameVariables._data[70] = 0;
							if ($gameVariables._data[70] == 1) { //投擲距離を加算
								if (!$gameVariables._data[69]) $gameVariables._data[69] = 0;
								if ($gameVariables._data[69] < 60) {
									$gameVariables._data[69] += 2;
								}
							}else if ($gameVariables._data[70] == 0){ //投擲距離加算の開始
								AudioManager.playSe({"name":"Equip2","volume":50,"pitch":150,"pan":0});
								$gameVariables._data[70] = 1;
							}
						}else{
							if ($gameVariables._data[70] == 1) { //投擲開始
								$gameSwitches.setValue(12,true);
							}
						}
						
					}
					if(Input.isTriggered('target') && $gamePlayer.targetList.length > 1){ //ターゲット変更
						if ($gamePlayer.targetListIndex == null) $gamePlayer.targetListIndex = 0;

						if ($gamePlayer.targetListIndex + 1 >= $gamePlayer.targetList.length) {
							$gamePlayer.targetListIndex = 0; $gamePlayer.targetId = 0;
						}else{
							$gamePlayer.targetListIndex++;
							$gamePlayer.targetId = $gamePlayer.targetList[$gamePlayer.targetListIndex]._eventId;
						}
					}

				}

				if (Input.isTriggered('1') && $gamePlayer.tutorialCheck(6) && !$gameSwitches.value(59)) { //メインウェポンへ切り替え
					var weapon = $gameParty.leader()._equips[0]._itemId;
					if ($gameSwitches.value(61) || $dataWeapons[weapon].wtypeId == 2) {
						$gameVariables._data[79] = 1;
						$gamePlayer.weaponsChanging();
					}
				}
				if (Input.isTriggered('2') && $gamePlayer.tutorialCheck(7) && !$gameSwitches.value(59)) { //サイドアームへ切り替え
					var weapon = $gameParty.leader()._equips[0]._itemId;
					if ($gameSwitches.value(61) || $dataWeapons[weapon].wtypeId == 1) {
						$gameVariables._data[79] = 2;
						$gamePlayer.weaponsChanging();
					}				
				}

			}else{ //優美用

				//突撃スキル発動
				if(Input.isTriggered('change') && $gameVariables._data[4] >= 100){
					var px = $gamePlayer.x; var py = $gamePlayer.y; var d = $gamePlayer._direction;
					if ($gamePlayer.canPass(px, py, d)) $gameSwitches.setValue(49,true);
				}

			}
		}
		
		if (!$gameVariables._data[71]) {
			$gameVariables._data[71] = [];
			$gameVariables._data[71].isPlaying = false;
			$gameVariables._data[71].alarmTimer = 0;
			$gameVariables._data[71].alarmCount = 0;
		}else{
			if ($gameVariables._data[71].isPlaying) {
				this.carAlarm();
			}else{
				if ($gameVariables._data[71].alarmTimer > 0 || $gameVariables._data[71].alarmCount > 0){
					$gameVariables._data[71].alarmTimer = 0;
					$gameVariables._data[71].alarmCount = 0;
				}
			}
		}
		
	};
	//近接武器装備
	Game_Player.prototype.equipMelee = function() {
		var schoolOrTraining = $gameSwitches.value(2) || $gameSwitches.value(25);
		if (schoolOrTraining && 
			!SceneManager.isSceneChanging() && 
			!$gameSwitches.value(10) &&
			$gameVariables._data[70] != 1 &&
			!this.isYuumi()) {

			//リロード中ならリロードをキャンセルする
			if ($gameSwitches.value(3)) $gameSwitches.setValue(3,false);
			$gameSwitches.setValue(10,true);

		}
	}
	//武器変更の開始処理
	Game_Player.prototype.weaponsChanging = function() {
		var schoolOrTraining = $gameSwitches.value(2) || $gameSwitches.value(25);
		if (schoolOrTraining && 
			!SceneManager.isSceneChanging() && 
			!$gameSwitches.value(10) &&
			!$gameSwitches.value(62) &&
			$gameVariables._data[70] != 1 &&
			!this.isYuumi()) {

			//リロード中ならリロードをキャンセルする
			if ($gameSwitches.value(3)) $gameSwitches.setValue(3,false);
			$gameSwitches.setValue(10,true);

		}
	}
	//武器変更の終了処理
	Game_Player.prototype.weaponsChanged = function() {
		if ($gameSwitches.value(61)) {
			$gameSwitches.setValue(61,false);
			var weapon = $gameParty.leader()._equips[0]._itemId;
			if ($gameVariables._data[79] == 1 && $dataWeapons[weapon].wtypeId == 1) {//既に主武装なら切り替えない
				Scene_Map.prototype.playerPicChange();
				return;
			}else if ($gameVariables._data[79] == 2 && $dataWeapons[weapon].wtypeId == 2){//既に副武装なら切り替えない
				Scene_Map.prototype.playerPicChange();
				return;
			}
		}
		var temp = $gameParty.leader()._equips[0];
		$gameParty.leader()._equips[0] = $gameParty.leader()._equips[1];
		$gameParty.leader()._equips[1] = temp;
		temp = magazine2;
		magazine2 = magazine;
		magazine = temp;
		Scene_Map.prototype.playerPicChange();
	}

	//ADS
	Game_Player.prototype.ads = function() {

		if (this.isYuumi() || $gameSwitches.value(3) || $gameVariables._data[70] == 1) return;

		$gameSwitches.setValue(20, !$gameSwitches.value(20));
		$gameVariables._data[35] = 50;
		
		if ($gameSwitches.value(20)) {
			//ads開始。
			$gameSwitches.setValue(32,true);
			AudioManager.playSe({"name":"kacha","volume":100,"pitch":200,"pan":0});
		}else{
			//ads終了。
			$gameSwitches.setValue(32,false);
		}
		this.setMoveSpeed();
		Scene_Map.prototype.playerPicChange();
	}

	//攻撃
	Game_Player.prototype.shoot = function(burstMode = false) {

		if (this.isYuumi()) {
			if (this.isDashing()) {
				return;
			}
			$gameSwitches.setValue(63,true);
			return;
		}else if ($gameSwitches.value(61) && this.canShootOrReload()) { //近接武器を装備時、可能なら近接攻撃を実行
			$gameSwitches.setValue(63,true);
			return;
		}

		if (!$gameVariables._data[77]) this.resetFireMode();

		var weapon = $dataWeapons[$gameParty.leader()._equips[0]._itemId];
		var weaponId = $gameParty.leader()._equips[0]._itemId;
		var fireMode = SelectiveFire[weaponId][$gameVariables._data[77][weapon.wtypeId - 1]];
		var execute = false;

		if (!burstMode) {
			if (!this.canShootOrReload()) {
				return;
			}else if (Input.isTriggered('shoot') && magazine <= 0) {
				AudioManager.playSe({"name":"empty","volume":100,"pitch":100,"pan":0});
				return;
			}
		}	

		if (magazine > 0) {

			//セミオート射撃、バースト射撃、フルオート射撃
			if (Input.isTriggered('shoot') && fireMode == 1) {
				execute = true;
			}else if (Input.isTriggered('shoot') && fireMode == 2) {
				$gameVariables._data[72] = 1;
				execute = true;
			}else if (Input.isTriggered('shoot') && fireMode == 3) {
				$gameVariables._data[72] = 2;
				execute = true;
			}else if (Input.isPressed('shoot') && fireMode == 4) {
				execute = true;
			}else if ($gameSwitches.value(53)) { //BOTモード
				execute = true;
			}else if (burstMode) {
				execute = true;
			}
			
		}

		if (!execute) return;

		//マガジン弾数を一発減らし、発砲回数を記録
		magazine -= 1;
		$gameVariables._data[26]++;
		$gameSystem.weaponRecord(weaponId, 1, 2);
		
		//または射撃反響音の再生
		if ($gameMap._mapId == 2) {
			AudioManager.playSe({"name":"Echo","volume":150,"pitch":100,"pan":0});
		}else if(Number($dataMap.meta.stepSE)){
			AudioManager.playSe({"name":"Echo1","volume":30,"pitch":100,"pan":0});
		}

		//命中判定
		$gameSwitches.value(25) ? TrainingHitDecision() : hitDecision();
		
		//銃の性能による命中率の低下
		var recoil = Number(weapon.meta.recoilNum);

		//シミュレーションモード時の反動ペナルティ
		if ($gameSwitches.value(40)) {

			//反動 20％ 増加
			recoil = Math.floor(recoil * 1.2);

			//移動中の反動ペナルティ
			if ($gamePlayer.isMoving()){
				//ADSなら 20％ 非ADSなら 40％
				if ($gameSwitches.value(20)){
					recoil = Math.floor(recoil * 1.2);
				}else{
					recoil = Math.floor(recoil * 1.4);
				}
			}

		}

		//射撃安定率を下げる。
		if ($gameVariables._data[8] > recoil){
			$gameVariables._data[8] -= recoil;
		}else{
			$gameVariables._data[8] = 0;
		}

	    //発砲炎
		if(!$gameSwitches.value(25)) {
			switch (this._direction) {
			case 2:
				this.requestAnimation(3);
				break;
			case 4:
				if (!$gameSwitches.value(20) && weapon.wtypeId == 2){
					this.requestAnimation(13);
				}else{
					this.requestAnimation(4);
				}
				break;
			case 6:
				if (!$gameSwitches.value(20) && weapon.wtypeId == 2){
					this.requestAnimation(14);
				}else{
					this.requestAnimation(5);
				}
				break;
			case 8:
				this.requestAnimation(6);
				break;
			}
		}

		//発砲音
		this.gunshotSe(weaponId);
		
		//薬莢落下音
		this.playShellSE(false);

		//射撃ウェイト
		$gameSwitches.setValue(4,true);
	
	}

	//発砲音の再生
	Game_Player.prototype.gunshotSe = function(id, mute = false) {
		switch (id) {
			case 1://G17
			    AudioManager.playSe({"name":"gunshot02","volume":mute ? 0 : 150,"pitch":120,"pan":0});
				break;
			case 2://C1911
			    AudioManager.playSe({"name":"gunshot02","volume":mute ? 0 : 150,"pitch":80,"pan":0});
				break;
		    case 3://TEC9
			    AudioManager.playSe({"name":"gunshot02","volume":mute ? 0 : 120,"pitch":110,"pan":0});
				break;
		    case 4://AR14
			    AudioManager.playSe({"name":"gunshot09","volume":mute ? 0 : 150,"pitch":100,"pan":0});
				break;
			case 5://Type56
			    AudioManager.playSe({"name":"gunshot07","volume":mute ? 0 : 120,"pitch":100,"pan":0});
				break;
		    case 6://SR22
			    AudioManager.playSe({"name":"gunshot06","volume":mute ? 0 : 120,"pitch":120,"pan":0});
				break;
		    case 7://S870K
				var name = $gameActors.actor(1).hasSkill(9) ? "shotgun_pump_fast" : "shotgun_pump";
				AudioManager.playSe({"name":name,"volume":mute ? 0 : 150,"pitch":100,"pan":0});
				break;
	        case 8://S12
			    AudioManager.playSe({"name":"shotgun_semi","volume":mute ? 0 : 150,"pitch":100,"pan":0});
				break;
				
	        case 9://BM15 Mod
			    AudioManager.playSe({"name":"gunshot09","volume":mute ? 0 : 150,"pitch":100,"pan":0});
				break;
	        case 10://BS3
			    AudioManager.playSe({"name":"shotgun_semi","volume":mute ? 0 : 150,"pitch":100,"pan":0});
				break;
			case 11://BM15
			    AudioManager.playSe({"name":"gunshot09","volume":mute ? 0 : 150,"pitch":100,"pan":0});
				break;
			case 12://C900
			    AudioManager.playSe({"name":"gunshot02","volume":mute ? 0 : 150,"pitch":120,"pan":0});
				break;
			case 13://Toy9
			    AudioManager.playSe({"name":"airsoft","volume":mute ? 0 : 100,"pitch":100,"pan":0});
				break;
			case 14://Toy26
			    AudioManager.playSe({"name":"airsoft","volume":mute ? 0 : 100,"pitch":100,"pan":0});
				break;
		    case 15://VSG
			    AudioManager.playSe({"name":"shotgun_semi","volume":mute ? 0 : 150,"pitch":100,"pan":0});
				break;
			case 16://CZ11
				AudioManager.playSe({"name":"gunshot09","volume":mute ? 0 : 150,"pitch":100,"pan":0});
				break;

			case 17://KS25
				var name = $gameActors.actor(1).hasSkill(9) ? "shotgun_pump_fast" : "shotgun_pump";
				AudioManager.playSe({"name":name,"volume":mute ? 0 : 150,"pitch":100,"pan":0});
				break;
			case 18://M22
			    AudioManager.playSe({"name":"gunshot06","volume":mute ? 0 : 120,"pitch":120,"pan":0});
				break;
			case 19://HSG12
			    AudioManager.playSe({"name":"shotgun_semi","volume":mute ? 0 : 150,"pitch":100,"pan":0});
				break;
			case 20://U22
			    AudioManager.playSe({"name":"gunshot06","volume":mute ? 0 : 110,"pitch":130,"pan":0});
				break;
			case 21://IM10
			    AudioManager.playSe({"name":"gunshot02","volume":mute ? 0 : 140,"pitch":100,"pan":0});
				break;
			case 22://D50
			    AudioManager.playSe({"name":"gunshot13","volume":mute ? 0 : 80,"pitch":100,"pan":0});
				break;
			case 23://G91
			    AudioManager.playSe({"name":"gunshot10","volume":mute ? 0 : 140,"pitch":90,"pan":0});
				break;
		    case 24://AS3M
			    AudioManager.playSe({"name":"gunshot11","volume":mute ? 0 : 100,"pitch":100,"pan":0});
				break;

			case 25://S12 Mod
				AudioManager.playSe({"name":"shotgun_semi","volume":mute ? 0 : 150,"pitch":100,"pan":0});
				break;
			case 26://M23
			    AudioManager.playSe({"name":"gunshot02","volume":mute ? 0 : 150,"pitch":80,"pan":0});
				break;
			case 27://SPK
			    AudioManager.playSe({"name":"gunshot02","volume":mute ? 0 : 150,"pitch":120,"pan":0});
				break;
			case 28://T54
				AudioManager.playSe({"name":"gunshot02","volume":mute ? 0 : 150,"pitch":130,"pan":0});
				break;
			case 29://M180 Mod
				AudioManager.playSe({"name":"gunshot06","volume":mute ? 0 : 120,"pitch":140,"pan":0});
				break;
			case 30://HP45
			    AudioManager.playSe({"name":"gunshot02","volume":mute ? 0 : 150,"pitch":100,"pan":0});
				break;
			case 31://S870BM
				var name = $gameActors.actor(1).hasSkill(9) ? "shotgun_pump_fast" : "shotgun_pump";
			    AudioManager.playSe({"name":name,"volume":mute ? 0 : 150,"pitch":100,"pan":0});
				break;
			case 32://BM16
				AudioManager.playSe({"name":"gunshot09","volume":mute ? 0 : 150,"pitch":100,"pan":0});
				break;
		}
	}

	//効果音のプリロード
	Game_Player.prototype.preloadSe = function() {
		this.gunshotSe(6, true); //OP警備員射殺用
		this.gunshotSe($gameParty.leader()._equips[0]._itemId, true);
		this.gunshotSe($gameParty.leader()._equips[1]._itemId, true);
	}

	//薬莢音の再生
	Game_Player.prototype.playShellSE = function(isReload) {

		var actor = $gameParty.leader(); 
	    var weapon = $dataWeapons[actor._equips[0]._itemId];

		if (!isReload) {
			if (weapon.meta.isShotgun == "1" && weapon.meta.type != "8") {
				return;
			}else if (weapon.meta.shell == "0") {
				return;
			}
		}

		var name = "Shell" + (Math.floor(Math.random() * 5) + 1);
		var volume = Math.floor(Math.random() * 21);

		switch (Number(weapon.meta.shell)) {
			//拳銃弾
			case 1:
				volume += 15;
				break;
			//ライフル弾
			case 2:
				volume += 30;
				break;
			//散弾
			case 3:
				name = "ShellShotgun" + (Math.floor(Math.random() * 4) + 1);
				volume += 10;
				break;
		}
		AudioManager.playSe({"name":name,"volume":volume,"pitch":100,"pan":0});
	}

	//画面の作成。
	var _SMCDO = Scene_Map.prototype.createDisplayObjects;
	Scene_Map.prototype.createDisplayObjects = function() {
		_SMCDO.call(this);
		this._mapPlayerGaugeWindow = new Window_PlayerGauge();
	    this.addChild(this._mapPlayerGaugeWindow);
		this._mapStatusWindow = new Window_MapStatus();
	    this.addChild(this._mapStatusWindow);
		this._announcement = new Window_Announcement();
	    this.addChild(this._announcement);
		this._speakWindow = [];
		this.makeCrosshair();
		this.createAnnounceAchievementsWindow();
	};
	//画面の更新。
	Scene_Map.prototype.update = function() {
        this.updateDestination();
        this.updateMainMultiply();
        if (this.isSceneChangeOk()) {
            this.updateScene();
        } else if (SceneManager.isNextScene(Scene_Battle)) {
            this.updateEncounterEffect();
        }
        this.updateWaitCount();
        Scene_Base.prototype.update.call(this);
		
		if ($gameSwitches.value(5)) {
			if (this._mapStatusWindow.contentsOpacity == 0) {
				this._mapStatusWindow.sprite.visible = !$gameSwitches.value(25);
			    this._mapStatusWindow.contentsOpacity = 255;
			}
			if (this._mapPlayerGaugeWindow.contentsOpacity == 0) {
			    this._mapPlayerGaugeWindow.contentsOpacity = 255;
			}
			this._mapPlayerGaugeWindow.refresh();
			this._mapStatusWindow.refresh();
		}else{
			if (this._mapStatusWindow.contentsOpacity == 255) {
				this._mapStatusWindow.sprite.visible = false;
			    this._mapStatusWindow.contentsOpacity = 0;
			}
			if (this._mapPlayerGaugeWindow.contentsOpacity == 255) {
			    this._mapPlayerGaugeWindow.contentsOpacity = 0;
			}
		}

		for (var i = 0; i < 10; i++){
			if (this._speakWindow[i]) {
				this._speakWindow[i].refresh();
			}
		}
		
	};
	
	//スプライトセットにタイマーを設置しない。
	Spriteset_Base.prototype.createTimer = function() {
	};

	//マップステータス画面の作成。
	function Window_MapStatus() {
        this.initialize.apply(this, arguments);
    };
	
    Window_MapStatus.prototype = Object.create(Window_Base.prototype);
    Window_MapStatus.prototype.constructor = Window_MapStatus;
	Window_MapStatus.prototype.initialize = function() {
		
		//ステータス画像表示。
		this.sprite = new Sprite();
		this.sprite.bitmap = ImageManager.loadPicture('Status');
		SceneManager._scene.addChild(this.sprite);
		this.sprite.visible = false;

		this._timerSprite = new Sprite_Timer();
		SceneManager._scene.addChild(this._timerSprite);

        var wight = 816; var height = 624;
        Window_Base.prototype.initialize.call(this, 0, 0, wight, height);
        this.opacity = 0; this.contentsOpacity = 0;
        this.refresh();
    };
	
	Window_MapStatus.prototype.refresh = function() {
        this.contents.clear();
		var width = this.contentsWidth();
		var isMelee = $gamePlayer.isYuumi() || $gameSwitches.value(61);
		if (isMelee) { //ナイフ画像表示
			var id = 0;
			if ($gamePlayer.isYuumi()) {
				id = 6;
			}else if ($gamePlayer.isBayonetAttacking()) {
				id = Number($dataArmors[15].meta.picID);
			}else{
				id = Number($dataArmors[$gameParty.leader()._equips[3]._itemId].meta.picID);
			}
			this.drawFace("knife", id, 635, 445, 144, 144);
		}else{ //銃画像表示
			var id = $gameParty.leader()._equips[0]._itemId;
			if (id > 24) {
				var gun = "guns4"; 
				var faceId = id - 25;
			}else if (id > 16) {
				var gun = "guns3";
				var faceId = id - 17;
			}else if (id > 8) {
				var gun = "guns2";
				var faceId = id - 9;
			}else{
				var gun = "guns1";
				var faceId = id - 1;
			}
			this.drawFace(gun, faceId, 635, 445, 144, 144);

			//残弾＆射撃モードの表示。
			this.contents.fontSize = 24;
			if($gameSwitches.value(40)){
				var weapon = $dataWeapons[$gameParty.leader()._equips[0]._itemId];
				var magazines = 0;
				if (weapon.meta["isPump"] == "0"){
					var num = weapon.wtypeId == 1 ? 50 : 51;
					$gameVariables._data[num].forEach(function (value) { if (value > 0) magazines += 1;});
				}else{
					var num = weapon.wtypeId == 1 ? 63 : 64;
					magazines = $gameVariables._data[num];
				}
				var magStatus = "?";
				switch ($gamePlayer.magazineStatus()) {
					case 3:
					case 2: 
						magStatus = magazine;
						break;
				}
				this.drawText(magazine + " / " + magazines, -8, 554, width, 'right');
			}else{
				this.drawText(magazine, -8, 554, width, 'right');
			}
			var fireModeIndex = $gamePlayer.checkFireMode();
			var fireMode = "";
			switch (fireModeIndex) {
				case 1:
					fireMode = " S";
					break;
				case 2:
					fireMode = " B";
					break;
				case 3:
					fireMode = " B";
					break;
				case 4:
					fireMode = " F";
					break;
			}
			this.contents.fontSize = 20;
			this.drawText(fireMode, -8, 526, width, 'right');
			this.contents.fontSize = this.standardFontSize();
		}

		//パイプ爆弾所持数
		if (!$gamePlayer.isYuumi() && !$gameSwitches.value(25)){
			this.drawIcon(126, 680, 410);
			this.drawText(" x " + $gameVariables._data[41], -10, 408, width, 'right');
		}

		//死傷者数表示。
		if (!$gameSwitches.value(25)){

			if (!$gameSwitches.value(36) && $gameSwitches.value(40)){
				var dead = "?";
				var wound = "?";
				var serious = "?";
			}else{
				var dead = $gameVariables._data[2];
				if ($gameSystem._data.seriousWound) {
					var serious = $gameSystem._data.seriousWound.length;
				}else{
					var serious = 0;
				}
				var wound = $gameVariables._data[56];
			}

			this.drawText(dead, -18, 25, width, 'right');
			this.drawText(serious, -18, 70, width, 'right');
			this.drawText(wound, -18, 115, width, 'right');

		}

		//デバッグ用データの表示（公開時は不使用）
		if ($gameSwitches.value(36)){

			var x = 2;
			var y = 510;
			var height = -20;
			this.contents.fontSize = 14;
			var gunId = $gamePlayer.isYuumi() ? $gameVariables._data[45][0] : $gameParty.leader()._equips[0]._itemId;
			var bombId = $gameParty.leader()._equips[2]._itemId;
			var meleeId = $gamePlayer.isYuumi() ? 14 : $gameParty.leader()._equips[3]._itemId;

			this.drawText("発言カウント " + $gamePlayer._speakTimer, x, y + height * 25, width, 'left');
			this.drawText("獲得SP " + $gameVariables._data[17] + " 合計SP " + $gameParty.gold(), x, y + height * 24, width, 'left');

			if (!$gamePlayer.isYuumi()) {
				this.drawText("銃使用回数 " + $gameSystem._data.gunRecord[gunId].useCount + " 発砲回数 " 
				+ $gameSystem._data.gunRecord[gunId].shotCount + " 殺害数 " + $gameSystem._data.gunRecord[gunId].killCount, x, y + height * 23, 230, 'right'); 
				
				this.drawText("爆弾使用回数 " + $gameSystem._data.bombRecord[bombId].useCount + " 投擲回数 " 
				+ $gameSystem._data.bombRecord[bombId].shotCount + " 殺害数 " + $gameSystem._data.bombRecord[bombId].killCount, x, y + height * 22, 230, 'right'); 
			}

			this.drawText("近接武器使用回数 " + $gameSystem._data.meleeRecord[meleeId].useCount + " 攻撃回数 " 
				+ $gameSystem._data.meleeRecord[meleeId].shotCount + " 殺害数 " + $gameSystem._data.meleeRecord[meleeId].killCount, x, y + height * 21, 230, 'right'); 

			this.drawText("殺害合計 " + $gameVariables._data[33] + " 発砲合計 " + $gameVariables._data[34], x, y + height * 20, width, 'left');
			this.drawText("散弾キル " + $gameVariables._data[83], x, y + height * 19, width, 'left');
			this.drawText("職員室殺害 " + $gameVariables._data[78], x, y + height * 18, width, 'left');

			this.drawText("付近の生存生徒数 " + $gameMap.numberOfStudents(true), x, y + height * 16, width, 'left');
			this.drawText("女性教師が存在 " + $gameMap.existFemaleTeacher(), x, y + height * 15, width, 'left');
			this.drawText("増援時間 " + $gameVariables._data[13] +  " 乗数 " + $gameVariables._data[75] + " 特殊施設？ " + $gameMap.isSpaciousMap(), x, y + height * 14, width, 'left');
			this.drawText("増援済 " + reinforcedMapList.indexOf($gameMap._mapId), x, y + height * 13, width, 'left');
			this.drawText("ヤンデレ位置 " + $gameMap.yanderePosition(), x, y + height * 12, width, 'left');

			this.drawText("発砲回数 " + $gameVariables._data[26] + " 命中回数 " + $gameVariables._data[27], x, y + height * 10, width, 'left');
			this.drawText("命中率 " +  $gamePlayer.accuracy() + " CQC? " + $gamePlayer.isCQC(), x, y + height * 9, width, 'left');
			this.drawText("主弾倉 " + $gameVariables._data[50], x, y + height * 8, width, 'left');
			this.drawText("副弾倉 " + $gameVariables._data[51], x, y + height * 7, width, 'left');
			if ($gameVariables._data[77]) this.drawText("射撃モード " + $gameVariables._data[77][0], x, y + height * 6, width, 'left');

			this.drawText("スタミナ " + $gameVariables._data[4] + " 反動値 " + $gameVariables._data[8], x, y + height * 4, width, 'left');
			this.drawText("realMoveSpeed " + $gamePlayer.realMoveSpeed(), x, y + height * 3, width, 'left');
			this.drawText("isDashing " + $gamePlayer.isDashing(), x, y + height * 2, width, 'left');
			this.drawText("isKeepMoving " + $gamePlayer.isKeepMoving(), x, y + height * 1, width, 'left');
			this.drawText("moveBack " + $gamePlayer.moveBack, x, y + height * 0, width, 'left');

			this.contents.fontSize = this.standardFontSize();
		}
	};

	//目前にターゲットが存在するかどうか
	Game_Player.prototype.isCQC = function() {
		if ($gameSwitches.value(7)) { //制限時間動作中のみ
			if ($gamePlayer.targetList.length > 0) {
				var id = $gamePlayer.targetId ? $gamePlayer.targetId : $gamePlayer.targetList[0]._eventId;
				var distance = $gameMap.distance(this.x, this.y, $gameMap._events[id]._x, $gameMap._events[id]._y);
				return distance == 1;
			}else{
				return false;
			}
		}else{
			return false;
		}
	}

	//射線上のターゲットをリストにする
	Game_Player.prototype.makeTargetList = function() {

		this.targetList = [];
		var enemy = [];
		var target = false;
		var x = this._x;
		var y = this._y;

		if ($gamePlayer.isYuumi() || $gameSwitches.value(61)) {
			range = 1;
		}else{
			range = 14;
		}
		
		for (var i = 1; i <= range; i++) {

			switch (this._direction) {
				case 2: y += 1; break;
				case 4: x -= 1; break;
				case 6: x += 1; break;
				case 8: y -= 1; break;
			}
			
			//障害物なら処理を終了
			if ($gameMap.regionId(x, y) == 1) break;

			var id = 0;
			var events = $gameMap.eventsXy(x, y);

			//重なっていないイベントの処理
			if (events.length == 1){
				id = $gameMap.eventIdXy(x, y);
				if ($gameMap._events[id].isInitialized()) {

					if ($gameVariables._data[1][$gameMap._mapId][id].status != "escaped" && !$gameMap._events[id].isCover()) {
						if ($gameVariables._data[1][$gameMap._mapId][id].status == "fight") { //敵対的なターゲット
							enemy.push($gameMap._events[id]);
						}
						if ($gameSwitches.value(40)) {
							this.targetList.push($gameMap._events[id]);
						}else{
							if ($gameVariables._data[1][$gameMap._mapId][id].hp > 0) {
								this.targetList.push($gameMap._events[id]);
							}
						}
					}

				}
			//重なったイベントの処理
			}else if (events.length > 1) {
				var list = [];
				var alive = false;
				for (var _i = 0; _i < events.length; _i++){
					id = events[_i]._eventId;
					if ($gameMap._events[id].isInitialized()) {

						if ($gameVariables._data[1][$gameMap._mapId][id].status != "escaped" && !$gameMap._events[id].isCover()) {
							if ($gameVariables._data[1][$gameMap._mapId][id].status == "fight") { //敵対的なターゲット
								enemy.push($gameMap._events[id]);
							}
							if ($gameVariables._data[1][$gameMap._mapId][id].hp > 0) alive = true;
							if ($gameSwitches.value(40)) { 
								list.push($gameMap._events[id]);
							}else{
								if ($gameVariables._data[1][$gameMap._mapId][id].hp > 0) {
									list.push($gameMap._events[id]);
								}
							}
						}

					}
				}
				if (list.length > 1 && alive){ //重複イベントのうち、生存者を優先する。どちらも死亡なら、適当なターゲットを選択
					for (var _i = 0; _i < list.length; _i++){
						id = list[_i]._eventId;
						if ($gameVariables._data[1][$gameMap._mapId][id].hp > 0){
							this.targetList.push($gameMap._events[id]);
							break;
						}
					}
				}else if(list.length > 0){
					id = list[0]._eventId;
					this.targetList.push($gameMap._events[id]);
				}
			}
		}
		
		//優先ターゲットがリストに存在しない（射線に存在しない）ならターゲット切り替えをリセットする
		if (this.targetId) {
			var target = false;
			for (var i = 0; i < this.targetList.length; i++){
				if (this.targetList[i]._eventId == this.targetId) target = true;
			}
			if (!target) { //リセット
				this.targetListIndex = 0;
				this.targetId = 0;
			}
		}else if (false && enemy.length > 0) { //敵対的なイベントに照準を強制する（停止中）
			var distance = 0;
			var nearestDistance = 0;
			var targetId = 0;
			for (var i = 0; i < enemy.length; i++) {
				distance = $gameMap.distance($gamePlayer.x, $gamePlayer.y, enemy[i]._x, enemy[i]._y);
				if (nearestDistance == 0 || nearestDistance > distance) {
					nearestDistance = distance;
					targetId = enemy[i]._eventId;
				}
			}
			if (targetId) { //ターゲット確定
				this.targetId = targetId;
			}
		}

	}

	//優美突撃スキル
	Game_Player.prototype.chargeSkill = function() {
		if ($gameSwitches.value(6)) { //スタミナ枯渇によるスキルの停止
			this.setMoveSpeed();
			$gameSwitches.setValue(49,false);
			return;
		}
		if (!this.canPass(this.x, this.y, this._direction)){

			$gameVariables._data[4] -= $gameSwitches.value(40) ? 40 : 20;
			this.makeTargetList();

			if ($gamePlayer.targetList.length > 0){ //攻撃可能なイベントがある時

				var event = this.targetList[0];
				var id = event._eventId;
				var eventHp = $gameVariables._data[1][$gameMap._mapId][id].hp;
				var maxHp = event._characterName == "yandere" ? 200 : 100;

				//防弾なら攻撃不可
				if ($gameVariables._data[1][$gameMap._mapId][id].shield > 0) {
					$gameMap._events[id].requestAnimation(15);
					this.setMoveSpeed();
					$gameSwitches.setValue(49,false);
					return;
				}

				//死傷者数の変更
				if (eventHp != maxHp){

					//軽傷
					if(eventHp >= 50){
						$gameVariables._data[56] -= 1;
					//重傷
					}else{
						$gameSystem.killSeriousWounded(id);
					}

				}

				//イベントのダメージ処理
				var eventHp = $gameVariables._data[1][$gameMap._mapId][id].hp = 0;
				$gameVariables._data[1][$gameMap._mapId][id].lastDamage = 0;
				$gameMap._events[id].setDamageStatus();
				$gameMap._events[id].requestAnimation(22);

				//赤色フラッシュと出血、SE再生
				var stm = $gameVariables._data[4] * 2;
				$gameScreen.startFlash([255 - stm,0,0,200], 100 - $gameVariables._data[4]);
				if (!Scene_Map.prototype.isBlood(event.x, event.y)) Scene_Map.prototype.createBlood(event.x, event.y, 0, 3);
				Scene_Map.prototype.createSplatterBlood(event.x, event.y, 10);
				AudioManager.playSe({"name":"Stab","volume":100,"pitch":100,"pan":0});

				$gameVariables._data[2]++; //殺害数加算
				$gameVariables._data[33]++; //合計殺害数加算
				$gameSystem.weaponRecord(14, 2, 3);
				$gameMap._events[id].gainGold();
				$gamePlayer.speakKillText(event._characterName);

			}else{ //障害物に衝突
				$gameScreen.startShake(1, 9, 10);
				AudioManager.playSe({"name":"Damage4b","volume":50,"pitch":150,"pan":0});
			}

			this.setMoveSpeed();
			$gameSwitches.setValue(49,false);

		}
	}

    //スタミナ・命中率表示。
	function Window_PlayerGauge() {
        this.initialize.apply(this, arguments);
    };
    Window_PlayerGauge.prototype = Object.create(Window_Base.prototype);
    Window_PlayerGauge.prototype.constructor = Window_PlayerGauge;
	Window_PlayerGauge.prototype.initialize = function() {
        var width = 100;
		var height = 100;
		if (!$gameSwitches.value(40)){ //ノーマルモードならスタミナを回復する
			$gameVariables._data[4] = 100 - $gameVariables._data[62]; 
			$gameVariables._data[8] = 100;
		}
        Window_Base.prototype.initialize.call(this, 0, 0, width, height);
        this.opacity = 0;
		this.contentsOpacity = 0;
		this.movingFalse = 0;
        this.refresh();
    };
	Window_PlayerGauge.prototype.refresh = function() {

        this.contents.clear();
		var acc = $gamePlayer.accuracy();
		this.x = $gamePlayer.screenX() - 50; 
		this.y = $gamePlayer.screenY() - 100;
		var width = this.contentsWidth();
		this.makeFontSmaller();

		//投擲ゲージ
		if ($gameVariables._data[69] > 0) {
			var dy = 0;
			if ($gameVariables._data[4] < 100) {
				this.y = $gamePlayer.screenY() - 110; 
				dy = 8;
			}
			var distance = $gameVariables._data[69] / 60;
			this.drawGauge(0, dy, width, distance, this.textColor(0), this.textColor(8));
		}

		if ($gameSwitches.value(3)){
			this.drawText("Reload", 0, 0, width, 'center');
		}else{
			var x = 0;
			//ADS中のアイコン表示
			if ($gameSwitches.value(20)) {
				if ($gamePlayer.isMoving()) {
					this.drawIcon(157, -7, 1);
					this.movingFalse = 0;
				}else{
					//falseが二回未満なら移動中とみなす
					if (this.movingFalse < 2){
						this.drawIcon(157, -7, 1);
						this.movingFalse += 1;
					}else{
						this.drawIcon(155, -7, 1);
					}

				}
				x = 9;
			};

			if ($gamePlayer.isYuumi() || $gameSwitches.value(61)) {
				var dmg = Math.floor($gameVariables._data[4]);
				if (dmg < 0) dmg = 0;
				this.drawText(dmg + "％", x, 0, width, 'center');
			}else{
				this.drawText(acc + "％", x, 0, width, 'center');
			}
		}

		//スタミナゲージ
		if ($gameVariables._data[4] < 100) {

			var STcolor1 = this.tpGaugeColor1(); var STcolor2 = this.tpGaugeColor2();
			var CDcolor1 = this.textColor(10); var CDcolor2 = this.textColor(18);

			if (!$gameVariables._data[62]) $gameVariables._data[62] = 0;
			var fillW = Math.floor(width * $gameVariables._data[62] / 100);
			if (fillW > 0) fillW += 1;

			this.drawGauge(0, 0, width, $gameVariables._data[4] / 100, STcolor1, STcolor2);
			this.contents.gradientFillRect(64 - fillW, 28, fillW, 6, CDcolor1, CDcolor2);

		}
	};

	//キャラクターに追加の変数を設定。
	var GCB = Game_CharacterBase.prototype.initMembers;
	Game_CharacterBase.prototype.initMembers = function() {
		GCB.call(this);
		this._speakWindow = false;
		this._speakWindowId = 0;
		this._hitAnimation = false;
	}

	//発言ウィンドウ作成
	Scene_Map.prototype.createSpeakWindow = function(text, targetId = 0) {
		if (!text) return;
		if (!SceneManager._scene._speakWindow[0]){
			SceneManager._scene._speakWindow[0] = new Window_Speak(text, 0, targetId);
			SceneManager._scene.addChild(SceneManager._scene._speakWindow[0]);
		}else{
			for (var i = 1; i < 10; i++){
				if (!SceneManager._scene._speakWindow[i]) {
					SceneManager._scene._speakWindow[i] = new Window_Speak(text, i, targetId);
			        SceneManager._scene.addChild(SceneManager._scene._speakWindow[i]);
					break;
				}
			}
		}
	}

	//発言ウィンドウ。
    function Window_Speak() {
        this.initialize.apply(this, arguments);
    }
	
    Window_Speak.prototype = Object.create(Window_Base.prototype);
    Window_Speak.prototype.constructor = Window_Speak;
	
    Window_Speak.prototype.initialize = function(text, windowId, targetId) {
        var width = (this.standardPadding() * 4) + (text.length * (this.textPadding() + 12));
		if (width < 100) width = 100;
        var height = this.fittingHeight(1);
        Window_Base.prototype.initialize.call(this, 0, 0, width, height);
        this.opacity = 0;
		this.contentsOpacity = 255;
		this.dimmerOpacity = 255;
		this.windowId = windowId;
		this.targetId = targetId;
		this.text = text;
		this.wait = 60;
		if (targetId) {
			if ($gameMap._events[targetId]._speakWindow) {
				SceneManager._scene.removeChild(SceneManager._scene._speakWindow[$gameMap._events[targetId]._speakWindowId]);
			}
			$gameMap._events[targetId]._speakWindow = true;
			$gameMap._events[targetId]._speakWindowId = this.windowId;
		}else{
			if ($gamePlayer._speakWindow) {
				SceneManager._scene.removeChild(SceneManager._scene._speakWindow[$gamePlayer._speakWindowId]);
			}
			$gamePlayer._speakWindow = true;
			$gamePlayer._speakWindowId = this.windowId;
		}
		this.showBackgroundDimmer();
		AudioManager.playSe({"name":"Item1","volume":50,"pitch":150,"pan":0});
        this.refresh();
    };
    Window_Speak.prototype.refresh = function() {

        this.contents.clear();

		var target = this.targetId == 0 ? $gamePlayer : $gameMap._events[this.targetId];
		this.x = (($gamePlayer.scrolledX() - $gamePlayer._realX + target._realX) * 48) - (this.width / 2) + 24;
		this.y = (($gamePlayer.scrolledY() - $gamePlayer._realY + target._realY) * 48) - 90;
		this.makeFontSmaller();
		this.drawText(this.text, 0, 0, this.contentsWidth(), 'center');

		if (this.wait > 0) {
			this.wait -= 1;
		}else{
			if (this.contentsOpacity > 0){
				this.contentsOpacity -= 2;
				this.dimmerOpacity -= 2;
				this._dimmerSprite.opacity = this.dimmerOpacity;
			}else{
				this.hideBackgroundDimmer();
				this.close();
			}
		}
    };
	Window_Speak.prototype.standardPadding = function() {
		return 6;
	}
	Window_Speak.prototype.close = function() {
		if (this.targetId) {
			$gameMap._events[this.targetId]._speakWindow = false;
			$gameMap._events[this.targetId]._speakWindowId = 0;
		}else{
			$gamePlayer._speakWindow = false;
			$gamePlayer._speakWindowId = 0;
		}
		SceneManager._scene._speakWindow[this.windowId] = null;
	}

	//被弾テキストを発言する
	Game_Event.prototype.speakHitText = function() {
		var random = Math.floor(Math.random() * speakTexts.getShot.length);
		SceneManager._scene.createSpeakWindow(speakTexts.getShot[random], this._eventId);
	}

	//テキストを発言する(プレイヤー用)
	Game_Player.prototype.speakText = function(type) {
		var text = [];
		switch (type) {
		case "shout":
			text = this.isYuumi() ? speakTexts.yuumi.shout : speakTexts.shooter.shout;
			if (!this.isYuumi() && !$gameSwitches.value(61)) {
				text = text.concat(speakTexts.shooter.useGun);
			}
			break;
		case "killedYandere":
			text = this.isYuumi() ? speakTexts.yuumi.killedYandere : speakTexts.shooter.killedYandere;
			break;
		case "killedEnemy":
			text = this.isYuumi() ? speakTexts.yuumi.killedEnemy : speakTexts.shooter.killedEnemy;
			break;
		case "killedOfficer":
			if (!this.isYuumi()) text = speakTexts.shooter.killedOfficer;
			break;
		case "useBomb":
			if (!this.isYuumi()) text = speakTexts.shooter.useBomb;
			break;
		}
		var random = Math.floor(Math.random() * text.length);
		SceneManager._scene.createSpeakWindow(text[random]);
	}
	//ターゲットに応じた発言テキストを設定
	Game_Player.prototype.speakKillText = function(name) {
		var text = "";
		switch (name) {
		case "yandere":
			text = "killedYandere"
			break;
		case "principal":
			text = this.isYuumi() ? "shout" : "killedEnemy";
			break;
		case "teacher":
			if (this._speakTimer <= 0) {
				text = this.isYuumi() ? "shout" : "killedEnemy";
			}
			break;
		case "policeman":
			text = this.isYuumi() ? "shout" : "killedEnemy";
			break;
		default:
			if (this._speakTimer <= 0) {
				text = "shout";
			}
		}
		this.speakText(text);
	}

	//テキストの発言間隔を設定
	Game_Player.prototype.speakTimer = function(num) {
		if (this._speakTimer === undefined) {
			this._speakTimer = 0;
		}else if (num) {
			this._speakTimer = num;
		}else{
			if (this._speakTimer <= 0) {
				this._speakTimer = 1 + Math.floor(Math.random() * 3);
			}else{
				this._speakTimer--;
			}
		}
	}

	//テキストを発言する(イベント用)
	Game_Event.prototype.speakText = function() {
		var name = this._characterName;
		var hp = $gameVariables._data[1][$gameMap._mapId][this._eventId].hp;
		var status = $gameVariables._data[1][$gameMap._mapId][this._eventId].status;
		var text = [];
		switch (name) {
		case "principal":
			if (hp >= 50) {
				text = speakTexts.principal.shout;
				if ($gamePlayer.isYuumi() || $gameSwitches._data[61]) {
				}else{
					text = text.concat(speakTexts.principal.reactToGun);
				}
			}else{
				text = speakTexts.injured;
			}
			break;
		case "yandere":
			if (hp >= 50) {
				text = speakTexts.yandere.shout;
			}else{
				text = speakTexts.yandere.injured;
			}
			break;
		case "policeman":
			if (hp >= 50) {
				if ($gamePlayer.isYuumi() || $gameSwitches._data[61]) {
					text = speakTexts.maleOfficer.reactToKnife;
				}else{
					text = speakTexts.maleOfficer.reactToGun;
				}
			}else{
				if (Math.floor(Math.random() * 2)) {
					text = speakTexts.maleOfficer.injured;
				}else{
					text = speakTexts.injured;
				}
			}
			break;
		case "w_policeman":
			if (hp >= 50) {
				if ($gamePlayer.isYuumi() || $gameSwitches._data[61]) {
					text = speakTexts.femaleOfficer.reactToKnife;
				}else{
					text = speakTexts.femaleOfficer.reactToGun;
				}
			}else{
				if (Math.floor(Math.random() * 2)) {
					text = speakTexts.femaleOfficer.injured;
				}else{
					text = speakTexts.injured;
				}
			}
			break;
		case "teacher":
			if (hp >= 50) {
				text = speakTexts.teacher.shout;
				if ($gamePlayer.isYuumi() || $gameSwitches._data[61]) {
					text = text.concat(speakTexts.teacher.reactToKnife);
				}else{
					text = text.concat(speakTexts.teacher.reactToGun);
				}
			}else{
				if (Math.floor(Math.random() * 2)) {
					text = speakTexts.teacher.injured;
				}else{
					text = speakTexts.injured;
				}
				if ($gamePlayer.isYuumi() || $gameSwitches._data[61]) {
					text = text.concat(speakTexts.teacher.injuredByKnife);
				}else{
					text = text.concat(speakTexts.teacher.injuredByGun);
				}
			}
			break;
		case "w_teacher":
			if (hp >= 50) {
				text = speakTexts.femaleTeacher.shout;
			}else{
				if (Math.floor(Math.random() * 2)) {
					text = speakTexts.femaleTeacher.injured;
				}else{
					text = speakTexts.injured;
				}
			}
			break;
		case "male_students":
			if (hp >= 50) {
				if(status == "fight") {
					text = speakTexts.maleStudent.fight;
				}else{
					text = speakTexts.maleStudent.shout;
					if (!$gamePlayer.isYuumi() && !$gameSwitches._data[61]) {
						text = text.concat(speakTexts.maleStudent.reactToGun);
					}
				}
			}else{
				if (Math.floor(Math.random() * 2)) {
					text = speakTexts.maleStudent.injured;
				}else{
					text = speakTexts.injured;
				}
			}
			break;
		case "female_students ":
			if (hp >= 50) {
				text = speakTexts.femaleStudent.shout;
				if (!$gamePlayer.isYuumi() && !$gameSwitches._data[61]) {
					text = text.concat(speakTexts.femaleStudent.reactToGun);
				}
			}else{
				if (Math.floor(Math.random() * 2)) {
					text = speakTexts.femaleStudent.injured;
				}else{
					text = speakTexts.injured;
				}
			}
			break;
		}
		var random = Math.floor(Math.random() * text.length);
		SceneManager._scene.createSpeakWindow(text[random], this._eventId);
	}

	//マップ内イベントを発言させる
	Scene_Map.prototype.randomSpeak = function() {

		if (!$gameVariables._data[1][$gameMap._mapId]) return;

		var speakId = 0;
		var priority = 0;

		//発言優先度　校長:６　ヤンデレ:５　警察官：４　男性教師：３　反撃男子生徒：２　女性教師：１ その他：０
		for (var i = 0; i < $gameVariables._data[1][$gameMap._mapId].length; i++) {
			if (!$gameVariables._data[1][$gameMap._mapId][i]) continue;
			if ($gameMap._events[i].isCanSpeak()) {
				switch ($gameMap._events[i]._characterName) {
				case "principal":
					if (priority < 6) {
						speakId = i;
						priority = 6;
					}
					break;
				case "yandere":
					if (priority < 5) {
						speakId = i;
						priority = 5;
					}
					break;
				case "policeman":
				case "w_policeman":
					if (priority < 4) {
						speakId = i;
						priority = 4;
					}
					break;
				case "w_teacher":
					if (priority < 3) {
						speakId = i;
						priority = 3;
					}
					break;
				case "teacher":
					if (priority < 2) {
						speakId = i;
						priority = 2;
					}
					break;
				case "male_students":
					if (priority < 1) {
						speakId = i;
						priority = 1;
					}
				}
			}
		}

		//優先イベントが遠すぎる場合、非優先イベントのリストを作り、最も近いイベントに発言させる
		if (priority > 0) {
			var distance = $gameMap.distance($gamePlayer.x, $gamePlayer.y, $gameMap._events[speakId]._x, $gameMap._events[speakId]._y);
			if (distance > 12) {
				var list = [];
				for (var i = 0; i < $gameVariables._data[1][$gameMap._mapId].length; i++) {
					if (!$gameVariables._data[1][$gameMap._mapId][i]) continue;
					if ($gameMap._events[i].isCanSpeak()) list.push(i);
				}
				if (list.length > 0) {
					var nearestEventId = 0;
					var nearestEventDistance = 0;
					for (var i = 0; i < list.length; i++) {
						if (!list[i]) continue;
						var id = list[i];
						distance = $gameMap.distance($gamePlayer.x, $gamePlayer.y, $gameMap._events[id]._x, $gameMap._events[id]._y);
						if (nearestEventId != 0 && distance > nearestEventDistance) continue;
						nearestEventId = id;
						nearestEventDistance = distance;
					}
					if (nearestEventId > 0) {
						speakId = nearestEventId;
					}
				}
			}
		}

		//発言可能なidがあるなら発言させる（女性教師は笛を鳴らす）
		if (speakId) {

			//距離が遠すぎる場合、発言させない（画面中央から四隅まで距離１４）
			distance = $gameMap.distance($gamePlayer.x, $gamePlayer.y, $gameMap._events[speakId]._x, $gameMap._events[speakId]._y);
			if (distance > 12) return;

			if ($gameMap._events[speakId]._characterName == "w_teacher" && $gameVariables._data[1][$gameMap._mapId][speakId].hp >= 50) {
				var rand = Math.floor( Math.random() * 21 ) + 130;
				AudioManager.playSe({"name":"whistle","volume":50,"pitch":rand,"pan":0});
			}
			$gameMap._events[speakId].speakText();

		}
	}

	//発言できるかどうか
	Game_Event.prototype.isCanSpeak = function() {
		var status = $gameVariables._data[1][$gameMap._mapId][this._eventId].status;
		var hp = $gameVariables._data[1][$gameMap._mapId][this._eventId].hp;
		if (hp <= 0) {
			return false;
		}else if (status == "dead" || status == "playDead" || status == "escaped") {
			return false;
		}else{
			return true;
		}
	}

	//群衆悲鳴の再生
	Game_Map.prototype.playCrowdScream = function() {
		var number = $gameMap.numberOfStudents(true);
		if (number >= 4 && !$gameSwitches.value(55)) {
		  $gameSwitches.setValue(55,true); 
		  var rand = Math.floor( Math.random() * 21 ) + 80;
		  AudioManager.playSe({"name":"kids_scream","volume":50,"pitch":rand,"pan":0});
		}
	}

	//マップ内の死者・死んだふり・重傷者を除く生徒数
	Game_Map.prototype.numberOfStudents = function(onlyNear = false) {
		if ($gameVariables._data[1]) {
			if (!$gameVariables._data[1][$gameMap._mapId]) return 0;

			var number = 0;
			var list = $gameVariables._data[1][$gameMap._mapId];
			var name = "";
			var status = "";
			var distance = 0;

			for (var i = 0; i < list.length; i++) {
				if (!list[i]) continue;
				if (onlyNear) {
					distance = this.distance($gamePlayer.x, $gamePlayer.y, $gameMap._events[i]._x, $gameMap._events[i]._y);
					if (distance > 14) continue;
				}

				name = $gameMap._events[i]._characterName;
				status = list[i].status;

				if (list[i].hp >= 50 && status != "playDead" && status != "escaped" && status != "fight") {
					if (name == "male_students" || name == "female_students ") number += 1;
				}
			}
		}
		return number;
	}

	//女性教師が存在するか
	Game_Map.prototype.existFemaleTeacher = function() {
		if ($gameVariables._data[1]) {
			if (!$gameVariables._data[1][$gameMap._mapId]) return false;
			var list = $gameVariables._data[1][$gameMap._mapId];
			for (var i = 0; i < list.length; i++) {
				if (!list[i]) continue;
				if($gameMap._events[i]._characterName == "w_teacher" && list[i].hp >= 50 && list[i].status != "escaped") {
					return true;
				}
			}
		}
		return false;
	}

	//叫び声を再生する
	Game_Map.prototype.playScream = function() {

		var audibleDistance = 20;
		var distance = 0;
		var nearestEventId = 0;
		var nearestEventDistance = 20;

		if (!$gameVariables._data[1][this._mapId]) {
			return;
		}

		for (var i = 0; i < $gameVariables._data[1][this._mapId].length; i++) {

			if (!$gameVariables._data[1][$gameMap._mapId][i]) continue;

			distance = this.distance($gamePlayer.x, $gamePlayer.y, $gameMap._events[i]._x, $gameMap._events[i]._y);

			if (distance < audibleDistance && $gameMap._events[i].isCanScream()) {
				if (distance < nearestEventDistance) {
					nearestEventId = i;
					nearestEventDistance = distance;
				}
			}
		}

		if (nearestEventId) {
			var randomNumber = Math.floor(Math.random() * 6);
			var volume = 100 - (nearestEventDistance * 6);
			if (volume < 0) volume = 10;
			var randomPitch = Math.floor( Math.random() * 11 ) + 90; 
			var pan = ($gameMap._events[nearestEventId]._x - $gamePlayer.x) * 10;
			AudioManager.playSe({"name":"scream" + randomNumber,"volume":volume,"pitch":randomPitch,"pan":pan});
		}

	}

	//叫び声を上げられるかどうか
	Game_Event.prototype.isCanScream = function() {
		var status = $gameVariables._data[1][$gameMap._mapId][this._eventId].status;
		var hp = $gameVariables._data[1][$gameMap._mapId][this._eventId].hp;
		return this._characterName == "female_students " && hp > 0 && status == "run";
	}

	//爆弾スプライトの生成
	Scene_Map.prototype.createBomb = function(distance) {
		this._spriteBomb = new Sprite_Bomb($gamePlayer._x, $gamePlayer._y, $gamePlayer._direction, distance);
        SceneManager._scene._spriteset._tilemap.addChild(this._spriteBomb);
	};
	function Sprite_Bomb() {
		this.initialize.apply(this, arguments);
	}
	Sprite_Bomb.prototype = Object.create(Sprite.prototype);
	Sprite_Bomb.prototype.constructor = Sprite_Bomb;
	Sprite_Bomb.prototype.initialize = function(x, y, d, distance) {
		Sprite.prototype.initialize.call(this);
		this.visible = false;
		this.isFlying = true;
		this.bombType = $dataArmors[$gameParty.leader()._equips[2]._itemId];
		this.timer = Number(this.bombType.meta.timer * 60);
		this._x = x; this.x = x; this.gx = x;
		this._y = y; this.y = y; this.gy = y;
		this.distance = Math.floor(distance / 10);
		this.movement = 0;
		this.dir = d;
		this.z = 0;
		this._animationSprites = [];
		this._effectTarget = this;
		this.setGoal();
		this.createBitmap();
	};
	Sprite_Bomb.prototype.setGoal = function() {
		var mx = 0; var my = 0;
		switch (this.dir){
			case 2: mx = 0; my = 1; break;
			case 4: mx = -1; my = 0; break;
			case 6: mx = 1; my = 0; break;
			case 8:	mx = 0; my = -1; break;
		}
		for (var i = 0; i < this.distance; i++) {
			if ($gameMap.regionId(this.gx + mx, this.gy + my) == 1) break;
			this.gx += mx; this.gy += my;
		}
		if (this.dir == 4 || this.dir == 6) {
			this.distance = Math.abs(this.gx - this._x);
		}else{
			this.distance = Math.abs(this.gy - this._y);
		}
	};
	Sprite_Bomb.prototype.createBitmap = function() {
		this.setFrame(id * 48, 0, 48, 48);
		this.bitmap = ImageManager.loadSystem("bomb");
		var id = Number(this.bombType.meta.type) - 1;
		this.setFrame(id * 48, 0, 48, 48);
		this.visible = true;
	};
	Sprite_Bomb.prototype.update = function() {
		Sprite.prototype.update.call(this);
		if ($gameVariables._data[70] < 4 && $gameMap._mapId != 53) this.countdown();
		this.updatePosition();
		this.updateAnimationSprites();
	};
	Sprite_Bomb.prototype.countdown = function() {
		if (this.timer < 0) {
			this.visible = false;
			this.isFlying = false;
			$gameVariables._data[70] = 4;
			if ($gameVariables._data[71]) { //盗難アラーム誤作動
				if ($gameMap._mapId == 2) $gameVariables._data[71].isPlaying = true;
			}
			$gameScreen.startShake(1, 10, 30);
			$gameScreen.startFlash([255,255,255,255], 30);
			var id = 17;
			switch (Number(this.bombType.meta.type)){
				case 2: id = 16; break;
				case 3: id = 18; break;
				case 4:	id = 19; break;
				case 5:	id = 20; break;
			}
			this.startAnimation($dataAnimations[id], false, 0);
			this.explosionDamage();
		}else{
			this.timer -= 1;
		}
	};
	Sprite_Bomb.prototype.updatePosition = function() {

		if (this.isFlying) {

			if (this.dir == 4 || this.dir == 6){

				if (Math.floor(this._x * 10) / 10 == this.gx) {
					this.landing();
				}else{
					this.movement += 1;
					if (this.dir == 4) {
						this._x -= 0.1; 
					}else{
						this._x += 0.1; 
					}
					var num = Math.abs((this.movement / 10) - Math.floor((this.distance / 2) * 10) / 10);
					if (this.movement / 10 > Math.floor((this.distance / 2) * 10) / 10) {
						this._y += num / 50;
					}else{
						this._y -= num / 50;
					}
				}

			}else{

				if (Math.floor(this._y * 10) / 10 == this.gy) {
					this.landing();
				}else{
					this.movement += 1;
					if (this.dir == 2) {
						this._y += 0.1; 
					}else{
						this._y -= 0.1; 
					}
				}

			}

			this.x = (($gamePlayer.scrolledX() - $gamePlayer._realX + this._x) * 48);
			this.y = (($gamePlayer.scrolledY() - $gamePlayer._realY + this._y) * 48);

		}else{

			this.x = (($gamePlayer.scrolledX() - $gamePlayer._realX + this._x) * 48);
			this.y = (($gamePlayer.scrolledY() - $gamePlayer._realY + this._y) * 48);

		}
	};
	Sprite_Bomb.prototype.landing = function() {
		this.isFlying = false;
		if ($gameMap._mapId == 53) {
			$gameVariables._data[70] = 0;
			$gameVariables._data[81] += 1;
		}else{
			$gameVariables._data[70] = 3;
		}
		AudioManager.playSe({"name":"hammer","volume":50,"pitch":150,"pan":0});
	};
	Sprite_Bomb.prototype.updateAnimationSprites = function() {
		if (this._animationSprites.length > 0) {
			var sprites = this._animationSprites.clone();
			this._animationSprites = [];
			for (var i = 0; i < sprites.length; i++) {
				var sprite = sprites[i];
				if (sprite.isPlaying()) {
					this._animationSprites.push(sprite);
				} else {
					this.parent.removeChild(this.animation);
					SceneManager._scene._spriteset._tilemap.removeChild(this);
					$gameVariables._data[70] = 0;
					SceneManager._scene._spriteBomb = null;
				}
			}
		}
	};
	Sprite_Bomb.prototype.startAnimation = function(animation, mirror, delay) {
		this.animation = new Sprite_Animation();
		this.animation.setup(this._effectTarget, animation, mirror, delay);
		this.parent.addChild(this.animation);
		this._animationSprites.push(this.animation);
	};
	//ダメージ処理
	Sprite_Bomb.prototype.explosionDamage = function() {

		var bombX = this.gx; var bombY = this.gy;
		var playerDistance = $gameMap.distance($gamePlayer._x, $gamePlayer._y, bombX, bombY);
		var maxDamage = Number(this.bombType.meta.damage);
		var dmg = 0;
		var deadlyRadius = Number(this.bombType.meta.deadlyRadius);
		var damageRadius = Number(this.bombType.meta.damageRadius);
		var id = 0;

		//プレイヤーが殺傷範囲　最短距離と実際の距離を比較し障害物をチェック
		if (playerDistance <= damageRadius && playerDistance == $gamePlayer.bombDistance(bombX, bombY) && !$gameSwitches._data[36]){ 
			
			AudioManager.playSe({"name":"Damage3","volume":100,"pitch":100,"pan":0});
			$gamePlayer.requestAnimation(11);

			if (playerDistance <= deadlyRadius) { //即死

				$gameVariables._data[62] = 100;
				$gameSwitches.setValue(27,true);
				$gameSwitches.setValue(34,true);
				$gameVariables._data[43] = 2; 
				$gameSwitches.setValue(9,true);

			}else{ //被弾

				var randomDamage = Math.floor(Math.random() * ( maxDamage - (maxDamage / 2) )) + 1;
				dmg = maxDamage - randomDamage;
				$gameVariables._data[62] += dmg;

				if (!Scene_Map.prototype.isBlood($gamePlayer._x, $gamePlayer._y)) Scene_Map.prototype.createBlood($gamePlayer._x, $gamePlayer._y, 0, 2);

				if ($gameVariables._data[62] >= 100) { //ダメージにより死亡
					$gameSwitches.setValue(27,true);
					$gameSwitches.setValue(34,true);
					$gameVariables._data[43] = 2; 
					$gameSwitches.setValue(9,true);
					return;
				}else if ($gameVariables._data[4] > 100 - $gameVariables._data[62]){ //生存ならスタミナを減らす
					$gameVariables._data[4] = -1;
					var volume = Math.floor(dmg / 2);
					var time = dmg * 3;
					AudioManager.playSe({"name":"tinnitus","volume":volume,"pitch":100,"pan":0});
					$gameScreen.startFlash([255,255,255,255], time)
				}

			}
		}
		
		var soundPlayed = false;
		var speak = false;

		$gameMap._events.forEach(function(event) {

			if (event) {
				
				id = event._eventId;
				if ($gameMap._events[id].isInitialized()) {

					var beforeHp = $gameVariables._data[1][$gameMap._mapId][id].hp;
					var afterHp = beforeHp;
					var eventX = event._x; var eventY = event._y;
					var distance = $gameMap.distance(eventX, eventY, bombX, bombY);

					//生存かつ殺傷範囲内のイベント
					if (distance <= damageRadius && distance == event.bombDistance(bombX, bombY) && $gameVariables._data[1][$gameMap._mapId][id].status != "escaped"){

						if (!soundPlayed) {
							AudioManager.playSe({"name":"Damage3","volume":100,"pitch":100,"pan":0});
							soundPlayed = true;
						}

						$gameMap._events[id].requestAnimation(11);

						//無傷なら負傷
						if (event._characterName == "yandere") {
							if (beforeHp == 200) $gameVariables._data[56] += 1;
						}else{
							if (beforeHp == 100) $gameVariables._data[56] += 1;
						}

						//致命的範囲か負傷範囲か
						if (distance <= deadlyRadius) {
							$gameVariables._data[1][$gameMap._mapId][id].hp = 0;
							$gameVariables._data[1][$gameMap._mapId][id].lastDamage = 0;
						}else{
							var randomDamage = Math.floor(Math.random() * ( maxDamage - (maxDamage / 2) )) + 1;
							var damage = maxDamage - randomDamage;
							$gameVariables._data[1][$gameMap._mapId][id].hp -= damage;
							$gameVariables._data[1][$gameMap._mapId][id].lastDamage = damage;
						}

						afterHp = $gameVariables._data[1][$gameMap._mapId][id].hp;
						if (!Scene_Map.prototype.isBlood(eventX, eventY)) Scene_Map.prototype.createBlood(eventX, eventY, 0, 2);

						if (afterHp > 0 && afterHp < 50){ //重傷
							
							$gameSystem.addSeriousWound(id, 3, $gameParty.leader()._equips[2]._itemId);

							if (beforeHp >= 50) $gameVariables._data[56] -= 1;

							if ($gameVariables._data[1][$gameMap._mapId][id].shield > 0) { //防弾値を０にする
								$gameVariables._data[1][$gameMap._mapId][id].shield = 0;
							}

						}else if (afterHp <= 0 && beforeHp > 0) { //死亡

							killed = true;

							if (beforeHp >= 50) {
								$gameVariables._data[56] -= 1;
							}else if (beforeHp > 0) {
								$gameSystem.killSeriousWounded(id);
							}

							$gameVariables._data[2]++;
							$gameVariables._data[33]++;

							$gameMap._events[id].gainGold();
							$gameSystem.weaponRecord($gameParty.leader()._equips[2]._itemId, 3, 3);

							if ($gameVariables._data[87]) { //合計投擲殺害数の加算
								$gameVariables._data[87]++;
							}else{
								$gameVariables._data[87] = 1;
							}

							if ($gameVariables._data[87] >= 50) { //実績 爆殺魔
								$gameSystem.unlockAchievement(23); 
							}

							if (Math.floor(Math.random() * 2) == 0 && $gameVariables._data[62] < 100 && speak == false) {  //爆殺時の台詞
								$gamePlayer.speakText("useBomb");
								speak = true;
							}

						}
						
						var name = event._characterName;
						if (name == "yandere" || name == "policeman" || name == "w_policeman" || name == "principal") {
							var hp = $gameVariables._data[1][$gameMap._mapId][id].hp;
							var shield = $gameVariables._data[1][$gameMap._mapId][id].shield;
							$gameMap.setEnemyData(name, hp, shield);
						}
				
					}

				}
			}

		});

	};
	//爆発物までの移動距離
	Game_Character.prototype.bombDistance = function(bombX, bombY) {

		var searchLimit = 10;
		var mapWidth = $gameMap.width();
		var nodeList = [];
		var openList = [];
		var closedList = [];
		var start = {};
		var best = start;
	
		if (this.x === bombX && this.y === bombY) {
			return 0;
		}
	
		start.parent = null;
		start.x = this.x;
		start.y = this.y;
		start.g = 0;
		start.f = $gameMap.distance(start.x, start.y, bombX, bombY);
		nodeList.push(start);
		openList.push(start.y * mapWidth + start.x);
	
		while (nodeList.length > 0) {
			var bestIndex = 0;
			for (var i = 0; i < nodeList.length; i++) {
				if (nodeList[i].f < nodeList[bestIndex].f) {
					bestIndex = i;
				}
			}
	
			var current = nodeList[bestIndex];
			var x1 = current.x;
			var y1 = current.y;
			var pos1 = y1 * mapWidth + x1;
			var g1 = current.g;
	
			nodeList.splice(bestIndex, 1);
			openList.splice(openList.indexOf(pos1), 1);
			closedList.push(pos1);
	
			if (current.x === bombX && current.y === bombY) {
				best = current;
				return best.g;
			}
	
			if (g1 >= searchLimit) {
				continue;
			}
	
			for (var j = 0; j < 4; j++) {
				var direction = 2 + j * 2;
				var x2 = $gameMap.roundXWithDirection(x1, direction);
				var y2 = $gameMap.roundYWithDirection(y1, direction);
				var pos2 = y2 * mapWidth + x2;
	
				if (closedList.contains(pos2)) {
					continue;
				}
				if ($gameMap.regionId(x2, y2) == 1) continue;

				var g2 = g1 + 1;
				var index2 = openList.indexOf(pos2);
	
				if (index2 < 0 || g2 < nodeList[index2].g) {
					var neighbor;
					if (index2 >= 0) {
						neighbor = nodeList[index2];
					} else {
						neighbor = {};
						nodeList.push(neighbor);
						openList.push(pos2);
					}
					neighbor.parent = current;
					neighbor.x = x2;
					neighbor.y = y2;
					neighbor.g = g2;
					neighbor.f = g2 + $gameMap.distance(x2, y2, bombX, bombY);
					if (!best || neighbor.f - neighbor.g < best.f - best.g) {
						best = neighbor;
					}
				}
			}
		}
		return searchLimit;
	};
	//爆発による盗難アラーム誤作動
	Scene_Map.prototype.carAlarm = function(){

		if (!$gameVariables._data[71].alarmCount) {
			AudioManager.playBgs2({"name":"Car1","volume":100,"pitch":100,"pan":0}, 1);
			AudioManager.playBgs2({"name":"Car2","volume":100,"pitch":100,"pan":0}, 2);
			$gameVariables._data[71].alarmTimer = 60;
			$gameVariables._data[71].alarmCount = 1;
		}

		if ($gameVariables._data[71].alarmTimer > 60){
			var distance = $gameMap.distance($gamePlayer._x, $gamePlayer._y, 49, 45);
			var volume1 = 150;
			var volume2 = 150 - (distance * 2);
			AudioManager.playBgs2({"name":"Car1","volume":volume1,"pitch":100,"pan":0}, 1);
			AudioManager.playBgs2({"name":"Car2","volume":volume2,"pitch":100,"pan":0}, 2);
			$gameVariables._data[71].alarmTimer = 0;
			$gameVariables._data[71].alarmCount += 1;
		}else{
			$gameVariables._data[71].alarmTimer += 1;
		}

		if ($gameMap._mapId != 2 || $gameVariables._data[71].alarmCount > 30) {
			AudioManager.stopBgs2();
			$gameVariables._data[71].isPlaying = false;
			$gameVariables._data[71].alarmTimer = 0;
			$gameVariables._data[71].alarmCount = 0;
		}

	};

	//出血スプライトの生成
	Scene_Map.prototype.createBlood = function(x, y, d = 0, type = 1, level = 0) {
		var blood = new Sprite_Blood(x, y, d, type, level);
        SceneManager._scene._spriteset._tilemap.addChild(blood);
		if (!bloodMap[$gameMap._mapId]) bloodMap[$gameMap._mapId] = [];
		bloodMap[$gameMap._mapId].push(blood);
	};
	Scene_Map.prototype.createSplatterBlood = function(x, y, level = 10) {

		var bx = $gameMap.xWithDirection(x, $gamePlayer._direction); 
		var by = $gameMap.yWithDirection(y, $gamePlayer._direction); 
		if (level > 10) level = 10;

		if (!this.isBlood(bx, by)) {
			//上方向ならイベントがリージョン２に存在しない時に出血
			//それ以外ならリージョン１でない時に出血
			if ($gamePlayer._direction == 8){
				if ($gameMap.regionId(x, y) != 2){
					this.createBlood(bx, by, $gamePlayer._direction, 1, level);
				}
			}else if($gameMap.regionId(bx, by) != 1){
				this.createBlood(bx, by, $gamePlayer._direction, 1, level)
			}
		}

	};
	//指定した場所に出血スプライトは存在するか
	Scene_Map.prototype.isBlood = function(x, y) {
		if (bloodMap[$gameMap._mapId]) {
			for (var i = 0; i <= bloodMap[$gameMap._mapId].length - 1; i++){
				if (Math.floor(bloodMap[$gameMap._mapId][i]._x) == x && Math.floor(bloodMap[$gameMap._mapId][i]._y) == y) return true;
			}
			return false;
		}
	};
	//出血スプライトの定義
	function Sprite_Blood() {
		this.initialize.apply(this, arguments);
	}
	Sprite_Blood.prototype = Object.create(Sprite.prototype);
	Sprite_Blood.prototype.constructor = Sprite_Blood;
	Sprite_Blood.prototype.initialize = function(x, y, d, type, level) {
		Sprite.prototype.initialize.call(this);
		this.bleedType = type;
		this.bleedLevel = level;
		this.d = d;
		this.visible = false;
		this.createBitmap();
		this._animationSprites = [];
		this._effectTarget = this;
		this.type = "blood";
		this._x = x; this.x = x; this.gx = x;
		this._y = y; this.y = y; this.gy = y;
		this.z = 0;
		this.dir = 0;
		this.down = 0;
	};
	Sprite_Blood.prototype.update = function() {
		Sprite.prototype.update.call(this);
		this.updatePosition();
		this.updateAnimationSprites();
	};
	Sprite_Blood.prototype.createBitmap = function() {

		var name = "bloods";
		if (this.d != 0) name = name + this.d;

		var idX = this.bleedLevel != 0 ? this.bleedLevel : Math.floor(Math.random() * 10);
		var idY = this.bleedType - 1;
		this.bitmap = ImageManager.loadSystem(name);
		this.setFrame(idX * 48, idY * 48, 48, 48);
		this.visible = true;

	};
	Sprite_Blood.prototype.updatePosition = function() {
		this.x = (($gamePlayer.scrolledX()- $gamePlayer._realX + this._x) * 48);
		this.y = (($gamePlayer.scrolledY()- $gamePlayer._realY + this._y) * 48);
	};
	Sprite_Blood.prototype.updateAnimationSprites = function() {
		if (this._animationSprites.length > 0) {
			var sprites = this._animationSprites.clone();
			this._animationSprites = [];
			for (var i = 0; i < sprites.length; i++) {
				var sprite = sprites[i];
				if (sprite.isPlaying()) {
					this._animationSprites.push(sprite);
				} else {
					this.parent.removeChild(this.sprite);
					SceneManager._scene._spriteset._tilemap.removeChild(this);
				}
			}
		}
	};
	Sprite_Blood.prototype.startAnimation = function(animation, mirror, delay) {
		this.sprite = new Sprite_Animation();
		this.sprite.setup(this._effectTarget, animation, mirror, delay);
		this.parent.addChild(this.sprite);
		this._animationSprites.push(this.sprite);
	};

	Game_Event.prototype.moveStraight = function(d) {
		if (this.isInitialized()) {

			var hp = $gameVariables._data[1][$gameMap._mapId][this._eventId].hp;
	
			if (hp < 100 && hp != 0){

				var donwTimer = $gameVariables._data[1][$gameMap._mapId][this._eventId].downTimer;
				var bleeding = false;

				if (donwTimer > 0 && Math.floor(Math.random() * 2)) { //ダウンタイマー動作中は 50％ の確率で出血

					bleeding = true;
					
				}else{ //体力によって最大 25％ の確率で出血

					var probability = (100 - hp) / 2; // 90 = 5, 60 = 20
					if (probability > 25) probability = 25;
					bleeding = probability > Math.floor(Math.random() * 100);

				}

				if (bleeding) {
					var type = hp < 50 ? 1 : 1; //現在は 1 固定
					if (!Scene_Map.prototype.isBlood(this._x, this._y)) Scene_Map.prototype.createBlood(this._x, this._y, 0, type);
				}

			}

		}
		Game_Character.prototype.moveStraight.call(this, d);
	};

	//クロスヘア
	Scene_Map.prototype.makeCrosshair = function() {
		for (var i = 2; i <= 8; i += 2) {
			if (i != 8) {
				Crosshair[i] = new Sprite_Crosshair(i);
				SceneManager._scene.addChild(Crosshair[i]);
			}
		}
	};
	function Sprite_Crosshair() {
		this.initialize.apply(this, arguments);
	}
	Sprite_Crosshair.prototype = Object.create(Sprite.prototype);
	Sprite_Crosshair.prototype.constructor = Sprite_Crosshair;
	Sprite_Crosshair.prototype.initialize = function(dir) {
		Sprite.prototype.initialize.call(this);

		$gamePlayer.targetList = [];
		$gamePlayer.targetId = 0;
		$gamePlayer.targetListIndex = 0;

		if ($gamePlayer.isYuumi() || $gameSwitches.value(61)) {
			this.isKnife = true;
		}else{
			this.isKnife = false;
		}
		this.dir = dir;
		this.hue = 0;
		this.x = 0; this.y = 0;
		this.adx = 0; this.ady = 0;
		switch (this.dir){
			case 2: this.ady = 0.5; break;
			case 4: this.adx = -0.5; break;
			case 6: this.adx = 0.5; break;
			case 8:	this.ady = -0.5; break;
		}
		this.visible = false;
		this.createBitmap();
	};
	Sprite_Crosshair.prototype.update = function() {
		Sprite.prototype.update.call(this);
		if ($gameSwitches.value(5)) { 
			this.updatePosition();
			this.updateHue();
		}else{
			this.visible = false;
		}
	};
	Sprite_Crosshair.prototype.recoil = function() {
		if ($gamePlayer.isYuumi() || $gameSwitches.value(61)) {
			return 80;
		}else{
			return $gamePlayer.accuracy();
		}
	};
	Sprite_Crosshair.prototype.updateHue = function() {

		var recoil = this.recoil();
		var hue = this.hue;

		if (recoil >= 90){
			this.hue = 0;
		}else if (recoil >= 80) {
			this.hue = 300;
		}else if (recoil >= 50) {
			this.hue = 200;
		}else{
			this.hue = 150;
		}

		if (this.hue != hue) {
			var name = "Crosshair" + this.dir;
			this.bitmap = ImageManager.loadBitmap('img/system/', name, this.hue, false);
		}
		
	};
	Sprite_Crosshair.prototype.createBitmap = function() {
		var name = "Crosshair" + this.dir;
		this.bitmap = ImageManager.loadSystem(name);
		this.updatePosition();
	};
	Sprite_Crosshair.prototype.updatePosition = function() {
		var target = $gamePlayer;
		if ($gamePlayer.targetList.length > 0) {
			this.visible = true;
			if ($gamePlayer.targetId) {
				target = $gameMap._events[$gamePlayer.targetId];
			}else{
				target = $gameMap._events[$gamePlayer.targetList[0]._eventId];
			}
		}else{
			this.visible = false;
		}
		if (target) {
			var recoil = this.recoil();
			if (recoil >= 100) recoil = 100;
			var spreadX = (100 - recoil) * this.adx;
			var spreadY = (100 - recoil) * this.ady;
			this.x = target.screenX() - 29 + spreadX;
			this.y = target.screenY() - 50 + spreadY;
		}
	};

	//装備メニュー
	Window_EquipStatus.prototype.initialize = function(x, y) {
		var width = this.windowWidth();
		var height = 330;
		Window_Base.prototype.initialize.call(this, 0, 0, width, height);
		this._actor = null;
		this._tempActor = null;
		this.drawFace("guns1", -1, 0, 30, 144, 144);
		this.refresh();
	};
	Window_EquipStatus.prototype.refresh = function() {

		this.contents.clear();
		var y = 28;

        if (this.item) {
			
			var gun = "";
			var id = 0;
			var speed = 0;
			var recoil = 0;

			if (this.item.etypeId == 1) { //主武装・副武装

				if (this.item.id > 24) {
					gun = "guns4"; 
					id = this.item.id - 25;
				}else if (this.item.id > 16) {
					gun = "guns3";
					id = this.item.id - 17;
				}else if (this.item.id > 8) {
					gun = "guns2";
					id = this.item.id - 9;
				}else{
					gun = "guns1";
					id = this.item.id - 1;
				}

				this.drawText(this.item.name, 0, -5, 276, 'center'); //銃の名前
				this.drawFace(gun, id, 0, 40, 144, 144); //銃の画像

				this.changeTextColor(this.textColor(16));
				this.contents.fontSize = 20;

				//ゲージ値を取得
				switch (this.item.meta.speed) {
					case "最遅": speed = 0.1; break;
					case "遅": speed = 0.25; break;
					case "普通": speed = 0.5; break;
					case "速": speed = 0.75; break;
					case "最速": speed = 1;
				}
				switch (this.item.meta.recoil) {
					case "最小": recoil = 0.1; break;
					case "小": recoil = 0.25; break;
					case "中": recoil = 0.5; break;
					case "大": recoil = 0.75; break;
					case "特大": recoil = 1;
				}

				//ゲージを表示
				this.drawGauge(150, y + 8, 123, this.item.params[2] / 100, this.textColor(8), this.textColor(0));
				this.drawGauge(150, (y * 2) + 8, 123, recoil, this.textColor(8), this.textColor(0));
				this.drawGauge(150, (y * 3) + 8, 123, speed, this.textColor(8), this.textColor(0));

				//テキスト
				this.drawText("威力 ", 150, y + 10); 
				this.drawText("反動 ", 150, (y * 2) + 10);
				this.drawText("速射", 150, (y * 3) + 10); 
				this.drawText("装弾数 ", 150, (y * 4) + 10);
				this.drawText("使用回数", 20, y * 7); 
				this.drawText("発砲回数", 20, y * 8); 
				this.drawText("殺害数", 20, y * 9);
				if ($gameSwitches.value(40)){
					if (this.item.meta["isPump"] == "0"){
						this.drawText("弾倉 ", 150, (y * 5) + 10);
					}else{
						this.drawText("散弾 ", 150, (y * 5) + 10);
					}
				}

				this.resetTextColor();

				//戦績データがない場合の初期化
				if (!$gameSystem._data.gunRecord[this.item.id]) $gameSystem.weaponRecordInitialize(this.item.id, 1);
				
				//戦績データの表示
				this.drawText($gameSystem._data.gunRecord[this.item.id].useCount + " 回", 0, y * 7, 230, 'right'); 
				this.drawText($gameSystem._data.gunRecord[this.item.id].shotCount + " 発", 0, y * 8, 230, 'right'); 
				this.drawText($gameSystem._data.gunRecord[this.item.id].killCount + " 人", 0, y * 9, 230, 'right');
				this.drawText(this.item.params[2], 225, y + 10, 48, 'right');
				this.drawText(this.item.meta.recoil, 225, (y * 2) + 10, 48, 'right');
				this.drawText(this.item.meta.speed, 225, (y * 3) + 10, 48, 'right');
				this.drawText(this.item.meta.rnd, 225, (y * 4) + 10, 48, 'right');
				if ($gameSwitches.value(40)) this.drawText(this.item.meta.magazine, 225, (y * 5) + 10, 48, 'right');

			}else if (this.item.etypeId == 3) { //投擲物

				var dead = 0;
				var wound = 0.25 * (Number(this.item.meta.damageRadius) - Number(this.item.meta.deadlyRadius));
				var damage = Number(this.item.meta.damage) / 100;

				this.drawText(this.item.name, 0, -5, 276, 'center');
				this.drawFace("bomb", this.item.id - 1, 0, 40, 144, 144);

				this.changeTextColor(this.textColor(16));
				this.contents.fontSize = 20;

				//致死範囲ゲージ値の取得
				switch (Number(this.item.meta.deadlyRadius)) {
					case 1: dead = 0.25; break;
					case 2: dead = 0.5; break
					case 3: dead = 1;
				}
				
				//ゲージを表示
				this.drawGauge(150, y + 8, 123, dead, this.textColor(8), this.textColor(0));
				this.drawGauge(150, (y * 2) + 8, 123, wound, this.textColor(8), this.textColor(0));
				this.drawGauge(150, (y * 3) + 8, 123, damage, this.textColor(8), this.textColor(0));

				//テキスト
				this.drawText("致死範囲", 150, y + 10); 
				this.drawText("＋負傷範囲", 150, (y * 2) + 10);
				this.drawText("ダメージ", 150, (y * 3) + 10); 
				this.drawText("起爆", 150, (y * 4) + 10);
				this.drawText("所持数", 150, (y * 5) + 10);
				this.drawText("使用回数", 20, y * 7); 
				this.drawText("投擲回数", 20, y * 8); 
				this.drawText("殺害数", 20, y * 9);

				this.resetTextColor();

				this.drawText(this.item.meta.deadlyRadius, 225, y + 10, 48, 'right');
				this.drawText(Number(this.item.meta.damageRadius) - Number(this.item.meta.deadlyRadius), 225, (y * 2) + 10, 48, 'right');
				this.drawText(this.item.meta.damage, 225, (y * 3) + 10, 48, 'right');
				this.drawText(this.item.meta.timer + "秒", 225, (y * 4) + 10, 48, 'right');
				var skill = $gameActors.actor(1).hasSkill(17) ? 2 : 1;
				this.drawText(this.item.meta.number * skill + "個", 225, (y * 5) + 10, 48, 'right');

				if (!$gameSystem._data.bombRecord[this.item.id]) {
					$gameSystem.weaponRecordInitialize(this.item.id, 3);
				}

				this.drawText($gameSystem._data.bombRecord[this.item.id].useCount + " 回", 0, y * 7, 230, 'right'); 
				this.drawText($gameSystem._data.bombRecord[this.item.id].shotCount + " 発", 0, y * 8, 230, 'right'); 
				this.drawText($gameSystem._data.bombRecord[this.item.id].killCount + " 人", 0, y * 9, 230, 'right');

			}else if (this.item.etypeId == 4) { //近接武器

				var damage = this.item.params[2] / 100;
				var speed = 0;
				var stamina = 0;

				this.drawText(this.item.name, 0, -5, 276, 'center');
				this.drawFace("knife", Number($dataArmors[this.item.id].meta.picID), 0, 40, 144, 144);
				this.changeTextColor(this.textColor(16));
				this.contents.fontSize = 20;

				switch (this.item.meta.speed) {
					case "最遅": speed = 0.1; break;
					case "遅": speed = 0.25; break;
					case "普通": speed = 0.5; break;
					case "速": speed = 1; break;
				}
				switch (this.item.meta.stamina) {
					case "小": stamina = 0.25; break;
					case "中": stamina = 0.5; break;
					case "大": stamina = 0.75; break;
				}

				this.drawGauge(150, y + 8, 123, damage, this.textColor(8), this.textColor(0));
				this.drawGauge(150, (y * 2) + 8, 123, stamina, this.textColor(8), this.textColor(0));
				this.drawGauge(150, (y * 3) + 8, 123, speed, this.textColor(8), this.textColor(0));

				this.drawText("威力", 150, y + 10); 
				this.drawText("疲労", 150, (y * 2) + 10);
				this.drawText("速度", 150, (y * 3) + 10); 
				this.drawText("使用回数", 20, y * 7); 
				this.drawText("攻撃回数", 20, y * 8); 
				this.drawText("殺害数", 20, y * 9);

				this.resetTextColor();

				//投擲物の戦績データがない場合の初期化
				if (!$gameSystem._data.meleeRecord[this.item.id]) {
					$gameSystem.weaponRecordInitialize(this.item.id, 2);
				}

				this.drawText($gameSystem._data.meleeRecord[this.item.id].useCount + " 回", 0, y * 7, 230, 'right'); 
				this.drawText($gameSystem._data.meleeRecord[this.item.id].shotCount + " 回", 0, y * 8, 230, 'right'); 
				this.drawText($gameSystem._data.meleeRecord[this.item.id].killCount + " 人", 0, y * 9, 230, 'right');
				this.drawText(this.item.params[2], 225, y + 10, 48, 'right');
				this.drawText(this.item.meta.stamina, 225, (y * 2) + 10, 48, 'right');
				this.drawText(this.item.meta.speed, 225, (y * 3) + 10, 48, 'right');

			}
			this.contents.fontSize = 28;	
        }
    };
	Scene_Equip.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createStatusWindow();
        this.createSlotWindow();
        this.createItemWindow();
		this._InfoWindow = new Window_Info();
		this.addWindow(this._InfoWindow);
		this._helpWindow.x = this._statusWindow.width;
		this._helpWindow.width = Graphics.boxWidth - this._statusWindow.width;

        this.refreshActor();
		this._slotWindow.activate();
        this._slotWindow.select(0);
		this._helpWindow.refresh();
    };
	Scene_Equip.prototype.createSlotWindow = function() {
        var wx = 312;
        var wy = this._helpWindow.height;
        var ww = 504;
        var wh = (36 * 4) + 36;
        this._slotWindow = new Window_EquipSlot(wx, wy, ww, wh);
        this._slotWindow.setHelpWindow(this._helpWindow);
        this._slotWindow.setStatusWindow(this._statusWindow);
        this._slotWindow.setHandler('ok',       this.onSlotOk.bind(this));
        this._slotWindow.setHandler('cancel',   this.popScene.bind(this));
        this.addWindow(this._slotWindow);
    };
	Window_EquipSlot.prototype.updateHelp = function() {
        Window_Selectable.prototype.updateHelp.call(this);
        this.setHelpWindowItem(this.item());
		this._statusWindow.item = this.item();
		this._statusWindow.refresh();
    };
	Window_Base.prototype.drawItemName = function(item, x, y, width) {
		width = width || 312;
		if (item) {
			var iconBoxWidth = Window_Base._iconWidth + 4;
			this.resetTextColor();
			this.drawIcon(item.iconIndex, x + 2, y + 2);
			this.drawText(item.name, x + iconBoxWidth, y, width - iconBoxWidth);
		}
	};
	Window_EquipSlot.prototype.drawItem = function(index) {
		if (this._actor) {
			var rect = this.itemRectForText(index);
			this.changeTextColor(this.systemColor());
			this.changePaintOpacity(this.isEnabled(index));
			switch (index) {
				case 0: this.drawText("主武装", rect.x, rect.y); break;
				case 1: this.drawText("副武装", rect.x, rect.y); break;
				case 2: this.drawText("投擲物", rect.x, rect.y); break;
				case 3: this.drawText("近接武器", rect.x, rect.y, 28 * 3); break;
			}
			this.drawItemName(this._actor.equips()[index], rect.x + 110, rect.y);
			this.changePaintOpacity(true);
		}
	};
	Window_EquipItem.prototype.includes = function(item) {
		if (item === null) return false;
        if (item) {
			if (this._slotId == 2) { //投擲物
				if (item.etypeId !== 3) return false;
			}else if (this._slotId == 3) { //近接武器
				if (item.etypeId !== 4) return false;
			}else{
				if ((this._slotId + 1) !== item.wtypeId) {
					return false
				}
				if (this._slotId < 0 || item.etypeId !== this._actor.equipSlots()[this._slotId]) {
					return false;
				}
			}
		}
		return this._actor.canEquip(item);
	};
	Scene_Equip.prototype.onItemOk = function() {
		var item = this._itemWindow.item();
		if (item.etypeId == 4 && (item.id == 14 || item.id == 15)) {
			this._itemWindow.activate();
			this._itemWindow.select(this._itemWindow.index());
		}else{
			SoundManager.playEquip();
			this.actor().changeEquip(this._slotWindow.index(), this._itemWindow.item());
			this._slotWindow.activate();
			this._slotWindow.refresh();
			this._itemWindow.deselect();
			this._itemWindow.refresh();
			this._statusWindow.refresh();
		}
	};
	Window_EquipItem.prototype.updateHelp = function() {
		Window_ItemList.prototype.updateHelp.call(this);
		if (this._actor && this._statusWindow && this._slotId > 0) {
			var actor = JsonEx.makeDeepCopy(this._actor);
			actor.forceChangeEquip(this._slotId, this.item());
			this._statusWindow.setTempActor(actor);
		}
		this._statusWindow.item = this.item();
		this._statusWindow.refresh();
	};
	Scene_Equip.prototype.createItemWindow = function() {
        var wx = 0;
        var wy = 408;
        var ww = Graphics.boxWidth;
        var wh = Graphics.boxHeight - wy;
        this._itemWindow = new Window_EquipItem(wx, wy, ww, wh);
        this._itemWindow.setHelpWindow(this._helpWindow);
        this._itemWindow.setStatusWindow(this._statusWindow);
        this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
        this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
        this._slotWindow.setItemWindow(this._itemWindow);
        this.addWindow(this._itemWindow);
    };
	function Window_Info() {
        this.initialize.apply(this, arguments);
    }
    Window_Info.prototype = Object.create(Window_Base.prototype);
    Window_Info.prototype.constructor = Window_Info;
	Window_Info.prototype.initialize = function() {
		var x = 516;
		var y = 408 - 70;
	    var width = 300;
	    var height = 70;
	    Window_Base.prototype.initialize.call(this, x, y, width, height);
		this.refresh();
	};
	Window_Info.prototype.refresh = function() {
	    this.contents.clear();
		this.changeTextColor(this.textColor(16));
		this.contents.fontSize = 26;
		this.drawText("ロッカーに保管中", 26, 0);
		this.contents.fontSize = 28;
		this.resetTextColor();
	};
	Window_ItemList.prototype.maxCols = function() {
		return 3;
	};
	Window_ItemList.prototype.drawItemNumber = function(item, x, y, width) {
	};
	Window_ItemList.prototype.drawItem = function(index) {
		var item = this._data[index];
		if (item) {
			var rect = this.itemRect(index);
			rect.width -= this.textPadding();
			this.changePaintOpacity(this.isEnabled(item));
			this.drawItemName(item, rect.x, rect.y, rect.width);
			this.changePaintOpacity(1);
		}
	};
	Window_ItemList.prototype.isEnabled = function(item) {
		if(item.etypeId == 4){
			return false;
		}else{
			return true;
		}
	};
	//装備不可能なアイテムの設定
	Window_EquipItem.prototype.isEnabled = function(item) {
		if(item){
			if (item.etypeId == 4 && (item.id == 14 || item.id == 15) ) {
				return false;
			}else{
				return true;
			}
		}else{
			return false
		}
	};

	//アナウンスメッセージウィンドウの定義
	function Window_Announcement() {
		this.initialize.apply(this, arguments);
	}
	Window_Announcement.prototype = Object.create(Window_Base.prototype);
	Window_Announcement.prototype.constructor = Window_Announcement;

	Window_Announcement.prototype.initialize = function() {
		var width = 525;
		var height = this.fittingHeight(1);
		Window_Base.prototype.initialize.call(this, 0, 0, width, height);
		this.opacity = 0;
		this.contentsOpacity = 0;
		this._showCount = 0;
		this.textX = 600;
		this.text = "";
		this.refresh();
	};
	Window_Announcement.prototype.update = function() {
		Window_Base.prototype.update.call(this);
		if (!$gameSwitches.value(5)) { //ステータスが表示されていない時にアナウンスを削除
			this._showCount = 0;
			this.contentsOpacity = 0;
			$gameVariables._data[18] = 0;
			return;
		}
		if (this._showCount > 0 && $gameMap.isNameDisplayEnabled()) {
			this.contentsOpacity += 16;
			this._showCount--;
			this.textX--;
			this.refresh();
			$gameVariables._data[18] = SceneManager._scene._announcement._showCount;
		} else {
			if ($gameVariables._data[18] > 0){
				this.text = announcement[$gameVariables._data[11] - 1];
				this.textX = $gameVariables._data[18] - this.textWidth(this.text);
				this._showCount = $gameVariables._data[18];
			}else if(this.contentsOpacity > 0) {
				this.contentsOpacity -= 16;
			}	
		}
	};
	Window_Announcement.prototype.open = function(text) {
		AudioManager.playSe({"name":"call_up","volume":50,"pitch":100,"pan":0});
		this.text = announcement[text];
		this.textX = 600;
		this._showCount = this.textWidth(this.text) + 600;
		this.refresh();
	};
	Window_Announcement.prototype.refresh = function() {
		this.contents.clear();
		this.drawBackground(0, 0, 525, this.lineHeight());
		this.drawText(this.text, this.textX, 0, (this.textWidth(this.text) + 48));
	};
	Window_Announcement.prototype.drawBackground = function(x, y, width, height) {
		var color1 = this.dimColor1();
		var color2 = this.dimColor2();
		this.contents.gradientFillRect(x, y, width / 2, height, color2, color1);
		this.contents.gradientFillRect(x + width / 2, y, width / 2, height, color1, color2);
	};

	//全体表示メッセージ
	Window_Message.prototype.numVisibleRows = function() {
		var height = $gameSwitches.value(16) ? 16 : 4;
		return height;
	};
	Window_Message.prototype.isEndOfText = function(textState) {
		return textState.index >= textState.text.length;
	};
	Window_Message.prototype.onEndOfText = function() {
		if (!this.startInput()) {
			if (!this._pauseSkip) {
				this.startPause();
			} else {
				this.terminateMessage();
			}
		}
		this._textState = null;
	};

	Game_Interpreter.prototype.command101 = function() {
		if (!$gameMessage.isBusy()) {
			$gameMessage.setFaceImage(this._params[0], this._params[1]);
			$gameMessage.setBackground(this._params[2]);
			$gameMessage.setPositionType(this._params[3]);
			while (this.nextEventCode() === 401) {  // Text data
				this._index++;
				$gameMessage.add(this.currentCommand().parameters[0]);
				if ($gameSwitches.value(16) && this.nextEventCode() === 101) {
					this._index++;
				}
			}
			switch (this.nextEventCode()) {
			case 102:  // Show Choices
				this._index++;
				this.setupChoices(this.currentCommand().parameters);
				break;
			case 103:  // Input Number
				this._index++;
				this.setupNumInput(this.currentCommand().parameters);
				break;
			case 104:  // Select Item
				this._index++;
				this.setupItemChoice(this.currentCommand().parameters);
				break;
			}
			this._index++;
			this.setWaitMode('message');
		}
		return false;
	};
	
    var _Window_Base_resetFontSettings = Window_Base.prototype.resetFontSettings;
    Window_Base.prototype.resetFontSettings = function() {
        _Window_Base_resetFontSettings.call(this);
		if ($gameSwitches.value(16)) {
        	this.contents.outlineColor = 'rgba(%1,%2,%3,%4)'.format(0, 0, 0, 0);
		}
    };
	
	//ゲーム終了時のスコア
	Scene_Map.prototype.score = function(){
		
		var acc = Math.floor(($gameVariables._data[27] / $gameVariables._data[26]) * 100);
		var y = 0;
		
		this.scoreSprite(475, 33, 80, 40, 28, $gameVariables._data[2], "right"); 	//死者
		this.scoreSprite(460, 82, 80, 40, 28, $gameVariables._data[3], "right"); 	//重傷者
		this.scoreSprite(460, 121, 80, 40, 28, $gameVariables._data[58], "right"); 	//内搬送後死亡
		this.scoreSprite(443, 159, 80, 40, 28, $gameVariables._data[56], "right"); 	//負傷
		this.scoreSprite(296, 195, 80, 40, 28, $gameVariables._data[26], "right"); 	//発砲数
		this.scoreSprite(478, 195, 80, 40, 28, acc, "right"); 						//命中率

		this.scoreSprite(368, 266, 70, 40, 26, $gameVariables._data[28], "right");
		this.scoreSprite(368, 266 + (28 * 1), 70, 40, 26, $gameVariables._data[29], "right");
		this.scoreSprite(368, 266 + (28 * 2), 70, 40, 26, $gameVariables._data[30], "right");
		this.scoreSprite(368, 266 + (28 * 3), 70, 40, 26, $gameVariables._data[31], "right");

		if ($gameVariables._data[76].yandere.status == 4) {
			this.scoreSprite(272, 382, 200  + (28 * y), 40, 22, "ヤンデレを殺害！", "left");
			this.scoreSprite(253, 382, 300  + (28 * y), 40, 22, "+5000SP", "right");
			y += 1;
		}
		if ($gameVariables._data[76].principal.status == 4) {
			this.scoreSprite(272, 382 + (28 * y), 200, 40, 22, "校長先生を殺害！", "left");
			this.scoreSprite(253, 382 + (28 * y), 300, 40, 22, "+5000SP", "right");
			y += 1;
		}
		if ($gameVariables._data[76].maleOfficer.status == 4 || $gameVariables._data[76].femaleOfficer.status == 4) {
			this.scoreSprite(272, 382 + (28 * y), 200, 40, 22, "警察官を殺害！", "left");
			if ($gameVariables._data[76].maleOfficer.status == 4 && $gameVariables._data[76].femaleOfficer.status == 4) {
				var sp = "+10000SP";
			}else{
				var sp = "+5000SP";
			}
			this.scoreSprite(253, 382 + (28 * y), 300, 40, 22, sp, "right");
			y += 1;
		}
		
		//獲得SP
		this.scoreSprite(370, 479, 130, 40, 35, $gameVariables._data[17], "right");

	};
	Scene_Map.prototype.scoreSprite = function(x, y, w, h, size, text, type){
		var sprite = new Sprite();
		sprite.bitmap = new Bitmap(w, h);
		sprite.x = x; sprite.y = y;
		sprite.bitmap.outlineColor = "#000000";
		sprite.bitmap.textColor = "#000000";
		sprite.bitmap.fontSize = size;
		sprite.bitmap.outlineWidth = 0;
		sprite.bitmap.drawText(text, 0, 0, sprite.width, sprite.height, type);
		SceneManager._scene.addChild(sprite);
	};

	//総合スコア
	Scene_Map.prototype.totalScore = function(){
		SceneManager._scene._totalScoreWindow = new Window_TotalScore();
		SceneManager._scene.addWindow(SceneManager._scene._totalScoreWindow);
	}
	function Window_TotalScore() {
        this.initialize.apply(this, arguments);
    }
    Window_TotalScore.prototype = Object.create(Window_Base.prototype);
    Window_TotalScore.prototype.constructor = Window_TotalScore;
	Window_TotalScore.prototype.initialize = function() {

		var x = 0;
		var y = 0;
	    var width = 816;
	    var height = 624;
	    Window_Base.prototype.initialize.call(this, x, y, width, height);
		this.opacity = 0;
		this.contentsOpacity = 255;
		this.contents.fontSize = 66;

		//ノーマルモードのハイスコア
		var dead = $gameVariables._data[15] ? $gameVariables._data[15] : 0;
		this.drawText(dead, 450, 94, 270, "right");

		//ハードモードのハイスコア
		dead = $gameVariables._data[65] ? $gameVariables._data[65] : 0;
		this.drawText(dead, 450, 218, 270, "right");
		this.contents.fontSize = 26;

		//ハイスコア使用武器
		if ($gameVariables._data[66]) {

			//ノーマルモード
			var primary = $gameVariables._data[66][0] ? $dataWeapons[$gameVariables._data[66][0]].name : ""; 
			var sidearm =  $gameVariables._data[66][1] ? $dataWeapons[$gameVariables._data[66][1]].name : ""; 

			if ($gameVariables._data[91]) {
				if ($gameVariables._data[91][0] == $gameVariables._data[15]) { //ハイスコアと優美ハイスコアが同値
					primary = $dataArmors[14].name;
					sidearm = "";
				}
			}
			if ($gameVariables._data[15] != 0) { //プレイ済みなら描画
				this.drawText(primary + "  " + sidearm, 510, 145, 270, "right");
			}

			//ハードモード
			primary = $gameVariables._data[66][2] ? $dataWeapons[$gameVariables._data[66][2]].name : ""; 
			sidearm =  $gameVariables._data[66][3] ? $dataWeapons[$gameVariables._data[66][3]].name : ""; 
			if ($gameVariables._data[91]) {
				if ($gameVariables._data[91][1] == $gameVariables._data[65]) { //ハイスコアと優美ハイスコアが同値
					primary = $dataArmors[14].name;
					sidearm = "";
				}
			}
			if ($gameVariables._data[65] != 0) { //プレイ済みなら描画
				this.drawText(primary + "  " + sidearm, 510, 270, 270, "right");
			}

		}

		//プレイ回数、殺害合計、発砲合計
		this.contents.fontSize = 34;
		this.drawText($gameVariables._data[32], 628, 328, 110, "right");
		this.drawText($gameVariables._data[33], 628, 328 + (33 * 1), 110, "right");
		this.drawText($gameVariables._data[34], 628, 328 + (33 * 2), 110, "right");
		if (!$gameVariables._data[24]) $gameVariables._data[24] = 0;
		this.drawText($gameVariables._data[24], 628, 436, 110, "right");
		this.drawText($gameSystem.achievementProgress(), 628, 436 + 33, 110, "right");

	};

	Scene_Map.prototype.recordWeapons = function(){

		var primary = 0; var sidearm = 0;

		if ($gamePlayer.isYuumi()) return;

		if ($dataWeapons[$gameParty.leader()._equips[0]._itemId].wtypeId == 1) {
			primary = $gameParty.leader()._equips[0]._itemId;
			sidearm = $gameParty.leader()._equips[1]._itemId;
		}else{
			primary = $gameParty.leader()._equips[1]._itemId;
			sidearm = $gameParty.leader()._equips[0]._itemId;
		}

		if (!$gameSwitches.value(40)){
			$gameVariables._data[66][0] = primary;
			$gameVariables._data[66][1] = sidearm;
		}else{
			$gameVariables._data[66][2] = primary;
			$gameVariables._data[66][3] = sidearm;
		}

	}

	//東城優美のハイスコア更新
	Game_System.prototype.YuumiRecord = function() {
		var index = $gameSwitches.value(40) ? 1 : 0;
		if (!$gameVariables._data[91]) { //初期化
			$gameVariables._data[91] = [];
			$gameVariables._data[91][0] = 0;
			$gameVariables._data[91][1] = 0;
		}
		if ($gameVariables._data[91][index] < $gameVariables._data[2]) { //記録更新
			$gameVariables._data[91][index] = $gameVariables._data[2];
		}
	}

	//装備・ショップ背景変更
	SceneManager.snapForBackground = function() {
		if(SceneManager.isNextScene(Scene_Shop)){
			this._backgroundBitmap = ImageManager.loadPicture('_armoury');
		}else if(SceneManager.isNextScene(Scene_Equip)){
			this._backgroundBitmap = ImageManager.loadPicture('_armoury');
		}else if (SceneManager.isNextScene(Scene_Skill)){
			this._backgroundBitmap = ImageManager.loadPicture('_armoury');
		}else if (SceneManager.isNextScene(Scene_Tips)){
			this._backgroundBitmap = ImageManager.loadPicture('tips');
		}else if (SceneManager.isNextScene(Scene_Achievement)){
			this._backgroundBitmap = ImageManager.loadPicture('_armoury');
		}else{
			this._backgroundBitmap = this.snap();
			this._backgroundBitmap.blur();
		}
	};
	//ショットガン購入時のTips
	Scene_Shop.prototype.doBuy = function(number) {
		$gameParty.loseGold(number * this.buyingPrice());
		$gameParty.gainItem(this._item, number);
		if ($gameVariables._data[36] != 2 && Number(this._item.meta.isShotgun)){
			$gameVariables._data[36] = 1;
		}
	};
	//ショップ数値入力スキップ
	var _Scene_Shop_onBuyOk = Scene_Shop.prototype.onBuyOk;
	Scene_Shop.prototype.onBuyOk = function(){
		_Scene_Shop_onBuyOk.call(this);
		this._numberWindow.onButtonOk();
	};
	Scene_Shop.prototype.onBuyCancel = function() {
		this.popScene();
	};
	Scene_Shop.prototype.onNumberOk = function() {
		this.doBuy(this._numberWindow.number());
		this.endNumberInput();
		this._goldWindow.refresh();
		this._statusWindow.refresh();
		if ($gameSwitches.value(17)) { //スキル取得
			AudioManager.playSe({"name":"Door3","volume":40,"pitch":100,"pan":0});
			$gameActors.actor(1).learnSkill(this._item.meta["skill"]);
			if (this._item.id == 17) {
				$gameSystem.unlockAchievement(6); //化学の時間
				$gameParty.gainItem($dataArmors[3], 1, true);
				$gameParty.gainItem($dataArmors[4], 1, true);
				$gameParty.gainItem($dataArmors[5], 1, true);
			}
		}else{ //武器取得
			if (this._item.id == 5) { //Type56
				$gameParty.gainItem($dataArmors[15], 1, true);
			}
			if (this._item.etypeId == 1) { //銃の取得SE
				switch (Number(this._item.meta.isPump)) {
				case 1:
					AudioManager.playSe({"name":"buyShotgun","volume":90,"pitch":100,"pan":0});
					break;
				case 2:
					AudioManager.playSe({"name":"buyShotgun2","volume":90,"pitch":100,"pan":0});
					break;
				default:
					if (Number(this._item.meta.type) == 7) {
						AudioManager.playSe({"name":"buyShotgun","volume":90,"pitch":100,"pan":0});
					}else{
						AudioManager.playSe({"name":"buyGun","volume":90,"pitch":100,"pan":0});
					}
				}
			}else{ //近接武器の取得SE
				AudioManager.playSe({"name":"buyKnife","volume":90,"pitch":100,"pan":0});
			}
		}
		if (this._buyWindow._price.length == this._buyWindow._index) {
			this._buyWindow.select(this._buyWindow._index - 1);
		}
	};
	Scene_Shop.prototype.endNumberInput = function() {
		this._numberWindow.hide();
		this.activateBuyWindow();
	};
	Scene_Shop.prototype.createDummyWindow = function() {
		var wy = 256;
		var wh = Graphics.boxHeight - wy;
		this._dummyWindow = new Window_Base(0, wy, Graphics.boxWidth, wh);
		this.addWindow(this._dummyWindow);
	};
	Scene_Shop.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createHelpWindow();
		this._helpWindow.x = 310; this._helpWindow.y = 0; this._helpWindow.width = Graphics.boxWidth - 310;
		this.createGoldWindow();
		this.createDummyWindow();
		this.createNumberWindow();
		this.createStatusWindow();
		this.createBuyWindow();
		this.createCategoryWindow();
		this.createAnnounceAchievementsWindow();
		this.commandBuy();
		this._helpWindow.refresh();
		if (this._buyWindow._price.length == 0) {
			this._buyWindow.select(-1);
		}
	};
	Scene_Shop.prototype.createStatusWindow = function() {
		this._statusWindow = new Window_ShopStatus(0, 0, 310, 256);
		this._statusWindow.hide();
		this.addWindow(this._statusWindow);
	};
	Scene_Shop.prototype.activateBuyWindow = function() {
		this._buyWindow.setMoney(this.money());
		this._buyWindow.show();
		this._buyWindow.activate();
		if (!$gameSwitches.value(17)) this._statusWindow.show();
	};
	Window_ShopBuy.prototype.windowWidth = function() {
		return Graphics.boxWidth;
	};
	Window_ShopBuy.prototype.drawItem = function(index) {
		var item = this._data[index];
		var rect = this.itemRect(index);
		var priceWidth = 128;
		rect.width -= this.textPadding();
		this.changePaintOpacity(this.isEnabled(item));
		this.drawItemName(item, rect.x, rect.y, rect.width - priceWidth);
		this.drawText(this.price(item) + " SP", rect.x + rect.width - priceWidth, rect.y, priceWidth, 'right');
		this.changePaintOpacity(true);
	};
	Window_ShopNumber.prototype.windowWidth = function() {
		return Graphics.boxWidth;
	};
	Window_ShopStatus.prototype.initialize = function(x, y, width, height) {
		Window_Base.prototype.initialize.call(this, x, y, width, height);
		this._item = null;
		this._pageIndex = 0;
		this.refresh();
	};
	Window_ShopStatus.prototype.refresh = function() {

		this.contents.clear();
		var y = 28;

		if (!$gameSwitches.value(17)){
			if (this._item) {

				var weapon = "";
				var id = 0;
				var speed = 0;
				var stamina = 0;

				if (this._item.etypeId == 4) {
					weapon = "knife"; 
					id = Number($dataArmors[this._item.id].meta.picID);
				}else{
					if (this._item.id > 24) {
						weapon = "guns4"; 
						id = this._item.id - 25;
					}else if (this._item.id > 16) {
						weapon = "guns3";
						id = this._item.id - 17;
					}else if (this._item.id > 8) {
						weapon = "guns2";
						id = this._item.id - 9;
					}else{
						weapon = "guns1";
						id = this._item.id - 1;
					}
				}

				if (this._item.etypeId != 4) { //銃ステータス

					this.drawText(this._item.name, 0, -5, 276, 'center');
					this.drawFace(weapon, id, 0, 40, 144, 144);

					this.changeTextColor(this.textColor(16));
					this.contents.fontSize = 20;

					switch (this._item.meta.speed) {
						case "最遅": speed = 0.1; break;
						case "遅": speed = 0.25; break;
						case "普通": speed = 0.5; break;
						case "速": speed = 0.75; break;
						case "最速": speed = 1;
					}
					var recoil = 0;
					switch (this._item.meta.recoil) {
						case "最小": recoil = 0.1; break;
						case "小": recoil = 0.25; break;
						case "中": recoil = 0.5; break;
						case "大": recoil = 0.75; break;
						case "特大": recoil = 1;
					}

					this.drawGauge(150, y + 8, 123, this._item.params[2] / 100, this.textColor(8), this.textColor(0));
					this.drawGauge(150, (y * 2) + 8, 123, recoil, this.textColor(8), this.textColor(0));
					this.drawGauge(150, (y * 3) + 8, 123, speed, this.textColor(8), this.textColor(0));
		
					this.drawText("威力 ", 150, y + 10); 
					this.drawText("反動 ", 150, (y * 2) + 10);
					this.drawText("速射", 150, (y * 3) + 10); 
					this.drawText("装弾数 ", 150, (y * 4) + 10);

					if ($gameSwitches.value(40)){
						if (this._item.meta["isPump"] == "0"){
							this.drawText("弾倉 ", 150, (y * 5) + 10);
						}else{
							this.drawText("散弾 ", 150, (y * 5) + 10);
						}
					}

					this.resetTextColor();

					this.drawText(this._item.params[2], 225, y + 10, 48, 'right');
					this.drawText(this._item.meta.recoil, 225, (y * 2) + 10, 48, 'right');
					this.drawText(this._item.meta.speed, 225, (y * 3) + 10, 48, 'right');
					this.drawText(this._item.meta.rnd, 225, (y * 4) + 10, 48, 'right');
					if ($gameSwitches.value(40)) this.drawText(this._item.meta.magazine, 225, (y * 5) + 10, 48, 'right');

					this.contents.fontSize = 28;

				}else{ //近接武器ステータス

					var damage = this._item.params[2] / 100;

					this.drawText(this._item.name, 0, -5, 276, 'center');
					this.drawFace("knife", Number($dataArmors[this._item.id].meta.picID), 0, 40, 144, 144);

					this.changeTextColor(this.textColor(16));
					this.contents.fontSize = 20;
					
					switch (this._item.meta.speed) {
						case "最遅": speed = 0.1; break;
						case "遅": speed = 0.25; break;
						case "普通": speed = 0.5; break;
						case "速": speed = 1; break;
					}
					switch (this._item.meta.stamina) {
						case "小": stamina = 0.25; break;
						case "中": stamina = 0.5; break;
						case "大": stamina = 0.75; break;
					}
	
					this.drawGauge(150, y + 8, 123, damage, this.textColor(8), this.textColor(0));
					this.drawGauge(150, (y * 2) + 8, 123, stamina, this.textColor(8), this.textColor(0));
					this.drawGauge(150, (y * 3) + 8, 123, speed, this.textColor(8), this.textColor(0));
					this.drawText("威力", 150, y + 10); 
					this.drawText("疲労", 150, (y * 2) + 10);
					this.drawText("速度", 150, (y * 3) + 10); 

					this.resetTextColor();
	
					this.drawText(this._item.params[2], 225, y + 10, 48, 'right');
					this.drawText(this._item.meta.stamina, 225, (y * 2) + 10, 48, 'right');
					this.drawText(this._item.meta.speed, 225, (y * 3) + 10, 48, 'right');
	
					this.contents.fontSize = 28;

				}

			}
		}
	};
	Window_ShopBuy.prototype.makeItemList = function() {
		this._data = [];
		this._price = [];
		this._shopGoods.forEach(function(goods) {
			var item = null;
			switch (goods[0]) {
			case 0:
				item = $dataItems[goods[1]];
				break;
			case 1:
				item = $dataWeapons[goods[1]];
				break;
			case 2:
				item = $dataArmors[goods[1]];
				break;
			}
			if (item) {
				if (!$gameParty.hasItem(item, true)) {
					this._data.push(item);
					this._price.push(goods[2] === 0 ? item.price : goods[3]);
				}
			}
		}, this);
	};
	Window_Gold.prototype.refresh = function() {
		var x = this.textPadding();
		var width = this.contents.width - this.textPadding() * 2;
		this.contents.clear();
		this.drawCurrencyValue(this.value(), this.currencyUnit(), x, 0, width);
	};

	//前景設定
	var _Game_Map_initialize = Game_Map.prototype.initialize;
	Game_Map.prototype.initialize = function() {
		_Game_Map_initialize.call(this);
		this._parallaxName2 = '';
		this._parallaxZero2 = false;
		this._parallaxLoopX2 = false;
		this._parallaxLoopY2 = false;
		this._parallaxSx2 = 0;
		this._parallaxSy2 = 0;
		this._parallaxX2 = 0;
		this._parallaxY2 = 0;
	};
	Spriteset_Map.prototype.createLowerLayer = function() {
		Spriteset_Base.prototype.createLowerLayer.call(this);
		this.createParallax();
		this.createTilemap();
		this.createCharacters();
		this.createShadow();
		this.createDestination();
		this.createForeParallax();
		this.createWeather();
	};
	Spriteset_Map.prototype.update = function() {
		Spriteset_Base.prototype.update.call(this);
		this.updateTileset();
		this.updateParallax();
		this.updateTilemap();
		this.updateShadow();
		this.updateForeParallax();
		this.updateWeather();
	};
	Spriteset_Map.prototype.createForeParallax = function() {
		this._parallax2 = new TilingSprite();
		this._parallax2.move(0, 0, Graphics.width, Graphics.height);
		this._baseSprite.addChild(this._parallax2);
	};
	Spriteset_Map.prototype.updateForeParallax = function() {
		if (this._parallaxName2 !== $dataMap.meta.fgName) {
			this._parallaxName2 = $dataMap.meta.fgName || " ";
			this._parallax2.bitmap = ImageManager.loadParallax(this._parallaxName2);
		}
		if (this._parallax2.bitmap) {
			this._parallax2.origin.x = $gameMap.parallaxOx();
			this._parallax2.origin.y = $gameMap.parallaxOy();
		}
	};

	//制御文字の追加
	Window_Base.prototype.processEscapeCharacter = function(code, textState) {
		switch (code) {
		case 'C':
			this.changeTextColor(this.textColor(this.obtainEscapeParam(textState)));
			break;
		case 'I':
			this.processDrawIcon(this.obtainEscapeParam(textState), textState);
			break;
		case 'N':
			this.processNewLine(textState); textState.index--;
			break;
		case '{':
			this.makeFontBigger();
			break;
		case '}':
			this.makeFontSmaller();
			break;
		case 'FS':
			this.contents.fontSize = this.obtainEscapeParam(textState);
			break;
		}
	};

	//Tipsウィンドウ
	Window_Base.prototype.standardFontFace = function() {
		if ($gameSystem.isChinese()) {
			return 'SimHei, Heiti TC, sans-serif';
		} else if ($gameSystem.isKorean()) {
			return 'Dotum, AppleGothic, sans-serif';
		} else {
			if (this.contents.fontFace == 'GameFont2') {
				return 'GameFont2';
			}else{
				return 'GameFont';
			}
		}
	};
	function Window_SelectTips() {
		this.initialize.apply(this, arguments);
	}
	Window_SelectTips.prototype = Object.create(Window_Selectable.prototype);
	Window_SelectTips.prototype.constructor = Window_SelectTips;
	Window_SelectTips.prototype.initialize = function() {
		Window_Selectable.prototype.initialize.call(this, 0, 0, 200, Graphics.height);
		this.opacity = 0;
		this.refresh();
	};
	Window_SelectTips.prototype.maxItems = function() {
		return this._data ? this._data.length : 1;
	};
	Window_SelectTips.prototype.item = function() {
		return this._data[this.index()];
	};
	Window_SelectTips.prototype.isEnabled = function(item) {
		return false;
	};
	Window_SelectTips.prototype.refresh = function() {
		this.makeList();
		this.createContents();
		this.drawAllItems();
	};
	Window_SelectTips.prototype.makeList = function() {
		this._data = tips;
	};
	Window_SelectTips.prototype.drawItem = function(index) {
		var item = this._data[index];
		var rect = this.itemRect(index);
		this.drawItemName(item, rect.x, rect.y, rect.width, index);
	};
	Window_SelectTips.prototype.drawItemName = function(item, x, y, width, index) {
		width = width || 312;
		if (item) {
			this.drawText(item, x, y, width, 'center');
			this.resetTextColor();
		}
	};
	Window_SelectTips.prototype.setTipsInfoWindow = function(infoWindow) {
		this._tipsInfoWindow = infoWindow;
		this.callUpdateHelp();
	};
	Window_SelectTips.prototype.callUpdateHelp = function() {
		if (this._tipsInfoWindow){
			this._tipsInfoWindow.refresh(this._index);
		}
	};
	Window_SelectTips.prototype.select = function(index) {
		this._index = index;
		this._stayCount = 0;
		this.ensureCursorVisible();
		this.updateCursor();
		this.callUpdateHelp();
	};

	//Tipsシーン
	Scene_Tips.prototype = Object.create(Scene_MenuBase.prototype);
	Scene_Tips.prototype.constructor = Scene_Tips;
	Scene_Tips.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this);
	};
	Scene_Tips.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createTipsInfoWindow();
		this.createSelectTipsWindow();
		this._SelectTipsWindow.setHandler('cancel', this.popScene.bind(this));
		this._SelectTipsWindow.activate();
		this._SelectTipsWindow.select(0);
	};
	Scene_Tips.prototype.createSelectTipsWindow = function() {
		this._SelectTipsWindow = new Window_SelectTips();
		this._SelectTipsWindow.setTipsInfoWindow(this._TipsInfoWindow);
		this.addWindow(this._SelectTipsWindow);
	};
	Scene_Tips.prototype.createTipsInfoWindow = function() {
		this._TipsInfoWindow = new Window_TipsInfo();
		this.addWindow(this._TipsInfoWindow);
	};
	//Tips解説ウィンドウ
	function Window_TipsInfo() {
        this.initialize.apply(this, arguments);
	}
    Window_TipsInfo.prototype = Object.create(Window_Base.prototype);
    Window_TipsInfo.prototype.constructor = Window_TipsInfo;
	Window_TipsInfo.prototype.initialize = function() {
		var x = 210;
		var y = 10;
	    var width = 600;
		var height = 624;
		Window_Base.prototype.initialize.call(this, x, y, width, height);
		this.opacity = 0;
		this.refresh();
	};
	Window_TipsInfo.prototype.refresh = function(index) {
	    this.contents.clear();
		if (this.sprite){
			this.removeChild(this.sprite);
			this.sprite = {};
		}
		if (index >= 0){
			
			this.contents.fontSize = 34; 
			this.contents.textColor = this.textColor(0);
			this.drawText(tips[index], -24, 4, this.width, 'center');

			if (index == 0) {

				var pictureName = "tips1";
				this.sprite = new Sprite(ImageManager.loadPicture(pictureName));
				this.sprite.x = 0;
				this.sprite.y = 130;
				this.addChild(this.sprite);

				// Move
				this.contents.fontSize = 24; 
				this.drawText(tipsKeyTexts[0], -30, 75, this.width, 'center');

				// Shift Space X
				var x = 171;
				this.drawText(tipsKeyTexts[1], -30 - x, 237, this.width, 'center');
				this.drawText(tipsKeyTexts[2], -30, 237, this.width, 'center');
				this.drawText(tipsKeyTexts[3], -30 + x, 237, this.width, 'center');

				var x1 = 40 + 15;
				var x2 = 236 + 15;
				var x3 = 432 + 15;
				var y = 54;
				this.contents.fontSize = 22; 

				// 1 2 3
				this.drawText(tipsKeyTexts[4], x1, 369, this.width, 'left');
				this.drawText(tipsKeyTexts[5], x2, 369, this.width, 'left');
				this.drawText(tipsKeyTexts[6], x3, 369, this.width, 'left');

				// Q E R
				this.drawText(tipsKeyTexts[7], x1, 369 + y, this.width, 'left');
				this.drawText(tipsKeyTexts[8], x2, 369 + y, this.width, 'left');
				this.drawText(tipsKeyTexts[9], x3, 369 + y, this.width, 'left');

				// F G C
				this.drawText(tipsKeyTexts[10], x1, 369 + y * 2, this.width, 'left');
				this.drawText(tipsKeyTexts[11], x2, 369 + y * 2, this.width, 'left');
				this.drawText(tipsKeyTexts[12], x3, 369 + y * 2, this.width, 'left');

				// V
				this.drawText(tipsKeyTexts[13], x1, 369 + y * 3, this.width, 'left');

			}else{
				this.contents.fontSize = 22; 
				this.drawTextEx(tipsTexts[index + 1], 0, 56 + 40);
			}
			this.contents.fontSize = this.standardFontSize();
			this.resetTextColor();
		}
	};
	//字間を伸ばす
	Window_TipsInfo.prototype.processNormalCharacter = function(textState) {
		var c = textState.text[textState.index++];
		var w = this.textWidth(c) + 1;
		this.contents.drawText(c, textState.x, textState.y, w * 2, textState.height);
		textState.x += w;
	};

	//オプションの編集
	Window_Options.prototype.makeCommandList = function() {
		this.addVolumeOptions();
		if (typeof $gameSwitches._data[1] !== "undefined") this.addOptions();
	};
	Window_Options.prototype.addOptions = function() {
		this.addCommand("ハードモード", 40);
		if($gameActors.actor(1).hasSkill(16)) this.addCommand("東城優美モード", 29);
		if($gameSwitches._data[14]) this.addCommand("オープニング自動スキップ", 44);
		if($gameSwitches._data[43]) this.addCommand("エンディング自動スキップ", 45);
	};
	//ボリューム調整量変更
	Window_Options.prototype.volumeOffset = function() {
		return 5;
	};
	Window_Options.prototype.isVolumeSymbol = function(symbol) {
		if (typeof (symbol) == "string"){
			return symbol.contains('Volume');
		}else{
			return false;
		}
	};
	Window_Options.prototype.getConfigValue = function(symbol) {
		if (typeof (symbol) == "string"){
			return ConfigManager[symbol];
		}else{
			return $gameSwitches._data[symbol];
		}
	};
	Window_Options.prototype.setConfigValue = function(symbol, volume) {
		if (typeof (symbol) == "string"){
			ConfigManager[symbol] = volume;
		}else{
			$gameSwitches._data[symbol] = volume;
		}	
	};
	//ME音量調整を削除
	Window_Options.prototype.addVolumeOptions = function() {
		this.addCommand(TextManager.bgmVolume, 'bgmVolume');
		this.addCommand(TextManager.seVolume, 'seVolume');
		this.addCommand(TextManager.bgsVolume, 'bgsVolume');
	};
	Window_Options.prototype.drawItem = function(index) {
		var symbol = this.commandSymbol(index);
		var value = this.getConfigValue(symbol);
		var rect = this.itemRectForText(index);
		var statusWidth = this.statusWidth();
		var titleWidth = rect.width - statusWidth;
		this.resetTextColor();
		this.changePaintOpacity(this.isCommandEnabled(index));
		if (typeof value === "number"){
			this.drawGauge(rect.x, rect.y, rect.width, value / 100, this.textColor(0), this.textColor(8));
		}
		this.drawText(this.commandName(index), rect.x, rect.y, titleWidth, 'left');
		this.drawText(this.statusText(index), titleWidth, rect.y, statusWidth, 'right');
	};
	//SeとMeの音量を統合
	Window_Options.prototype.changeValue = function(symbol, value) {
		var lastValue = this.getConfigValue(symbol);
		if (lastValue !== value) {
			if (symbol == "seVolume") {
				this.setConfigValue("meVolume", value);
			}
			this.setConfigValue(symbol, value);
			this.redrawItem(this.findSymbol(symbol));
			SoundManager.playCursor();
		}
	};

	//所有スキル
	Scene_Skill.prototype.create = function() {
		Scene_ItemBase.prototype.create.call(this);
		this.createHelpWindow();
		this.createItemWindow();
		this.createActorWindow();
	};
	Scene_Skill.prototype.start = function() {
		Scene_ItemBase.prototype.start.call(this);
		this.refreshActor();
		this._itemWindow.setStypeId(1);
		this._itemWindow.activate();
		this._itemWindow.select(0);
		this._helpWindow.refresh();
	};
	Scene_Skill.prototype.createItemWindow = function() {
		var wx = 0;
		var wy = this._helpWindow.height;
		var ww = Graphics.boxWidth;
		var wh = Graphics.boxHeight - wy;
		this._itemWindow = new Window_SkillList(wx, wy, ww, wh);
		this._itemWindow.setHelpWindow(this._helpWindow);
		this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
		this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
		this.addWindow(this._itemWindow);
	};
	Scene_Skill.prototype.refreshActor = function() {
		var actor = this.actor();
		this._itemWindow.setActor(actor);
	};
	Scene_Skill.prototype.onItemCancel = function() {
		this._itemWindow.deselect();
		this.popScene();
	};
	Scene_Skill.prototype.useItem = function() {
	};
	//スキルリストをグレー表示にしない
	Window_SkillList.prototype.isEnabled = function(item) {
		return this._data.length > 0;
	};
	Window_SkillList.prototype.playOkSound = function() {
	};

	//セーブ・ロード関係
	Window_SavefileList.prototype.drawItem = function(index) {
		var id = index + 1;
		var valid = DataManager.isThisGameFile(id);
		var info = DataManager.loadSavefileInfo(id);
		var rect = this.itemRectForText(index);
		this.resetTextColor();
		if (this._mode === 'save') {
			valid = this.isEnabled(id);
		}
		this.changePaintOpacity(valid);
		this.drawFileId(id, rect.x, rect.y);
		if (info) {
			this.changePaintOpacity(valid);
			this.drawContents(info, rect, valid);
			this.changePaintOpacity(true);
		}
	};
	Window_SavefileList.prototype.drawContents = function(info, rect, valid) {

		var lineHeight = this.lineHeight();
		var bottom = rect.y + rect.height;
		var y2 = bottom - lineHeight;
		var kill1 = info.kill ? info.kill : 0;
		var kill2 = info.kill2 ? info.kill2 : 0;
		var kill3 = info.kill3 ? info.kill3 : 0;

		if (rect.width >= 420) {

			this.contents.fontSize = 22;
			this.drawText("最高殺害記録" + " " + kill1 + " " + "人" + " " + "ハードモード" + " " + kill2 + " " + "人", rect.x, rect.y - 5 + (lineHeight * 1), rect.width, 'right');
			this.drawText("総殺害数" + " " + kill3 + " " + "人", rect.x, rect.y - 5 + (lineHeight * 2), rect.width, 'right');
			this.contents.fontSize = this.standardFontSize();

		}

		if (y2 >= lineHeight) {
			this.drawTime(info, rect.x, rect.y + (lineHeight * 0), rect.width);
		} 

		this.contents.paintOpacity = 48;
		this.contents.fillRect(0, rect.y, this.contentsWidth(), 2, this.textColor(7));
		this.contents.paintOpacity = 255;

	};
	Window_SavefileList.prototype.drawFileId = function(id, x, y) {
		this.changeTextColor(this.textColor(16));
		if (id == 1) {
			this.drawText("AutoSave", x, y, 180);
		}else{
			this.drawText(TextManager.file + ' ' + (id - 1), x, y, 180);
		}
		this.resetTextColor();
	};
	Window_SavefileList.prototype.drawTime = function(info, x, y, width) {
		if (info.time) {
			this.changeTextColor(this.textColor(16));
			this.contents.fontSize = 24;
			this.drawText(info.time, x, y, width, 'right');
			this.contents.fontSize = this.standardFontSize();
			this.resetTextColor();
		}
	};
	Window_SavefileList.prototype.isEnabled = function(fileId) {
		if (fileId == 1) {
			return this._mode === 'load';
		}else{
			return true;
		}
	};
	Window_SavefileList.prototype.isCurrentItemEnabled = function() {
		return this.isEnabled(this._index + 1);
	};
	DataManager.maxSavefiles = function() { //セーブデータ数の変更
		return 11;
	};
	DataManager.makeSavefileInfo = function() {

		var info = {};
		info.globalId   = this._globalId;
		info.title      = $dataSystem.gameTitle;
		info.characters = $gameParty.charactersForSavefile();
		info.faces      = $gameParty.facesForSavefile();
		info.playtime   = $gameSystem.playtimeText();
		info.timestamp  = Date.now();
		
		var time = new Date();
		var year = time.getFullYear();
		var month = ("0" + (time.getMonth() + 1)).slice(-2);
		var day = ("0" + time.getDate()).slice(-2);
		var hour = ("0" + time.getHours()).slice(-2);
		var minute = ("0" + time.getMinutes()).slice(-2);
		
		info.time = year + "/" + month + "/" + day + "/ " + hour + ":" + minute;
		info.kill = $gameVariables._data[15];
		info.kill2 = $gameVariables._data[65];
		info.kill3 = $gameVariables._data[33];
		info.playCounts = $gameVariables._data[32];
		
		return info;
	};
	DataManager.autoSave = function() {
		$gameSystem.onBeforeSave();
		this.saveGame(1);
		StorageManager.cleanBackup(1);
	};
	
	//選択肢位置調節用
	Window_ChoiceList.prototype.updatePlacement = function() {
		var positionType = $gameMessage.choicePositionType();
		var messageY = this._messageWindow.y;
		this.width = this.windowWidth();
		this.height = this.windowHeight();
		switch (positionType) {
		case 0:
			this.x = 0;
			break;
		case 1:
			this.x = (Graphics.boxWidth - this.width) / 2;
			break;
		case 2:
			this.x = Graphics.boxWidth - this.width;
			break;
		}
		if (messageY >= Graphics.boxHeight / 2) {
			this.y = messageY - this.height;
		} else {
			this.y = messageY + this._messageWindow.height;
		}
		if ($gameVariables._data[38]) this.y = $gameVariables._data[38];
	};
	
	//マップネームの固定
	Window_MapName.prototype.update = function() {
		Window_Base.prototype.update.call(this);
		if ($gameMap.isNameDisplayEnabled()) {
			this.updateFadeIn();
		} else {
			this.updateFadeOut();
		}
	};
	Window_MapName.prototype.refresh = function() {
		this.contents.clear();
		if ($gameMap.displayName()) {
			this.y = Graphics.boxHeight - this.fittingHeight(1);
			var width = this.contentsWidth();
			this.contents.fontSize = 24;
			this.drawText($gameMap.displayName(), 0, 0, width, 'left');
		}
	};

	//シーン削除時の処理の追加
	Scene_Map.prototype.terminate = function() {
		Scene_Base.prototype.terminate.call(this);
		if (!SceneManager.isNextScene(Scene_Battle)) {
			this._spriteset.update();
			this._mapNameWindow.hide();
			SceneManager.snapForBackground();
		} else {
			ImageManager.clearRequest();
		}
	
		if (SceneManager.isNextScene(Scene_Map)) {
			ImageManager.clearRequest();
		}
		$gameScreen.clearZoom();
		this.removeChild(this._fadeSprite);
		this.removeChild(this._mapNameWindow);
		this.removeChild(this._windowLayer);
		this.removeChild(this._spriteset);
		//爆発物の投擲状況をリセットする
		$gameVariables._data[69] = 0;
		$gameVariables._data[70] = 0;
	};

	//BGSの二重再生を追加
	AudioManager.playBgs2 = function(bgs2, id) {

		if (!this._bgsBuffer2) {
			this._bgsBuffer2 = [];
			this._currentBgs2 = [];
			this._bgsVolume2 = [];
		}

		if (!this._bgsVolume2[id]) this._bgsVolume2[id] = 100;

		if (this._currentBgs2[id] && this._bgsBuffer2[id] && this._currentBgs2[id].name === bgs2.name) {
			this.updateBufferParameters(this._bgsBuffer2[id], this._bgsVolume2[id], bgs2);
		} else {
			if (this._bgsBuffer2[id]) this.stopBgs2(id);
			if (bgs2.name) {
				this._bgsBuffer2[id] = this.createBuffer('bgs', bgs2.name);
				this.updateBufferParameters(this._bgsBuffer2[id], this._bgsVolume2[id], bgs2);
				this._bgsBuffer2[id].play(true, 0);
			}
		}

		this._currentBgs2[id] = {
			name: bgs2.name,
			volume: bgs2.volume,
			pitch: bgs2.pitch,
			pan: bgs2.pan,
			pos: 0
		};
	};
	AudioManager.stopBgs2 = function(id) {
		if (id) {
			this._bgsBuffer2[id].stop();
			this._bgsBuffer2[id] = null;
			this._currentBgs2[id] = null;
		}else{
			this._bgsBuffer2.forEach(function(value, index, array) {
				if (AudioManager._bgsBuffer2[index]) {
					AudioManager._bgsBuffer2[index].stop();
					AudioManager._bgsBuffer2[index] = null;
					AudioManager._currentBgs2[index] = null;
				}
			});
		}
	};
	//Me再生時にBGMを止めない
	AudioManager.playMe = function(me) {
		this.stopMe();
		if (me.name) {
			this._meBuffer = this.createBuffer('me', me.name);
			this.updateMeParameters(me);
			this._meBuffer.play(false);
			this._meBuffer.addStopListener(this.stopMe.bind(this));
		}
	};
	AudioManager.stopMe = function() {
		if (this._meBuffer) {
			this._meBuffer.stop();
			this._meBuffer = null;
		}
	};

	AudioManager.playSe = function(se) {
		if (se.name) {
			this._seBuffers = this._seBuffers.filter(function(audio) {
				return audio.isPlaying();
			});
			var buffer = this.createBuffer('se', se.name);
			this.updateSeParameters(buffer, se);
			buffer.play(false);
			this._seBuffers.push(buffer);
		}
	};
	AudioManager.stopSe = function() {
		this._seBuffers.forEach(function(buffer) {
			buffer.stop();
		});
		this._seBuffers = [];
	};

	//実績シーン
	Scene_Achievement.prototype = Object.create(Scene_MenuBase.prototype);
	Scene_Achievement.prototype.constructor = Scene_Achievement;
	Scene_Achievement.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this);
	};
	Scene_Achievement.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createAchievementInfoWindow();
		this.createAchievementWindow();
		this._AchievementWindow.setHandler('cancel', this.popScene.bind(this));
		this._AchievementWindow.activate();
		this._AchievementWindow.select(0);
	};
	Scene_Achievement.prototype.createAchievementWindow = function() {
		this._AchievementWindow = new Window_Achievement();
		this.addWindow(this._AchievementWindow);
	};
	Scene_Achievement.prototype.createAchievementInfoWindow = function() {
		this._AchievementInfoWindow = new Window_AchievementInfo();
		this.addWindow(this._AchievementInfoWindow);
	};
	//achievementデータ初期化
	Game_System.prototype.achievementInitialize = function() {
		$gameSystem._data.achievement = [];
		for (var i = 0; i < achievementTexts.length; i++) {
			$gameSystem._data.achievement.push(false);
		}
	};
	//実績達成
	Game_System.prototype.unlockAchievement = function(id) {
		if (!$gameSystem._data.achievement[id]) {
			$gameSystem._data.achievement[id] = true;
			SceneManager._scene._announceAchievementsWindow.announceAchievements(id);
			this.gainReward(id);
		}
	}
	//デバッグ用に全実績達成
	Game_System.prototype.unlockAllAchievement = function() {
		for (var i = 1; i < $gameSystem._data.achievement.length; i++) {
			$gameSystem.unlockAchievement(i);
		}
	}
	Game_System.prototype.achievementProgress = function() {
		var total = achievementTexts.length - 1;
		var achieved = $gameSystem._data.achievement.filter(element => element);
		return Math.floor((achieved.length / total) * 100);
	}
	Game_System.prototype.gainReward = function(id) {
		switch (achievementTexts[id].rewardType) {
			case 1: //SP
				$gameParty.gainGold(achievementTexts[id].reward);
			case 2: //武器（不使用）
			case 3: //スキル
		}
	}
	//武器報酬
	Game_System.prototype.highScoreReward = function() {

		if ($gameSwitches.value(40)) { //ハードモード

			if ($gameVariables._data[2] >= 30 && $gameVariables._data[84] != 2) { //CZ11
				this.unlockAchievement(21); $gameVariables._data[84] = 1;
			}
			if ($gameVariables._data[2] >= 60 && $gameVariables._data[55] != 2) { //AS3M
				this.unlockAchievement(22); $gameVariables._data[55] = 1;
			}

		}else{ //ノーマルモード

			if ($gameVariables._data[2] >= 70 && $gameVariables._data[44] != 2) { //BM15Mod
				this.unlockAchievement(19); $gameVariables._data[44] = 1;
			}

		}

		if ($gameVariables._data[33] >= 100) { //ともだち百人
			$gameSystem.unlockAchievement(24); 
		}
		if ($gameVariables._data[33] >= 1000 && $gameVariables._data[85] != 2) { //A180 千の風
			$gameSystem.unlockAchievement(25); 
			$gameVariables._data[85] = 1;
		}
		if ($gameVariables._data[83] >= 60 && $gameVariables._data[54] != 2) { //S12Mod
			$gameSystem.unlockAchievement(20); 
			$gameVariables._data[54] = 1;
		}

	}

	//実績情報ウィンドウ
	function Window_AchievementInfo() {
		this.initialize.apply(this, arguments);
	}
	Window_AchievementInfo.prototype = Object.create(Window_Base.prototype);
	Window_AchievementInfo.prototype.constructor = Window_AchievementInfo;
	Window_AchievementInfo.prototype.initialize = function() {
		var width = Graphics.boxWidth;
		var height = this.fittingHeight(1);
		Window_Base.prototype.initialize.call(this, 0, 0, width, height);
		this.opacity = 255;
		this.refresh();
	};
	Window_AchievementInfo.prototype.refresh = function() {
		this.contents.clear();
		this.drawIcon(12, 2, 2);
		this.contents.fontSize = 34; 
		this.contents.textColor = this.textColor(0);
		this.drawText("実績一覧", 46, 0, this.contentsWidth(), 'left');
		var achieved = $gameSystem._data.achievement.filter(element => element);
		var total = achievementTexts.length - 1;
		this.contents.fontSize = 26;
		this.contents.textColor = this.textColor(0);
		this.drawText("達成済み" + " " + achieved.length + "/" + total, 0, 0, this.contentsWidth(), 'right');
	};
	//実績ウィンドウ
	function Window_Achievement() {
		this.initialize.apply(this, arguments);
	}
	Window_Achievement.prototype = Object.create(Window_Selectable.prototype);
	Window_Achievement.prototype.constructor = Window_Achievement;

	Window_Achievement.prototype.initialize = function() {
		var width = Graphics.boxWidth;
		var height = Graphics.height - this.fittingHeight(1);
		Window_Selectable.prototype.initialize.call(this, 0, this.fittingHeight(1), width, height);
		this.opacity = 255;
		this.refresh();
	};
	Window_Achievement.prototype.maxItems = function() {
		return achievementTexts.length - 1;
	};
	Window_Achievement.prototype.item = function() {
		return achievementTexts[this.index()];
	};
	Window_Achievement.prototype.isEnabled = function(item) {
		return false;
	};
	Window_Achievement.prototype.drawAllItems = function() {
		var topIndex = this.topIndex();
		for (var i = 0; i < this.maxPageItems(); i++) {
			var index = topIndex + i;
			if (index < this.maxItems()) {
				this.drawItem(index);
			}
		}
	};
	//実績をシークレットにするか
	Window_Achievement.prototype.isSecret = function(order) {
		switch (order) {
			case 8:
			case 9:
			case 10:
				//ヤンデレ
				if (!$gameSystem._data.achievement[8] && !$gameSystem._data.achievement[9] && !$gameSystem._data.achievement[10]) {
					return true;
				}
				break;
			case 17:
			case 18:
				//校長
				if (!$gameSystem._data.achievement[17] && !$gameSystem._data.achievement[18]) {
					return true;
				}
				break;
		}
		return false;
	}
	Window_Achievement.prototype.drawItem = function(index) {
		var item = achievementTexts[index + 1];
		var id = index + 1;
		if (item) {
			var rect = this.itemRect(index);
			this.drawName(item, id, rect.x, rect.y, rect.width);
			if (!this.isSecret(item.order)) {
				this.drawRequirement(item, id, rect.x, rect.y, rect.width);
				this.drawDescription(item, id, rect.x, rect.y);
				this.drawDate(item, id, rect.x, rect.y, rect.width);
			}
			this.contents.paintOpacity = 48;
			this.contents.fillRect(0, rect.y, this.contentsWidth(), 2, this.textColor(7));
			this.contents.paintOpacity = 255;
		}
	};
	Window_Achievement.prototype.drawName = function(item, index, x, y, width) {
		this.contents.fontSize = this.standardFontSize();
		if (this.isSecret(item.order)) { //シークレット化
			this.contents.textColor = this.textColor(7);
			this.drawText("秘密の実績", x, y, width);
			this.resetTextColor();
			return;
		}
		if ($gameSystem._data.achievement[index]) { //達成済み
			var icon = 169 + item.difficulty;
			this.drawIcon(icon, x + 2, y + 2);
			this.drawText(item.name, x + 46, y, width);
		}else{ //未達成
			this.contents.textColor = this.textColor(7);
			this.drawText("未達成", x, y, width);
			this.resetTextColor();
		}
	};
	Window_Achievement.prototype.drawRequirement = function(item, index, x, y, width) {

		this.contents.fontSize = 22;
		var color = $gameSystem._data.achievement[index] ? 16 : 7;
		this.contents.textColor = this.textColor(color);
		var progress = true;
		var text = "";
		var num1 = 0;
		var num2 = 0;

		switch (index) {
			case 23: //投擲物５０人殺害
				num1 = $gameVariables._data[87] ? $gameVariables._data[87] : 0;
				num2 = 50; 
				break;
			case 24: //殺害１００人
				num1 = $gameVariables._data[33] ? $gameVariables._data[33] : 0; 
				num2 = 100; 
				break;
			case 25: //殺害１０００人
				num1 = $gameVariables._data[33] ? $gameVariables._data[33] : 0; 
				num2 = 1000; 
				break;
			default: progress = false;
		}
		if (progress){
			text = " " + num1 + "/" + num2;
		}

		this.drawText(item.requirement + text, x - 4, y + 2, width, 'right');
		this.contents.fontSize = this.standardFontSize();
		this.resetTextColor();

	};
	Window_Achievement.prototype.drawDescription = function(item, index, x, y) {
		if ($gameSystem._data.achievement[index]) {
			this.contents.fontSize = 20;
			this.drawTextEx("\\C[8]\\Fs[20]" + item.description, x + 16, y + this.fittingHeight(0) + 2);
			this.resetTextColor();
			this.contents.fontSize = this.standardFontSize();
		}
	};
	Window_Achievement.prototype.drawDate = function(item, index, x, y, width) {
		this.contents.fontSize = 22;
		var color = $gameSystem._data.achievement[index] ? 0 : 7;
		this.contents.textColor = this.textColor(color);
		if ($gameSystem._data.achievement[index]) { //達成済み
			this.drawText("達成済み！", x - 4, y + 4 + this.fittingHeight(0), width, 'right');
		}else{ //未達成
			var text = "";
			var reward = 0;
			if (achievementTexts[index].rewardType == 1) { //SP
				reward = achievementTexts[index].reward + " SP";
			}else{ //武器もしくはスキル
				reward = achievementTexts[index].reward;
			}
			this.contents.fontSize = 20;
			text = "報酬 " + reward;
			this.drawText(text, x - 4, y + 4 + this.fittingHeight(0), width, 'right');
			this.contents.fontSize = 22;
			
		}
		this.resetTextColor();
	};
	Window_Achievement.prototype.select = function(index) {
		this._index = index;
		this._stayCount = 0;
		this.ensureCursorVisible();
		this.updateCursor();
	};
	Window_Achievement.prototype.refresh = function() {
		this.createContents();
		this.drawAllItems();
	};
	Window_Achievement.prototype.itemHeight = function() {
		return this.height / 4 - this.padding + 4;
	};

	//実績解除告知ウィンドウ
	var achievementsCount = 0;
	var AnnounceList = [];

	Scene_Map.prototype.createAnnounceAchievementsWindow = function() {
		this._announceAchievementsWindow = new Window_AnnounceAchievements();
		this.addChild(this._announceAchievementsWindow);
	};
	Scene_Shop.prototype.createAnnounceAchievementsWindow = function() {
		this._announceAchievementsWindow = new Window_AnnounceAchievements();
		this.addChild(this._announceAchievementsWindow);
	};

	function Window_AnnounceAchievements() {
		this.initialize.apply(this, arguments);
	}
	Window_AnnounceAchievements.prototype = Object.create(Window_Base.prototype);
	Window_AnnounceAchievements.prototype.constructor = Window_AnnounceAchievements;

	Window_AnnounceAchievements.prototype.initialize = function() {
		var wight = this.windowWidth();
		var height = this.windowHeight();
		Window_Base.prototype.initialize.call(this, 0, 0, wight, height);
		this.opacity = 0;
		this.contentsOpacity = 0;
		this.refresh();
	};
	Window_AnnounceAchievements.prototype.standardPadding = function() {
		return 8;
	};
	Window_AnnounceAchievements.prototype.windowWidth = function() {
		return 300;
	};
	Window_AnnounceAchievements.prototype.windowHeight = function() {
		return 82;
	};
	Window_AnnounceAchievements.prototype.update = function() {
		Window_Base.prototype.update.call(this);
		if (achievementsCount > 0) {
			this.updateFadeIn();
			achievementsCount--;
		} else {
			if (this.opacity < 1 && AnnounceList.length > 0) {
				AnnounceList.splice(0, 1);
				if (AnnounceList.length > 0) this.open();
			} else {
				this.updateFadeOut();
			}
		}
	};
	Window_AnnounceAchievements.prototype.updateFadeIn = function() {
		this.opacity += 16;
		this.contentsOpacity += 16;
	};
	Window_AnnounceAchievements.prototype.updateFadeOut = function() {
		this.opacity -= 16;
		this.contentsOpacity -= 16;
	};
	Window_AnnounceAchievements.prototype.announceAchievements = function(id) {
		AnnounceList.push(id);
		if (achievementsCount < 1) this.open();
	};
	Window_AnnounceAchievements.prototype.open = function() {
		AudioManager.playSe({"name":"click01","volume":30,"pitch":100,"pan":0});
		this.refresh();
		achievementsCount = 240;
	};
	Window_AnnounceAchievements.prototype.refresh = function() {
		this.contents.clear();
		if (AnnounceList.length > 0) {
			var width = this.contentsWidth();
			var achievement = achievementTexts[AnnounceList[0]];
			this.contents.fontSize = 18; this.changeTextColor(this.textColor(0));
			this.drawIcon(12, 2, 2);
			this.drawText(achievement.name, this.standardPadding() + 36, 0, width, 'left');
			this.contents.fontSize = 16; this.changeTextColor(this.textColor(16));
			this.drawText("実績を達成しました", this.standardPadding(), 32, width, 'left');
			this.contents.fontSize = 28;
		}
	};

	//射撃訓練用タイマー
	Game_Interpreter.prototype.command124 = function() {
		if (this._params[0] === 0) {  // Start
			$gameTimer.start(this._params[1] * 60);
		} else {  // Stop
			$gameTimer.stop();
		}
		return true;
	};
	Game_Timer.prototype.update = function(sceneActive) {
		if (sceneActive && this._working) {
			if ($gameSwitches.value(60)) {
				this._frames++;
			}else if (this._frames > 0) {
				this._frames--;
				if (this._frames === 0) {
					this.onExpire();
				}
			}
		}
	};
	Game_Timer.prototype.milliseconds = function() {
		var ms = this._frames / 60;
		ms = Math.floor(ms * 100) / 100;
		ms = ms.toString(); 
		ms = ms.split(".");
		ms = ms[1] ? ms[1] : "0";
		return Number(ms);
	};
	Game_Timer.prototype.returnRecord = function() {
		var record = this._frames / 60;
		record = Math.floor(record * 100) / 100;
		return record;
	};
	Sprite_Timer.prototype.timerText = function() {
		var min = Math.floor(this._seconds / 60) % 60;
		var sec = this._seconds % 60;
		if ($gameSwitches.value(60)) {
			var ms = $gameTimer.milliseconds();
			return min.padZero(2) + ':' + sec.padZero(2) + "." + ms.padZero(2);
		}else{
			return min.padZero(2) + ':' + sec.padZero(2) ;
		}
	};
	Sprite_Timer.prototype.updateBitmap = function() {
		if ($gameSwitches.value(60)) {
			this._seconds = $gameTimer.seconds();
			this.redraw();
		}else if (this._seconds !== $gameTimer.seconds()) {
			this._seconds = $gameTimer.seconds();
			this.redraw();
		}
	};
	Sprite_Timer.prototype.updatePosition = function() {
		if ($gameSwitches.value(60)){
			this.x = Graphics.width - this.bitmap.width - 10;
			this.y = 0;
		}else{
			this.x = Graphics.width - this.bitmap.width;
			this.y = 0;
		}
	};

	//デバッグ用スプライト（公開時は不使用）
	Sprite_Character.prototype.update = function() {
		Sprite_Base.prototype.update.call(this);
		this.updateBitmap();
		this.updateFrame();
		this.updatePosition();
		this.updateAnimation();
		this.updateBalloon();
		this.updateDebugSprite();
		this.updateOther();
	};
	Sprite_Character.prototype.setupDebugSprite = function() {
		if (this._character._eventId > 0) {
			if ($gameSwitches.value(36) && $gameMap._events[this._character._eventId].isInitialized()) {
				this.startDebugSprite();
			}
		}
	};
	Sprite_Character.prototype.startDebugSprite = function() {
		if (!this._debugSprite) {
			this._debugSprite = new Sprite_DebugSprite();
			this._debugSprite._eventId = this._character._eventId;
		}
		this.parent.addChild(this._debugSprite);
	};
	Sprite_Character.prototype.updateDebugSprite = function() {
		this.setupDebugSprite();
		if (this._debugSprite) {
			this._debugSprite.x = this.x;
			this._debugSprite.y = this.y - this.height;
			if (!$gameSwitches.value(36)) {
				this.endDebugSprite();
			}
		}
	};
	Sprite_Character.prototype.endDebugSprite = function() {
		if (this._debugSprite) {
			this.parent.removeChild(this._debugSprite);
			this._debugSprite = null;
		}
	};
	function Sprite_DebugSprite() {
		this.initialize.apply(this, arguments);
	}
	Sprite_DebugSprite.prototype = Object.create(Sprite_Base.prototype);
	Sprite_DebugSprite.prototype.constructor = Sprite_DebugSprite;
	Sprite_DebugSprite.prototype.initialize = function() {
		Sprite_Base.prototype.initialize.call(this);
		this.initMembers();
		this.update();
	};
	Sprite_DebugSprite.prototype.initMembers = function() {
		this.bitmap = new Bitmap(128, 48);
		this.bitmap.fontSize = 20;
		this.anchor.x = 0.5;
		this.anchor.y = 1;
		this.z = 7;
		this._eventId = 0;
	};
	Sprite_DebugSprite.prototype.update = function() {
		Sprite_Base.prototype.update.call(this);
		this.updateBitmap();
	};
	Sprite_DebugSprite.prototype.updateBitmap = function() {
		var textA = "";
		var textB = "";
		if ($gameVariables._data[1][$gameMap._mapId][this._eventId]) {
			var status = $gameVariables._data[1][$gameMap._mapId][this._eventId].status;
			var hp = $gameVariables._data[1][$gameMap._mapId][this._eventId].hp;
			var courage = $gameVariables._data[1][$gameMap._mapId][this._eventId].courage;
			textA = "ID " + this._eventId + " " + status;
			textB = "体力 " + hp + " 勇敢 " + courage + " 危険 " + $gameMap._events[this._eventId].riskLevel();
		}
		var width = this.bitmap.width;
		var height = this.bitmap.height;
		this.bitmap.clear();
		this.bitmap.drawText(textA, 0, -8, width, height, 'center');
		this.bitmap.drawText(textB, 0, 14, width, height, 'center');
	};

})();