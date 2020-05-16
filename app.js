let items = document.getElementsByClassName('block');
let container = document.getElementsByClassName('container')[0];

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

//select item
function selectItem(item) {
	item.classList.add('selected');
}
//unselect item
function unselectItem(item) {
	item.classList.remove('selected');
}

//adding click listener to all items
Array.from(items).forEach((item) => {
	//unselection all items before selecting one
	item.addEventListener('click', (ev) => {
		if (!ev.shiftKey) {
			Array.from(items).forEach((block) => {
				unselectItem(block);
			});
			selectItem(item);
		}
		// else flipSelected(item);
	});
});

let topC, left, bottom, right;

function mouseDownListener(ev) {
	// console.log(ev.clientX, ev.clientY);
	// console.log(ev.shiftKey, ev.ctrlKey, ev.altKey);
	if (ev.shiftKey) {
		topC = ev.clientY + window.pageYOffset;
		left = ev.clientX + window.pageXOffset;
		console.log('Top, left -> ', topC, left);
		window.addEventListener('mousemove', mouseMoveListener);
		window.addEventListener('mouseup', mouseUpListener);
	}
}
function mouseMoveListener(ev) {
	if (!ev.shiftKey) {
		removeMouseEventListener(ev);
	}
}
function mouseUpListener(ev) {
	removeMouseEventListener(ev);
}
function removeMouseEventListener(ev) {
	window.removeEventListener('mousemove', mouseMoveListener);
	window.removeEventListener('mouseup', mouseUpListener);
	bottom = ev.clientY + window.pageYOffset;
	right = ev.clientX + window.pageXOffset;
	console.log('Bottom, Right -> ', bottom, right);
	toggleSelection();
}
window.addEventListener('mousedown', mouseDownListener);

function toggleSelection() {
	let sl = Math.min(left, right);
	let sr = Math.max(left, right);
	let st = Math.min(topC, bottom);
	let sb = Math.max(topC, bottom);
	Array.from(items).forEach((item) => {
		let rect = item.getBoundingClientRect();
		let el = rect.x + window.pageXOffset;
		let er = el + rect.width;
		let et = rect.y + window.pageYOffset;
		let eb = et + rect.height;
		if (isInsideRectangle({ st, sb, sl, sr }, { et, eb, el, er })) {
			flipSelected(item);
		}
	});
}
function isInsideRectangle({ st, sb, sl, sr }, { et, eb, el, er }) {
	return !(et > sb || eb < st || er < sl || sr < el);
}
function flipSelected(item) {
	if (item.classList.contains('selected')) {
		item.classList.remove('selected');
	} else item.classList.add('selected');
}
//TODO:add window event listener to unselect all nodes
