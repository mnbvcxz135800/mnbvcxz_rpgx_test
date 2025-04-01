var toPreload = new Set();
var preloadIter;
var preload = {
	paths: new Set(),
	files: new Set(),
	temp:{

	},
	perm:{

	},
	canvas:{

	},
	failed: false,
	failedPaths: [],
	loaded: 0,
	audio:{
		voice: new Audio(),
		bgm: new Audio(),
		se: new Audio(),
	}
}

//make scene uninteractable until load

function initPreload(){
	preload.permElem = document.getElementById("preload-perm-elem");
	preload.tempElem = document.getElementById("preload-temp-elem");
}

function preloadSceneResources(script){
	for(let command of script){
		let fn;
		let src;
		const commandArgs = splitCommand(command);
		switch(commandArgs[1]){
			case "EV":
			case "BG":
				fn = commandArgs[2].trim();
				if(fn == "black" || fn == "white"){
					continue;
				}
				src = createImagePath(fn);
			break;
			case "ACTOR":
				fn = commandArgs[3].trim();
				src = createImagePath(fn);
			break;
			case "VOICE_PLAY":
				// src = constructVoiceAudioPath(command.substr(command.lastIndexOf(">") +1).trim(), scene.id);
			break;
			case "BGM_PLAY":
				// src = constructBGMAudioPath(command.substr(command.lastIndexOf(">") +1, command.indexOf(",") - (command.lastIndexOf(">") +1)).trim());
			break;
			case "SE_PLAY":
				// src = constructSEAudioPath(command.substr(command.lastIndexOf(">") +1).trim());
			break;
			default:
			break;
		}
		preload.paths.add(src);
	}
	preload.paths.delete(undefined);
	preload.iter = preload.paths.values();
	fileLoader(loadSceneResources);
}

function preloadTABAResources(){
	for(let part in sceneData[scene.id].SCRIPTS){
		let curPart = sceneData[scene.id].SCRIPTS[part];
		let folder = curPart.FOLDER;
		let script;
		if(scene.translated){
			for(let tl of curPart.TRANSLATIONS){
				if(tl.LANGUAGE == scene.language && tl.TRANSLATOR == scene.translator){
					script = tl.SCRIPT;
					break;
				}
			}
		} else {
			script = curPart.SCRIPT
		}
		let path = "./TABAScenes/" + folder;
		for(let cmd of script){
			let src = cmd.src;
            let type = cmd.type;
            let id = cmd.id;
            let fullPath;

            switch(type){
            	case "BG":
            	case "EV":
            	case "OV":
            		if(src){
            			fullPath = path + "/images/" + src.split("/")[src.split("/").length -1];
            		}
            	break;
            	case "TXT":
	            	if(src){
            			// fullPath = path + "/sounds/" + src.split("/")[src.split("/").length -1];
            		}
            	break;
            	default:
            	break;
            }
            if(fullPath != undefined && !fullPath.includes("non_resource")){
            	preload.files.add(fullPath.split("/")[fullPath.split("/").length-1]);
            	preload.paths.add(fullPath);
            }
		}
		preload.paths.delete(undefined);
		preload.iter = preload.paths.values();
		fileLoader(loadSceneResources);
	}
}

function preloadNecroResources(script){
	let path = `./NecroScenes/${scene.id}`;
	for(let command of script){
		let src;
		let cmd = command.split(",");
		switch(cmd[0]){
			case "bg":
				src = `${path}/images/${cmd[1]}.png`;
			break;
			case "bgmplay":
				// src = `./data/audio/bgm/${cmd[1]}.m4a`;
			break;
			case "msgvoicesync":
				// src = `${path}/voices/${cmd[5]}.m4a`;
			break;
			case "playmovie":
				src = `${path}/videos/${cmd[1]}.webm`;
			break;
			case "seplay":
				// src = `./data/audio/se/${cmd[1]}.m4a`;
			break;
			case "voice":
				// if(!cmd[1].includes("_i_men")){
				// 	src = `${path}/voices/${cmd[1]}.m4a`;
				// }
			break;
			default:
			break;
		}
		preload.paths.add(src);
	}
	preload.paths.delete(undefined);
	preload.iter = preload.paths.values();
	fileLoader(loadSceneResources);
}

function preloadOtogiResources(script){
	let path = `./OtogiScenes/${scene.id.split("_")[1]}`;
	for(let cmd of script){
		if(cmd.Voice != ""){
			// preload.paths.add(`${path}/voices/${cmd.Voice}.m4a`);
		}
		if(cmd.BGM != null){
			// preload.paths.add(`./data/audio/bgm/${cmd.BGM}.m4a`);
		}
		if(cmd.SE != ""){
			// preload.paths.add(`./data/audio/se/${cmd.BGM}.m4a`);
		}
	}
	for(let img of sceneData[scene.id].SCRIPTS.PART1.images){
		preload.paths.add(img);
	}
	preload.paths.delete(undefined);
	preload.iter = preload.paths.values();
	fileLoader(loadSceneResources);
}

