import { useState, useCallback } from "react";
import { Form, Input, Button } from "antd";
import { useDispatch } from "react-redux";
import { showError } from "../../redux/slices/errorSlice";
import checkInputFormat from "../../utils/misc/validation";
import authApi from "../../services/user/auth";

/*
	formConfig
	{
		label: "str",
		placeholder: "str",
		btnText: "str",
		layout: "vertical" | "horizontal" | "inline",
		customClass: "str",
		addElement: <></>,
		addValues: {obj: "object"}
	}
*/
const LoginForm = ({ formConfig }) => {
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);

	const validator = async (rule, value) => {
		const { result, message } = checkInputFormat({ [rule.field]: value });
		if (!result) return Promise.reject(new Error(message));
	};

	const submitForm = useCallback(async values => {
		if (!loading) {
			const additionalValues = formConfig && formConfig.addValues ? formConfig.addValues : {};
			const sendData = {
				...values,
				...additionalValues
			};
			setLoading(true);
			try {
				const res = await authApi.login(sendData);
				setLoading(false);
				// add your success handling here //
			} catch (error) {
				setLoading(false);
				dispatch(showError(error.response.data.error));
			}
		}
	}, []);

	return (
		<Form
			name="login-form"
			id="login-form"
			className={`login-form ${formConfig && formConfig.customClass}`}
			layout={
				formConfig && (formConfig.layout === "horizontal" || formConfig.layout === "vertical" || formConfig.layout === "inline")
					? formConfig.layout
					: "vertical"
			}
			onFinish={submitForm}
			onFinishFailed={e => console.log("submit fail", e.errorFields)}
			disabled={loading}
			aria-label="form"
			data-testid="login-form"
		>
			<Form.Item
				label={formConfig && formConfig.label ? formConfig.label : "Phone Number"}
				name="number"
				htmlFor="number"
				rules={[
					{ validator },
					{
						required: true,
						message: "Phone Number is required"
					}
				]}
				className="form-group"
				data-testid="number-input"
			>
				<Input
					type="text"
					id="number"
					name="number"
					className="form-input"
					required
					placeholder={formConfig && formConfig.placeholder ? formConfig.placeholder : null}
				/>
			</Form.Item>

			{formConfig && formConfig.addElement}

			<Form.Item className="form-group">
				<Button htmlType="submit" block loading={loading} id="login-form-submit-btn" className="form-submit-btn">
					{formConfig && formConfig.btnText ? formConfig.btnText : "Submit"}
				</Button>
			</Form.Item>
		</Form>
	);
};

export default LoginForm;
