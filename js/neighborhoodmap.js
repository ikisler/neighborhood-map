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
/*	
			{name: 'Japanese Friendship Garden at Kelley Park',
			address: '1300 Senter Rd, San Jose, CA 95112',
			tags: ['kids','adults','outdoors','cheap'],
			link: 'http://www.sanjoseca.gov/facilities/Facility/Details/350',
			selected: false,
			marker: '',
			wikiSnippet: '',
			infowindow: ''}
*/
	/***
	Template:
			{name: '',
			address: '',
			tags: [],
			link: ''}, */
		];

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

			var initialize = function() {
				// POPULATE locationList
				for(var i=0; i<locations.length; i++) {
				that.locationList.push(new Location(locations[i]));
				}

				that.getWikiData();
				
				// CREATE map
				// CREATE markers
				// POPULATE locationList w/ markers
				createMap();
			}


			this.getWikiData = function() {
				var wikiQuery;

				for(var i=0; i<that.locationList().length; i++) {
					wikiQuery = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + that.locationList()[i].name() + '&srproperties=snippet&format=json&callback=wikiCallback';

					$.ajax({url: wikiQuery,
				        dataType:'jsonp',
				        success: function(data) {

				        	for(var i=0; i<that.locationList().length; i++) {
				        		if(data[1][0] == that.locationList()[i].name()) {
				        			that.locationList()[i].wikiSnippet(data[2][0]);
				        		}
				        	}

				            clearTimeout(wikiRequestTimeout);
				        }
				    });
				}

/****		Move this entire section up into the for loop above: ******/
			    var wikiRequestTimeout = setTimeout(function() {
			    	console.log("FAIL");

			        //$wikiElem.text('Failed to get Wikipedia resources');
			    }, 8000);

			};

			var createMap = function() {
				geocoder = new google.maps.Geocoder();
				// Create a new map and center on San Jose, CA
				this.map = new google.maps.Map(document.getElementById('map'), {
				center: {lat: 37.33, lng: -121.85},
				zoom: 11
				});

				// Wait long enough for the Wikipedia information to load and be ready for infowindows
				setTimeout(function() {
					// Add map markers for each location
					for(var i=0; i<that.locationList().length; i++) {
						// Use setTimeout to space out query requests, and avoid OVER_QUERY_LIMIT error
						//setTimeout(that.codeAddress(that.locationList()[i]), 1000 * i);
						that.codeAddress(that.locationList()[i]);
					}

					// Try this approach:
					//	http://rizsharif.blogspot.com/2010/10/recursion-settimeout-to-simulate-pause.html
					//	https://discussions.udacity.com/t/how-do-i-troubleshoot-google-map-problems-when-there-are-no-errors-in-console/25256/5?u=ikisler


				}, 1000);
			};

			// Adds markers to map
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
						console.log('Geocode was not successful for the following reason: ' + status);
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
				var contentString = '<div id="content" style="color:black;">'+
				    '<div id="siteNotice">'+
				    '</div>'+
				    '<h1 id="firstHeading" class="firstHeading">' + marker.title +'</h1>'+
				    '<div id="bodyContent">'+
				    '<div class="wiki-snip">' + thisLocation.wikiSnippet() + '</div>' +
				    '</div>'+
				    '</div>';
				var infowindow = new google.maps.InfoWindow({
					content: contentString
				});

				return infowindow;
			};

			this.select = function(marker) {

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
						marker.setIcon('mapicons/star-3.png');
						infoWin = that.locationList()[i].infowindow();
						infoWin.open(map, marker);
					}

				}
			};

			this.selectFromList = function(index) {
				that.select(index.marker());

				that.highlightListItem(index.name());
			};

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

				// Shitty javascript-only version
