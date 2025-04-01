var swipeStart = 0;
var swipeEnd = 0;
var swiping = false;
var touchStartTime = 0;
var touchStartElem = "";
var swipedToTarget = "";
var touchHeld = false;
var touchHeldScene = "";
// CURRENT VIEW
const START_PAGE = 0;
const SCENE_SELECT = 1;
const SCENE_VIEWER = 2;
const OPTIONS_SCREEN = 3;
const SEARCH_SCREEN = 4;
const CG_VIEWER = 5;
const STORY_SELECT = 6;
// SCENE TYPE
const NO_TYPE = 0;
const H_RPGX = 1;
const CG_RPGX = 2;
const H_TABA = 3;
const CG_TABA = 4;
const STORY_RPGX = 5;
const H_NECRO = 6;
const H_OTOGI = 7;
// SCENE MODE
const MODE = {
	MANUAL: 0,
	AUTO: 1,
	SKIP: 2
}

function isMode(mode){
	return ((scene.mode & (2**mode)) >> mode) === 1;
}

function setMode(mode, force = false){
	if(force){
		scene.mode = (1 << mode);
		return true;
	} else if(!isMode(mode)){
		scene.mode += (1 << mode);
		return true;
	}
	return false;
}

function stopMode(mode){
	if(isMode(mode)){
		scene.mode -= (1 << mode);
		return true
	}
	return false;
}

var input = {
	touch:{
		startTime:0,
		held:false,
		swiping:false,
		swipeStart:0,
		swipeEnd:0,
		swipeTravel:0
	}
}

