window.addEventListener('load', function () {
	var vue = new Vue({
		el: '#app',
		data: {
			numberOfCols: 3,
			allTodos: ['First','Second','Third','Fourth','Fifth'],
			addTodoTextbox: '',
		},
		computed: {
			numberOfRows: function() {
				return Math.ceil(this.allTodos.length / this.numberOfCols);
			},
			chunkedTodos: function() {
				return _.chunk(this.allTodos, this.numberOfCols);
			},
		},
		methods: {
			addTodo: function() {
				this.allTodos.push(this.addTodoTextbox);
				this.addTodoTextbox = '';
			},
		},
	});
});
