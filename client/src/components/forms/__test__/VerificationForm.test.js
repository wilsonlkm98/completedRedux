import "../../../configs/matchMedia";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
import VerificationForm from "../VerificationForm";
import MockComponent from "../../tests/Mock";

it("Should show the correct label", async () => {
	render(<MockComponent children={<VerificationForm formConfig={{ label: "OTP" }} />} />);
	const formLabel = screen.getByText("OTP");
	expect(formLabel).toBeInTheDocument();
	expect(formLabel.innerHTML).toBe("OTP");
});

it("Should show correct placeholder", async () => {
	render(<MockComponent children={<VerificationForm formConfig={{ placeholder: "Enter OTP" }} />} />);
	const inputField = screen.getByPlaceholderText("Enter OTP");
	expect(inputField).toBeInTheDocument();
	expect(inputField.placeholder).toBe("Enter OTP");
});

it("Should have default 'Submit' button text", async () => {
	render(<MockComponent children={<VerificationForm />} />);
	const submitButton = screen.getByRole("button", { name: "Submit" });
	expect(submitButton).toBeInTheDocument();
	expect(submitButton.innerHTML).toMatch(/submit/i);
});

it("Should render correct submit button text", async () => {
	render(<MockComponent children={<VerificationForm formConfig={{ btnText: "VERIFY" }} />} />);
	const submitButton = screen.getByRole("button", { name: "VERIFY" });
	expect(submitButton).toBeInTheDocument();
	expect(submitButton.innerHTML).toMatch(/verify/i);
});

it("Input field should be required", async () => {
	render(<MockComponent children={<VerificationForm formConfig={{}} />} />);
	const inputField = screen.getByRole("spinbutton");
	expect(inputField).toBeRequired();
});

it("Should show additional element in the form", async () => {
	render(<MockComponent children={<VerificationForm formConfig={{ addElement: <h1>Hello Guys</h1> }} />} />);
	const additionalElement = screen.getByRole("heading", { name: "Hello Guys" });
	expect(additionalElement).toBeInTheDocument();
});