function initUserInput(){

	function documentKeyUpHandler(e){
		switch(main.view.current){
			case SCENE_VIEWER:
			switch(e.code){
				case "ControlLeft":
					toggleOffSceneSkipping();
				break;
			}
			

		}
	}

	function documentKeyDownHandler(e){
		switch(main.view.current){
			case START_PAGE:
			break;
			case SCENE_SELECT:
				switch(e.code){
					case "Enter":
					case "NumpadEnter":
						if(document.activeElement.id == "page-number"){
							if(main.elements.pageNumber.value >= 1 && main.elements.pageNumber.value <= (Math.floor(main.sceneList.length / (prefs.select.rows * prefs.select.columns)) + 1)){
								sceneSelect.page = main.elements.pageNumber.value - 1;
								constructSceneSelect();
								main.elements.pageNumber.blur();
							}
						} else {
							handleSceneSelected(main.elements.cgWrapper.children[sceneSelect.cursor].getAttribute("sceneid"));
						}
					break;
					case "KeyW":
					case "ArrowUp":
						cursorUp();
					break;
					case "KeyA":
					case "ArrowLeft":
						cursorLeft();
					break;
					case "KeyS":
					case "ArrowDown":
						cursorDown();
					break;
					case "KeyD":
					case "ArrowRight":
						cursorRight();
					break;
					case "KeyZ":
						prevPage();
					break;
					case "KeyX":
						nextPage();
					break;
					case "Space":
						handleSceneSelected(main.elements.cgWrapper.children[sceneSelect.cursor].getAttribute("sceneid"));
					break;
					case "KeyF":
						togglefavourite(main.elements.cgWrapper.children[sceneSelect.cursor]);
					break;
					case "KeyQ":
						openSearchMenu();
					break;
					// case "KeyI":
					// 	if(e.shiftKey){
					// 		fileCheck();
					// 	}
					// break;
					case "KeyT":
						if(e.shiftKey){
							toggleTLMode();
						}
					break;
					case "KeyR":
						chooseScene(main.sceneList[Math.floor(Math.random() * main.sceneList.length)]);
					break;
					case "KeyM":
						shuffleSceneSelect();
					break;
					case "KeyO":
						openOptionsMenu();
					break;
					case "KeyC":
						openControlsMenu();
					break;
					case "KeyJ":
						switchSelectScreen();
					break;
					case "KeyK":
						toggleSceneSelectMode();
					break;
					default:
					break;
				}
			break;
			case SCENE_VIEWER:
				switch(e.code){
					case "ControlLeft":
						if(!isMode(MODE.SKIP) && !tlTools.active && canProgress(true)){
							toggleSceneSkipping();
							// progressScene()
						}
					break;
					case "KeyA":
						if(!tlTools.active){
							toggleSceneAutoMode();
						}
					break;
					case "Escape":
					case "Backspace":
					case "Backquote":
						endScene();
					break;
					case "Space":
					case "Enter":
					case "NumpadEnter":
						if(canProgress(false) && !tlTools.active){
							sceneMode = 0;
							progressScene()
						}
					break;
					case "KeyH":
						if(!tlTools.active){
							toggleTextBox();
						}
					break;
					case "PageDown":
					case "ArrowDown":
					case "ArrowRight":
						e.preventDefault();
						jumpToAction(false);
					break;
					case "PageUp":
					case "ArrowUp":
					case "ArrowLeft":
						e.preventDefault();
						jumpToAction(true);
					break;
					case "KeyV":
						scene.current.voice.pause();
						scene.current.voice.currentTime = 0;
						scene.current.voice.play();
					break;
					default:
						// console.log(e.code)
					break;
				}
			break;
			case OPTIONS_SCREEN:
			break;
			case SEARCH_SCREEN:
				switch(e.code){
					case "Enter":
					case "NumpadEnter":
						if(document.getElementsByClassName("autocomplete-values").length == 0){
							runSearch();
						}
					break;
					case "Escape":
					case "Backquote":
						main.elements.searchMenu.style.display = "none";
						main.view.current = SCENE_SELECT;
					break;
					default:
					break;
				}
			break;
			case CG_VIEWER:
				switch(e.code){
					case "KeyD":
					case "Space":
					case "Enter":
					case "NumpadEnter":
					case "ArrowRight":
						toggleOffSlideShow();
						nextCG();
					break;
					case "KeyA":
					case "ArrowLeft":
						toggleOffSlideShow();
						prevCG();
					break;
					case "KeyW":
					case "ArrowUp":
						toggleOffSlideShow();
						nextCGScene();
					break;
					case "KeyS":
					case "ArrowDown":
						toggleOffSlideShow();
						prevCGScene();
					break;
					case "KeyG":
						toggleSlideShow();
					break;
					case "Escape":
					case "Backspace":
					case "Backquote":
						exitCGViewMode();
					break;
				}
			break;
			case STORY_SELECT:
				switch(e.code){
					case "KeyT":
						if(e.shiftKey){
							toggleTLMode();
						}
					break;
					case "KeyJ":
						switchSelectScreen();
					break;
					case "KeyO":
						openOptionsMenu();
					break;
					case "KeyC":
						openControlsMenu();
					break;
				}
			break;
			default:
			break;
		}
	}

	function documentWheelHandler(e){
		switch(main.view.current){
			case SCENE_VIEWER:
				if(e.deltaY < 0 && !scene.backlogOpen){
					toggleBacklog();
				}
			break;
			default:
			break;
		}
	}

	function documentPointerMoveHandler(e){
		if(!input.touch.held) return;

		if(input.touch.swiping){
			input.touch.swipeEnd = e.screenX;

			if(main.view.current == STORY_SELECT){
				if(e.target.closest("#story-select-chapter-wrap")){
					let scrollY = input.touch.swipeTravel - e.screenY;
					let elem = document.getElementById("story-select-chapter-choices");
					if(elem.scrollTop + elem.offsetHeight + scrollY >= elem.scrollHeight){
						elem.scrollTop = elem.scrollHeight - elem.offsetHeight;
					} else if (elem.scrollTop + scrollY <= 0){
						elem.scrollTop = 0;
					} else {
						let mod = (Math.abs(scrollY) / 100) + 1;
						elem.scrollTop += Math.floor(scrollY * mod)
					}
					input.touch.swipeTravel = e.screenY;
				}
			}

		} else {
			input.touch.swiping = true;
			input.touch.swipeStart = e.screenX;
			input.touch.swipeTravel = e.screenY;
		}
	}

	function documentPointerUpHandler(e){
		// console.log(input.touch.swipeStart - input.touch.swipeEnd);
		let swipeDistX = input.touch.swipeStart - e.screenX;
		let swipeDistY = input.touch.swipeTravel - e.screenY;
		let touchLength = e.timeStamp - input.touch.startTime;
		let touchEndElem = e.target; // document.elementFromPoint(e.clientX, e.clientY);
		let touchedViewer = e.target.closest(".viewer-main-class");
		let touchedOutside = e.target.matches("html");
		switch(main.view.current){
			case SCENE_SELECT:
				if(input.touch.startElem == touchEndElem && e.target.closest(".cg-container")){
					if(touchLength >= 300 || e.button === 2){
						togglefavourite(e.target.closest(".cg-container"));
					} else if(e.button === 0){
						handleSceneSelected(e.target.closest(".cg-container").getAttribute("sceneid"));
					}
				} else if (input.touch.swiping){
					if(swipeDistX > 100){
						nextPage();
					} else if(swipeDistX < -100){
						prevPage();
					}
				}
			break;
			case SCENE_VIEWER:
				if(touchedViewer && !e.target.closest(".scene-menu") && !e.target.closest(".scene-exit")){
					if(scene.textBoxHidden){
						toggleTextBox();
					} else if(canProgress(false)){
						if(isMode(MODE.MANUAL)) progressScene();
						toggleOffSceneSkipping();
						toggleOffSceneAutoMode();
					}
				}
			break;
			case CG_VIEWER:
				if(!touchedViewer) break;
				toggleOffSlideShow();
				if(Math.abs(swipeDistY) > Math.abs(swipeDistX)){
					if(swipeDistY > 60 && touchLength > 100){
						cgViewer.elements.menu.style.opacity = "1";
					} else if(swipeDistY < -60 && touchLength > 100){
						cgViewer.elements.menu.style.opacity = "";
					}
				} else {
					if((swipeDistX < -100 && touchLength > 100) || e.button === 2){
						prevCG();
					} else {
						nextCG();
					}
				}
				
			break;
			case STORY_SELECT:
				if(input.touch.startElem == touchEndElem && e.target.closest(".chapter-choice")){
					setChapterChoice(e.target.closest(".chapter-choice"));
				} else if(e.target.matches(".story-select-section-tag")){
					setChapterSection(e.target);
				} else if(e.target.matches(".story-select-section-part")){
					setChapterPart(e.target);
				}
			break;
			case OPTIONS_SCREEN:
				if(input.touch.startElem == touchEndElem && e.target.matches(".option-head-btn")){
					let idx = Array.prototype.indexOf.call(e.target.parentNode.children, e.target);
					for(let elem of e.target.parentNode.children){
						elem.classList.remove("styled-btn-active");
					}
					document.getElementById("options-page-wrap").scrollLeft = idx * 1250;
					e.target.classList.add("styled-btn-active");
				}
			break;
		}
		clearTimeout(input.touch.heldScene);
		input.touch.startElem = null;
		input.touch.swipeStart = 0;
		input.touch.swipeEnd = 0;
		input.touch.swipeTravel = 0;
		input.touch.swiping = false;
		input.touch.held = false;
	}

	function documentPointerDownHandler(e){
		input.touch.startTime = e.timeStamp;
		input.touch.startElem = e.target;
		input.touch.swipeStart = e.screenX;
		input.touch.swipeTravel = e.screenY;
		input.touch.held = true;
		if(main.view.current == SCENE_VIEWER){
			if(prefs.scene.skipHoldDelay > 0){
				input.touch.heldScene = setTimeout(() => {
					if(input.touch.held && canProgress(true) && !isMode(MODE.SKIP)){
						toggleSceneSkipping();
					}
				}, prefs.scene.skipHoldDelay);
			}
		}
	}

	document.addEventListener("contextmenu", e => e.preventDefault());
	document.addEventListener("keydown", documentKeyDownHandler);
	document.addEventListener("keyup", documentKeyUpHandler);
	document.addEventListener("wheel", documentWheelHandler);
	document.addEventListener("pointermove", documentPointerMoveHandler);
	document.addEventListener("pointerup", documentPointerUpHandler);
	document.addEventListener("pointerdown", documentPointerDownHandler);

	document.getElementById("prev-page").addEventListener("click", prevPage);
	document.getElementById("next-page").addEventListener("click", nextPage);

	main.elements.pageNumber.addEventListener("click", () => main.elements.pageNumber.value = "", true);
	main.elements.pageNumber.addEventListener("focusout", setPageNumber, true);
	main.elements.head.controls.addEventListener("click", openControlsMenu, true);
	main.elements.head.options.addEventListener("click", openOptionsMenu, true);
	main.elements.head.search.addEventListener("click", openSearchMenu, true);
	main.elements.fullScreenBtn.addEventListener("click", toggleFullscreen, true);

	main.elements.foot.exit.addEventListener("click", () => {
		if(main.view.current == SCENE_VIEWER){
			if(tlTools.active){
				if(changesToScript()){
					warnUnsavedChanges();
				} else {
					tlTools.elements.wrap.style.display = "none";
					endScene();
				}
			} else {
				endScene();
			}
		} else if(main.view.current == CG_VIEWER){
			exitCGViewMode();
		} else if(main.view.current == SCENE_SELECT){
			chooseScene(main.sceneList[Math.floor(Math.random() * main.sceneList.length)]);
		}
	}, true);
	main.elements.foot.skip.addEventListener("click", () => {
		if(main.view.current == SCENE_VIEWER){
			toggleSceneSkipping();
		} else if(main.view.current == CG_VIEWER){
			chooseScene(cgViewer.scene);
		} else if(main.view.current == SCENE_SELECT){
			shuffleSceneSelect();
		}
	}, true);
	main.elements.foot.auto.addEventListener("click", () => {
		if(main.view.current == SCENE_VIEWER){
			toggleSceneAutoMode();
		} else if(main.view.current == SCENE_SELECT || main.view.current == STORY_SELECT){
			switchSelectScreen();
		}
	}, true);
	main.elements.foot.mode.addEventListener("click", () => {
		if(main.view.current == SCENE_SELECT){
			toggleSceneSelectMode();
		} else if(main.view.current == CG_VIEWER){
			toggleSlideShow();
		} else if(main.view.current == SCENE_VIEWER){
			toggleBacklog();
		}
	}, true);
	document.getElementById("controls-close").addEventListener("click", () => {
		main.elements.controlsMenu.style.display = "none";
		main.view.current = main.view.prev;
	}, true);
	

	function handleSceneSelected(id){
		if(prefs.select.mode){
			chooseScene(id);
		} else {
			if(id.startsWith("c")){
				scene.type = CG_TABA;
				startCGViewMode(id);
			} else {
				scene.type = CG_RPGX;
				startCGViewMode(id);
			}
		}
	}
}

