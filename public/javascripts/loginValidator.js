$(document).ready(function(){
	var lv = new LoginValidator();

	$('#login').ajaxForm({
		beforeSubmit : function(formData, jqForm, options) {
			if (lv.validateForm() == false) {
				return false;
			}
		},
		success : function(responseText, status, xhr, $form) {
			if (status == 'success') window.location.href = '/home';
		},
		error : function(e) {
			lv.showLoginError('Error', 'Invalid Username and/or Password');
		}
	});
});

function LoginValidator() {
	this.loginErrors = $('.modal-alert')
	this.loginErrors.modal({ show: false, keyboard : true, backdrop : true });

	this.showLoginError = function(t, m) {
		$('.modal-alert .modal-header h3').text(t);
		$('.modal-alert .modal-body p').text(m);
		this.loginErrors.modal('show');
	}
}

LoginValidator.prototype.validateForm = function() {
	if ($('#user').val() == '') {
		this.showLoginError('Error', 'Username is required');
		return false;
	}
	else if ($('pass').val() == '') {
		this.showLoginError('Error', 'Password is required');
		return false;
	}
	return true;
}