/*				for(var i=0; i<locationListItems.length; i++) {
					// If it is selected, deselect it
					if(locationListItems[i].className.search('item-selected') > 0) {
						// will have to fix this later, with the addition of the search function
						locationListItems[i].className = locationListItems[i].className.slice(0, locationListItems[i].className.search('item-selected'));
					}
					// Use both innerText and textContent for browser compatibility
					if(locationListItems[i].firstElementChild.innerText === selectedName || locationListItems[i].firstElementChild.textContent === selectedName) {
						locationListItems[i].className = locationListItems[i].className + ' item-selected';
					}

				} */
				
				/*
				for( all the items in .location-list )
					remove the item-selected class

					if(the name of this item is the same as the selectedName)
						add the item-selected class
				*/

				/*
				var locationListElement = $('.location-list');
				var strTemp = '';

				for(var i=0; i<locationListItems.length; i++) {
					strTemp = '.location-list:nth-child(' + (i+1) + ')';

					console.log($('ul:first-child'));
					//console.log($(strTemp).first().text());
					//console.log($('.location-list:nth-child(1)'));

					//$(strTemp).first().removeClass('item-selected');

					//if($(strTemp).first().text() === selectedName) {
						$(strTemp).addClass('item-selected');
					//}
				}

				//locationListItems = $('location-list').first();

// structure:
//				location-list
//					location-list-item
//						name
/*
	Get the location-list object, then use nth-child to access each location-list-item.  Use first().text() to get name of item.
*/
			};

			this.search = function() {
				//	http://codepen.io/prather-mcs/pen/KpjbNN
				//	https://discussions.udacity.com/t/knockout-form-and-search-bar/29018/7

				// Put the query into lowercase, for easy searching
				var queryLowerCase = that.query().toLowerCase();
				// Grab the first location-list-item
				var locationListItems = $('.location-list-item').first();
				// Get the number of location-list-items for the loop
				var numLocationListItems = $('.location-list-item').toArray().length;

				/**** IMPORTANT!
					This takes advantage of the fact that both the locationList and the location-list-items are in the same order, thus sharing index numbers.
					If some future addition changes this, then adjustments will need to be made.
				****/

				// Loop through location-list-items
				for(var i=0; i<numLocationListItems; i++) {
					// If the item's hidden, reveal it
					if(locationListItems.hasClass('item-hidden')) {
						locationListItems.removeClass('item-hidden');
						// Set the marker to being visible
						that.locationList()[i].marker().setVisible(true);
					}
					// If the item name or tags don't match the query, hide it
					if(locationListItems.children('.location-title').text().toLowerCase().search(queryLowerCase) < 0 && locationListItems.find('.location-tag-item').text().search(queryLowerCase) < 0) {
						locationListItems.addClass('item-hidden');
						// Set the marker to being invisible
						that.locationList()[i].marker().setVisible(false);
						// Close the infowindow, if opened
						that.locationList()[i].infowindow().close(map, that.locationList()[i].marker());
					}

					// Go to the next location-list-item
					locationListItems = locationListItems.next();
				}
/*	Beautiful, flawed javascript-only version
				var locationListItems = document.getElementsByClassName('location-list-item');
				for(var i=0; i<locationListItems.length; i++) {
					// If it doesn't match, reveal it:
					if(locationListItems[i].className.search('item-hidden') > 0) {
						// will have to fix this later, with the addition of the search function
						locationListItems[i].className = locationListItems[i].className.slice(0, locationListItems[i].className.search('item-hidden'));
						// Set the marker to being visible
						that.locationList()[i].marker().setVisible(true);
					}
					// Use both innerText and textContent for browser compatibility
					if(locationListItems[i].firstElementChild.innerText.toLowerCase().search(queryLowerCase) < 0 || locationListItems[i].firstElementChild.textContent.toLowerCase().search(queryLowerCase) < 0 ) {
						console.log("BING");
						locationListItems[i].className = locationListItems[i].className + ' item-hidden';
						// Set the marker to being invisible
						that.locationList()[i].marker().setVisible(false);
					}
				}
*/
			};

			this.initializeTHAT = initialize();

		};

		ko.applyBindings(new ViewModel());
