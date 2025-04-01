var main = {
	allowCookies:checkCookie(),
	localFile: window.location.href.startsWith("file:///"),
	chromeBrowser:navigator.userAgent.includes("Chrome"),
	rescaleRequest:0,
	sceneList:[],
	view:{
		current:1,
		prev:1
	},
	elements:{
		head:{

		},
		foot:{

		},
		options:{

		}
	},
	data:{
		H_RPGX:false,
		H_TABA:false,
		H_NECRO:false,
		H_OTOGI:false,
		STORY_RPGX:false,
		STORY_TABA:false
	},
	pause:{
		auto:false,
		slideshow:false,
		voice:false,
		bgm:false,
		se:false
	},
	info:{
		rpgx_h:{
			name: "Taimanin RPGX H Scenes",
			date:"< 2020-08-18",
			desc:"No update since 2020-08-18",
		},
		rpgx_extasy_h:{
			name: "Taimanin RPGX Extasy H Scenes",
			date:"< 2024-01-31",
			desc:"No update since 2024-01-31",
		},
		rpgx_story:{
			name: "Taimanin RPGX Story",
			date:"< 2020-08-18",
			desc:"No update since 2020-08-18",
		},
		rpgx_extasy_story:{
			name: "Taimanin RPGX Extasy Story",
			date:"< 2024-01-31",
			desc:"No update since 2024-01-31",
		},
		taba_h:{
			name: "TABA H Scenes",
			date:"< 2020-08-18",
			desc:"No update since 2020-08-18",
		},
		necro_h:{
			name: "Tokyo Necro H Scenes",
			date:"< 2020-08-18",
			desc:"No update since 2020-08-18",
		},
		otogi_h:{
			name: "Otogi Frontier H Scenes",
			date:"< 2021-01-15",
			desc:"No update since 2021-01-15",
		}
	}
};

const Viewer = main;

window.onfocus = () => {

	if(!prefs.viewer.pauseOnFocusLoss) return;

	if(main.view.current === CG_VIEWER){
		if(main.pause.slideshow){
			toggleSlideShow();
		}
	}

	if(main.view.current === SCENE_VIEWER){
		if(main.pause.auto){
			toggleSceneAutoMode();
		}
		if(main.pause.voice){
			scene.current.voice.play();
		}
		if(main.pause.bgm){
			scene.current.bgm.play();
		}
		if(main.pause.se){
			scene.current.se.play();
		}
	}
}

window.onblur = () => {
	if(!([SCENE_VIEWER, CG_VIEWER].includes(main.view.current))) return
	// if(main.view.current != SCENE_VIEWER) return;
	main.pause.auto = false;
	main.pause.slideshow = false;
	main.pause.voice = false;
	main.pause.bgm = false;
	main.pause.se = false;
	if(!prefs.viewer.pauseOnFocusLoss){
		return;
	}
	if(isMode(MODE.AUTO)){
		main.pause.auto = true;
		toggleOffSceneAutoMode();
	}
	if(cgViewer.slideshow){
		main.pause.slideshow = true;
		toggleOffSlideShow();
	}
	if(!scene.current.voice.paused){
		main.pause.voice = true;
		scene.current.voice.pause();
	}
	if(!scene.current.bgm.paused){
		main.pause.bgm = true;
		scene.current.bgm.pause();
	}
	if(!scene.current.se.paused){
		main.pause.se = true;
		scene.current.se.pause();
	}
	toggleOffSceneSkipping();
}

