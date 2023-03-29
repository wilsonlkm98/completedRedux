import { Modal, Button } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { clearError } from "../../redux/slices/errorSlice";

const ErrorPopup = () => {
	const error = useSelector(state => state.error);
	const dispatch = useDispatch();

	const closeError = () => dispatch(clearError());

	return (
		<Modal open={error} onCancel={closeError} centered footer={null} closable={false}>
			<div className="error-popup-body text-center">
				<CloseCircleOutlined className="error-popup-icon" />

				<p className="error-message">{error}</p>

				<Button htmlType="button" type="primary" className="error-popup-button" block onClick={closeError}>
					Okay
				</Button>
			</div>
		</Modal>
	);
};

export default ErrorPopup;