function loadSceneResources(){
	let path = preload.iter.next().value;
	if(path == null || path == undefined){
		if(preload.failed){
			fileErrorPopup();
			return;
		}
		if(scene.type == H_TABA){
			// Multi-part scenes may use the same files so using paths
			// doesn't always work.
			if(preload.files.size == Object.keys(preload.temp).length){
				cleanupPreload();
				startScene();
				return;
			}
		} else {
			// I don't know why filenames doesn't work and paths does
			// for RPGX but I also don't care enough to find out.
			if(preload.paths.size == Object.keys(preload.temp).length ){
				cleanupPreload();
				startScene();
				return;
			}
		}
		//console.log("Error code: Some shit's not fucking loading");
		//console.log(loadSceneResources.caller);
		return;
	}
	main.elements.loadingFile.innerText = path;
	let fn = path.substr(path.lastIndexOf("/") + 1, path.lastIndexOf(".") - path.lastIndexOf("/") - 1);
	if(preload.temp[fn]){
		loadSceneResources();
		return;
	}
	let ext = path.substr(path.lastIndexOf(".")  + 1);
	if(ext == "png" || ext == "jpg"){
		loadImage(path, "tempPreloadImage", false, loadSceneResources);
	} else if(ext == "ogg" || ext == "m4a"){
		//loadAudio(path, false, loadSceneResources);
	} else if(ext == "webm"){
		loadVideo(path, "tempPreloadImage", false, loadSceneResources);
	}
}

function cleanupPreload(){
	preload.paths = new Set();
	preload.files = new Set();
	preload.failed = false;
	preload.failedPaths = [];
	preload.loaded = 0;
	main.elements.loadingWrap.style.visibility = "hidden";
}

function createCanvases(script, pairList=null){
	let evData = getCommandData(script, "<EV>", 0);
	evData = [...new Set(evData)];
	const prevParent = {ev:null}
	for(let ev of evData){
		createCGCanvases(ev, pairList, prevParent);
	}
	// for(let img of sceneData[id].hierarchy.pairList){
	// 	if(!preload.canvas.hasOwnProperty(img.parent)){
	// 		createCanvas([img.parent]);
	// 	}
	// 	if(!preload.canvas.hasOwnProperty(img.child)){
	// 		createCanvas([img.parent, img.child]);
	// 	}
	// }
}

function getPrevImage(image){
	const fn = image.split("_r18")[0];
	const prev = String.fromCharCode(fn.at(-1).charCodeAt(0) - 1);
	const r18 = image.includes("_r18") ? "_r18" : "";
	return fn.substring(0, fn.length - 1) + prev + r18;
}

function createCGCanvases(ev, pairList=null, prevParent={ev:null}){
	//console.log(ev + ", " + pairList)
	if(!preload.canvas.hasOwnProperty(ev) && pairList != null){
		const parentMap = new Map();
		for(const pair of pairList){
			parentMap.set(pair.parent, pair.parent);
			parentMap.set(pair.child, pair.parent);
		}
		let imageIndex = ev.split("_r18")[0].at(-1);
		if(parentMap.has(ev)){
			createCanvas([parentMap.get(ev), ev]);
		} else {
			let found = false;
			let prev = ev;
			while(imageIndex !== "a"){
				prev = getPrevImage(prev);
				imageIndex = prev.split("_r18")[0].at(-1);
				if(parentMap.has(prev)){
					found = true;
					createCanvas([parentMap.get(prev), ev]);
					break;
				}
			}
			if(!found){
				createCanvas([ev]);
			}
		}


		// let foundMatch = false;
		// for(let pair of pairList){
		// 	if(ev == pair.parent){
		// 		foundMatch = true;
		// 		prevParent.ev = pair.parent;
		// 		createCanvas([pair.parent]);
		// 		break;
		// 	} else if(ev == pair.child){
		// 		foundMatch = true;
		// 		prevParent.ev = pair.parent;
		// 		createCanvas([pair.parent, pair.child]);
		// 		break;	
		// 	}
		// }
		// if(!foundMatch){
		// 	// Sometimes EVs aren't listed in the pair list.
		// 	if(prevParent.ev == null){
		// 		createCanvas([ev])
		// 	} else {
		// 		createCanvas([prevParent.ev, ev]);
		// 	}
		// }
	} else {
		createCanvas([ev]);
	}
}