window.onload = function() {
	main.elements.loadingWrap = document.getElementById("loading-wrap");
	main.elements.loadingFile = document.getElementById("loading-file");
	main.elements.loadingProgress = document.getElementById("loading-progress");
	main.elements.loadingError = document.getElementById("loading-error");
	main.elements.loadingErrorMsg = document.getElementById("loading-error-msg");
	main.elements.loadingErrorBtn = document.getElementById("loading-error-btn");
	main.elements.loadingErrorBtn.addEventListener("click", closeError);

	let permPreloadUI = ['arrow_left_icon', 'arrow_right_icon', 'auto_btn_off', 'auto_btn_on', 'BG_0005', 'chara', 'checkbox', 'checkbox_checked', 'Cmn_poppup_frm_s', 'Cmn_trust_icon_on', 'Eve_raid_top_btn_ep', 'Eve_raid_top_btn_pro', 'exit', 'favicon', 'hide_btn', 'log_btn', 'log_button_voice', 'menu_base', 'menu_btn_close', 'menu_btn_open', 'menu_close_button', 'menu_option_off_left', 'menu_option_off_mid', 'menu_option_off_right', 'menu_option_on_left', 'menu_option_on_mid', 'menu_option_on_right', 'normalquest_section_radar_eff', 'off_button_active', 'off_button_inactive', 'on_button_active', 'on_button_inactive', 'progress_1', 'progress_2', 'Quest_capter_frm1', 'Quest_capter_frm_off', 'Quest_capter_frm_on', 'Quest_section_base1', 'Quest_section_cell_base', 'Quest_section_cell_difficulty3_afoot', 'Quest_section_number1_off', 'Quest_section_number2_off', 'Quest_section_number3_off', 'Quest_section_number4_off', 'Quest_section_number5_off', 'Scene_choices_base', 'Scene_text_icon_edn1', 'Scene_text_icon_edn2', 'Scene_text_icon_edn3_eff', 'Scene_text_icon_edn4_eff', 'settings_btn', 'skip_btn_off', 'skip_btn_on', 'slider_handle', 'text_box', 'Title_load_gauge_font_1', 'Title_load_gauge_font_2'];
	for(let i = 0; i < permPreloadUI.length; i++){
		permPreloadUI[i] = "./data/ui/" + permPreloadUI[i] + ".png";
	}
	permPreload(permPreloadUI);
	main.elements.html = document.getElementsByTagName("html")[0];
	main.elements.viewer = document.getElementById("scene-viewer");
	main.elements.sceneSelect = document.getElementById("scene-select");
	main.elements.storySelect = document.getElementById("story-select");
	main.elements.cgWrapper = document.getElementById("cg-wrapper");
	main.elements.searchMenu = document.getElementById("search");
	main.elements.controlsMenu = document.getElementById("controls");
	main.elements.pageNumber = document.getElementById("page-number");
	main.elements.pageSelect = document.getElementById("page-select");
	main.elements.tlChoiceBox = document.getElementById("tl-choice-box");
	main.elements.canvasHoldElem = document.getElementById("canvas-hold");
	main.elements.contents = document.getElementById("content");
	//main.elements.header = document.getElementById("header");
	//main.elements.footer = document.getElementById("footer");
	main.elements.mainUI = document.getElementById("scene-select-control");
	main.elements.head.controls = main.elements.mainUI.children[7];
	main.elements.head.options = main.elements.mainUI.children[2];
	main.elements.head.search = main.elements.mainUI.children[1];
	main.elements.foot.exit = main.elements.mainUI.children[5];
	main.elements.foot.skip = main.elements.mainUI.children[6];
	main.elements.foot.auto = main.elements.mainUI.children[4];
	main.elements.foot.mode = main.elements.mainUI.children[3];
	main.elements.fullScreenBtn = main.elements.mainUI.children[8];
	// main.elements.ResizeBtn = main.elements.mainUI.children[9];
	main.elements.alertBox = document.getElementById("alert-box");
	main.elements.alertMsg = document.getElementById("alert-msg");
	main.elements.alertOpts = document.getElementById("alert-opts");
	main.elements.tlNotice = document.getElementById("tl-mode-notice");
	//hideScrollBars();
	main.elements.contents.addEventListener("transitionend", function(){
		cancelAnimationFrame(main.rescaleRequest);
		rescale();
	}, true);
	main.elements.viewer.addEventListener("transitionend", function(){
		if(main.elements.viewer.style.opacity < 1){
			main.elements.viewer.style.zIndex = "0";
		}
	}, true);
	killChildren(main.elements.viewer);
	checkData();
	initPreferences();
	initMeta();
	//initFiles();
	initUserInput();
	//mergeSceneData();
	initSearch();
	if(main.data.H_RPGX || main.data.H_TABA){
		fillSceneList();
		constructSceneSelect();
	}
	if(main.data.STORY_RPGX){
		initStorySelect();
	}
	initPreload();
	initTlTools();
	//createAutocompleteData();
	// if(!main.localFile) loadPIXI();
	setScreen();
	checkScriptRecovery();
	// Viewer.ResourceManager = new ResourceManager();
	// Viewer.Game = {
	// 	RPGX:{}
	// }
	// const rpgx = Viewer.Game.RPGX;
	// rpgx.ResourceManager = Viewer.ResourceManager.addGame("Taimanin RPGX");
	// rpgx.scene = {};
	// rpgx.scene.ResourceManager = rpgx.ResourceManager.addScreen("scene", 5, {viewer:true})

	// Viewer.Game.RPGX.scene.ResourceManager.loadResources([
	// {url: "thumb1080.png", temp: true},
	// {url: "test2.json", name: "test2j", temp: false},
	// {url: "test.json", name: "test", temp: true},
	// {url: "shi.png", name: "shisui", temp: true},
	// {url: "test3.json", name: "test3", temp: false},
	// {url: "test2.txt", name: "test2", temp: true},
	// ], () => {console.log("FINISHED")}, 0);

	buildRPGXUI();
}