function toggleSceneSelectMode(){
	if(prefs.select.mode){
		main.elements.foot.mode.innerHTML = "Mode: CG";
	} else {
		main.elements.foot.mode.innerHTML = "Mode: Scene";
	}
	prefs.select.mode = !prefs.select.mode;
	toLocalStorage("sceneViewMode", prefs.select.mode);
}

function shuffleSceneSelect(){
	shuffle(main.sceneList);
	sceneSelect.page = 0;
	constructSceneSelect();
}

function toggleSceneSkipping(){
	if(isMode(MODE.SKIP)){
		toggleOffSceneSkipping();
	} else if(canProgress(true)){
		setMode(MODE.SKIP)
		scene.elements.menuSkipInput.checked = true;
		progressScene();
	}
}

function openControlsMenu(){
	contractFrame();
	if(!isMode(MODE.MANUAL)){
		toggleOffSceneSkipping();
		toggleOffSceneAutoMode();
	}
	if(main.view.current != OPTIONS_SCREEN){
		main.view.prev = main.view.current;
	}
	if(main.view.current == SCENE_VIEWER){
		toggleOffSceneAutoMode();
	} else if(main.view.current == CG_VIEWER){
		toggleOffSlideShow();
	}
	main.view.current = OPTIONS_SCREEN;
	closeMenus();
	main.elements.controlsMenu.style.display = "inherit";
}

