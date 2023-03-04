(function () {
	'use strict';
	var formWrapper = document.querySelector('.myc-subscription-form');
	var fieldsToValidate = formWrapper.querySelectorAll('input[type="text"][required], input[type="radio"][required], input[type="checkbox"][required], input[type="email"][required], input[type="tel"][required], textarea[required]');
	var inputValidity;
	var elemErrorAttr;
	var elemDescribedby;
	var backdrop = document.querySelector('.myc-loading');
	var backdropTitle = backdrop.querySelector('h2');
	var backdropTitleMsg = backdrop.querySelector('h2').dataset.msg;
	var errorBanner = document.querySelector('#gralError');
	var happyPath = document.querySelector('#happypath');
	var happyPathText = happyPath.querySelectorAll('.myc-option-chosen');
	var sadPath = document.querySelector('#sadpath');
	var formObj = {};
	var http;
	var url;
	var params;
	var nameParam;	
	var urlEncodedDataPairs = [];
	var goBackBtn = document.querySelectorAll('.myc-wordBtn');
	var hiddenFields;
	var urlLastPart;

	function slideStep(elem, isTransitioned, secondElem) {
		if (isTransitioned) {
			setTimeout(function () {
				elem.setAttribute('hidden', true);
			}, 400);
			secondElem.removeAttribute('hidden');
		} else {
			//to do after transition ends, add hidden 
			document.querySelector('.myc-step-container').classList.remove('resizeWidth');
			setTimeout(function () {
				secondElem.setAttribute('hidden', true);
				
			}, 400);
			elem.removeAttribute('hidden');
			elem.focus();
			Array.prototype.forEach.call(document.querySelector('.myc-subscription-form-ending'), function (elem) {
				elem.setAttribute('hidden', true);
			});
		}
	}

	function finalStep(result) {
		if(formWrapper.dataset.lastStep === "true") {
			document.querySelector('.myc-step-container').classList.add('resizeWidth');
			//to do after transition ends, add hidden
			if (result) {
				happyPath.removeAttribute('hidden');
				happyPath.focus();
				Array.prototype.forEach.call(document.querySelectorAll('input:checked + label'), function (inputElem) {
					Array.prototype.forEach.call(happyPathText, function (choosenOption) {
						choosenOption.textContent = inputElem.textContent;
					});
				});
			} else {
				sadPath.removeAttribute('hidden');
				sadPath.focus();

			}
			slideStep(document.querySelector('#first-step'), true, document.querySelector('#second-step'));
		}		
	}

	function sendingData(datatoSend) {
		http = new XMLHttpRequest();
		url = formWrapper.dataset.sendingUrl;
		params = datatoSend;
		http.open('POST.html', url, true);
		for (nameParam in params) {
			urlEncodedDataPairs.push(encodeURIComponent(nameParam) + '=' + encodeURIComponent(params[nameParam]));
		}
		//Send the api-x-code TO BE REMOVED
		//http.setRequestHeader('X-API-KEY', 'GJvjWTgmTrUUAiv8x9HP7gKpnEJyzZ13uifxRGq6')
		//Send the proper header information along with the request
		http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');


		http.onreadystatechange = function () { //Call a function when the state changes.

			if (http.readyState === 4) {
				switch (true) {
					case (http.status == 200):
						//success
						loadBack('', false);
						finalStep(true);
						break;
					case (http.status >= 500):
						// internal server error
						loadBack('', false);
						finalStep(false);
						break;
					case (http.status >= 402 && http.status <= 420):
						// error
						loadBack('', false);
						finalStep(false);
						break;
					case (http.status == 400 || http.status == 401):
						// bad request & unauthorized error
						loadBack('', false);
						finalStep(false);
						break;
					default:
						console.log('issue with http status');
				}
			}
		}
		console.log(urlEncodedDataPairs.join("&"));
		http.send(urlEncodedDataPairs.join("&"));
	}
	//Get all the information from the form
	function createObj() {
		Array.prototype.forEach.call(document.querySelectorAll('.myc-subscription-form input'), function (inputElem) {
			if(inputElem.getAttribute('type') === 'radio' || inputElem.getAttribute('type') === 'checkbox') {
				if(inputElem.checked) {
					formObj[inputElem.getAttribute('name')] = inputElem.value;
				}
			} else {
				formObj[inputElem.getAttribute('name')] = inputElem.value;
			}			
		});
		sendingData(formObj);
		//finalStep(true);
	}

	//Clean Error Validation
	function cleanValidation(el) {
		if (el.getAttribute('type') === 'radio' || el.getAttribute('type') === 'checkboxes') {
			el.parentNode.classList.remove('myc-error');
		} else {
			el.parentNode.parentNode.classList.remove('myc-error');
		}
		if (el.hasAttribute('aria-describedby')) {
			elemDescribedby = el.getAttribute('aria-describedby');
			document.querySelector('#' + elemDescribedby).setAttribute('hidden', true);
			el.removeAttribute('aria-describedby');
		}
	}
	//Error handling
	function errorHandling(el, errorType) {
		if (el.getAttribute('type') === 'radio' || el.getAttribute('type') === 'checkboxes') {
			el.parentNode.classList.add('myc-error');
		} else {
			el.parentNode.parentNode.classList.add('myc-error');
		}
		if (el.hasAttribute('data-' + errorType)) {
			elemErrorAttr = el.getAttribute('data-' + errorType);
			el.setAttribute('aria-describedby', elemErrorAttr);
			document.querySelector('#' + elemErrorAttr).removeAttribute('hidden');
		}
	}
	//Validate input
	function validInput(field) {
		cleanValidation(field);
		inputValidity = field.validity;
		if (!inputValidity.valid) {
			for (var prop in inputValidity) {
				if (inputValidity[prop] === true) {
					//Error Handling
					errorHandling(field, prop)
					return false;
				}
			}
		}
	}

	function validateForm(ftv) {
		Array.prototype.forEach.call(ftv, function (field) {
			validInput(field);
		});
		if (document.querySelectorAll('.myc-error').length > 0) {
			return true;
		} else {
			return false;
		}
	}
	//Function for showing backdrop
	//showBackDrop is a boolean to show or hide
	function loadBack(msg, showBackDrop) {
		backdropTitle.textContent = msg;
		if (showBackDrop) {
			backdrop.removeAttribute('hidden');
			backdrop.focus();
		} else {
			backdrop.blur();
			backdrop.setAttribute('hidden', true);
		}
	}

	function addingInlineEvents() {
		Array.prototype.forEach.call(fieldsToValidate, function (field) {
			if (field.getAttribute('type') === 'radio' || field.getAttribute('type') === 'checkbok') {
				field.addEventListener('change', function () {
					validInput(this);
				});
			} else {
				field.addEventListener('input', function () {
					validInput(this);
				});
			}
		});
	}
//additions from subscriptionform.js
	//get url label 
	function getUrlLabel(urlForm) {
		urlLastPart = urlForm.substring(urlForm.lastIndexOf('https://www.mayoclinic.org/')+1);
	   //to do get an object;		
	   for (var i = 0; i < urlList.length; i++) {
		   if(urlList[i].url.indexOf(urlLastPart) !== -1) {
			   return urlList[i].label;
		   }
	   }
   }
   //Populate hidden fields
   function populateHiddenFields(){
	   hiddenFields = document.querySelectorAll('input[type="hidden"][value=""]');
	   Array.prototype.forEach.call(hiddenFields, function(hf){
		   switch(hf.name){
			   case 'page_url': 
			   hf.value = window.location.href;
			   break;
			   case 'pageTitle':
			   hf.value = document.querySelector('h1').textContent;
			   break;
			   /* case 'category':					
			   hf.value = getUrlLabel(window.location.pathname);
			   break; */
			   case 'elqFormName':
			   hf.value = formWrapper.dataset.nameForm;
			   break;
			   default:
				   
		   }
	   });
   }

	//Function for initialize the main logic
	function init() {
		if(urlList !== undefined && Array.isArray(urlList)) {
			populateHiddenFields();
		} else {
			console.log('subscriptionlist.js is not present')
		}
		//Validation on submit button click
		document.querySelector('#newsletterTrigger').addEventListener('click', function (e) {
			e.preventDefault();
			addingInlineEvents();
			if (validateForm(fieldsToValidate)) {
				errorBanner.removeAttribute('hidden');
				errorBanner.focus();
			} else {
				errorBanner.setAttribute('hidden', true);
				loadBack(backdropTitleMsg, true);
				createObj();
			}
		}, false);

		//Go Back To first step
		Array.prototype.forEach.call(goBackBtn, function (btn) {
			btn.addEventListener('click', function (e) {
				e.preventDefault();
				slideStep(document.querySelector('#first-step'), false, document.querySelector('#second-step'));
			});
		});

		//if the page is created using .Net form
		if(document.querySelector('#mayoform') !== null) {
			//
			Array.prototype.forEach.call(document.querySelectorAll('#Search, [id$=SearchMobileAzure]'), 
			function(elem) {
				elem.addEventListener('click', function(e){
				e.preventDefault();
				var searchBox = document.querySelector('#searchTerm');
				if (searchBox === null) {
					searchBox = document.querySelector('#azureSiteSearchTerm')
					if(searchBox !== null && searchBox.value === '') {
						searchBox = document.querySelector('#SearchMainMobile')
					}
				}
				if(searchBox !== null && searchBox.value !== "") {
					window.location = 'https://www.mayoclinic.org/search/search-results?q='+searchBox.value;
				}
			}, false);
			});
		}		
	}
	//start main logic
	document.addEventListener('DOMContentLoaded', init);


})();