function setScreen(){
	if(main.data.H_RPGX || main.data.H_TABA){
		main.elements.storySelect.style.display = "none";
	} else if(main.data.STORY_RPGX){
		main.elements.storySelect.style.display = "initial"
	}
	loadSceneSelect();
}

function checkData(){
	const table = [];
	if(typeof sceneData !== "undefined"){
		main.data.H_RPGX = true;
		table.push(main.info.rpgx_h);

		if(typeof RPGX_Extasy_H !== "undefined"){
			table.push(main.info.rpgx_extasy_h);
			for(const key of Object.keys(RPGX_Extasy_H)){
				sceneData[key]["SCRIPTS"]["PART1"]["TRANSLATIONS"] = RPGX_Extasy_H[key]["SCRIPTS"]["PART1"]["TRANSLATIONS"];
			}
		}
	}
	
	if(typeof storyData !== "undefined" && typeof STORY !== "undefined"){
		main.data.STORY_RPGX = true;
		table.push(main.info.rpgx_story);

		if(typeof RPGX_Extasy_Story !== "undefined"){
			table.push(main.info.rpgx_extasy_story);
			for(const [key, data] of Object.entries(RPGX_Extasy_Story)){
				for(const [section, sectionData] of Object.entries(data["SECTIONS"])){
					for(const [part, partData] of Object.entries(sectionData)){
						storyData[key]["SECTIONS"][section][part]["TRANSLATIONS"] = partData["TRANSLATIONS"];
					}
				}
			}
		}
		if(typeof STORY_ENG !== "undefined"){
			for(const [key, data] of Object.entries(STORY_ENG)){
				if(key in STORY){
					for(const [k, v] of Object.entries(data)){
						STORY[key][k] = v;
					}
				}
			}
		}
	}
	
	// if(typeof sceneData !== "undefined"){
	// 	main.data.H_RPGX = true;
	// 	console.log(`RPGX H Scenes\nDate: ${main.info.rpgx_h.date}\nDescription: ${main.info.rpgx_h.desc}`);
	// }
	if(typeof TABAData !== "undefined"){
		main.data.H_TABA = true;
		table.push(main.info.taba_h);
		// console.log(`TABA H Scenes\nDate: ${main.info.taba_h.date}\nDescription: ${main.info.taba_h.desc}`);
	}
	if(typeof NecroData !== "undefined"){
		main.data.H_NECRO = true;
		table.push(main.info.necro_h);
		// console.log(`Tokyo Necro H Scenes\nDate: ${main.info.necro_h.date}\nDescription: ${main.info.necro_h.desc}`);
	}
	if(typeof OtogiData !== "undefined"){
		main.data.H_OTOGI = true;
		table.push(main.info.otogi_h);
		// console.log(`Otogi Frontier H Scenes\nDate: ${main.info.otogi_h.date}\nDescription: ${main.info.otogi_h.desc}`);
	}
	// if(typeof storyData !== "undefined"){
	// 	main.data.STORY_RPGX = true;
	// 	console.log(`RPGX Story Scenes\nDate: ${main.info.rpgx_story.date}\nDescription: ${main.info.rpgx_story.desc}`);
	// }
	console.table(table);
}