function openOptionsMenu(){
	contractFrame();
	if(!isMode(MODE.MANUAL)){
		toggleOffSceneSkipping();
		toggleOffSceneAutoMode();
	}
	if(main.view.current != OPTIONS_SCREEN){
		main.view.prev = main.view.current == 4 ? 1 : main.view.current;
	}
	if(main.view.current == SCENE_VIEWER){
		toggleOffSceneAutoMode();
	} else if(main.view.current == CG_VIEWER){
		toggleOffSlideShow();
	}
	main.view.current = OPTIONS_SCREEN;
	closeMenus();
	opts.menu.style.display = "inherit";
	document.getElementById("options-head").children[Math.floor(document.getElementById("options-page-wrap").scrollLeft / 1250)].classList.add("styled-btn-active");
}

function openSearchMenu(){
	if(main.view.current == SCENE_SELECT || (main.view.current == OPTIONS_SCREEN && main.view.prev == SCENE_SELECT)){
		closeMenus();
		main.elements.searchMenu.style.display = "inherit";
		main.view.current = SEARCH_SCREEN;
	}
}

function toggleOffSceneSkipping(){
	clearTimeout(scene.nextSkip);
	stopMode(MODE.SKIP);
	scene.elements.menuSkipInput.checked = false;
	if(isMode(MODE.AUTO)) sceneAutoMode();
}

