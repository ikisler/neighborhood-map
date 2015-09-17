/*****
"Neighborhood Map" by Isabeau Kisler
Shows a searchable list of locations of interest in the San Jose, CA area.

Project created for Udacity's Front End Nano-Degree using
Knockout.js, jQuery, Google Maps API and the Wikipedia API.

Oddities and fiddly-bits are labeled with the tag IMPORTANT!
-- If you are making changes to the script, please look over those parts first.

09/15
*****/
// Star icon from: Maps Icons Collection https://mapicons.mapsmarker.com

var locations = [
	{name: 'Rosicrucian Egyptian Museum',
	address: '1660 Park Ave, San Jose, CA 95191',
	tags: ['kids','adults','museum','educational','indoors','cheap'],
	link: 'http://www.egyptianmuseum.org/',
	selected: false,
	marker: '',
	wikiSnippet: '',
	infowindow: ''},

	{name: 'San Jose Municipal Rose Garden',
	address: 'Naglee Ave & Dana Ave San Jose, CA 95126',
	tags: ['kids','adults','nature','outdoors', 'cheap'],
	link: 'https://www.sanjoseca.gov/Facilities/Facility/Details/74',
	selected: false,
	marker: '',
	wikiSnippet: '',
	infowindow: ''},

	{name: 'Winchester Mystery House',
	address: '525 S Winchester Blvd, San Jose, CA 95128',
	tags: ['adults','educational','indoors'],
	link: 'www.winchestermysteryhouse.com',
	selected: false,
	marker: '',
	wikiSnippet: '',
	infowindow: ''},

	{name: "Children's Discovery Museum of San Jose",
	address: '180 Woz Way, San Jose, CA 95110',
	tags: ['kids','museum','educational','indoors'],
	link: 'https://www.cdm.org/',
	selected: false,
	marker: '',
	wikiSnippet: '',
	infowindow: ''},

	{name: 'Lick Observatory',
	address: '7281 Mt Hamilton Rd, Mt Hamilton, CA 95140',
	tags: ['adults','educational','cheap'],
	link: 'http://www.ucolick.org/main/index.html',
	selected: false,
	marker: '',
	wikiSnippet: '',
	infowindow: ''},

	{name: 'Emma Prusch Farm Park',
	address: '647 S King Rd, San Jose, CA 95116',
	tags: ['kids', 'adults', 'outdoors', 'cheap'],
	link: 'www.pruschfarmpark.org/',
	selected: false,
	marker: '',
	wikiSnippet: '',
	infowindow: ''},

	{name: 'The Tech Museum of Innovation',
	address: '201 S Market St, San Jose, CA 95113',
	tags: ['kids','adults','museum','educational'],
	link: 'https://www.thetech.org',
	selected: false,
	marker: '',
	wikiSnippet: '',
	infowindow: ''},

	{name: 'Raging Waters',
	address: '2333 South White Road, San Jose, CA 95148',
	tags: ['kids','adults','outdoors'],
	link: 'https://www.rwsplash.com',
	selected: false,
	marker: '',
	wikiSnippet: '',
	infowindow: ''},

	{name: 'Kelley Park',
	address: '1300 Senter Rd, San Jose, CA 95112',
	tags: ['kids','adults','outdoors','cheap'],
	link: 'http://www.sanjoseca.gov/facilities/Facility/Details/175',
	selected: false,
	marker: '',
	wikiSnippet: '',
	infowindow: ''},

	{name: 'History Park at Kelley Park',
	address: '635 Phelan Ave, San Jose, CA 95112',
	tags: ['kids','adults','museum','educational','outdoors','indoors','cheap'],
	link: 'http://historysanjose.org/wp/',
	marker: '',
	wikiSnippet: '',
	infowindow: ''},

	{name: 'Happy Hollow Park & Zoo',
	address: 'Story Road & Remillard, San Jose, CA 95112',
	tags: ['kids','educational','outdoors'],
	link: 'http://www.hhpz.org/',
	selected: false,
	marker: '',
	wikiSnippet: '',
	infowindow: ''},

	{name: 'Japanese Friendship Garden (Kelley Park)',
	address: '1300 Senter Rd, San Jose, CA 95112',
	tags: ['kids','adults','outdoors','cheap'],
	link: 'http://www.sanjoseca.gov/facilities/Facility/Details/350',
	selected: false,
	marker: '',
	wikiSnippet: '',
	infowindow: ''}
];
	/***
	Template:
			{name: '',
			address: '',
			tags: [],
			link: '',
			selected: false,
			marker: '',
			wikiSnippet: '',
			infowindow: ''},
	***/

var Location = function(data) {
	this.name = ko.observable(data.name);
	this.address = ko.observable(data.address);
	this.tags = ko.observableArray(data.tags);
	this.link = ko.observable(data.link);
	this.selected = ko.observable(data.selected);
	this.marker = ko.observable(data.marker);
	this.wikiSnippet = ko.observable(data.wikiSnippet);
	this.infowindow = ko.observable(data.infowindow);
};