function stretchFrame(){
	let width = 0;
	let height = 0;
	
	switch(scene.type){
		case H_TABA:
			width -= 330;
			height -= 8;
			break;
		case H_OTOGI:
			width -= 144;
			height -= 80;
			break;
		case H_NECRO:
			width -= 104;
			height -= 56
			break;
	}
	setCSSVar("frame-height-mod", height + "px");
	if(prefs.scene.textBoxUnder && main.view.current != CG_VIEWER){
		height += 176;
	}
	if(main.view.current == SCENE_VIEWER){
		main.elements.contents.style.width = `${1280 + width}px`;
		main.elements.contents.style.height = `${720 + height}px`;
	}
	rescaleLoop();
	// if(prefs.scene.textBoxFullUnder){
	// 	main.elements.contents.style.height = "901px"
	// } else {
	// 	main.elements.contents.style.height = "871px"
	// }
}

function contractFrame(){
	main.elements.contents.style.width = "1280px"
	main.elements.contents.style.height = "720px"
	rescaleLoop();
	// main.elements.contents.style.backgroundSize = "1002px 768px"
}

function killChildren(elem) {
	//AMERICA NO!
	while (elem.firstChild) {
		elem.removeChild(elem.firstChild);
	}
}

function loadSceneSelect(){
	main.view.current = main.elements.sceneSelect.style.display == "none" ? STORY_SELECT : SCENE_SELECT;
	main.elements.viewer.style.opacity = "0"
	contractFrame();
	// if(prefs.scene.textBoxUnder){
		
	// }
	switchView();
}

function switchSelectScreen(){
	if(main.view.current == SCENE_SELECT && main.data.STORY_RPGX){
		main.elements.sceneSelect.style.display = "none"
		main.elements.storySelect.style.display = "flex"
		main.elements.foot.auto.innerHTML = "Select: Story";
		main.elements.head.search.innerHTML = "";
		main.elements.pageSelect.style.visibility = "collapse";
		main.elements.mainUI.style.justifyContent = "center";
		main.elements.storySelect.prepend(main.elements.mainUI);
		main.view.current = STORY_SELECT;
	} else if(main.view.current == STORY_SELECT && (main.data.H_RPGX || main.data.H_TABA)){
		main.elements.sceneSelect.style.display = "flex"
		main.elements.storySelect.style.display = "none"
		main.elements.foot.auto.innerHTML = "Select: Scene";
		main.elements.head.search.innerHTML = "Search";
		main.elements.pageSelect.style.visibility = "visible";
		main.elements.mainUI.style.justifyContent = "flex-start";
		main.elements.sceneSelect.prepend(main.elements.mainUI);
		main.view.current = SCENE_SELECT;
	}
	switchView();
}

function loadSceneViewer(){
	main.view.current = SCENE_VIEWER;
	displayLoadScreen();
	closeTLChoiceBox();
	prepareScene();
	main.elements.viewer.style.zIndex = "1"
	main.elements.viewer.style.opacity = "1";
	stretchFrame();
	// if(prefs.scene.textBoxUnder){
	// 	stretchFrame();
	// }
}

function displayLoadScreen(){
	if(prefs.viewer.loadingScreen){
		main.elements.loadingWrap.style.visibility = "initial";
	}
}

function isArray(obj) {
	if (typeof obj === "object" && obj.constructor === Array) {
		return true;
	} else {
		return false;
	}
}

// Creates what scene select works off of
function fillSceneList(){
	for(key of Object.keys(sceneData)){
		if(sceneData[key].SCRIPT){
			main.sceneList.push(key)
		} else if(sceneData[key].SCRIPTS.PART1.SCRIPT){
			main.sceneList.push(key)
		}
	}
}

function checkCookie(){
    var cookieEnabled = navigator.cookieEnabled;
    if (!cookieEnabled){ 
        document.cookie = "testcookie";
        cookieEnabled = document.cookie.indexOf("testcookie")!=-1;
    }
    return cookieEnabled
}

