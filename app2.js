let items = document.getElementsByClassName('block');
let container = document.getElementsByClassName('container')[0];
let selectionRectangle = document.getElementsByClassName('rectangle')[0];
let singleDragActive = true;
let selectionTop, selectionBottom, selectionLeft, selectionRight;

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
generateBlocks(10);

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
	// console.log('mousedown');

	if (ev.shiftKey) {
		initializeCoords(ev);
		window.addEventListener('mousemove', mouseMoveShiftListener);
	} else {
		// if (isBlock(ev.target)) return;
		initializeCoords(ev);
		window.addEventListener('mousemove', mouseMoveListener);
	}
	// ev.stopImmediatePropagation();
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
	selectionRight = pageXOffset + ev.clientX;
	selectionBottom = pageYOffset + ev.clientY;
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
function selectAllInsideRectangle() {
	let [rectX1, rectY1, rectX2, rectY2] = calculateRectangleCoords();
	Array.from(items).forEach((item) => {
		let itemRect = item.getBoundingClientRect();
		let itemLeft = itemRect.x + window.pageXOffset;
		let itemRight = itemRect.width + itemLeft;
		let itemTop = itemRect.y + window.pageYOffset;
		let itemBottom = itemTop + itemRect.height;
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
function flipAllInsideRectangle() {
	let [rectX1, rectY1, rectX2, rectY2] = calculateRectangleCoords();
	if (rectX1 == rectX2 && rectY1 == rectY2) return;
	console.log([rectX1, rectY1, rectX2, rectY2]);
	Array.from(items).forEach((item) => {
		let itemRect = item.getBoundingClientRect();
		let itemLeft = itemRect.x + window.pageXOffset;
		let itemRight = itemRect.width + itemLeft;
		let itemTop = itemRect.y + window.pageYOffset;
		let itemBottom = itemTop + itemRect.height;
		if (
			isInsideRectangle(
				[rectX1, rectY1, rectX2, rectY2],
				[itemLeft, itemTop, itemRight, itemBottom]
			)
		) {
			flipSelection(item);
		}
	});
}
function checkBounds(ev) {
	let containerRect = container.getBoundingClientRect();
	return (
		ev.clientX > containerRect.x &&
		ev.clientY > containerRect.y &&
		ev.clientX < containerRect.x + containerRect.width &&
		ev.clientY < containerRect.y + containerRect.height
	);
}
function mouseMoveListener(ev) {
	if (ev.buttons) {
		if (checkBounds) {
			finalizeCoords(ev);
			drawRectangle();
		}

		selectAllInsideRectangle();
	} else {
		window.removeEventListener('mousemove', mouseMoveListener);
		selectionRectangle.style.display = 'none';
	}
}
function mouseMoveShiftListener(ev) {
	if (ev.shiftKey && ev.buttons) {
		finalizeCoords(ev);
		drawRectangle();
	} else {
		flipAllInsideRectangle();
		window.removeEventListener('mousemove', mouseMoveShiftListener);
		selectionRectangle.style.display = 'none';
	}
}
