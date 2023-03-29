/**
 * to check phone number, email and name format
 * @param {Object} data { number, name, email }
 * @param {*} callback { result, field, message }
 */
const checkInputFormat = data => {
	const { name, number, email } = data;
	let field = null;
	let message = null;
	let result = true;

	if (name) {
		const nameRegex = /^[a-zA-Z ]+$/;
		if (!nameRegex.test(name)) {
			field = "name";
			message = 'Please avoid using special characters in "Name" input field';
			result = false;
		}
	}
	if (number) {
		const numberRegex = /^(01)[0-46-9]([0-9]){7,8}$/;
		if (!numberRegex.test(number)) {
			field = "number";
			message = "You have entered an invalid phone number";
			result = false;
		}
	}
	if (email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			field = "email";
			message = "You have entered an invalid email address";
			result = false;
		}
	}
	return { result, field, message };
};

export default checkInputFormat;
