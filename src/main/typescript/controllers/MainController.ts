import { Action } from "../core/Action";
import Controller from "../core/Controller";

class MainController extends Controller {
    @Action("GET", "/")
    public index() {
        return {
            message: "Hello, world!",
        };
    }
}

export default MainController;