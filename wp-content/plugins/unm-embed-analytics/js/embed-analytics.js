var Embed = {
	init: function(){

	},
	IDS: '',
	START_DATE: '',
	END_DATE: '',
	ACCESS_TOKEN: '',
	graphs: [
		{
			// sessions
			query: {
				'metrics': 'ga:sessions',
				'dimensions': 'ga:date'
			},
			chart: {
				type: 'LINE',
				container: 'traffic-1-container',
				'options': {
					'width': '100%'
				}
			}
		},
		{
			// pageviews
			query: {
				'metrics': 'ga:pageviews',
				'dimensions': 'ga:date'
			},
			chart: {
				'type': 'LINE',
				'container': 'traffic-2-container',
				'options': {
					'width': '100%'
				}
			}
		},
		{
			// pageviews per sessions
			query: {
				'metrics': 'ga:pageviewsPerSession',
				'dimensions': 'ga:date'
			},
			chart: {
				'type': 'LINE',
				'container': 'traffic-3-container',
				'options': {
					'width': '100%',
				}
			}
		},
		{
			// users
			query: {
				'metrics': 'ga:users',
				'dimensions': 'ga:date'
			},
			chart: {
				type: 'LINE',
				container: 'traffic-4-container',
				'options': {
					'width': '100%'
				}
	    	}
		},
		{
			// new users
			query: {
				'metrics': 'ga:newUsers',
				'dimensions': 'ga:date'
			},
			chart: {
				'type': 'LINE',
				'container': 'traffic-5-container',
				'options': {
					'width': '100%'
				}
			}
		},
		{
			// sessions vs users
			query: {
				'metrics': 'ga:sessions, ga:users',
				'dimensions': 'ga:date'
			},
			chart: {
				'type': 'LINE',
				'container': 'traffic-6-container',
				'options': {
					'width': '100%',
				}
			}
		},
		{
			// top jobs
			query: {
				'metrics': 'ga:pageviews',
				'dimensions': 'ga:pageTitle',
				'sort': '-ga:pageviews',
				'filters': 'ga:pagePathLevel1=@jobs;ga:pagePathLevel2!=/;ga:pagePathLevel2!=/page/;ga:pagePath=~^/jobs/[0-9a-zA-z-_].*'
			},
			chart: {
				'type': 'PIE',
				'container': 'content-1-container',
				'options': {
					'width': '100%',
					'pieHole': 4/9,
				}
			}
	    },
	    {
	    	// top events
			query: {
				'metrics': 'ga:pageviews',
				'dimensions': 'ga:pageTitle',
				'sort': '-ga:pageviews',
				'filters': 'ga:pagePath=~^/events/[0-9]*/[0-9]*/[0-9]*/.*'
		    },
			chart: {
				'type': 'PIE',
				'container': 'content-2-container',
				'options': {
					'width': '100%',
					'pieHole': 4/9,
				}
			}
	    },
	    {
	    	// top blogs
			query: {
				'metrics': 'ga:pageviews',
				'dimensions': 'ga:pageTitle',
				'sort': '-ga:pageviews',
				'filters': 'ga:pagePath=~^/blog/[0-9]*/[0-9]*/[0-9]*/.*'
			},
			chart: {
				'type': 'PIE',
				'container': 'content-3-container',
				'options': {
					'width': '100%',
					'pieHole': 4/9,
				}
			}
	    },
	    {
	    	// top resources
	    	query: {
				'metrics': 'ga:pageviews',
				'dimensions': 'ga:pageTitle',
				'sort': '-ga:pageviews',
				'filters': 'ga:pagePath=~^/resources/[0-9a-zA-z-_].*'
	    	},
			chart: {
				'type': 'PIE',
				'container': 'content-4-container',
				'options': {
					'width': '100%',
					'pieHole': 4/9,
				}
			}
	    },
	    {
	    	// top pages
			query: {
				'metrics': 'ga:pageviews',
				'dimensions': 'ga:pageTitle',
				'sort': '-ga:pageviews',
				'filters': 'ga:pagePathLevel1!=/'
	    	},
			chart: {
				'type': 'PIE',
				'container': 'content-5-container',
				'options': {
					'width': '100%',
					'pieHole': 4/9,
	      		}
	    	}
	    },
	    {
	    	// top sources
			query: {
				'metrics': 'ga:sessions',
				'dimensions': 'ga:source',
				'sort': '-ga:sessions',
	    	},
			chart: {
				'type': 'PIE',
				'container': 'content-6-container',
				'options': {
					'width': '100%',
					'pieHole': 4/9
				}
			}
	    }
  ],
  loadAllGraphs: function(){

		gapi.analytics.ready(function() {

			gapi.analytics.auth.authorize({
				serverAuth: {
					access_token: Embed.ACCESS_TOKEN
				}
			});

			var activeUsers = new gapi.analytics.ext.ActiveUsers({
				container: 'active-users-container',
				pollingInterval: 5
			});
			  
			activeUsers.once('success', function() {
				var element = this.container.firstChild;
				var timeout;

				this.on('change', function(data) {
					var element = this.container.firstChild;
					var animationClass = data.delta > 0 ? 'is-increasing' : 'is-decreasing';
					element.className += (' ' + animationClass);

					clearTimeout(timeout);
					timeout = setTimeout(function() {
						element.className = element.className.replace(/ is-(increasing|decreasing)/g, '');
					}, 3000);
				});
			});
			activeUsers.set({'ids': Embed.IDS}).execute();

		    jQuery.each(Embed.graphs, function(i,obj){

				obj['query']['ids'] = Embed.IDS;
				obj['query']['start-date'] = Embed.START_DATE;
				obj['query']['end-date'] = Embed.END_DATE;

				if(obj['chart']['type'] === 'PIE') {
					obj['query']['max-results'] = 5;
				}

				var chart = new gapi.analytics.googleCharts.DataChart(obj).execute();
			});
		});
	},
	viewAll: function(key, title) {

		jQuery('#view-all-chart').empty();

		var obj = Embed.graphs[key];

		obj['query']['ids'] = Embed.IDS;
		obj['query']['start-date'] = Embed.START_DATE;
		obj['query']['end-date'] = Embed.END_DATE;

		obj['chart']['type'] = 'TABLE';
		obj['chart']['container'] = 'view-all-chart';
		obj['query']['max-results'] = null;

		var chart = new gapi.analytics.googleCharts.DataChart(obj).execute();

		jQuery('#view-all h2').html(title);
		jQuery('#view-all').ScrollTo({duration:1000});
		
	}
};

jQuery(function($){
    $('input[name="date_range"]').daterangepicker({
        datepickerOptions : {
            numberOfMonths : 2,
            changeYear: true
        },
        onChange: function(){
            $('#embed-analytics').submit();
        }
    });

	Embed.init();
	Embed.loadAllGraphs();

});