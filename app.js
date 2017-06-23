
	//----------------------------------------------//
	// BUDGET CONTROLLER
	//----------------------------------------------//
var budgetController = (function() {

	//constructors and prototype methods
	var Expense = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome){
		if(totalIncome > 0){
			this.percentage = Math.round((this.value / totalIncome) * 100);
		}else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(cur, index, array){
			sum += cur.value
		});
		data.totals[type] = sum;
	}

		var data = {
			allItems: {
				exp:  [],
				inc:  []
			},
			totals: {
				exp: 0,
				inc: 0
			},
			budget: 0,
			percentage : -1

		};

	//EXPOSING TO THE PUBLIC EYE
		return {
			addItem: function(type, des, val){
				var newItem, ID;

				// create new ID
				if(data.allItems[type].length > 0){
					ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
				}else{
					ID = 0;
				}

				//create new item based on 'inc' or 'exp' type
				if(type === 'exp'){
					newItem = new Expense(ID, des, val);
				}else if (type ==='inc') {
					newItem = new Income(ID, des, val);
				}

				//push it into our data structure
				data.allItems[type].push(newItem);

				//return the new item
				return newItem;

			},

			deleteItem: function(type, id) {
					var ids, index;

					ids = data.allItems[type].map(function(current) {
							return current.id;
					});

					index = ids.indexOf(id);

					if (index !== -1) {
							data.allItems[type].splice(index, 1);
					}
			},

			calculateBudget: function(){
				//calculateTotal income and expenses
				// console.log(calculateTotal('exp'));

				calculateTotal('inc');
				calculateTotal('exp');

				//calculateBudget: income - expenses
				data.budget = data.totals.inc - data.totals.exp;
				// console.log(data.budget);

				//calculate the percentage of income that we spent
				if (data.totals.inc > 0){
					data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100 )
				}else {
					data.percentage = -1;
				}

			},

			calculatePercentages: function(){

				data.allItems.exp.forEach(function(cur) {
					cur.calcPercentage(data.totals.inc);
				});

			},

			getPercentages: function(){
				var allPerc = data.allItems.exp.map(function(cur){
					return cur.getPercentage();
				});
				return allPerc;
			},

			getBudget : function(){
				return {
					budget: data.budget,
					totalInc: data.totals.inc,
					totalExp: data.totals.exp,
					percentage: data.percentage
				}
			},

			testing : function() {
				console.log(data);
			}

		};

}());




	// UI CONTROLLER
	//----------------------------------------------//
var UIcontroller = (function() {

	var DOMstrings = {
		inputType:'.add__type',
		inputDescription: '.add__description',
		inputValue:'.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var  formatNumber = function(num, type){

		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.')

		int = numSplit[0];
		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3 ,int.length);
		}

		dec = numSplit[1];

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec

	};

	var nodeListForEach = function(list, callback){
		for (var i = 0; i < list.length; i++){
			callback(list[i], i);
		}
	};
	//EXPOSING TO THE PUBLIC EYE
	return {
		//get the input from the form and return a public object with each peice of the input
		getInput: function(){
			return {
				type: document.querySelector(DOMstrings.inputType).value,// either inc || expenses
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		addListItem: function(obj, type) {
			var html, newHtml, element;
			//create HTML string with placeholder text
			if(type ==='inc'){
				element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}else if(type === 'exp'){
				element = DOMstrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			//replace the placeholder text with actual data
			//all strings have there own methods such as replace
			newHtml = html.replace('%id%', obj.id)
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			// insert the html into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem: function (selectorID) {

			var el = document.getElementById(selectorID)
			el.parentNode.removeChild(el)
		},

		clearFields : function(){
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(current, index, array){
				current.value = "";
			});
			fieldsArr[0].focus();
		},

		displayBudget : function(obj){
			var type;

			obj.budget > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');

			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

			if(obj.percentage > 0 ){
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
			}else{
				document.querySelector(DOMstrings.percentageLabel).textContent = "----";
			}

		},

		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);


			nodeListForEach(fields, function(current, index){
				if(percentages[index] > 0){
					current.textContent = percentages[index] + '%';
				}else {
					current.textContent = '---';
				}
			});

		},

		displayDate : function(){
			var now, month,months, year;

			now = new Date();

			months = ['January', 'February', 'March', 'April', 'may', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

			month = now.getMonth();

			year = now.getFullYear();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' of ' + year;
		},

		changedType: function(){
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDescription+ ',' +
				DOMstrings.inputValue
			);

			nodeListForEach(fields, function(cur){
				cur.classList.toggle('red-focus');
			});
			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

		},

		getDOMStrings : function(){
			return DOMstrings;
		}
	};

}());



	//----------------------------------------------//
	// GLOBAL APP CONTROLLER
	//has access to the other two controllers
	//where we tell the other modules what to do
	//----------------------------------------------//
var controller = (function(budgetCtrl, UICtrl) {

	//PRIVATE to the outside until returned due to closures

	//select the HTMLelement to listen to and trigger functions to do desired tasks. Functions located below
	var setupEventListeners = function(){
		var DOM = UICtrl.getDOMStrings();


		//WHEN BUTTON IS CLICKED CALL ctrlAddItem
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		//WHEN ENTER IS PRESSED CALL ctrlAddItem
		document.addEventListener('keypress', function(e){
			// console.log(e);
			if(e.keyCode === 13 || e.which === 13){
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
	}

	var updateBudget = function() {

		//1. Calculate the budget
			budgetCtrl.calculateBudget();

		//2. return the budget
			var budget = budgetCtrl.getBudget();
		//3. display the budget on the UI
			UICtrl.displayBudget(budget);
	}

	var updatePercentages = function(){

		//1. calculate percentages
		budgetCtrl.calculatePercentages();
		//2. read percentages from the budget controllers
		var percentages = budgetCtrl.getPercentages();
		//3. Update the UI with the new percentages
		UICtrl.displayPercentages(percentages);
	};

	var ctrlAddItem = function(){

		//1. get the feild input data
		var input = UICtrl.getInput();
		// console.log(input);

		if(input.description !== '' && !isNaN(input.value) && input.value > 0){
			//2. add the item to the budget contrloller
			var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			//3. add the item to the UI
			UICtrl.addListItem(newItem,input.type);

			//4. clear the fields
			UICtrl.clearFields();

			//5. calc and update budget
			updateBudget();
			//6. calc and update the percentages
			updatePercentages();

		}


	};

	var ctrlDeleteItem = function(event){
		var itemID, splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemID) {

				//inc-1
				splitID = itemID.split('-');
				type = splitID[0];
				ID = parseInt(splitID[1]);

			// 1. delete the item from the data structure
			budgetCtrl.deleteItem(type, ID);
			// 2. delete the item from the UI
			UICtrl.deleteListItem(itemID);
			//3. Update and show the new budget
			updateBudget();
			//4. calc and update the percentages
			updatePercentages();
		}

	}


//EXPOSING TO THE PUBLIC EYE
	return {
		init: function(){
			UICtrl.displayDate();
			UICtrl.displayBudget({
					budget: 0,
					totalInc: 0,
					totalExp: 0,
					percentage: -1
			});
			setupEventListeners();

		}
	};//init



}(budgetController, UIcontroller));
	//1
controller.init();


//how the program reads
//init
