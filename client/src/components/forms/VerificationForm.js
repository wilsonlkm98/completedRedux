import { useState, useCallback } from "react";
import { Form, Input, Button } from "antd";
import { useDispatch } from "react-redux";
import { showError } from "../../redux/slices/errorSlice";
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
const VerificationForm = ({ formConfig }) => {
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);

	const submitForm = useCallback(async values => {
		if (!loading) {
			const additionalValues = formConfig && formConfig.addValues ? formConfig.addValues : {};
			const sendData = {
				...values,
				...additionalValues
			};
			setLoading(true);
			try {
				const res = await authApi.verify(sendData);
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
			name="verification-form"
			id="verification-form"
			className={`verification-form ${formConfig && formConfig.customClass}`}
			layout={
				formConfig && (formConfig.layout === "horizontal" || formConfig.layout === "vertical" || formConfig.layout === "inline")
					? formConfig.layout
					: "vertical"
			}
			onFinish={submitForm}
			onFinishFailed={e => console.log("submit fail", e.errorFields)}
			disabled={loading}
			aria-label="form"
			data-testid="verification-form"
		>
			<Form.Item
				label={formConfig && formConfig.label ? formConfig.label : ""}
				name="otp"
				htmlFor="otp"
				className="form-group"
				data-testid="otp-input"
			>
				<Input
					type="number"
					id="otp"
					name="otp"
					className="form-input"
					required
					placeholder={formConfig && formConfig.placeholder ? formConfig.placeholder : null}
				/>
			</Form.Item>

			{formConfig && formConfig.addElement}

			<Form.Item className="form-group">
				<Button htmlType="submit" block loading={loading} id="verification-form-submit-btn" className="form-submit-btn">
					{formConfig && formConfig.btnText ? formConfig.btnText : "Submit"}
				</Button>
			</Form.Item>
		</Form>
	);
};

export default VerificationForm;