function createCanvas(files){
	let name = files[files.length - 1];
	let canvas = document.createElement("canvas");
	canvas.id = name
	canvas.height = 720;
	canvas.width = 1280;
	main.elements.canvasHoldElem.append(canvas);
	// let ctx = canvas.getContext("2d");

	// for(file of files){
	// 	let image = new Image();
	// 	image.onload = function(){
	// 		ctx.drawImage(image, 160, 0, 960, 720, 0, 0, 960, 720);
	// 	}
	// 	image.src = createImagePath(file);
	// }
	if(files.length == 2){
		drawImage(canvas, files[0], function(){
			drawImage(canvas, files[1])
		});
	} else {
		drawImage(canvas, files[0]);
	}
	canvas.classList.add("tempPreloadImage");
	preload.canvas[name] = canvas;
}

function drawImage(canvas, file, callback=null){
	let ctx = canvas.getContext("2d");
	let image = new Image();
	image.onload = function(){
		ctx.drawImage(image, 0, 0, 1280, 720, 0, 0, 1280, 720);
		if(callback != null){
			callback();
		}
	}
	image.src = createImagePath(file);
}

const hasExternalFile = new Set(["0295", "0299", "0334", "0364", "0382", "0470", "0494", "0498", "0502", "0516", "0542", "0562", "0615", "0651", "0680", "0697", "0732", "0345", "0603"]);

function createImagePath(file){
	if(scene.type === H_RPGX || scene.type === CG_RPGX){
		let id;
		if(file.startsWith("chr_0") && !hasExternalFile.has(file.substring(4,8))){
			id = file.replace("chr_", "").replace("_r18", "").replace(/[a-z]/g, "").substr(0,6);
		} else if(file.startsWith("exev")){
			id = (file.split("_")[0] + file.split("_")[1].replace(/[a-z]/, "")).replace("exev", "EX");
		// } else if(file.startsWith("ex")){
		// 	id = file.split("_")[0] + file.split("_")[1].replace(/[a-z]/, "");
		// 	console.log("ex match: " + file + ", " + id + ", " + scene.id)
		} else {
			id = scene.type === H_RPGX ? scene.id : cgViewer.scene;
		}
		return "./scenes/" + id + "/images/" + file + ".png";
	} else if(scene.type === STORY_RPGX){
		if(/[a-z]+_[a-z][0-9][0-9][0-9][a-z]/.test(file) || file.startsWith("chr_") || file.startsWith("ex_")){
			return "./Story/char/" + file + ".png";
		} else if(file.startsWith("ef") || file.startsWith("nc") || file.startsWith("chrnc")){
			return "./Story/bg/" + file + ".png";
		} else if(file.startsWith("stv")){
			return "./Story/ev/" + file + ".png";
		}
	}
}

function getCommandData(script, tag, idx=null){
	let data = []
	for(let cmd of script){
		if(cmd.startsWith(tag)){
			if(idx != null){
				data.push(cmd.substr(cmd.lastIndexOf(">") + 1).split(",")[idx]);
			} else {
				data.push(cmd.substr(cmd.lastIndexOf(">") + 1));
			}
		}
	}
	return data
}

// var trans = new Set();
// for(let key in sceneData){
// 	console.log(getCommandData(sceneData[key].script, "<TRANSITION>", 0));
// }

function constructImagePath(src, id){
	return "./scenes/" + id + "/images/" + src + ".png";
}
function constructVoiceAudioPath(src, id){
	return "./scenes/" + id + "/voices/" + src + ".ogg";
}

function constructBGMAudioPath(src){
	return "./data/audio/bgm/" + src + ".ogg";
}

function constructSEAudioPath(src){
	return "./data/audio/se/" + src + ".ogg";
}

function emptyTempPreload(){
	// Kill children causes some weird shit in CG mode for the canvas holder
	// for(let key in preload.canvas){
	// 	let child = preload.canvas[key];
	// 	child.parentElement.removeChild(child)
	// }
	preload.canvas = {};
	preload.temp = {};
	preload.paths = new Set();
	preload.files = new Set();
	killChildren(document.getElementById("preload-temp-elem"));
	killChildren(main.elements.canvasHoldElem);
}

// var names = new Set();
// for(let key in sceneData){
// 	let curScene = sceneData[key];
// 	for(let cmd of curScene.script){
// 		if(cmd.startsWith("<NAME_PLATE>")){
// 			let name = cmd.substr(cmd.lastIndexOf(">") + 1);
// 			if(/[ａ-ｚＡ-Ｚ０-９？]/.test(name)){
// 				names.add(name.substr(0, /[ａ-ｚＡ-Ｚ０-９？]/.exec(name).index).trim());
// 			} else {
// 				names.add(name.trim());
// 			}
// 		}
// 	}
// }

function permPreload(paths){
	preload.paths = new Set(paths);
	preload.paths.delete(undefined);
	preload.iter = preload.paths.values();
	displayLoadScreen();
	loadPermFiles();
}

