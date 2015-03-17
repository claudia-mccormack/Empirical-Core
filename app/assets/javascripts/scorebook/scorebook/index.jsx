$(function () {
	var ele = $('#scorebook');
	if (ele.length > 0) {
		React.render(React.createElement(EC.Scorebook), ele[0]);
	}
});

EC.Scorebook = React.createClass({
	mixins: [EC.TableFilterMixin],

	getInitialState: function () {
		return {
			units: [],
			classrooms: [],
			selectedUnit: {name: 'All Units', value: ''},
			selectedClassroom: {name: 'All Classrooms', value: ''},
			classroomFilters: [],
			unitFilters: [],
			currentPage: 1,
			loading: false,
			isLastPage: false,
			noLoadHasEverOccurredYet: true
		}
	},
	scrollComputation: function () {
		var y = $('#page-content-wrapper').height();
		var w = 1/(this.state.currentPage + 1);
		var z = y*(1 - w);
		return z;
	},	

	componentDidMount: function () {
		this.fetchData();
		var that = this;
		$(window).scroll(function (e) {
			if (($(window).scrollTop() + document.body.clientHeight) > (that.scrollComputation() )) {
				if (!that.state.loading && !that.state.isLastPage) {
					that.loadMore();
				}
			}
		});
	},
	loadMore: function () {
		this.setState({currentPage: this.state.currentPage + 1});
		this.fetchData();
	},
	fetchData: function () { 
		console.log('state before fetching data: ', this.state)
		this.setState({loading: true})
		$.ajax({
			url: 'scores',
			data: {
				current_page: this.state.currentPage,
				classroom_id: this.state.selectedClassroom.value,
				unit_id: this.state.selectedUnit.value,
				no_load_has_ever_occurred_yet: this.state.noLoadHasEverOccurredYet
			},
			success: this.displayData
		});
	},

	displayData: function (data) {
		console.log('data: ', data)
		
		if (data.was_classroom_selected_in_controller) {
			this.setState({selectedClassroom: data.selected_classroom});
		}

		this.setState({
			classroomFilters: this.getFilterOptions(data.classrooms, 'name', 'id', 'All Classrooms'),
			unitFilters: this.getFilterOptions(data.units, 'name', 'id', 'All Units'),
			isLastPage: data.is_last_page,
			noLoadHasEverOccurredYet: false
		});


		if (this.state.currentPage == 1) {
			this.setState({scores: data.scores});
		} else {
			var x1 = _.last(_.keys(this.state.scores));		
			var new_scores = this.state.scores;
			_.forEach(data.scores, function (val, key) {
				if (key == x1) {
					new_scores[key]['results'] = (new_scores[key]['results']).concat(val['results']);
				} else {
					new_scores[key] = val;
				}
			})
			this.setState({scores: new_scores});
		}
		this.setState({loading: false});
	},

	selectUnit: function (option) {
		this.setState({currentPage: 1, selectedUnit: option}, this.fetchData); 
	},

	selectClassroom: function (option) {
		this.setState({currentPage: 1, selectedClassroom: option}, this.fetchData);
	},

	render: function() {
		scores = _.map(this.state.scores, function (data, student_id) {
			return <EC.StudentScores data={data} />
		});
		if (this.state.loading) {
			loadingIndicator = <EC.LoadingIndicator />;
		} else {
			loadingIndicator = null;
		}
		console.log('default classroom : ', this.state.defaultClassroom)
		return (
			<span>

				<div className="tab-subnavigation-wrapper">
	                <div className="container">
	                  <ul>
	                    <li><a href="" className="active">Student View</a></li>
	                  </ul>
	                </div>
	            </div>
	            <div className="container">
		            <section className="section-content-wrapper">
				            <EC.ScorebookFilters
				            	selectedClassroom = {this.state.selectedClassroom}
				            	classroomFilters = {this.state.classroomFilters}
				            	selectClassroom  = {this.selectClassroom}

				            	selectedUnit = {this.state.selectedUnit}
				            	unitFilters = {this.state.unitFilters}
				            	selectUnit  = {this.selectUnit} />

				            <EC.ScorebookLegend />
			        </section>
		        </div>


		        {scores}

		        {loadingIndicator}

			</span>
		);
	}


});