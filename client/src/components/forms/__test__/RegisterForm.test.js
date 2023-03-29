import "../../../configs/matchMedia";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "../RegisterForm";
import MockComponent from "../../tests/Mock";
import checkInputFormat from "../../../utils/misc/validation";

describe("Name Input Field", () => {
	it("Should render input field if show input is true", async () => {
		const formConfig = {
			name: {
				showInput: true
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const nameInputElement = screen.getByTestId("name-input");
		expect(nameInputElement).toBeInTheDocument();
	});

	it("Should show the correct label", async () => {
		const formConfig = {
			name: {
				showInput: true,
				label: "User Name"
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const labelText = screen.getByText(formConfig.name.label);
		expect(labelText).toBeInTheDocument();
		expect(labelText.innerHTML).toBe(formConfig.name.label);
	});

	it("Should be required if required is true", async () => {
		const formConfig = {
			name: {
				showInput: true,
				label: "User Name",
				required: true
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const nameInputField = screen.getByRole("textbox", { name: formConfig.name.label });
		expect(nameInputField).toBeRequired();
	});

	it("Should have correct placeholder", async () => {
		const formConfig = {
			name: {
				showInput: true,
				label: "User Name",
				placeholder: "Your Full Name"
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const nameInputField = screen.getByPlaceholderText(formConfig.name.placeholder);
		expect(nameInputField).toBeInTheDocument();
		expect(nameInputField.placeholder).toBe(formConfig.name.placeholder);
	});

	it("Should be disabled if true", async () => {
		const formConfig = {
			name: {
				showInput: true,
				label: "User Name",
				disabled: true
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const nameInputField = screen.getByRole("textbox", { name: formConfig.name.label });
		expect(nameInputField).toBeDisabled();
	});

	it("Should have the correct default/initial value", async () => {
		const formConfig = {
			name: {
				showInput: true,
				label: "User Name",
				defaultValue: "test user name"
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const nameInputField = screen.getByDisplayValue(formConfig.name.defaultValue);
		expect(nameInputField).toBeInTheDocument();
		expect(nameInputField.value).toBe(formConfig.name.defaultValue);
	});

	it("Should show error message if format is not correct", async () => {
		const formConfig = {
			name: {
				showInput: true,
				label: "User Name"
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const nameInputField = screen.getByRole("textbox", { name: formConfig.name.label });
		await userEvent.type(nameInputField, "12 3");
		const result = checkInputFormat({ name: nameInputField.value });
		const errorMessage = await screen.findByText(result.message);
		expect(errorMessage).toBeInTheDocument();
	});
});

describe("Email Address Input Field", () => {
	it("Should render input field if show input is true", async () => {
		const formConfig = {
			email: {
				showInput: true
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const emailInputElement = screen.getByTestId("email-input");
		expect(emailInputElement).toBeInTheDocument();
	});

	it("Should show the correct label", async () => {
		const formConfig = {
			email: {
				showInput: true,
				label: "Email Address"
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const labelText = screen.getByText(formConfig.email.label);
		expect(labelText).toBeInTheDocument();
		expect(labelText.innerHTML).toBe(formConfig.email.label);
	});

	it("Should be required if required is true", async () => {
		const formConfig = {
			email: {
				showInput: true,
				label: "Email Address",
				required: true
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const emailInputField = screen.getByRole("textbox", { name: formConfig.email.label });
		expect(emailInputField).toBeRequired();
	});

	it("Should have correct placeholder", async () => {
		const formConfig = {
			email: {
				showInput: true,
				label: "Email Address",
				placeholder: "Your Email Address"
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const emailInputField = screen.getByPlaceholderText(formConfig.email.placeholder);
		expect(emailInputField).toBeInTheDocument();
		expect(emailInputField.placeholder).toBe(formConfig.email.placeholder);
	});

	it("Should be disabled if true", async () => {
		const formConfig = {
			email: {
				showInput: true,
				label: "Email Address",
				disabled: true
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const emailInputField = screen.getByRole("textbox", { name: formConfig.email.label });
		expect(emailInputField).toBeDisabled();
	});

	it("Should have the correct default/initial value", async () => {
		const formConfig = {
			email: {
				showInput: true,
				label: "Email Address",
				defaultValue: "test@email.com"
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const emailInputField = screen.getByDisplayValue(formConfig.email.defaultValue);
		expect(emailInputField).toBeInTheDocument();
		expect(emailInputField.value).toBe(formConfig.email.defaultValue);
	});

	it("Should show error message if format is not correct", async () => {
		const formConfig = {
			email: {
				showInput: true,
				label: "Email Address"
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const emailInputField = screen.getByRole("textbox", { name: formConfig.email.label });
		await userEvent.type(emailInputField, "12 3");
		const result = checkInputFormat({ email: emailInputField.value });
		const errorMessage = await screen.findByText(result.message);
		expect(errorMessage).toBeInTheDocument();
	});
});

describe("Phone Number Input Field", () => {
	it("Should render input field if show input is true", async () => {
		const formConfig = {
			number: {
				showInput: true
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const numberInputElement = screen.getByTestId("number-input");
		expect(numberInputElement).toBeInTheDocument();
	});

	it("Should show the correct label", async () => {
		const formConfig = {
			number: {
				showInput: true,
				label: "Phone Number"
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const labelText = screen.getByText(formConfig.number.label);
		expect(labelText).toBeInTheDocument();
		expect(labelText.innerHTML).toBe(formConfig.number.label);
	});

	it("Should be required if required is true", async () => {
		const formConfig = {
			number: {
				showInput: true,
				label: "Phone Number",
				required: true
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const numberInputField = screen.getByRole("textbox", { name: formConfig.number.label });
		expect(numberInputField).toBeRequired();
	});

	it("Should have correct placeholder", async () => {
		const formConfig = {
			number: {
				showInput: true,
				label: "Phone Number",
				placeholder: "Your Phone Number"
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const numberInputField = screen.getByPlaceholderText(formConfig.number.placeholder);
		expect(numberInputField).toBeInTheDocument();
		expect(numberInputField.placeholder).toBe(formConfig.number.placeholder);
	});

	it("Should be disabled if true", async () => {
		const formConfig = {
			number: {
				showInput: true,
				label: "Phone Number",
				disabled: true
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const numberInputField = screen.getByRole("textbox", { name: formConfig.number.label });
		expect(numberInputField).toBeDisabled();
	});

	it("Should have the correct default/initial value", async () => {
		const formConfig = {
			number: {
				showInput: true,
				label: "Phone Number",
				defaultValue: "0123456789"
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const numberInputField = screen.getByDisplayValue(formConfig.number.defaultValue);
		expect(numberInputField).toBeInTheDocument();
		expect(numberInputField.value).toBe(formConfig.number.defaultValue);
	});

	it("Should show error message if format is not correct", async () => {
		const formConfig = {
			number: {
				showInput: true,
				label: "Phone Number"
			}
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const numberInputField = screen.getByRole("textbox", { name: formConfig.number.label });
		await userEvent.type(numberInputField, "12 3");
		const result = checkInputFormat({ number: numberInputField.value });
		const errorMessage = await screen.findByText(result.message);
		expect(errorMessage).toBeInTheDocument();
	});
});

describe("Submit Button", () => {
	it("Should show correct button text", async () => {
		const formConfig = {
			btnText: "Sign Up"
		};
		render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
		const submitButton = screen.getByRole("button", { name: formConfig.btnText });
		expect(submitButton).toBeInTheDocument();
		expect(submitButton.innerHTML).toMatch(/sign up/i);
	});

	it('Should show "Submit" if no btnText was passed', async () => {
		render(<MockComponent children={<RegisterForm formConfig={{}} />} />);
		const submitButton = screen.getByRole("button", { name: /submit/i });
		expect(submitButton).toBeInTheDocument();
		expect(submitButton.innerHTML).toMatch(/submit/i);
	});

	// should be disabled after submission
});

it("Should show additional element in the form", async () => {
	const formConfig = {
		addElement: <h1>Hello Guys</h1>
	};
	render(<MockComponent children={<RegisterForm formConfig={formConfig} />} />);
	const additionalElement = screen.getByRole("heading", { name: "Hello Guys" });
	expect(additionalElement).toBeInTheDocument();
});
