var selectQualityEl = document.querySelector("#extentions.czxzyyyk.livestreamer.quality");
var selectQualityOptions = document.querySelectorAll("#extentions.czxzyyyk.livestreamer.quality option");
var defaultValue = selectQualityOptions.length ? selectQualityOptions[selectQualityOptions.length - 1].value : "best";
var key = "extentions.czxzyyyk.livestreamer.quality";

function saveOptions(e) {
	var options = {};
		options[key] = selectQualityEl.value;

	browser.storage.local.set(options);
	e.preventDefault();
}

function restoreOptions() {
	var gettingItem = browser.storage.local.get(key);
	gettingItem.then((res) => {
		selectQualityEl.value = res.colour || defaultValue;
	});
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);