 Module.register('MMM-fitbit',{
	
	userData: {
		steps: 0,
		heart: 0
	},
	
	goals: {
		steps: 10000,
		heart: 0
	},
	
	// Default module config.
	defaults: {
		credentials: {
			client_id: '228JPM',
			client_secret: '79bbd05b3e18723d4730bcc6f64d68b0'
		},
		resources: [
			'steps',
			'heart'
		],
		update_interval: 60
	},
	
	// Define required scripts.
	getStyles: function() {
		return ["MMM-fitbit.css"];
	},
	
	// Override socket notification handler.
	socketNotificationReceived: function(notification, payload) {
		if (notification === "DATA"){
			resource = payload['resource'];
			if (this.inResources(resource)) {
				this.userData[resource] = payload['values']['data'];
				this.goals[resource] = payload['values']['goal'];
				Log.log("Writing " + resource + " (data/goal): " + this.userData[resource] + "/" + this.goals[resource]);
			}
		}
		if (notification === "UPDATE") {
			Log.log('Updating Dom');
			this.updateDom(this.fadeSpeed);
		}
	},
	
	// Initialisation
	start: function() {
		Log.info('Starting module: ' + this.name);
		this.sendSocketNotification('SET CREDS',this.config.credentials)
		this.sendSocketNotification('GET DATA', 'intial');
		
		this.fadeSpeed = 500;
		
		// Schedule update interval.
		var self = this;
		setInterval(function() {
			self.updateData();
		}, this.config.update_interval*60*1000);
	},
	
	// Updates the data from fitbit
	updateData: function() {
		this.sendSocketNotification('GET DATA', 'Update');
	},
	
	// Checks whether the user wants to lookup a resourse type
	inResources: function(resource) {
		return this.config.resources.indexOf(resource) > -1;
	},
	
	// Converts minutes into HH:MM
	minsToHourMin: function(number) {
		hours = Math.floor(number / 60);
		minutes = number % 60;
		return ("00" + hours.toString()).slice(-2) + ":" + ("00" + minutes.toString()).slice(-2);
	},
	
	// WIdth of the progress bar
	progressBar: function(resource) {
		if (this.userData[resource] >= this.goals[resource]) {
			return 100;
		} else {
			return Math.round(Number(this.userData[resource]) / this.goals[resource] * 100)
		}
	},
	
	// Make each resource element for the UI
	UIElement: function(resource) {
		iconPath = '/img/' + resource + 'White.png';
		// Create wrappers
		var wrapper = document.createElement("div");
		var icon = document.createElement("img");
		var text = document.createElement("div");
		var userData = document.createElement("div")
		var suffix = document.createElement("div");
		var progress = document.createElement("div");
		var bar = document.createElement("div");
		
		// Icon
		icon.className = 'fitbiticon';
		icon.src = 'modules/' + this.name + iconPath;
		
		
		// Make text on the same line
		userData.style.display = 'inline-block';
		suffix.style.display = 'inline-block';
		
		// Progress bar
		progress.className = 'progbarbkg';
		
		bar.className = 'progbar';
		bar.style.width = this.progressBar(resource) + '%';
		
		if (resource !== 'heart') {
			progress.appendChild(bar);
		}
		
		// Put them all together
		wrapper.appendChild(icon);
		text.appendChild(userData);
		if (['heart'].indexOf(resource) > -1) {
			text.appendChild(suffix);
		}
		wrapper.appendChild(text);
		wrapper.appendChild(progress);
		
		wrapper.style.display = 'inline-block';
		wrapper.style.paddingLeft = '5px';
		wrapper.style.paddingRight = '5px';
		
		return wrapper;
	},
	
	// Override dom generator.
	getDom: function() {
		// Create Wrappers
		var wrapper = document.createElement("div");
		
		for (resource in this.config.resources) {
			wrapper.appendChild(this.UIElement(this.config.resources[resource]));
		}
		
		return wrapper;
	},
});
