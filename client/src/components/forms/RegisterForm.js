import { useState, useCallback, useMemo, Fragment } from "react";
import { Form, Input, Button } from "antd";
import { useDispatch } from "react-redux";
import { showError } from "../../redux/slices/errorSlice";
import checkInputFormat from "../../utils/misc/validation";
import authApi from "../../services/user/auth";

/*
	formConfig
	{
		name: {
			showInput: true | false,
			label: "str",
			required: true | false,
			placeholder: "str",
			disabled: true | false,
			sequence: 0,
			defaultValue: "str"
		},
		email: {
			showInput: true | false,
			label: "str",
			required: true | false,
			placeholder: "str",
			disabled: true | false,
			sequence: 0,
			defaultValue: "str"
		},
		number: {
			showInput: true | false,
			label: "str",
			required: true | false,
			placeholder: "str",
			disabled: true | false,
			sequence: 0,
			defaultValue: "str"
		},
		btnText: "str",
		layout: "vertical" | "horizontal" | "inline",
		customClass: "str",
		addElement: <></>,
		addValues: {obj: "object"}
	}
*/
const RegisterForm = ({ formConfig }) => {
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);

	// form validation function
	const validator = async (rule, value) => {
		const { result, message } = checkInputFormat({ [rule.field]: value });
		if (!result) return Promise.reject(new Error(message));
	};

	// form configs
	const initialValues = useMemo(() => {
		let returnThis = {};
		if (formConfig && formConfig.name && formConfig.name.defaultValue) returnThis.name = formConfig.name.defaultValue;
		if (formConfig && formConfig.email && formConfig.email.defaultValue) returnThis.email = formConfig.email.defaultValue;
		if (formConfig && formConfig.number && formConfig.number.defaultValue) returnThis.number = formConfig.number.defaultValue;
		return returnThis;
	}, [formConfig]);

	const formContent = useMemo(() => {
		let holder = [];

		if (formConfig && formConfig.name && formConfig.name.showInput) {
			let nameRules = [{ validator }];

			if (formConfig.name.required)
				nameRules.push({
					required: true,
					message: "Name is required"
				});

			let nameElement = (
				<Form.Item
					label={formConfig.name.label}
					name="name"
					htmlFor="name"
					rules={nameRules}
					className="form-group"
					data-testid="name-input"
				>
					<Input
						type="text"
						name="name"
						id="name"
						className="form-input"
						required={formConfig.name.required}
						disabled={formConfig.name.disabled}
						placeholder={formConfig.name.placeholder}
					/>
				</Form.Item>
			);

			let sequence = formConfig.name.sequence;
			holder.push({ elem: nameElement, sequence });
		}

		if (formConfig && formConfig.email && formConfig.email.showInput) {
			let emailRules = [{ validator }];

			if (formConfig.email.required)
				emailRules.push({
					required: true,
					message: "Email is required"
				});

			let emailElement = (
				<Form.Item
					label={formConfig.email.label}
					name="email"
					htmlFor="email"
					rules={emailRules}
					className="form-group"
					data-testid="email-input"
				>
					<Input
						type="email"
						id="email"
						name="email"
						className="form-input"
						required={formConfig.email.required}
						disabled={formConfig.email.disabled}
						placeholder={formConfig.email.placeholder}
					/>
				</Form.Item>
			);

			let sequence = formConfig.email.sequence;
			holder.push({ elem: emailElement, sequence });
		}

		if (formConfig && formConfig.number && formConfig.number.showInput) {
			let numberRules = [{ validator }];

			if (formConfig.number.required)
				numberRules.push({
					required: true,
					message: "Phone Number is required"
				});

			let numberElement = (
				<Form.Item
					label={formConfig.number.label}
					name="number"
					htmlFor="number"
					rules={numberRules}
					className="form-group"
					data-testid="number-input"
				>
					<Input
						type="text"
						id="number"
						name="number"
						className="form-input"
						required={formConfig.number.required}
						disabled={formConfig.number.disabled}
						placeholder={formConfig.number.placeholder}
					/>
				</Form.Item>
			);
			let sequence = formConfig.number.sequence;
			holder.push({ elem: numberElement, sequence });
		}

		return holder.sort((a, b) => a.sequence - b.sequence).map((item, index) => <Fragment key={index}>{item.elem}</Fragment>);
	}, [formConfig]);

	// form submit
	const submitForm = useCallback(async values => {
		if (!loading) {
			const additionalValues = formConfig && formConfig.addValues ? formConfig.addValues : {};
			const sendData = {
				...values,
				...additionalValues
			};
			setLoading(true);
			try {
				const res = await authApi.register(sendData);
				setLoading(false);
				// add your success handling here //
			} catch (error) {
				setLoading(false);
				dispatch(showError(error.response.data.error));
			}
		}
	}, []);

	if (!formConfig) return null;
	return (
		<Form
			name="register-form"
			id="register-form"
			className={`register-form ${formConfig.customClass}`}
			layout={
				formConfig.layout === "horizontal" || formConfig.layout === "vertical" || formConfig.layout === "inline"
					? formConfig.layout
					: "vertical"
			}
			onFinish={submitForm}
			onFinishFailed={e => console.log("submit fail", e.errorFields)}
			disabled={loading}
			initialValues={initialValues}
			aria-label="form"
			data-testid="register-form"
		>
			{formContent}

			{formConfig.addElement}

			<Form.Item className="form-group">
				<Button htmlType="submit" block loading={loading} id="register-form-submit-btn" className="form-submit-btn">
					{formConfig.btnText || "Submit"}
				</Button>
			</Form.Item>
		</Form>
	);
};

export default RegisterForm;