function loadPermFiles(){
	let path = preload.iter.next().value;
	if(path == null || path == undefined){
		if(preload.failed){
			fileErrorPopup();
			return;
		} else {
			cleanupPreload();
			return;
		}
	}
	main.elements.loadingFile.innerText = path;
	let fn = path.substr(path.lastIndexOf("/") + 1, path.lastIndexOf(".") - path.lastIndexOf("/") - 1);
	if(preload.temp[fn]){
		loadPermFiles();
		return;
	}
	loadImage(path, "permPreloadImage", true, loadPermFiles);
}

function errorLoading(path){
	preload.failed = true;
	preload.failedPaths.push(path);
}

function fileErrorPopup(){
	main.elements.loadingError.style.visibility = "initial";
	main.elements.loadingErrorMsg.value = "The following files could not be loaded:\n"
	for(let error of preload.failedPaths){
		main.elements.loadingErrorMsg.value += "    " + error + "\n";
	}
}

function closeError(){
	main.elements.loadingError.style.visibility = "hidden";
	main.elements.loadingErrorMsg.value = "";
	cleanupPreload();
	endScene();
}

function fileLoader(loadFunction){
	for(let i = 0; i < prefs.viewer.fileLoaders; i++){
		loadFunction();
	}
}

function updateProgress(){
	main.elements.loadingProgress.style.width = ((preload.loaded / preload.paths.size) * 100) + "%";
}

function loadImage(path, className, perm, callback){
	let img = new Image();
	let fn = path.substr(path.lastIndexOf("/") + 1, path.lastIndexOf(".") - path.lastIndexOf("/") - 1);
	img.className = className;
	img.addEventListener("load", function(){
		if(perm){
			preload.perm[fn] = img;
			preload.permElem.append(img);
		} else {
			preload.temp[fn] = img;
			preload.tempElem.append(img);
		}
		preload.loaded++;
		updateProgress();
		callback();
	}, {once:true});
	img.addEventListener("error", function(){
		errorLoading(path);
		callback();
	}, {once:true})
	img.src = path;
}

function loadVideo(path, className, perm, callback){
	let vid = document.createElement("video");
	let fn = path.substr(path.lastIndexOf("/") + 1, path.lastIndexOf(".") - path.lastIndexOf("/") - 1);
	vid.className = className;
	vid.addEventListener("canplay", function(){
		if(perm){
			preload.perm[fn] = vid;
			preload.permElem.append(vid);
		} else {
			preload.temp[fn] = vid;
			preload.tempElem.append(vid);
		}
		preload.loaded++;
		updateProgress();
		callback();
	}, {once:true});
	vid.addEventListener("error", function(){
		errorLoading(path);
		callback();
	}, {once:true})
	vid.src = path;
}

function loadAudio(path, perm, callback){
	let audio = new Audio();
	let fn = path.substr(path.lastIndexOf("/") + 1, path.lastIndexOf(".") - path.lastIndexOf("/") - 1);
	audio.addEventListener("canplay", function(){
		if(perm){
			preload.perm[fn] = audio;
		} else {
			preload.temp[fn] = audio;
		}
		preload.loaded++;
		updateProgress();
		callback();
	}, {once:true});
	audio.addEventListener("error", function(){
		errorLoading(path);
		callback();
	}, {once:true});
	audio.src = path;
}

async function loadAudioNow(path, type){
	return new Promise((resolve, reject) => {
		let audio = preload.audio[type.toLowerCase()];
		audio.src = "";
		audio.oncanplaythrough = () => resolve();
		audio.onerror = (e) => {
			//deleteElement(elem);
			errorLoading(path)
			reject()
		};
		audio.src = path;
	});

	function promiseFile(path, obj){
		return new Promise((resolve, reject) => {
			let audio = obj;
			audio.oncanplaythrough = () => resolve();
			audio.onerror = (e) => {
				//deleteElement(elem);
				errorLoading(path)
				reject()
			};
			audio.src = path;
		});
	}
}

async function loadBacklogVoice(path){
	scene.current.backlogVoice.src = "";
	try{
		await promiseFile(path);
	} catch(e){
		console.log("Backlog Audio Load Error");
	}

	function promiseFile(path){
		return new Promise((resolve, reject) => {
			let audio = scene.current.backlogVoice;
			audio.oncanplaythrough = () => resolve();
			audio.onerror = () => {
				//deleteElement(elem);
				reject()
			};
			audio.src = path;
		});
	}
}

// requires a default switch statement to handle text commands
function getCommandType(cmd){
    return cmd.split(/[<>]/)[1];
}

function splitCommand(cmd){
    return cmd.split(/[<>,]/);
}