function toggleSceneAutoMode(){
	if(isMode(MODE.AUTO)){
		toggleOffSceneAutoMode();
	} else if(canProgress(false)){
		toggleOffSceneSkipping();
		setMode(MODE.AUTO);
		scene.elements.menuAutoInput.checked = true;
		scene.elements.autoInd.style.visibility = "visible";
		scene.elements.textBoxIcon.style.backgroundImage = "url('data/ui/Scene_text_icon_edn2.png')"
		sceneAutoMode();
	} 
}

function toggleOffSceneAutoMode(){
	stopMode(MODE.AUTO);
	scene.elements.menuAutoInput.checked = false;
	scene.elements.autoInd.style.visibility = "hidden";
	scene.elements.textBoxIcon.style.backgroundImage = "url('data/ui/Scene_text_icon_edn1.png')"
	clearTimeout(scene.nextAuto);
}

function toggleSlideShow(){
	cgViewer.slideshow = !cgViewer.slideshow;
	if(!cgViewer.slideshow){
		toggleOffSlideShow();
	} else {
		main.elements.foot.mode.innerHTML = "Mode: Slide";
		cgViewer.elements.slideInput.checked = true;
		slideshowMode();
	}
}

function toggleOffSlideShow(){
	main.elements.foot.mode.innerHTML = "Mode: CG";
	cgViewer.slideshow = false;
	cgViewer.elements.slideInput.checked = false;
	clearTimeout(cgViewer.nextSlide);
}

function toggleBacklog(){
	if(scene.backlogOpen){
		hideElem(scene.elements.backlog);
		unhideElem(scene.elements.textBox);
	} else {
		toggleOffSceneSkipping();
		toggleOffSceneAutoMode();
		if(!prefs.scene.textBoxUnder){
			hideElem(scene.elements.textBox);
		}
		unhideElem(scene.elements.backlog);
	}
	scene.backlogOpen = !scene.backlogOpen;
}

function toggleOffBacklog(){
	hideElem(scene.elements.backlog);
	unhideElem(scene.elements.textBox);
	scene.current.backlogVoice.pause();
	scene.current.backlogVoice.currentTime = 0;
	scene.backlogOpen = false;
}

function closeMenus(){
	if(main.view.current == CG_VIEWER){
		toggleOffSlideShow();
	}
	main.elements.controlsMenu.style.display = "none";
	opts.menu.style.display = "none";
	main.elements.searchMenu.style.display = "none";
}

function toggleTextBox(){
	toggleOffSceneSkipping();
	toggleOffSceneAutoMode();
	if(scene.elements.overlay.style.opacity != "0"){
		scene.textBoxHidden = true;
		scene.elements.overlay.style.opacity = "0";
	} else {
		scene.textBoxHidden = false;
		scene.elements.overlay.style.opacity = "1";
	}
	//scene.elements.textBox.style.display = scene.elements.textBox.style.display != "none" ? "none" : "inherit";
}

