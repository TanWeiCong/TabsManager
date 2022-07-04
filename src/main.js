var keyFuncs = {
  url: (t) => t.url,
  domain: (t) => new URL(t.url).hostname,
  title: (t) => t.title,
  access: (t) => t.lastAccessed,
};

for(let el of document.querySelectorAll(".option")) {
  el.addEventListener("click", (e) => {
    sortTabsByKey(e.target.id);
  });
}

async function sortTabsByKey(keyName) {
  let tabs = await browser.tabs.query({windowId: browser.windows.WINDOW_ID_CURRENT});
  tabs.sort((a, b) => a.index - b.index);
  let oldPositions = tabs.map((t) => t.index);

  let keyFunc;
  if(keyName === "shuffle") {
    keyFunc = (t) => Math.floor(Math.random() * tabs.length * 100);
  }
  else if(keyName === "merge") {
	  var windowQuery = getWindow();	
		windowQuery.then(getWindowId, onError);
		var tabQuery = getAllTabs();
		tabQuery.then(wrangleTabs, onError);
  }
  else if(keyName === "delete") {
	var windowQuery = getWindowWithTabs();	
	windowQuery.then(removeDuplicates, onError);
  }
  else {
    keyFunc = keyFuncs[keyName];
  }

  let sorter = (lhs, rhs) => {
    let a = keyFunc(lhs);
    let b = keyFunc(rhs);
    if(typeof a === "string") {
      return a.localeCompare(b);
    }
    return a - b;
  };

  tabs.sort(sorter);
  if(document.getElementById("reverse").checked) {
    tabs.reverse();
  }

  for(let index = 0; index < tabs.length; ++index) {
    let tab = tabs[index];
    await browser.tabs.move(tab.id, {index: oldPositions[index] });
  }
}

var windowId;

function getTabs() {
	return browser.tabs.query({currentWindow: true});
}

function getAllTabs() {
	return browser.tabs.query({});
}

function getWindow() {
	return browser.windows.getCurrent();
}

function getWindowWithTabs() {
	return browser.windows.getCurrent({populate: true});
}

function getWindowId(window) {
	windowId = window.id;
}

function wrangleTabs(tabs) {
	for (var i = 0; i < tabs.length; i++) {
		browser.tabs.move(tabs[i].id, {windowId: windowId, index: 0});
	}
}

function removeDuplicates(window) {
	var tabSet = new Set();
	var toDelete = [];
	for (var i = 0; i < window.tabs.length; i++) {
		if (!tabSet.has(window.tabs[i].url))
			tabSet.add(window.tabs[i].url);
		else
			toDelete.push(window.tabs[i].id);
	}

	for (var i = 0; i < toDelete.length; i++) {
		browser.tabs.remove(toDelete[i]);
	}
}

function onError() {
	console.log("Error");
}