import { Provider } from "react-redux";
import store from "../../redux/store";

const MockComponent = ({ children }) => <Provider store={store}>{children}</Provider>;

export default MockComponent;
