let items = document.getElementsByClassName('block');
let container = document.getElementsByClassName('container')[0];
let selectionRectangle = document.getElementsByClassName('rectangle')[0];
let singleDragActive = true;
let selectionTop, selectionBottom, selectionLeft, selectionRight;
let boundTop, boundBottom, boundLeft, boundRight;
let timerID = null;
let timeout = 0;

//generate n*3 div blocks and add class names
function generateBlocks(n) {
	for (let i = 0; i < n; i++) {
		let divDoc = document.createElement('div');
		let divFolder = document.createElement('div');
		let divMovie = document.createElement('div');
		divDoc.classList.add('block', 'document');
		divFolder.classList.add('block', 'folder');
		divMovie.classList.add('block', 'movie');
		container.appendChild(divDoc);
		container.appendChild(divFolder);
		container.appendChild(divMovie);
	}
}
generateBlocks(100);

function getBounds() {
	let html = document.documentElement;
	boundLeft = 0;
	boundTop = 0;
	boundBottom = html.scrollHeight;
	boundRight = html.scrollWidth;
	return [boundLeft, boundTop, boundRight, boundBottom];
}
//---------------------------------

//select item
function selectItem(item) {
	item.classList.add('selected');
}
//unselect item
function unselectItem(item) {
	item.classList.remove('selected');
}
function isSelected(item) {
	return item.classList.contains('selected');
}

function isBlock(item) {
	return item.classList.contains('block');
}
function unselectAll() {
	Array.from(items).forEach((block) => {
		unselectItem(block);
	});
}
function flipSelection(item) {
	if (isSelected(item)) unselectItem(item);
	else selectItem(item);
}
window.addEventListener('click', (ev) => {
	// console.log('click');
	if (isBlock(ev.target)) {
		if (!ev.shiftKey) {
			unselectAll();
			selectItem(ev.target);
		} else {
			flipSelection(ev.target);
		}
	}
});
window.addEventListener('mousedown', (ev) => {
	initializeCoords(ev);
	if (ev.shiftKey) {
		window.addEventListener('mousemove', mouseMoveShiftListener);
	} else {
		window.addEventListener('mousemove', mouseMoveListener);
	}
});

function calculateRectangleCoords() {
	let rectX1 = Math.min(selectionLeft, selectionRight);
	let rectX2 = Math.max(selectionLeft, selectionRight);
	let rectY1 = Math.min(selectionTop, selectionBottom);
	let rectY2 = Math.max(selectionTop, selectionBottom);
	return [rectX1, rectY1, rectX2, rectY2];
}

function initializeCoords(ev) {
	selectionTop = window.pageYOffset + ev.clientY;
	selectionLeft = window.pageXOffset + ev.clientX;
	selectionBottom = selectionTop;
	selectionRight = selectionLeft;
}

function finalizeCoords(ev) {
	let [boundLeft, boundTop, boundRight, boundBottom] = getBounds();
	selectionRight = Math.min(pageXOffset + ev.clientX, boundRight);
	selectionBottom = Math.min(pageYOffset + ev.clientY, boundBottom);
}

function drawRectangle() {
	let [rectX1, rectY1, rectX2, rectY2] = calculateRectangleCoords();
	selectionRectangle.style.left = rectX1 + 'px';
	selectionRectangle.style.top = rectY1 + 'px';
	selectionRectangle.style.width = rectX2 - rectX1 + 'px';
	selectionRectangle.style.height = rectY2 - rectY1 + 'px';
	selectionRectangle.style.display = 'block';
}
function isInsideRectangle(
	[rectX1, rectY1, rectX2, rectY2],
	[itemLeft, itemTop, itemRight, itemBottom]
) {
	return (
		!(
			rectY1 > itemBottom ||
			rectX1 > itemRight ||
			rectX2 < itemLeft ||
			rectY2 < itemTop
		) &&
		!(
			rectY1 > itemTop &&
			rectX1 > itemLeft &&
			rectX2 < itemRight &&
			rectY2 < itemBottom
		)
	);
}

function getItemCoords(item) {
	let itemRect = item.getBoundingClientRect();
	let itemLeft = itemRect.x + window.pageXOffset;
	let itemRight = itemRect.width + itemLeft;
	let itemTop = itemRect.y + window.pageYOffset;
	let itemBottom = itemTop + itemRect.height;
	return [itemLeft, itemTop, itemRight, itemBottom];
}
function selectAllInsideRectangle() {
	let [rectX1, rectY1, rectX2, rectY2] = calculateRectangleCoords();
	Array.from(items).forEach((item) => {
		let [itemLeft, itemTop, itemRight, itemBottom] = getItemCoords(item);
		if (
			isInsideRectangle(
				[rectX1, rectY1, rectX2, rectY2],
				[itemLeft, itemTop, itemRight, itemBottom]
			)
		) {
			selectItem(item);
		} else unselectItem(item);
	});
}
function processAllInsideRectangle() {
	let [rectX1, rectY1, rectX2, rectY2] = calculateRectangleCoords();
	if (rectX1 == rectX2 && rectY1 == rectY2) return;

	Array.from(items).forEach((item) => {
		let [itemLeft, itemTop, itemRight, itemBottom] = getItemCoords(item);
		if (
			isInsideRectangle(
				[rectX1, rectY1, rectX2, rectY2],
				[itemLeft, itemTop, itemRight, itemBottom]
			)
		) {
			// console.log(item.classList);
			if (isSelected(item)) {
				item.classList.add('unselecting');
			} else item.classList.add('selecting');
		} else {
			item.classList.remove('selecting', 'unselecting');
		}
	});
}
function finalProcess() {
	Array.from(items).forEach((item) => {
		if (item.classList.contains('selecting')) {
			item.classList.remove('selecting');
			selectItem(item);
		} else if (item.classList.contains('unselecting')) {
			item.classList.remove('unselecting');
			unselectItem(item);
		}
	});
}

function mouseMoveListener(ev) {
	if (ev.buttons) {
		finalizeCoords(ev);
		drawRectangle();
		if (!timerID) {
			timerID = setTimeout(() => {
				selectAllInsideRectangle();
				console.log('hello');
				timerID = null;
			}, timeout);
		}
	} else {
		window.removeEventListener('mousemove', mouseMoveListener);
		selectionRectangle.style.display = 'none';
	}
}
function mouseMoveShiftListener(ev) {
	if (ev.shiftKey && ev.buttons) {
		finalizeCoords(ev);
		drawRectangle();
		if (!timerID) {
			timerID = setTimeout(() => {
				processAllInsideRectangle();
				console.log('hello yourself');
				timerID = null;
			}, timeout);
		}
	} else {
		finalProcess();
		window.removeEventListener('mousemove', mouseMoveShiftListener);
		selectionRectangle.style.display = 'none';
	}
}