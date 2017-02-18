if ( typeof czxzyyyk != "object" ) var czxzyyyk = {};

czxzyyyk.livestreamer = function init() {

	const {Cc,Ci} = require("chrome");

	var cm          = require("sdk/context-menu");
	var fs          = require("sdk/io/file");
	var tabs        = require('sdk/tabs');
	var environment = Cc["@mozilla.org/process/environment;1"].getService(Ci.nsIEnvironment);
	var paths       = environment.get("PATH").split(";");
	var prompts     = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);


	// check for exetables
	for (var i = 0, path, livesteamerPath, silentPath; i < paths.length; i++) {
		path = paths[i];

		if ( fs.exists(fs.join(path,"livestreamer.exe")) )
			livesteamerPath = fs.join(path,"livestreamer.exe");
		else if ( fs.exists(fs.join(path,"SilentCMD.exe")) )
			silentPath = fs.join(path,"SilentCMD.exe");
	}

	// setup contexts
	cm.Item({
		label: "Launch link url in livestreamer",
		context: cm.SelectorContext("a"),
		contentScript: 'self.on("click", function (node, data) {' +
									 '  self.postMessage(node.href);' +
									 '});',
		onMessage: runLivestreamer
	});

	cm.Item({
		label: "Launch selection in livestreamer",
		context: cm.SelectionContext(),
		contentScript: 'self.on("click", function () {' +
									 '  var text = window.getSelection().toString();' +
									 '  self.postMessage(text);' +
									 '});',
		onMessage: runLivestreamer
	});

	cm.Item({
		label: "Launch page url in livestreamer",
		context: cm.PageContext(),
		contentScript: 'self.on("click", function () {' +
									 '  self.postMessage();' +
									 '});',
		onMessage: function(){
			runLivestreamer(tabs.activeTab.url);
		}
	});

	// main
	function runLivestreamer(streamUrl){

		var quality = require("sdk/simple-prefs").prefs["extentions.czxzyyyk.livestreamer.quality"];
		var qualities = {
			"youtube": {
				"best": "best",
				"high": "720p",
				"medium": "480p",
				"low": "360p",
				"worst": "worst"
			},
			"twitch": {
				"best": "best",
				"high": "high",
				"medium": "medium",
				"low": "low",
				"worst": "mobile"
			},
			"other": {
				"best": "best",
				"high": "best",
				"medium": "best",
				"low": "worst",
				"worst": "worst"
			}
		};

		var provider = /youtu\.?be/.test(streamUrl) ? "youtube": /twitch/.test(streamUrl) ? "twitch" : "other";

		quality = qualities[provider][quality];

		if ( livesteamerPath ) {

			if ( silentPath )
				runFile(silentPath, [livesteamerPath, streamUrl, quality]);
			else
				runFile(livesteamerPath, [streamUrl, quality]);
		}
		else
			prompts.alert(null, "Error", "livestreamer.exe not found in PATH");
	}

	function runFile (path, args) {

		var
		localFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
		localFile.initWithPath(path);

		var
		process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
		process.init(localFile);

		args = args || [];

		process.run(false, args, args.length);
	}
};
czxzyyyk.livestreamer();