function hideScrollBars () {
  let inner = document.createElement('p');
  inner.style.width = "100%";
  inner.style.height = "200px";

  let outer = document.createElement('div');
  outer.style.position = "absolute";
  outer.style.top = "0px";
  outer.style.left = "0px";
  outer.style.visibility = "hidden";
  outer.style.width = "200px";
  outer.style.height = "150px";
  outer.style.overflow = "hidden";
  outer.appendChild (inner);

  document.body.appendChild (outer);
  let w1 = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  let w2 = inner.offsetWidth;
  if (w1 == w2) w2 = outer.clientWidth;

  document.body.removeChild (outer);

  document.documentElement.style.setProperty("--scrollbar-width", (w1 - w2) + "px");
};

function sendAlert(msg, options){
	main.elements.alertBox.visibility = "initial";
	main.elements.alertMsg.innerHTML = msg;
	for(let opt of options){
		let btn = document.createElement("div")
		btn.classList = "alert-btn";
		btn.innerHTML = opt[0];
		btn.addEventListener("click", opt[1], false);
		main.elements.alertOpts.appendChild(btn);
	}
}

//PIXI.live2d.Live2DModel.from("./TokyoNecro/l2d00362/model.model3.json")

// async function loadPIXI(){
// 	try {
// 		await promiseScript("./data/scripts/pixi6.js");
// 	} catch(e){
// 		console.log("Does not have pixi.js")
// 		return;
// 	}
// 	const canvas = document.createElement("canvas");
//     main.pixi = new PIXI.Application({
//         width: 1136,
//         height: 640,
//         backgroundColor: 0x109bb,
//         view: canvas,
//         transparent: true,
//         resolution: 1,
//         antialias: true
//     });
//     try {
//     	main.data.H_NECRO = await promiseScript("./data/scripts/data/necroH.js");
//     } catch(e){
//     	console.log("Not loading Tokyo Necro");
//     }
//     try {
//     	main.data.H_MIST = await promiseScript("./data/scripts/data/mistH.js");
//     } catch(e){
//     	console.log("Not loading Mist Train Girls");
//     }
    
//     if(main.data.H_NECRO){
//     	await promiseScript("./data/scripts/live2dcubismcore.min.js")
//     	await promiseScript("./data/scripts/cubism4.min.js")
//     }

//     if(main.data.H_MIST){
//     	await promiseScript("./data/scripts/pixi-spine.js");
//     }
// }

// function promiseScript(path){
// 	const elem = document.createElement("script");
// 	return new Promise((resolve, reject) => {
// 		elem.addEventListener("load", resolveRequest, {once:true});
// 		elem.addEventListener("error", rejectRequest, {once:true});
// 		elem.src = path;
// 		document.head.appendChild(elem);

// 		function resolveRequest(){
// 	        this.removeEventListener("error", rejectRequest, {once:true});
// 		    resolve(true)
// 		}

// 	    function rejectRequest(){
// 	        this.removeEventListener("load", resolveRequest, {once:true});
// 	     	elem.parentNode.removeChild(elem);
// 	        reject(false);
// 	    }
// 	});
// }

document.addEventListener("fullscreenchange", rescale);
// screen.orientation.addEventListener("change", rescale);
// window.addEventListener('resize', rescale);

function rescale(){
	const content = document.getElementById("content-wrap");
	const cw = content.clientWidth;
	const ch = content.clientHeight;
	const w = window.innerWidth;
	const h = window.innerHeight;
	const wScale = (w / cw);
	const hScale = (h / ch);
	const smallest = wScale < hScale ? wScale : hScale;
	setCSSVar("fs-scale-width", wScale);
    setCSSVar("fs-scale-height", hScale);
    setCSSVar("fs-scale-smallest", smallest);
    document.getElementById("content").style.transformOrigin = smallest < 1 ? "top left" : "top";
    // console.log(`width:${w}, height:${h}, wScale:${wScale}, hScale:${hScale}, smallest:${smallest}, clientWidth:${cw}, clientHeight:${ch}`);
    // debug.innerHTML = `width:${w}, height:${h}, wScale:${wScale}, hScale:${hScale}, smallest:${smallest}, clientWidth:${cw}, clientHeight:${ch}`;
}

function rescaleLoop(){
	rescale();
	main.rescaleRequest = requestAnimationFrame(rescaleLoop);
}

function setCSSVar(cssVar, value){
    if(!cssVar.startsWith("--")) cssVar = `--${cssVar}`;
    document.documentElement.style.setProperty(cssVar, value);
}