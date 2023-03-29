import "../../../configs/matchMedia";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "../LoginForm";
import MockComponent from "../../tests/Mock";
import checkInputFormat from "../../../utils/misc/validation";

it("Should have the default label of 'Phone Number'", async () => {
	render(<MockComponent children={<LoginForm />} />);
	const formLabel = screen.getByText("Phone Number");
	expect(formLabel).toBeInTheDocument();
	expect(formLabel.innerHTML).toBe("Phone Number");
});

it("Should show the correct label value", async () => {
	render(<MockComponent children={<LoginForm formConfig={{ label: "Number" }} />} />);
	const formLabel = screen.getByText("Number");
	expect(formLabel).toBeInTheDocument();
	expect(formLabel.innerHTML).toBe("Number");
});

it("Should show correct placeholder value", async () => {
	render(<MockComponent children={<LoginForm formConfig={{ placeholder: "Phone Number" }} />} />);
	const inputField = screen.getByPlaceholderText("Phone Number");
	expect(inputField).toBeInTheDocument();
	expect(inputField.placeholder).toBe("Phone Number");
});

it("Should have default 'Submit' button text", async () => {
	render(<MockComponent children={<LoginForm />} />);
	const submitButton = screen.getByRole("button", { name: "Submit" });
	expect(submitButton).toBeInTheDocument();
	expect(submitButton.innerHTML).toMatch(/submit/i);
});

it("Should render correct submit button text", async () => {
	render(<MockComponent children={<LoginForm formConfig={{ btnText: "LOGIN" }} />} />);
	const submitButton = screen.getByRole("button", { name: "LOGIN" });
	expect(submitButton).toBeInTheDocument();
	expect(submitButton.innerHTML).toMatch(/login/i);
});

it("Input field should be required", async () => {
	render(<MockComponent children={<LoginForm />} />);
	const inputField = screen.getByRole("textbox", { name: "Phone Number" });
	expect(inputField).toBeRequired();
});

it("Should show error message if format is wrong", async () => {
	render(<MockComponent children={<LoginForm />} />);
	const inputField = screen.getByRole("textbox", { name: "Phone Number" });
	await userEvent.type(inputField, "abc123");
	const result = checkInputFormat({ number: inputField.value });
	const errorMessage = await screen.findByText(result.message);
	expect(errorMessage).toBeInTheDocument();
});

it("Should show additional element in the form", async () => {
	render(<MockComponent children={<LoginForm formConfig={{ addElement: <h1>Hello Guys</h1> }} />} />);
	const additionalElement = screen.getByRole("heading", { name: "Hello Guys" });
	expect(additionalElement).toBeInTheDocument();
});
