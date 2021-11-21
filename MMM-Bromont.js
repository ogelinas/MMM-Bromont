/* global Module */

/* Magic Mirror
 * Module: MMM-Bromont
 *
 * By Olivier Gélinas
 * MIT Licensed.
 */

Module.register("MMM-Bromont", {
	defaults: {
		updateInterval: 3600000,
		retryDelay: 5000,
		recaps: ["versant", "remontes", "pistes", "snowparks", "apline", "raquette" ,"stationnement"],
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		this.loaded = false;

		setInterval(function() {
			self.getData();
			self.updateDom();
		}, this.config.updateInterval);

		// Schedule update timer.
		this.getData();
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function() {
		// var self = this;

		data = {"recap": this.config.recaps};
		this.sendSocketNotification("MMM-Bromont-Sending", data);
		
		// var self = this;

		// var urlApi = "https://www.bromontmontagne.com/conditions-detaillees/";
		// var retry = true;

		// var dataRequest = new XMLHttpRequest();
		// dataRequest.open("GET", urlApi, true);
		// dataRequest.setRequestHeader("Access-Control-Allow-Origin", "true");
		// dataRequest.onreadystatechange = function() {
		// 	console.log(this.readyState);
		// 	if (this.readyState === 4) {
		// 		console.log(this.status);
		// 		if (this.status === 200) {
		// 			self.processData(JSON.parse(this.response));
		// 		} else if (this.status === 401) {
		// 			self.updateDom(self.config.animationSpeed);
		// 			Log.error(self.name, this.status);
		// 			retry = false;
		// 		} else {
		// 			Log.error(self.name, "Could not load data.");
		// 		}
		// 		if (retry) {
		// 			self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
		// 		}
		// 	}
		// };
		// dataRequest.send();
	},


	

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},

	getDom: function() {
		var self = this;

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");

		var header = document.createElement('header');
		header.innerHTML = "Ski Bromont";
		wrapper.appendChild(header);

		// Data from helper
		if (this.dataNotification) {

			if (!this.dataNotification.error) {

				if (this.dataNotification.response.statusCode == 200) {
					var conditions = this.dataNotification.conditions;

					if (conditions != []) {

						// Table
						var table = document.createElement("table");
						wrapper.appendChild(table);
						table.className = "small";

						conditions.forEach(recap => {
							// Row
							var tr = document.createElement("tr");
							table.appendChild(tr);
							tr.className = "light";
							table.append(tr);

							// Section title
							var td = document.createElement("td");
							td.innerHTML = recap.title;
							td.classList.add("normal", "bright", "name");
							tr.append(td);

							// Day Open / Day Total
							var td = document.createElement("td");
							td.innerHTML = recap.day_open;
							// td.innerHTML = "888";
							td.classList.add("status", "status_day");
							var span = document.createElement("span");
							span.innerHTML = " / " + recap.day_total;
							// span.innerHTML = " / " + "888";
							span.className = "xsmall light";
							td.append(span);
							tr.append(td);

							// Night Open / Night Total
							var td = document.createElement("td");
							td.innerHTML = recap.night_open;
							// td.innerHTML = "888";
							td.className = "status"
							var span = document.createElement("span");
							span.innerHTML = " / " + recap.night_total;
							// span.innerHTML = " / " + "888";
							span.className = "xsmall light";
							td.append(span);
							tr.append(td);

							if (recap.details) {
								
								var details = recap.details;

								details.forEach(detail => {
									var tr = document.createElement("tr");
									table.append(tr);
				
									var td = document.createElement("td");
									
									// Icon
									var iconContainer = document.createElement("span");
									iconContainer.classList.add("ico-container");
									iconContainer.appendChild(self.svgIconFactory(detail.legend));
									td.append(iconContainer);

									// Name
									td.innerHTML = td.innerHTML + this.truncate(detail.name);
									td.classList.add("xsmall", "light", "detail");
									tr.append(td);

									// Status Day
									var td = document.createElement("td");
									td.innerHTML = detail.status_day;
									// td.innerHTML = "Ouvert";
									td.className = "xsmall light status";
									tr.append(td);

									// Status Night
									var td = document.createElement("td");
									td.innerHTML = detail.status_night;
									td.className = "xsmall light status";
									tr.append(td);
								});
							}
						});
					}
				} else if (this.dataNotification.response.statusCode == 401) {
					//self.updateDom(self.config.animationSpeed);
					console.error(self.name, this.status);
					this.retry = false;
				} else {
					// Log.error(self.name, "Could not load data.");
					console.error(self.name + ": "+ this.dataNotification.response.statusCode);
					this.retry = false;
				}
			} else {
				// Error

			}

			
		}
		return wrapper;
	},

	getScripts: function() {
		return [];
	},

	getStyles: function () {
		return [
			"MMM-Bromont.css",
		];
	},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			es: "translations/es.json"
		};
	},

	// processData: function(data) {
	// 	var self = this;
	// 	this.dataRequest = data;
	// 	if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
	// 	this.loaded = true;

	// 	// the data if load
	// 	// send notification to helper
	// 	data = null;
	// 	this.sendSocketNotification("MMM-Bromont-Sending", data);
	// },

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "MMM-Bromont-Receiving") {
			// set dataNotification
            this.dataNotification = payload;
			console.log(payload);
			console.log( Date.now());
			this.updateDom();
		}
	},

	svgIconFactory: function(glyph) {
		var object = document.createElementNS('http://www.w3.org/2000/svg', "object");
		object.setAttributeNS(null, "data", this.file("icons/" + glyph + ".svg"));
		object.setAttributeNS(null, "type", "image/svg+xml");
		object.setAttributeNS(null, "class", "ico-container-size");
		return(object)
	  }, 

	truncate: function(str) {
		var length = 30;
		if ((str.constructor === String) && (length>0)) {
			if (str.length > length) {
				return str.slice(0, length) + '…';
			} else {
				return str;
			}
		} else {
			return str;
		}
	},
});