function togglefavourite(container){
	let sceneId = container.getAttribute("sceneid");
	if(sceneData[sceneId].favourite){
		prefs.select.favourites.splice(prefs.select.favourites.indexOf(sceneId), 1);
		container.getElementsByClassName("cg-fave-ind")[0].style.visibility = "hidden";
		toLocalStorage("favourites", prefs.select.favourites);
	} else {
		prefs.select.favourites.push(sceneId);
		prefs.select.favourites.sort();
		container.getElementsByClassName("cg-fave-ind")[0].style.visibility = "visible";
		toLocalStorage("favourites", prefs.select.favourites);
	}
	sceneData[sceneId].favourite = !sceneData[sceneId].favourite;
}

function cursorLeft(){
	removeCursorEffect();
	if(sceneSelect.cursor % prefs.select.columns == 0){
		if(sceneSelect.cursor + (prefs.select.columns - 1) >= main.elements.cgWrapper.children.length){
			sceneSelect.cursor = main.elements.cgWrapper.children.length - 1;
		} else {
			sceneSelect.cursor += (prefs.select.columns - 1);	
		}
	} else {
		sceneSelect.cursor -= 1;
	}
	addCursorEffect()
}

function cursorRight(){
	removeCursorEffect();
	if(sceneSelect.cursor % prefs.select.columns == (prefs.select.columns - 1) || sceneSelect.cursor + 1 == main.elements.cgWrapper.children.length){
		sceneSelect.cursor -= (sceneSelect.cursor % prefs.select.columns);
	} else { 
		sceneSelect.cursor += 1;
	}
	addCursorEffect()
}

function cursorUp(){
	removeCursorEffect();
	if(sceneSelect.cursor < prefs.select.columns){
		sceneSelect.cursor = sceneSelect.cursor % prefs.select.columns <= (main.elements.cgWrapper.children.length - 1) % prefs.select.columns ? ((main.elements.cgWrapper.children.length - 1) / prefs.select.columns | 0) * prefs.select.columns + sceneSelect.cursor : ((main.elements.cgWrapper.children.length / prefs.select.columns | 0) * prefs.select.columns + sceneSelect.cursor) - prefs.select.columns;
	} else {
		sceneSelect.cursor -= prefs.select.columns;
	}
	addCursorEffect()
}

function cursorDown(){
	removeCursorEffect();
	if(sceneSelect.cursor + prefs.select.columns >= main.elements.cgWrapper.children.length){
		sceneSelect.cursor = (sceneSelect.cursor % prefs.select.columns >= main.elements.cgWrapper.children.length ? main.elements.cgWrapper.children.length - 1 : sceneSelect.cursor % prefs.select.columns);
	} else {
		sceneSelect.cursor += prefs.select.columns;
	}
	addCursorEffect()
}

function chooseScene(id){
	scene.id = id;
	if(id[0] == "c"){
		scene.type = H_TABA;
	} else if(id.split("_")[0] == "HAR"){
		scene.type = H_NECRO;
	} else if(id.split("_")[0] == "OTOGI") {
		scene.type = H_OTOGI;
	} else {
		scene.type = H_RPGX;
	}
	if(H_TABA) scene.TABAFolder = sceneData[id].SCRIPTS.PART1.FOLDER;
	if(prefs.scene.eng && sceneData[id].SCRIPTS.PART1.TRANSLATIONS != null){
		let tls = sceneData[id].SCRIPTS.PART1.TRANSLATIONS;
		if(tls.length > 1){
			buildTLChoiceBox(tls);
		} else {
			scene.script = tls[0].SCRIPT;
			scene.translated = true;
			scene.translator = tls[0].TRANSLATOR;
			scene.language = tls[0].LANGUAGE;
			if(main.view.current == CG_VIEWER){
				exitCGViewMode();
			}
			loadSceneViewer();
		}
	} else {
		scene.script = sceneData[id].SCRIPTS.PART1.SCRIPT;
		if(main.view.current == CG_VIEWER){
			exitCGViewMode();
		}
		loadSceneViewer();
	}
}

function tlSelect(idx){
	killChildren(main.elements.tlChoiceBox);
	let choice = sceneData[scene.id].SCRIPTS.PART1.TRANSLATIONS[idx]
	scene.script = choice.SCRIPT;
	scene.translated = true;
	scene.translator = choice.TRANSLATOR;
	scene.language = choice.LANGUAGE;
	if(main.view.current == CG_VIEWER){
		exitCGViewMode();
	}
	loadSceneViewer();
}