var ViewModel = function() {
	var that = this;

	this.query = ko.observable('');

	this.locationList = ko.observableArray([]);

	this.map;
	// Default location for the center of the map
	this.defaultLocation = {lat: 37.33, lng: -121.85000000000002};

	var initialize = function() {
		// Populate locationList
		for(var i=0; i<locations.length; i++) {
		that.locationList.push(new Location(locations[i]));
		}

		// Get data from Wikipedia, populate locationList with the info
		that.getWikiData();
		
		// Create the map, markers, and populate locationList with markers and infowindows
		createMap();
	}

	// Gets data from Wikipedia, populates locationList with wikiSnippets
	this.getWikiData = function() {
		var wikiQuery;

		// If the wikiRequest times out, then display a message with a link to the Wikipedia page.
	    var wikiRequestTimeout = setTimeout(function() {
	    	var phrase = 'Unable to access Wikipedia.  Please check your internet connection, or try clicking here: <a href="';
	    	var wikiLink = 'https://en.wikipedia.org/wiki/';

			for(var i=0; i<that.locationList().length; i++) {
				that.locationList()[i].wikiSnippet(phrase + wikiLink + that.locationList()[i].name() + '" target="_blank">' + that.locationList()[i].name() + '</a>');
		    }
	    }, 1000);

		for(var i=0; i<that.locationList().length; i++) {
			wikiQuery = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + that.locationList()[i].name() + '&srproperties=snippet&format=json&callback=wikiCallback';

			$.ajax({url: wikiQuery,
		        dataType:'jsonp',
		        success: function(data) {
		        	// Go through the list and find the correct item, then add the wikiSnippet data
		        	for(var i=0; i<that.locationList().length; i++) {
		        		if(data[1][0] == that.locationList()[i].name()) {
		        			that.locationList()[i].wikiSnippet(data[2][0]);
		        		}
		        	}

		            clearTimeout(wikiRequestTimeout);
		        }
		    });
		}
		

	};

	// Creates the map, calls the codeAddress function to add markers, infowindows
	var createMap = function() {
		geocoder = new google.maps.Geocoder();
		// Create a new map and center on San Jose, CA
		this.map = new google.maps.Map(document.getElementById('map'), {
		center: that.defaultLocation,
		zoom: 11
		});

		/*** What's going on here?! ***/
		// This setTimeout is to give the Wikipedia queries enough time to come back with information before assigning them to a marker.
		setTimeout(function() {
			// To avoid the OVER_QUERY_LIMIT error, Google Maps requires spacing out queries when you have 10 or more.
			
			/*** IMPORTANT!
				This is currently set up to take 20 or less locations.  If, in the future, there are more locations added, this may have to be adjusted.
			***/

			// This loop places the first 10 markers
			for(var i=0; i<10; i++) {
					that.codeAddress(that.locationList()[i]);
			}

			// This setTimeout allows 1 second to go by, then places the rest of the markers.
			setTimeout(function() {
				for(var i=10; i<that.locationList().length; i++) {
					that.codeAddress(that.locationList()[i]);
				}
			}, 1000);
		}, 1000);

	};

	// Add marker to map, assign click listener and infowindow to it
	this.codeAddress = function(thisLocation) {
		geocoder.geocode( {address:thisLocation.address()}, function(results, status) 
		{
			if (status == google.maps.GeocoderStatus.OK) {
				// Place a map marker at the location
				var marker = new google.maps.Marker(
				{
					map: map,
					position: results[0].geometry.location,
					title: thisLocation.name(),
					icon: 'https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-blue.png&psize=16&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1'
				});

				// Add click listener
				that.addClickListener(thisLocation, marker);

				// Add infowindow
				tempInfowindow = that.addInfowindow(thisLocation, marker);

				// Put each marker and infowindow into it's associated object
				for(var i=0; i<that.locationList().length; i++) {
					if(marker.title === that.locationList()[i].name()) {
						that.locationList()[i].marker(marker);
						that.locationList()[i].infowindow(tempInfowindow);
					}
				}
			} else {
				/*** IMPORTANT!
					If a location is added that has the exact coordinates listed below, then a new location should be selected.
					(This also would have to be changed in the addInfowindow function, below).
				***/
				// If the geocoder fails, place the marker in the center of San Jose, so at least the user can look at the infowindow and access that information.
				var marker = new google.maps.Marker({
					map: map,
					position: that.defaultLocation,
					title: thisLocation.name(),
					icon: 'https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-blue.png&psize=16&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1'
				});

				// Add click listener
				that.addClickListener(thisLocation, marker);

				// Add infowindow
				tempInfowindow = that.addInfowindow(thisLocation, marker);

				// Put each marker and infowindow into it's associated object
				for(var i=0; i<that.locationList().length; i++) {
					if(marker.title === that.locationList()[i].name()) {
						that.locationList()[i].marker(marker);
						that.locationList()[i].infowindow(tempInfowindow);
					}
				}
			}
		});
	};

	// Adds click listener to markers
	this.addClickListener = function(thisLocation, marker) {
		marker.addListener('click', function() {
			// Set the selected for this as true
			thisLocation.selected(true);
			// Call the select function to enact the select changes
			that.selectFromList(thisLocation);
		});
	};

	// Adds infowindow to markers
	this.addInfowindow = function(thisLocation, marker) {
		// Check to see if there were problems with geocoder, and add a special note if there was
		var geocoderError = "";

		if(marker.getPosition().lat()===that.defaultLocation.lat && marker.getPosition().lng()===that.defaultLocation.lng) {
			geocoderError = "<p>Please note that there was an error, and this map location does not reflect the actual location of the attraction.</p>"
		}

		var contentString = '<div id="content" style="color:black;">'+
		    '<div id="siteNotice">'+
		    '</div>'+
		    '<h1 id="first-heading" class="first-heading">' + marker.title +'</h1>'+
		    '<div id="body-content">'+
		    '<div class="wiki-snip">' + thisLocation.wikiSnippet() + '</div>' + geocoderError +
		    '</div>'+
		    '</div>';
		var infowindow = new google.maps.InfoWindow({
			content: contentString
		});

		return infowindow;
	};

	// Show both the marker AND the location-list-item as selected
	this.selectFromList = function(index) {
		that.selectMarker(index.marker());
		that.highlightListItem(index.name());
	};

	// Selects the desired marker on the map by changing it's icon into a star
	this.selectMarker = function(marker) {
		var infoWin;

		// Iterate through the locations.
		for(var i=0; i<that.locationList().length; i++) {
			// De-select the other markers, assign them the default icon, and close the open infowindow.
			if(that.locationList()[i].name() != marker.title) {
				// Set selected to false
				that.locationList()[i].selected(false);
				// Set the icon to the default
				that.locationList()[i].marker().setIcon('https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-blue.png&psize=16&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1');
				// Close the infowindow
				infoWin = that.locationList()[i].infowindow();
				infoWin.close(map, marker);
			// Put the star icon and open the info window for the selected marker
			} else {
				// Star icon from: Maps Icons Collection https://mapicons.mapsmarker.com
				marker.setIcon('mapicons/star-3.png');
				infoWin = that.locationList()[i].infowindow();
				infoWin.open(map, marker);
			}

		}
	};

	// Highlight the desired item from location-list-item
	this.highlightListItem = function(selectedName) {
		var locationListItems = document.getElementsByClassName('location-list-item');

		// Grab the first location-list-item
		var locationListItems = $('.location-list-item').first();
		// Get the number of location-list-items for the loop
		var numLocationListItems = $('.location-list-item').toArray().length;


		for(var i=0; i<numLocationListItems; i++) {
			// If it is already selected, deselect it
			if(locationListItems.hasClass('item-selected')) {
				locationListItems.removeClass('item-selected');
			}
			// If the item is selected, then select it
			if(locationListItems.children('.location-title').text() === selectedName) {
				locationListItems.addClass('item-selected');
			}

			// Go to the next location-list-item
			locationListItems = locationListItems.next();
		}
	};

	// Filters the showing location-list-items and markers.  This is data-binded to the Search box ('.search-box') to activate on keyup.
	// Searches the location-list-item name and tags for matches.
	this.search = function() {
		// Put the query into lowercase
		var queryLowerCase = that.query().toLowerCase();
		// Grab the first location-list-item
		var locationListItems = $('.location-list-item').first();
		// Get the number of location-list-items for the loop
		var numLocationListItems = $('.location-list-item').toArray().length;

		/*** IMPORTANT!
			This takes advantage of the fact that both the locationList and the location-list-items are in the same order, thus sharing index numbers.
			If some future addition changes this, then adjustments will need to be made.
		***/

		// Loop through location-list-items
		for(var i=0; i<numLocationListItems; i++) {
			// If the item's hidden, reveal it
			if(locationListItems.hasClass('item-hidden')) {
				locationListItems.removeClass('item-hidden');
				// Set the marker to visible
				that.locationList()[i].marker().setVisible(true);
			}
			// If the item name or tags don't match the query, hide it
			if(locationListItems.children('.location-title').text().toLowerCase().search(queryLowerCase) < 0 && locationListItems.find('.location-tag-item').text().search(queryLowerCase) < 0) {
				locationListItems.addClass('item-hidden');
				// Set the marker to invisible
				that.locationList()[i].marker().setVisible(false);
				// Close the infowindow, if opened
				that.locationList()[i].infowindow().close(map, that.locationList()[i].marker());
			}

			// Go to the next location-list-item
			locationListItems = locationListItems.next();
		}
	};

	this.initializeTHAT = initialize();

};

ko.applyBindings(new ViewModel());