function buildTLChoiceBox(choices){
	killChildren(main.elements.tlChoiceBox);
	let btnClose = document.createElement("div");
	btnClose.classList = "tl-choice-close";
	main.elements.tlChoiceBox.appendChild(btnClose);
	btnClose.addEventListener("click", closeTLChoiceBox);
	let idx = 0;
	for(choice of choices){
		createTLChoice(choice.LANGUAGE, choice.TRANSLATOR, idx);
		idx++
	}
	main.elements.tlChoiceBox.style.zIndex = "100";
	main.elements.tlChoiceBox.style.visibility = "initial";
}

function createTLChoice(lang, tl, idx){
	let btn = document.createElement("div");
	btn.classList = "styled-btn";
	btn.style.fontSize = "18px";
	btn.innerText = lang + " - " + tl;
	main.elements.tlChoiceBox.appendChild(btn);
	btn.setAttribute("tlidx", idx);
	btn.addEventListener("click", function(){
		tlSelect(this.getAttribute("tlidx"));
	},false);
}

function closeTLChoiceBox(){
	main.elements.tlChoiceBox.style.zIndex = "0";
	main.elements.tlChoiceBox.style.visibility = "hidden";
	killChildren(main.elements.tlChoiceBox)
}

function canProgress(skipping = false){
	const base = !scene.choice && !scene.backlogOpen && !scene.textBoxHidden && scene.started;
	if(skipping){
		return base;
	} else {
		return (scene.skippableAnimation || prefs.scene.skipAnim) && base;
	}
}

function switchView(){
	switch(main.view.current){
		case START_PAGE:
		break;
		case SCENE_SELECT:
			main.elements.foot.exit.innerHTML = "Random";
			main.elements.foot.skip.innerHTML = "Shuffle";
			main.elements.foot.auto.innerHTML = "Select: Scene";
			main.elements.foot.mode.innerHTML = prefs.select.mode ? "Mode: Scene" : "Mode: CG";
		break;
		case SCENE_VIEWER:
			main.elements.foot.exit.innerHTML = "Exit";
			main.elements.foot.skip.innerHTML = "Skip";
			main.elements.foot.auto.innerHTML = "Auto";
			main.elements.foot.mode.innerHTML = "Backlog";
		break;
		case OPTIONS_SCREEN:
		break;
		case SEARCH_SCREEN:
		break;
		case CG_VIEWER:
			main.elements.foot.exit.innerHTML = "Exit";
			main.elements.foot.skip.innerHTML = "Play Scene";
			main.elements.foot.auto.innerHTML = "";
			main.elements.foot.mode.innerHTML = cgViewer.slideshow ? "Mode: Slide" : "Mode: CG";
		break;
		case STORY_SELECT:
			main.elements.foot.auto.innerHTML = "Select: Story";
			main.elements.foot.skip.innerHTML = "";
			main.elements.foot.mode.innerHTML = "";
			main.elements.foot.exit.innerHTML = "";
		break;
		default:
		break;
	}
}

function jumpToAction(backwards = false){
	if(!(scene.type == H_RPGX || scene.type == H_TABA || scene.type == H_NECRO ||scene.type == H_OTOGI) || !canProgress(true)){
		return;
	}
	let jumped = false;
	main.pause.auto = isMode(MODE.AUTO);
	toggleOffSceneSkipping();
	toggleOffSceneAutoMode();
	
	if(backwards){
		let indexes = scene.jumpIndexes.slice().reverse();
		for(const [i, idx] of indexes.entries()){
			if(scene.index >= idx && i+1 < indexes.length){
				sceneJump(indexes[indexes.indexOf(idx) + 1]);
				jumped = true;
				break;
			}
		}
	} else {
		for(const idx of scene.jumpIndexes){
			if(scene.index < idx){
				sceneJump(idx);
				jumped = true;
				break;
			}
		}
	}
}


function toggleFullscreen(){
    if(document.fullscreenElement){
        document.exitFullscreen();
    } else {
        document.getElementById("body-wrapper").requestFullscreen();
    }
}